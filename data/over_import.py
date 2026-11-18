"""Ověření kroku 5: počty v Dataverse proti kontrolni-cisla.json.

Zbývá dní není v Dataverse calculated (Now() nejde s Date only), počítá se tu jako Lhůta - dnes.
"""
import datetime as dt
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from importuj import get_all, req, ROOT  # noqa: E402

sys.stdout.reconfigure(encoding="utf-8")
KC = json.load(open(os.path.join(ROOT, "kontrolni-cisla.json"), encoding="utf-8"))
DNES = dt.date.today()

prod = get_all("rek_produkts?$select=rek_kod")
typy = get_all("rek_typvadies?$select=rek_nazev")
obj = get_all("rek_objednavkas?$select=rek_cislo,rek_zeme,rek_datumnakupu")
rek = get_all("rek_reklamaces?$select=rek_cislo,rek_stav,rek_lhuta,rek_rozhodnuti,rek_fotka_url,_rek_produkt_value,"
              "_rek_objednavka_value,_rek_typvady_value,rek_uplatnenodne")

hranice = DNES.replace(year=DNES.year - 2)
otev = [r for r in rek if r["rek_stav"] != 100000006]
ohr = [r for r in otev if r["rek_stav"] != 100000007 and r["rek_lhuta"]
       and (dt.date.fromisoformat(r["rek_lhuta"]) - DNES).days <= 5]
rozh = [r for r in rek if r["rek_rozhodnuti"] is not None]
uzn = [r for r in rozh if r["rek_rozhodnuti"] != 100000004]
podil = round(100 * len(uzn) / len(rozh), 1)

radky = [
    ("pocet.produkt", len(prod)), ("pocet.typvady", len(typy)), ("pocet.objednavka", len(obj)),
    ("pocet.objednavka_sk", sum(o["rek_zeme"] == 100000001 for o in obj)), ("pocet.reklamace", len(rek)),
    ("pocet.otevrene", len(otev)), ("pocet.ohrozene", len(ohr)),
    ("test.ohrozene_cisla", sorted(r["rek_cislo"] for r in ohr)),
    ("pocet.po_lhute", sum(r["rek_stav"] == 100000007 for r in rek)),
    ("pocet.mimo_zaruku_objednavky", sum(dt.date.fromisoformat(o["rek_datumnakupu"]) < hranice for o in obj)),
    ("podil_uznanych", podil),
]
ok = True
print(f"{'klíč':32} {'Dataverse':>12} {'kontrolni-cisla.json':>22}")
for k, v in radky:
    shoda = v == KC[k]
    ok &= shoda
    print(f"{k:32} {str(v):>12} {str(KC[k]):>22}  {'OK' if shoda else 'CHYBA'}")
extra = {
    "reklamace bez lookupu produkt/typ": sum(1 for r in rek if not r["_rek_produkt_value"] or not r["_rek_typvady_value"]),
    "reklamace bez objednávky (čeká 4)": sum(1 for r in rek if not r["_rek_objednavka_value"]),
    "reklamace s fotkou": sum(1 for r in rek if r["rek_fotka_url"]),
    "reklamace bez Lhůty": sum(1 for r in rek if not r["rek_lhuta"]),
}
print(extra)
seed = json.loads(req("POST", "GetAutoNumberSeed", {"EntityName": "rek_reklamace", "AttributeName": "rek_cislo"}))
print("autonumber seed:", seed.get("AutoNumberSeedValue"))
print("VÝSLEDEK:", "PROŠLO" if ok else "NEPROŠLO")
