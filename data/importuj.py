"""Krok 5: import CSV z data/ do Dataverse (dávky po 50 přes $batch).

Spuštění:  python data/importuj.py
Token bere z Azure CLI (az login pod lab účtem). Import je idempotentní:
Produkt a Objednávka přes alternativní klíč (upsert), Typ vady a Reklamace přeskočí existující názvy/čísla.
"""
import base64
import csv
import datetime as dt
import json
import os
import subprocess
import urllib.error
import urllib.request
import uuid

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
FOTKY = os.path.join(ROOT, "starter-kit", "fotky")
URL = "https://org37b4cbab.crm.dynamics.com"
API = URL + "/api/data/v9.2/"
SOLUTION = "Reklamace"
DAVKA = 50
DNES = dt.date.today()  # lhůty odpovídají dni importu

# persony -> systemuserid (tým má jen jeden lab účet, všechny persony jsou na něm)
LABADMIN = "7efba0aa-f2d4-f111-a05b-6045bd0965dc"  # LabAdmin12@M365x29026754.onmicrosoft.com
PERSONY = {"Klára": LABADMIN, "Pavel": LABADMIN, "Jitka": LABADMIN, "Radek": LABADMIN}

CH = {
    "kategorie": {"Kávovary a kuchyně": 100000000, "Vysavače": 100000001, "Praní a mytí": 100000002,
                  "Příslušenství a díly": 100000003},
    "zeme": {"Česko": 100000000, "Slovensko": 100000001},
    "mena": {"CZK": 100000000, "EUR": 100000001},
    "stav": {"Nová": 100000000, "Čeká na doplnění": 100000001, "Posuzuje se": 100000002, "U technika": 100000003,
             "Ke schválení": 100000004, "Rozhodnuto": 100000005, "Vyřízeno": 100000006, "Po lhůtě": 100000007},
    "kanal": {"E-mail": 100000000, "Formulář e-shopu": 100000001, "Telefon": 100000002, "Prodejna": 100000003},
    "jazyk": {"Čeština": 100000000, "Slovenština": 100000001},
    "reseni": {"Oprava": 100000000, "Výměna": 100000001, "Vrácení peněz": 100000002, "Sleva": 100000003,
               "Zamítnuto": 100000004},
    "navrh": {"Oprava": 100000000, "Výměna": 100000001, "Vrácení peněz": 100000002, "Sleva": 100000003,
              "Zamítnuto": 100000004, "K technikovi": 100000005},
    "jistota": {"Vysoká": 100000000, "Střední": 100000001, "Nízká": 100000002},
}

_tok = {}


def token():
    if "v" not in _tok:
        _tok["v"] = subprocess.run(["az", "account", "get-access-token", "--resource", URL, "--query", "accessToken",
                                    "-o", "tsv"], capture_output=True, text=True, shell=True, check=True).stdout.strip()
    return _tok["v"]


def req(method, path, body=None, headers=None):
    h = {"Authorization": "Bearer " + token(), "Accept": "application/json", "OData-Version": "4.0",
         "OData-MaxVersion": "4.0", "Content-Type": "application/json; charset=utf-8"}
    h.update(headers or {})
    data = body if isinstance(body, bytes) else (json.dumps(body).encode() if body is not None else None)
    r = urllib.request.Request((path if path.startswith("http") else API + path).replace(" ", "%20"),
                               data=data, method=method, headers=h)
    try:
        with urllib.request.urlopen(r, timeout=600) as resp:
            t = resp.read()
            return t
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"{method} {path} -> {e.code}: {e.read().decode('utf-8', 'replace')[:2000]}") from None


def get_all(path):
    out, url = [], path
    while url:
        d = json.loads(req("GET", url, headers={"Prefer": "odata.maxpagesize=5000"}))
        out += d["value"]
        url = d.get("@odata.nextLink")
    return out


def batch(operations):
    """operations: list of (method, relative_url, body). Jedna changeset na dávku (vše nebo nic)."""
    for i in range(0, len(operations), DAVKA):
        chunk = operations[i:i + DAVKA]
        b, cs = f"batch_{uuid.uuid4()}", f"changeset_{uuid.uuid4()}"
        parts = [f"--{b}", f"Content-Type: multipart/mixed; boundary={cs}", ""]
        for n, (m, u, body) in enumerate(chunk, 1):
            parts += [f"--{cs}", "Content-Type: application/http", "Content-Transfer-Encoding: binary",
                      f"Content-ID: {n}", "", f"{m} {API}{u} HTTP/1.1", "Content-Type: application/json; charset=utf-8",
                      f"MSCRM.SolutionUniqueName: {SOLUTION}", "", json.dumps(body, ensure_ascii=False)]
        parts += [f"--{cs}--", f"--{b}--", ""]
        payload = "\r\n".join(parts).encode("utf-8")
        resp = req("POST", "$batch", payload, {"Content-Type": f"multipart/mixed; boundary={b}"}).decode("utf-8", "replace")
        if "HTTP/1.1 4" in resp or "HTTP/1.1 5" in resp:
            raise RuntimeError("dávka selhala:\n" + resp[:3000])
        print(f"    dávka {i // DAVKA + 1}: {len(chunk)} záznamů OK")


