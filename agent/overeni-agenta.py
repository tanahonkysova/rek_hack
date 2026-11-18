"""Ověření kroků 3–5 části 4 (Asistent Pohoda) dotazem do Dataverse.

Spuštění (po testech v testovacím panelu agenta):
    python agent/overeni-agenta.py
Potřebuje přihlášené Azure CLI (az login) s účtem LabAdmin12. Nic nezapisuje.
"""
import json
import subprocess
import sys
import urllib.parse
import urllib.request
from datetime import date

sys.stdout.reconfigure(encoding="utf-8")

KC = json.load(open("kontrolni-cisla.json", encoding="utf-8"))
SCHEMA = json.load(open("reklamace-schema.json", encoding="utf-8"))
ORG = SCHEMA["prostredi"]
API = ORG + "/api/data/v9.2/"
NAVRH = SCHEMA["choice"]["Návrh AI"]
STAV = SCHEMA["choice"]["Stav reklamace"]
JISTOTA = SCHEMA["choice"]["Jistota"]

TOKEN = subprocess.run(
    ["az", "account", "get-access-token", "--resource", ORG, "--query", "accessToken", "-o", "tsv"],
    capture_output=True, text=True, shell=sys.platform == "win32",
).stdout.strip()

SLOUPCE = "rek_cislo,rek_stav,rek_navrhai,rek_jistota,rek_navrhoduvodneni,rek_kulance,rek_kulanceduvod,rek_zbyvadni,rek_uplatnenodne,rek_email"


def dotaz(cesta: str) -> list[dict]:
    req = urllib.request.Request(API + cesta, headers={"Authorization": "Bearer " + TOKEN, "Accept": "application/json"})
    with urllib.request.urlopen(req) as r:
        return json.load(r)["value"]


def podle_emailu(email: str) -> dict | None:
    f = urllib.parse.quote(f"rek_email eq '{email}'")
    v = dotaz(f"rek_reklamaces?$select={SLOUPCE}&$filter={f}&$orderby=createdon%20desc&$top=1")
    return v[0] if v else None


vysledky: list[tuple[str, bool, str]] = []


def kontrola(nazev: str, ok: bool, detail: str = "") -> None:
    vysledky.append((nazev, ok, detail))


def popis(r: dict) -> str:
    return (f"{r['rek_cislo']}: stav {STAV.get(str(r['rek_stav']))}, návrh {NAVRH.get(str(r['rek_navrhai']), '–')}, "
            f"jistota {JISTOTA.get(str(r['rek_jistota']), '–')}")


# Krok 3 – E-01: Výměna, jistota Vysoká, v odůvodnění datum nákupu a článek.
r = podle_emailu(KC["e01.email"])
if r:
    od = r.get("rek_navrhoduvodneni") or ""
    kontrola("E-01 návrh Výměna", r["rek_navrhai"] == 100000001, popis(r))
    kontrola("E-01 jistota Vysoká", r["rek_jistota"] == 100000000)
    kontrola("E-01 odůvodnění: datum nákupu", KC["e01.datum_nakupu"] in od, od[:120])
    kontrola("E-01 odůvodnění: článek", "čl" in od.lower() or "článek" in od.lower())
else:
    kontrola("E-01 reklamace existuje (F1)", False, KC["e01.email"])

# Krok 3 – E-03: Výměna (odpověď slovensky se kontroluje v chatu).
r = podle_emailu(KC["e03.email"])
kontrola("E-03 návrh Výměna", bool(r) and r["rek_navrhai"] == 100000001, popis(r) if r else "nenalezena")

# Krok 3 – E-07: K technikovi + stav U technika, nikdy Výměna.
r = podle_emailu(KC["e07.email"])
kontrola("E-07 návrh K technikovi a stav U technika",
         bool(r) and r["rek_navrhai"] == 100000005 and r["rek_stav"] == 100000003, popis(r) if r else "nenalezena")

# Krok 4 – E-05: bez objednávky nesmí mít zapsaný návrh.
r = podle_emailu(KC["e05.email"])
kontrola("E-05 bez návrhu", bool(r) and r["rek_navrhai"] is None, popis(r) if r else "nenalezena")

# Krok 4 – ohrožené lhůty (pro porovnání se seznamem od agenta).
f = urllib.parse.quote("rek_stav ne 100000006 and rek_stav ne 100000007 and rek_zbyvadni le 5")
ohrozene = sorted(x["rek_cislo"] for x in dotaz(f"rek_reklamaces?$select=rek_cislo,rek_zbyvadni&$filter={f}"))
kontrola("Ohrožené = test.ohrozene_cisla", set(KC["test.ohrozene_cisla"]) <= set(ohrozene), ", ".join(ohrozene))

# Krok 5 – V2 kulance u E-08 (záruka skončila 2 měsíce před dneškem → v okně 3 měsíců).
r = podle_emailu(KC["e08.email"])
kontrola("E-08 návrh Zamítnuto", bool(r) and r["rek_navrhai"] == 100000004, popis(r) if r else "nenalezena")
kontrola("E-08 kulance = Ano s důvodem", bool(r) and r["rek_kulance"] is True and bool(r.get("rek_kulanceduvod")),
         (r.get("rek_kulanceduvod") or "")[:120] if r else "")

# Krok 6 – po úklidu nemá žádná dnešní reklamace návrh.
dnes = date.today().isoformat()
f = urllib.parse.quote(f"rek_navrhai ne null and rek_uplatnenodne eq {dnes}")
zbyva = dotaz(f"rek_reklamaces?$select=rek_cislo&$filter={f}")
kontrola("(po úklidu) dnešní reklamace bez návrhu", not zbyva, ", ".join(x["rek_cislo"] for x in zbyva))

for nazev, ok, detail in vysledky:
    print(("OK   " if ok else "CHYBA") + f"  {nazev}" + (f"  — {detail}" if detail else ""))