def csv_rows(name):
    with open(os.path.join(DATA, name), encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f))


def ano(v):
    return v == "Ano"


def main():
    print("Produkty")
    ops = []
    for r in csv_rows("produkt.csv"):
        ops.append(("PATCH", f"rek_produkts(rek_kod='{r['kod']}')", {
            "rek_nazev": r["nazev"], "rek_kategorie": CH["kategorie"][r["kategorie"]], "rek_cena": float(r["cena"]),
            "rek_zaruka": int(r["zaruka"]), "rek_aktivni": ano(r["aktivni"])}))
    batch(ops)

    print("Typy vad")
    exist = {x["rek_nazev"] for x in get_all("rek_typvadies?$select=rek_nazev")}
    ops = []
    for r in csv_rows("typvady.csv"):
        if r["nazev"] in exist:
            continue
        b = {"rek_nazev": r["nazev"], "rek_kod": r["kod"], "rek_uznatelna": ano(r["uznatelna"]),
             "rek_vyzadujetechnika": ano(r["vyzadujetechnika"]), "rek_popisproai": r["popisproai"]}
        if r["vychozireseni"]:
            b["rek_vychozireseni"] = CH["reseni"][r["vychozireseni"]]
        ops.append(("POST", "rek_typvadies", b))
    if ops:
        batch(ops)
    typy = {x["rek_nazev"]: x["rek_typvadyid"] for x in get_all("rek_typvadies?$select=rek_nazev")}

    print("Objednávky")
    ops = []
    for r in csv_rows("objednavka.csv"):
        ops.append(("PATCH", f"rek_objednavkas(rek_cislo='{r['cislo']}')", {
            "rek_produkt@odata.bind": f"/rek_produkts(rek_kod='{r['produkt_kod']}')",
            "rek_zakaznik": r["zakaznik"], "rek_email": r["email"], "rek_zeme": CH["zeme"][r["zeme"]],
            "rek_datumnakupu": r["datumnakupu"], "rek_cena": float(r["cena"]), "rek_mena": CH["mena"][r["mena"]]}))
    batch(ops)

    print("Reklamace")
    exist = {x["rek_cislo"] for x in get_all("rek_reklamaces?$select=rek_cislo")}
    fotky = {}
    ops = []
    for r in csv_rows("reklamace.csv"):
        if r["cislo"] in exist:
            continue
        b = {"rek_cislo": r["cislo"], "rek_stav": CH["stav"][r["stav"]], "rek_kanal": CH["kanal"][r["kanal"]],
             "rek_zeme": CH["zeme"][r["zeme"]], "rek_jazyk": CH["jazyk"][r["jazyk"]],
             "rek_produkt@odata.bind": f"/rek_produkts(rek_kod='{r['produkt_kod']}')",
             "rek_typvady@odata.bind": f"/rek_typvadies({typy[r['typvady_nazev']]})",
             "rek_zakaznik": r["zakaznik"], "rek_email": r["email"], "rek_popiszakaznika": r["popiszakaznika"],
             "rek_uplatnenodne": (DNES - dt.timedelta(days=int(r["uplatneno_pred_dny"]))).isoformat(),
             "rek_vyrizuje@odata.bind": f"/systemusers({PERSONY[r['vyrizuje']]})"}
        if r["objednavka_cislo"]:
            b["rek_objednavka@odata.bind"] = f"/rek_objednavkas(rek_cislo='{r['objednavka_cislo']}')"
        for col in ["popiscesky", "popisfotky", "chybejici", "navrhoduvodneni", "posudek", "oduvodneni", "komentar"]:
            if r[col]:
                b[f"rek_{col}"] = r[col]
        if r["vzaruce"]:
            b["rek_vzaruce"] = ano(r["vzaruce"])
        if r["shodasai"]:
            b["rek_shodasai"] = ano(r["shodasai"])
        if r["navrhai"]:
            b["rek_navrhai"] = CH["navrh"][r["navrhai"]]
        if r["jistota"]:
            b["rek_jistota"] = CH["jistota"][r["jistota"]]
        if r["rozhodnuti"]:
            b["rek_rozhodnuti"] = CH["reseni"][r["rozhodnuti"]]
        if r["naklady"]:
            b["rek_naklady"] = float(r["naklady"])
        if r["schvalil"]:
            b["rek_schvalil@odata.bind"] = f"/systemusers({PERSONY[r['schvalil']]})"
        if r["vyrizeno_pred_dny"]:
            b["rek_datumvyrizeni"] = (DNES - dt.timedelta(days=int(r["vyrizeno_pred_dny"]))).isoformat()
        if r["fotka_soubor"]:
            if r["fotka_soubor"] not in fotky:
                fotky[r["fotka_soubor"]] = base64.b64encode(open(os.path.join(FOTKY, r["fotka_soubor"]), "rb").read()).decode()
            b["rek_fotka"] = fotky[r["fotka_soubor"]]
        ops.append(("POST", "rek_reklamaces", b))
    if ops:
        batch(ops)

    print("Autonumber seed 14231")
    req("POST", "SetAutoNumberSeed", {"EntityName": "rek_reklamace", "AttributeName": "rek_cislo", "Value": 14231})
    print("Hotovo.")


if __name__ == "__main__":
    main()
