"""Generátor dat části 1 (Reklamace) pro tým 12, Pohoda Spotřebiče (smyšlená firma).

Jen standardní knihovna Pythonu, žádná síť ani AI. Seed = číslo týmu (12).
Spuštění z kořene projektu nebo odkudkoli:  python data/generuj.py

Výstupy:
  data/produkt.csv, data/typvady.csv, data/objednavka.csv, data/reklamace.csv
  data/vstupy/E-01.eml .. E-08.eml, data/vstupy/ai-zaloha/E-01.json .. E-08.json
  kontrolni-cisla.json (kořen projektu)
Fotky kotev bere ze starter-kit/fotky/ (náhradní kresby, viz starter-kit/kresli_fotky.py).
"""
import base64
import calendar
import csv
import datetime as dt
import json
import os
import random
from collections import Counter
from email.header import Header

CISLO_TYMU = 12
rnd = random.Random(CISLO_TYMU)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
VSTUPY = os.path.join(DATA, "vstupy")
ZALOHA = os.path.join(VSTUPY, "ai-zaloha")
FOTKY = os.path.join(ROOT, "starter-kit", "fotky")

DNES = dt.date(2026, 11, 18)  # den akce, všechna data jsou relativní k němu


def add_months(d, m):
    y = d.year + (d.month - 1 + m) // 12
    mo = (d.month - 1 + m) % 12 + 1
    return dt.date(y, mo, min(d.day, calendar.monthrange(y, mo)[1]))


def fmt(d):
    return f"{d.day}. {d.month}. {d.year}" if d else ""


HRANICE_ZARUKY = add_months(DNES, -24)  # nákup před tímto dnem = mimo záruku dnes

# ---------------------------------------------------------------------------
# Potvrzený katalog (krok 4.1)
# ---------------------------------------------------------------------------
KATEGORIE = {100000000: "Kávovary a kuchyně", 100000001: "Vysavače",
             100000002: "Praní a mytí", 100000003: "Příslušenství a díly"}

# kód, název, kategorie, cena Kč, aktivní, váha v objednávkách
PRODUKTY = [
    ("KV-210", "Espresso automat Pohoda KV-210", 100000000, 12990, True, 25),
    ("KV-450", "Espresso automat Pohoda KV-450", 100000000, 17990, True, 30),
    ("KV-800", "Espresso automat Pohoda KV-800", 100000000, 24990, True, 15),
    ("PK-120", "Pákový kávovar Pohoda PK-120", 100000000, 6490, True, 15),
    ("ML-20", "Mlýnek na kávu Pohoda ML-20", 100000000, 1290, True, 12),
    ("TV-25", "Tyčový vysavač Pohoda TV-25", 100000001, 7990, True, 25),
    ("RV-50", "Robotický vysavač Pohoda RV-50", 100000001, 11990, True, 20),
    ("VS-300", "Vysavač s vakem Pohoda VS-300", 100000001, 3490, False, 10),
    ("HV-10", "Ruční vysavač Pohoda HV-10", 100000001, 1990, True, 15),
    ("MY-60", "Myčka nádobí Pohoda MY-60", 100000002, 13990, True, 25),
    ("PR-70", "Pračka Pohoda PR-70", 100000002, 14990, True, 20),
    ("SU-80", "Sušička Pohoda SU-80", 100000002, 16990, True, 15),
    ("KP-450", "Náhradní kryt panelu KV-450", 100000003, 690, True, 8),
    ("HD-15", "Přívodní hadice s rychlospojkou", 100000003, 490, True, 10),
    ("VF-10", "Vodní filtr pro espresso automaty", 100000003, 390, True, 15),
]
P = {p[0]: {"kod": p[0], "nazev": p[1], "kat": p[2], "cena": p[3], "aktivni": p[4], "vaha": p[5]}
     for p in PRODUKTY}
K1, K2 = "KV-450", "MY-60"

# krátké názvy pro texty zákazníků
KRATKE = {"KV-210": ("kávovar KV-210", "kávovar KV-210"), "KV-450": ("kávovar KV-450", "kávovar KV-450"),
          "KV-800": ("kávovar KV-800", "kávovar KV-800"), "PK-120": ("pákový kávovar PK-120", "pákový kávovar PK-120"),
          "ML-20": ("mlýnek ML-20", "mlynček ML-20"), "TV-25": ("tyčový vysavač TV-25", "tyčový vysávač TV-25"),
          "RV-50": ("robotický vysavač RV-50", "robotický vysávač RV-50"),
          "VS-300": ("vysavač VS-300", "vysávač VS-300"), "HV-10": ("ruční vysavač HV-10", "ručný vysávač HV-10"),
          "MY-60": ("myčka MY-60", "umývačka MY-60"), "PR-70": ("pračka PR-70", "práčka PR-70"),
          "SU-80": ("sušička SU-80", "sušička SU-80"), "KP-450": ("náhradní kryt panelu KP-450", "náhradný kryt panela KP-450"),
          "HD-15": ("přívodní hadice HD-15", "prívodná hadica HD-15"), "VF-10": ("vodní filtr VF-10", "vodný filter VF-10")}

T1, T2, T3, T4, T5, T6, T7, T8 = ("Výrobní vada materiálu", "Nefunkční elektrika nebo motor", "Únik vody",
                                  "Chybějící díl v balení", "Poškození při přepravě",
                                  "Mechanické poškození uživatelem", "Běžné opotřebení", "Nelze určit")
# název, kód, uznatelná, výchozí řešení, vyžaduje technika, popis pro AI
TYPY = [
    (T1, "MAT", True, "Výměna", False,
     "Vada plastu nebo kovu bez vnější příčiny: prasklina přes kryt panelu kávovaru s čistými okraji, bez otlaku "
     "a stop pádu, často krátce po zapnutí nebo zahřátí. Výrobek nespadl, zákazník nepopisuje náraz."),
    (T2, "ELE", True, "Oprava", True,
     "Spotřebič nejde zapnout, nenabíjí, vypíná se nebo hlásí chybu: kávovar hlásí chybu spařovací jednotky, "
     "vysavač ztrácí výkon nebo nenabíjí, motor nenaskočí. Bez fotky se posoudit nedá, posuzuje technik."),
    (T3, "VODA", True, "Výměna", True,
     "Voda uniká kolem rychlospojky přívodní hadice myčky nebo pračky, z těsnění nebo z nádržky kávovaru. "
     "Na fotce je vidět mokro, kapky nebo posunuté těsnění. Ověří technik (Aquastop, těsnost spoje)."),
    (T4, "DIL", True, "Oprava", False,
     "Zákazník po rozbalení postrádá díl uvedený v obsahu balení: vodní filtr, hadici, nástavec vysavače, "
     "odkapávač. Hlásí se brzy po nákupu, fotka obsahu balení."),
    (T5, "PREP", True, "Výměna", False,
     "Poškozená krabice, promáčknutý nebo prasklý výrobek hned po doručení, nefunkční při dodání (DOA). "
     "Zákazník zmiňuje přepravce nebo rozbalení."),
    (T6, "MECH", False, "Zamítnuto", True,
     "Stopy pádu nebo nárazu: otlak, promáčknutí, odřený roh, kávovar spadl při stěhování nebo do krytu panelu "
     "narazila konvice. Prasklina vycházející z otlaku nebo rohu = náraz. Uznat nelze, posoudí technik."),
    (T7, "OPOT", False, "Zamítnuto", False,
     "Opotřebení odpovídající používání: ošoupané kartáče vysavače, slabší baterie po letech, zanesené filtry. "
     "Kávovar zanesený vodním kamenem kvůli neodvápňování je běžné opotřebení, ne vada; reklamace se neuznává."),
    (T8, "NEURC", True, None, True,
     "Popis ani fotka nestačí k určení příčiny, nebo si odporují. Agent nic nedomýšlí, posoudí technik."),
]
TYP = {t[0]: {"nazev": t[0], "kod": t[1], "uznatelna": t[2], "vychozi": t[3], "technik": t[4], "popis": t[5]}
       for t in TYPY}

# které typy vad dávají smysl u které kategorie
TYPY_KAT = {100000000: [T1, T2, T3, T4, T5, T6, T7, T8], 100000001: [T1, T2, T4, T5, T6, T7, T8],
            100000002: [T1, T2, T3, T4, T5, T6, T7, T8], 100000003: [T1, T4, T5, T7]}

POPIS_FOTKY = {
    "kryt-g300.jpg": "Prasklina přes plastový kryt ovládacího panelu, okraje čisté, bez stop nárazu.",
    "kryt-roh.jpg": "Prasklina vychází z otlaku na rohu krytu, roh je promáčknutý.",
    "t150-spojka.jpg": "Voda uniká kolem rychlospojky hadice, těsnění je vidět posunuté.",
}

# ---------------------------------------------------------------------------
# Jména (smyšlená)
# ---------------------------------------------------------------------------
CZ_Z = ["Jana", "Petra", "Lucie", "Kateřina", "Eva", "Martina", "Hana", "Lenka", "Veronika", "Tereza",
        "Michaela", "Alena", "Monika", "Zuzana", "Markéta", "Barbora", "Klára", "Ivana", "Simona", "Dana"]
CZ_M = ["Tomáš", "Jan", "Petr", "Martin", "Jakub", "Lukáš", "Ondřej", "Pavel", "Michal", "David",
        "Jiří", "Josef", "Marek", "Filip", "Vojtěch", "Radek", "Karel", "Roman", "Adam", "Daniel"]
CZ_P = [("Novák", "Nováková"), ("Svoboda", "Svobodová"), ("Dvořák", "Dvořáková"), ("Černý", "Černá"),
        ("Procházka", "Procházková"), ("Kučera", "Kučerová"), ("Veselý", "Veselá"), ("Horák", "Horáková"),
        ("Němec", "Němcová"), ("Pokorný", "Pokorná"), ("Marek", "Marková"), ("Pospíšil", "Pospíšilová"),
        ("Hájek", "Hájková"), ("Král", "Králová"), ("Jelínek", "Jelínková"), ("Růžička", "Růžičková"),
        ("Beneš", "Benešová"), ("Fiala", "Fialová"), ("Sedláček", "Sedláčková"), ("Doležal", "Doležalová"),
        ("Zeman", "Zemanová"), ("Kolář", "Kolářová"), ("Navrátil", "Navrátilová"), ("Čermák", "Čermáková"),
        ("Urban", "Urbanová"), ("Vaněk", "Vaňková"), ("Blažek", "Blažková"), ("Kříž", "Křížová"),
        ("Kovář", "Kovářová"), ("Šimek", "Šimková")]
SK_Z = ["Zuzana", "Mária", "Katarína", "Lucia", "Jana", "Monika", "Simona", "Martina", "Veronika", "Ivana",
        "Andrea", "Lenka", "Barbora", "Petra", "Silvia"]
SK_M = ["Peter", "Martin", "Marek", "Ján", "Michal", "Tomáš", "Jozef", "Lukáš", "Juraj", "Matej",
        "Andrej", "Milan", "Róbert", "Patrik", "Dušan"]
SK_P = [("Horváth", "Horváthová"), ("Kováč", "Kováčová"), ("Varga", "Vargová"), ("Tóth", "Tóthová"),
        ("Nagy", "Nagyová"), ("Baláž", "Balážová"), ("Szabó", "Szabóová"), ("Molnár", "Molnárová"),
        ("Lukáč", "Lukáčová"), ("Kollár", "Kollárová"), ("Oravec", "Oravcová"), ("Polák", "Poláková"),
        ("Hudák", "Hudáková"), ("Kráľ", "Kráľová"), ("Gajdoš", "Gajdošová"), ("Mikuš", "Mikušová"),
        ("Bartoš", "Bartošová"), ("Šimko", "Šimková"), ("Kmeť", "Kmeťová"), ("Ďurica", "Ďuricová")]

ASCII = str.maketrans("áčďéěíňóřšťúůýžäľĺôŕÁČĎÉĚÍŇÓŘŠŤÚŮÝŽÄĽĹÔŔ", "acdeeinorstuuyzallorACDEEINORSTUUYZALLOR")
pouzite_emaily = set()


def novy_zakaznik(zeme, zena=None, krestni=None):
    zena = rnd.random() < 0.55 if zena is None else zena
    for _ in range(1000):
        if zeme == "CZ":
            k = krestni or rnd.choice(CZ_Z if zena else CZ_M)
            pr = rnd.choice(CZ_P)[1 if zena else 0]
            dom = "cz"
        else:
            k = krestni or rnd.choice(SK_Z if zena else SK_M)
            pr = rnd.choice(SK_P)[1 if zena else 0]
            dom = "sk"
        email = f"{k}.{pr}".lower().translate(ASCII) + f"@example.{dom}"
        if email not in pouzite_emaily:
            pouzite_emaily.add(email)
            return {"jmeno": f"{k} {pr}", "email": email, "zena": zena, "krestni": k}
    raise RuntimeError("došla jména")


# ---------------------------------------------------------------------------
# Objednávky (300: 210 CZ, 90 SK; přesně 8 starších než 24 měsíců)
# ---------------------------------------------------------------------------
pouzita_cisla = set()


def cislo_objednavky(zeme, datum):
    while True:
        n = rnd.randint(1000, 9999)
        if n not in pouzita_cisla:
            pouzita_cisla.add(n)
            return f"EO-{zeme}-{datum.year}-{n:06d}"


def cena_obj(kod, zeme):
    c = P[kod]["cena"]
    return (float(c), "CZK") if zeme == "CZ" else (round(c / 25) - 0.01, "EUR")


def nova_objednavka(zeme, kod, datum, zakaznik=None):
    z = zakaznik or novy_zakaznik(zeme)
    cena, mena = cena_obj(kod, zeme)
    return {"cislo": cislo_objednavky(zeme, datum), "produkt_kod": kod, "zakaznik": z["jmeno"],
            "email": z["email"], "zeme": zeme, "datumnakupu": datum, "cena": cena, "mena": mena,
            "_z": z, "_email_obj": False}


def nahodne_datum(od, do):
    return od + dt.timedelta(days=rnd.randint(0, (do - od).days))


objednavky = []
# objednávky, na které odkazují e-maily (jsou mezi 300, reklamace z nich ještě neexistují)
E = {}
E["01"] = nova_objednavka("CZ", K1, add_months(DNES, -7), novy_zakaznik("CZ", True, "Jana"))
E["02"] = nova_objednavka("CZ", "TV-25", DNES - dt.timedelta(days=rnd.randint(60, 200)))
E["03"] = nova_objednavka("SK", K2, add_months(DNES, -5), novy_zakaznik("SK", True))
E["04"] = nova_objednavka("SK", "HD-15", DNES - dt.timedelta(days=rnd.randint(14, 25)))
E["07"] = nova_objednavka("CZ", K1, add_months(DNES, -6), novy_zakaznik("CZ", False))
E["08"] = nova_objednavka("CZ", K2, add_months(DNES, -26))
for o in E.values():
    o["_email_obj"] = True
    objednavky.append(o)

vahy = [P[k]["vaha"] for k in P]
kody = list(P)
cz_zbyva = 210 - sum(1 for o in objednavky if o["zeme"] == "CZ")
sk_zbyva = 90 - sum(1 for o in objednavky if o["zeme"] == "SK")
zeme_seznam = ["CZ"] * cz_zbyva + ["SK"] * sk_zbyva
rnd.shuffle(zeme_seznam)
stare_zbyva = 8 - sum(1 for o in objednavky if o["datumnakupu"] < HRANICE_ZARUKY)
for i, zeme in enumerate(zeme_seznam):
    kod = rnd.choices(kody, vahy)[0]
    if i == 0:  # objednávka pro reklamaci zamítnutou kvůli konci záruky (reklamace před 35 až 45 dny)
        d = nahodne_datum(add_months(DNES, -26), add_months(DNES, -25) - dt.timedelta(days=15))
    elif i < stare_zbyva:
        d = nahodne_datum(add_months(DNES, -26), HRANICE_ZARUKY - dt.timedelta(days=1))
    else:
        d = nahodne_datum(HRANICE_ZARUKY, DNES - dt.timedelta(days=7))
    objednavky.append(nova_objednavka(zeme, kod, d))
objednavky.sort(key=lambda o: (o["datumnakupu"], o["cislo"]))

# ---------------------------------------------------------------------------
# Texty
# ---------------------------------------------------------------------------
TXT = {  # popis zákazníka podle typu vady: (cs varianty, sk varianty)
    T1: (["Dobrý den, na {p} se po pár týdnech objevila prasklina, aniž by spadl nebo do něj něco narazilo. Používám ho normálně podle návodu. Prosím o výměnu.",
          "Dobrý den, {p} má prasklý plast, praskl sám od sebe při běžném používání. Nic jsme s ním nedělali, stojí pořád na stejném místě. Co s tím?",
          "Dobrý den, u {p} se odlupuje a praská povrch, i když je skoro nový. Myslím, že je to vada materiálu. Děkuji za vyřízení."],
         ["Dobrý deň, na {p} sa po pár týždňoch objavila prasklina, hoci nespadol ani doň nič nenarazilo. Používam ho bežne podľa návodu. Prosím o výmenu.",
          "Dobrý deň, {p} má prasknutý plast, praskol sám od seba pri bežnom používaní. Nič sme s ním nerobili. Čo s tým?"]),
    T2: (["Dobrý den, {p} přestal fungovat, nejde vůbec zapnout. Zkoušeli jsme jinou zásuvku, nic. Prosím o opravu.",
          "Dobrý den, {p} se po pár minutách sám vypíná a pak nejde znovu spustit. Je to čím dál horší. Prosím, poraďte, co dál.",
          "Dobrý den, {p} hlásí chybu a odmítá pracovat. Restart nepomohl. Bez něj se doma těžko obejdeme."],
         ["Dobrý deň, {p} prestal fungovať, nedá sa vôbec zapnúť. Skúšali sme inú zásuvku, nič. Prosím o opravu.",
          "Dobrý deň, {p} sa po pár minútach sám vypne a potom sa nedá znova spustiť. Prosím, poraďte, čo ďalej."]),
    T3: (["Dobrý den, {p} teče, pod spotřebičem je pokaždé louže vody. Hadici jsme zapojili podle návodu. Prosím o rychlé řešení, bojíme se o podlahu.",
          "Dobrý den, z {p} uniká voda, nejvíc u přípojky. Musíme pod ni dávat ručník. Prosím o výměnu nebo opravu."],
         ["Dobrý deň, {p} tečie, pod spotrebičom je zakaždým mláka vody. Hadicu sme zapojili podľa návodu. Prosím o rýchle riešenie.",
          "Dobrý deň, z {p} uniká voda, najviac pri prípojke. Musíme pod ňu dávať uterák. Prosím o výmenu alebo opravu."]),
    T4: (["Dobrý den, po rozbalení {p} jsme zjistili, že v balení chybí díl uvedený v obsahu balení. Bez něj ho nemůžeme používat. Prosím o doposlání.",
          "Dobrý den, v krabici od {p} chybělo příslušenství, které je v návodu. Krabice byla neporušená. Děkuji za doplnění."],
         ["Dobrý deň, po rozbalení {p} sme zistili, že v balení chýba diel uvedený v obsahu balenia. Prosím o doposlanie.",
          "Dobrý deň, v krabici od {p} chýbalo príslušenstvo, ktoré je v návode. Krabica bola neporušená. Ďakujem."]),
    T5: (["Dobrý den, {p} dorazil s promáčknutou krabicí a po rozbalení byl poškozený. Kurýr spěchal, tak jsem to hned nekontrolovala. Prosím o výměnu.",
          "Dobrý den, {p} přišel rozbitý, uvnitř chrastí uvolněný díl a po zapojení nejde zapnout. Prosím o výměnu kusu."],
         ["Dobrý deň, {p} prišiel s pokrčenou krabicou a po rozbalení bol poškodený. Prosím o výmenu.",
          "Dobrý deň, {p} prišiel rozbitý, vo vnútri hrkoce uvoľnený diel. Prosím o výmenu kusu."]),
    T6: (["Dobrý den, {p} má prasklý roh. Při stěhování nám trochu ujel ze stolu, ale myslím, že by to měl vydržet. Prosím o nový.",
          "Dobrý den, na {p} je prasklina a odřený roh. Nevím přesně, jak se to stalo, možná do něj někdo narazil. Prosím o výměnu."],
         ["Dobrý deň, {p} má prasknutý roh. Pri sťahovaní nám trochu skĺzol zo stola, ale mal by to vydržať. Prosím o nový.",
          "Dobrý deň, na {p} je prasklina a odretý roh. Neviem presne, ako sa to stalo. Prosím o výmenu."]),
    T7: (["Dobrý den, {p} už nefunguje jako dřív, výkon je slabší a dělá zvuky. Používáme ho denně. Prosím o opravu v záruce.",
          "Dobrý den, {p} teče pomalu a káva je vlažná. Odvápňovali jsme naposledy asi před rokem. Prosím o opravu."],
         ["Dobrý deň, {p} už nefunguje ako predtým, výkon je slabší. Používame ho denne. Prosím o opravu v záruke.",
          "Dobrý deň, {p} tečie pomaly a káva je vlažná. Odvápňovali sme naposledy asi pred rokom. Prosím o opravu."]),
    T8: (["Dobrý den, s {p} je něco v nepořádku, občas funguje a občas ne. Nevím, čím to je. Prosím o kontrolu.",
          "Dobrý den, {p} se chová divně, nedokážu přesně popsat, co se děje. Prosím, ať se na to někdo podívá."],
         ["Dobrý deň, s {p} je niečo v neporiadku, raz funguje a raz nie. Prosím o kontrolu.",
          "Dobrý deň, {p} sa správa divne, neviem presne opísať, čo sa deje. Prosím, nech sa na to niekto pozrie."]),
}
CESKY = {T1: "Prasklina nebo vada materiálu na výrobku {k} bez vnější příčiny.",
         T2: "Výrobek {k} nejde zapnout nebo se vypíná, zákazník žádá opravu.",
         T3: "U výrobku {k} uniká voda, nejspíš u přípojky nebo těsnění.",
         T4: "V balení výrobku {k} chybí díl uvedený v obsahu balení.",
         T5: "Výrobek {k} dorazil poškozený při přepravě.",
         T6: "Výrobek {k} má prasklinu a otlak, zákazník zmiňuje pád nebo náraz.",
         T7: "Výrobek {k} má slabší výkon po delším používání, údržba zanedbaná.",
         T8: "Zákazník popisuje nejasnou vadu výrobku {k}, příčina z popisu nejde určit."}
POSUDEK = {T2: "Změřeno v dílně: vadná řídicí deska, motor v pořádku. Vada uznána, doporučuji opravu výměnou desky.",
           T3: "Těsnění rychlospojky bylo z výroby posazené mimo drážku, spoj netěsní. Vada uznána.",
           T6: "Na krytu je otlak, prasklina z něj vychází paprskovitě. Odpovídá nárazu, nejde o vadu materiálu.",
           T8: "Spotřebič při testu v dílně fungoval bez závad, chyba se neprojevila. Doporučuji vrátit zákazníkovi s protokolem."}
ODUV = {"Výměna": "Vada uznána, zákazník dostane nový kus. Lhůta dodržena.",
        "Oprava": "Vada uznána, oprava v dílně proběhla, výrobek vrácen zákazníkovi.",
        "Vrácení peněz": "Vada uznána, výměna nebyla možná, zákazníkovi vrácena kupní cena dobropisem.",
        "Sleva": "Vada uznána, zákazník si výrobek ponechal a přijal přiměřenou slevu.",
        "Zamítnuto": "Vada neuznána: podle posudku a fotky jde o mechanické poškození nebo běžné opotřebení (čl. 8 reklamačního řádu). "
                     "Zákazníkovi nabídnuta placená oprava, orientačně 690 Kč / 28 €."}
NAVRH_TXT = {"Oprava": "Typ vady je uznatelný a jde opravit v dílně. Podle čl. 7 reklamačního řádu má přednost oprava, pokud je rychlá.",
             "Výměna": "Vada vznikla bez vnější příčiny a výrobek je v záruce. Podle čl. 7 reklamačního řádu navrhuji výměnu kusu.",
             "Vrácení peněz": "Vada je uznatelná a výměna ani oprava nejsou možné v přiměřené lhůtě. Podle čl. 7 reklamačního řádu navrhuji vrácení peněz.",
             "Sleva": "Vada je drobná a nebrání používání. Podle čl. 7 reklamačního řádu navrhuji přiměřenou slevu.",
             "Zamítnuto": "Podle fotky a popisu jde o poškození uživatelem nebo běžné opotřebení. Podle čl. 8 reklamačního řádu navrhuji zamítnutí.",
             "K technikovi": "Z popisu a fotky nelze rozhodnout, zda jde o vadu nebo poškození. Podle čl. 6 reklamačního řádu je potřeba posudek technika."}

STAVY = ["Nová", "Čeká na doplnění", "Posuzuje se", "U technika", "Ke schválení", "Rozhodnuto", "Vyřízeno", "Po lhůtě"]
RESENI = ["Oprava", "Výměna", "Vrácení peněz", "Sleva", "Zamítnuto"]
NAVRHY = RESENI + ["K technikovi"]

# ---------------------------------------------------------------------------
# Reklamace (120)
# ---------------------------------------------------------------------------
rek = []


def slot(stav, **kw):
    r = {"stav": stav, "rozhodnuti": None, "typ": None, "produkt": None, "objednavka": None,
         "upl": None, "vyr": None, "vyrizuje": "Klára", "posudek_pavel": False, "vraceno": False,
         "ohrozena": False, "bez_obj": False, "navrh": None, "mimo_zaruku": False}
    r.update(kw)
    rek.append(r)
    return r


# otevřené (47)
for s, n in [("Nová", 15), ("Čeká na doplnění", 6), ("Posuzuje se", 14), ("U technika", 3),
             ("Ke schválení", 2), ("Rozhodnuto", 5), ("Po lhůtě", 2)]:
    for _ in range(n):
        slot(s)
# vyřízené (73)
for roz, n in [("Výměna", 30), ("Oprava", 20), ("Vrácení peněz", 6), ("Sleva", 3), ("Zamítnuto", 14)]:
    for _ in range(n):
        slot("Vyřízeno", rozhodnuti=roz)


def volne(stav, **filtr):
    out = [r for r in rek if r["stav"] == stav and all(r.get(k) == v for k, v in filtr.items())]
    return out


# kotva K1: 2 otevřené s typem 1 (5 až 19 dní) a 4 vyřízené (1 Zamítnuto)
for r, upl in zip([volne("Posuzuje se")[0], volne("Nová")[0]], [rnd.randint(8, 19), rnd.randint(5, 7)]):
    r.update(produkt=K1, typ=T1, upl=upl, kotva="K1")
for roz in ["Výměna", "Výměna", "Oprava", "Zamítnuto"]:
    r = next(x for x in volne("Vyřízeno", rozhodnuti=roz) if x["typ"] is None)
    r.update(produkt=K1, typ=T1, kotva="K1")
# kotva K2 s únikem vody (fotka): 1 otevřená, 2 vyřízené
r = volne("U technika")[0]
r.update(produkt=K2, typ=T3, kotva="K2")
for roz in ["Výměna", "Oprava"]:
    r = next(x for x in volne("Vyřízeno", rozhodnuti=roz) if x["typ"] is None)
    r.update(produkt=K2, typ=T3, kotva="K2")
# 4 otevřené bez objednávky (Čeká na doplnění)
for r in volne("Čeká na doplnění")[:4]:
    r["bez_obj"] = True
# ohrožené lhůtou: 4 otevřené (ne Po lhůtě), uplatněno před 25 až 30 dny
ohr = [x for x in volne("Posuzuje se") if x["typ"] is None][:2] + [volne("Ke schválení")[0], volne("Rozhodnuto")[0]]
for r, upl in zip(ohr, [25, 27, 29, 30]):
    r.update(ohrozena=True, upl=upl)
# 2 vrácené od Jitky (Posuzuje se, Klára, komentář)
for r in [x for x in volne("Posuzuje se") if not x["ohrozena"] and x["typ"] is None][:2]:
    r["vraceno"] = True
# Pavel: 3 U technika + 7 vyřízených s posudkem
for r in volne("U technika"):
    r["vyrizuje"] = "Pavel"
pav = [x for x in volne("Vyřízeno") if x["typ"] is None and x["rozhodnuti"] in ("Oprava", "Zamítnuto", "Výměna")]
for r, typ in zip([x for x in pav if x["rozhodnuti"] == "Oprava"][:3] +
                  [x for x in pav if x["rozhodnuti"] == "Zamítnuto"][:3] +
                  [x for x in pav if x["rozhodnuti"] == "Výměna"][:1],
                  [T2, T2, T8, T6, T6, T6, T3]):
    r.update(vyrizuje="Pavel", posudek_pavel=True, typ=typ)
# 1 zamítnutá vyřízená mimo záruku (uznatelný typ, ale po záruce)
r = next(x for x in volne("Vyřízeno", rozhodnuti="Zamítnuto") if x["typ"] is None)
r.update(typ=T2, mimo_zaruku=True, upl=rnd.randint(35, 45))

# dny uplatnění
for r in rek:
    if r["upl"] is not None:
        continue
    if r["stav"] == "Vyřízeno":
        r["upl"] = rnd.randint(35, 365)
    elif r["stav"] == "Po lhůtě":
        r["upl"] = rnd.randint(32, 40)
    elif r["stav"] == "Nová":
        r["upl"] = rnd.randint(0, 4)
    else:
        r["upl"] = rnd.randint(2, 19)
for r in rek:
    if r["stav"] == "Vyřízeno":
        r["vyr"] = r["upl"] - rnd.randint(3, 29)

# typy vad u zbývajících
for r in rek:
    if r["typ"]:
        continue
    if r["stav"] == "Ke schválení" or r["rozhodnuti"] == "Zamítnuto":
        r["typ"] = rnd.choice([T6, T7])
    elif r["rozhodnuti"] in ("Výměna", "Vrácení peněz"):
        r["typ"] = rnd.choice([T1, T2, T3, T5])
    elif r["rozhodnuti"] in ("Oprava",):
        r["typ"] = rnd.choice([T2, T2, T3, T4, T8])
    elif r["rozhodnuti"] == "Sleva":
        r["typ"] = rnd.choice([T1, T4])
    elif r["stav"] == "U technika":
        r["typ"] = rnd.choice([T2, T6, T8])
    elif r["stav"] == "Rozhodnuto":
        r["typ"] = rnd.choice([T1, T2, T5])
    else:
        r["typ"] = rnd.choice([T1, T2, T2, T3, T4, T5, T6, T7, T8])

# rozhodnutí u otevřených
for r in volne("Rozhodnuto"):
    r["rozhodnuti"] = "Oprava" if r["typ"] == T2 else "Výměna"
for r in volne("Ke schválení"):
    r["rozhodnuti"] = "Zamítnuto"

# produkty a objednávky
vahy_rek = {k: (P[k]["vaha"] * (2 if k == K1 else 1)) for k in P}
volne_obj = [o for o in objednavky if not o["_email_obj"]]


def najdi_obj(kod, r):
    den = DNES - dt.timedelta(days=r["upl"])
    kandidati = []
    for o in volne_obj:
        if o["produkt_kod"] != kod or o["datumnakupu"] >= den:
            continue
        v_zaruce = add_months(o["datumnakupu"], 24) > den
        if r["mimo_zaruku"] != (not v_zaruce):
            continue
        kandidati.append(o)
    return rnd.choice(kandidati) if kandidati else None


for r in sorted(rek, key=lambda x: (x["mimo_zaruku"] is False, x["produkt"] is None)):
    if r["bez_obj"]:
        r["produkt"] = r["produkt"] or rnd.choice(["TV-25", "RV-50", "KV-210", "PR-70"])
        continue
    if r["mimo_zaruku"]:
        kand = [o for o in volne_obj if add_months(o["datumnakupu"], 24) <= DNES - dt.timedelta(days=r["upl"])]
        o = rnd.choice(kand) if kand else None
        if o:
            r["produkt"] = o["produkt_kod"]
            if r["typ"] not in TYPY_KAT[P[r["produkt"]]["kat"]]:
                r["typ"] = T1
    elif r["produkt"]:
        o = najdi_obj(r["produkt"], r)
    else:
        o = None
        for _ in range(200):
            kod = rnd.choices(list(vahy_rek), list(vahy_rek.values()))[0]
            if r["typ"] not in TYPY_KAT[P[kod]["kat"]]:
                continue
            if kod == K1 and r["typ"] == T1:  # K1 + typ 1 jen u kotev
                continue
            o = najdi_obj(kod, r)
            if o:
                r["produkt"] = kod
                break
    if not o:
        raise RuntimeError(f"nenalezena objednávka pro {r['stav']} {r['typ']} {r['produkt']}")
    volne_obj.remove(o)
    r["objednavka"] = o

# kanály: E-mail 60, Formulář 36, Telefon 18, Prodejna 6 (prodejna jen kávovary v ČR, jako v ElektroDům/TechnoSvět)
for r in rek:
    r["kanal"] = None
for r in rek:
    if r["bez_obj"]:
        r["kanal"] = "E-mail"
prod_kand = [r for r in rek if r["objednavka"] and r["objednavka"]["zeme"] == "CZ"
             and P[r["produkt"]]["kat"] == 100000000 and not r.get("kotva")]
rnd.shuffle(prod_kand)
for r in prod_kand[:6]:
    r["kanal"] = "Prodejna"
zbyle = [r for r in rek if r["kanal"] is None]
rnd.shuffle(zbyle)
pocty = {"E-mail": 60 - sum(1 for r in rek if r["kanal"] == "E-mail"), "Formulář e-shopu": 36, "Telefon": 18}
seznam = [k for k, n in pocty.items() for _ in range(n)]
assert len(seznam) == len(zbyle), (len(seznam), len(zbyle))
for r, k in zip(zbyle, seznam):
    r["kanal"] = k

# Návrh AI: 60 = 50 vyřízených (40 shoda) + 10 otevřených
vyr = [r for r in rek if r["stav"] == "Vyřízeno"]
rnd.shuffle(vyr)
for i, r in enumerate(vyr[:50]):
    if i < 40:
        r["navrh"] = r["rozhodnuti"]
    else:
        r["navrh"] = rnd.choice([n for n in NAVRHY if n != r["rozhodnuti"]])
    r["shoda"] = r["navrh"] == r["rozhodnuti"]
otev_navrh = volne("Rozhodnuto") + volne("Ke schválení") + volne("U technika")[:1] + \
    [x for x in volne("Posuzuje se") if x.get("kotva") != "K1"][:2]
for r in otev_navrh:
    r["navrh"] = r["rozhodnuti"] or ("K technikovi" if TYP[r["typ"]]["technik"] else TYP[r["typ"]]["vychozi"])

# čísla reklamací podle data uplatnění, NNNNN 10000 až 14199
poradi = sorted(rek, key=lambda x: (-x["upl"], STAVY.index(x["stav"])))
krok = 4199 / len(poradi)
for i, r in enumerate(poradi):
    nnnnn = 10000 + int(i * krok) + rnd.randint(0, max(0, int(krok) - 2))
    r["den"] = DNES - dt.timedelta(days=r["upl"])
    r["cislo"] = f"R-{r['den'].year}-{nnnnn:05d}"

# doplnění textových polí
for r in rek:
    o = r["objednavka"]
    zeme = o["zeme"] if o else "CZ"
    r["zeme"] = "Česko" if zeme == "CZ" else "Slovensko"
    r["jazyk"] = "Čeština" if zeme == "CZ" else "Slovenština"
    if o:
        r["zakaznik"], r["email"] = o["zakaznik"], o["email"]
        r["vzaruce"] = "Ano" if add_months(o["datumnakupu"], 24) > r["den"] else "Ne"
    else:
        z = novy_zakaznik("CZ")
        r["zakaznik"], r["email"], r["vzaruce"] = z["jmeno"], z["email"], ""
    lang = 0 if zeme == "CZ" else 1
    r["popiszakaznika"] = rnd.choice(TXT[r["typ"]][lang]).format(p=KRATKE[r["produkt"]][lang])
    if r["kanal"] == "Telefon":
        r["popiszakaznika"] = "Zapsáno z telefonu: " + r["popiszakaznika"]
    r["popiscesky"] = "" if r["stav"] == "Nová" else CESKY[r["typ"]].format(k=r["produkt"])
    foto = ""
    if r.get("kotva") == "K1" and r["typ"] == T1:
        foto = "kryt-g300.jpg"
    elif r["produkt"] == K2 and r["typ"] in (T1, T3):
        foto = "t150-spojka.jpg"
    r["fotka_soubor"] = foto
    r["popisfotky"] = POPIS_FOTKY[foto] if foto else ""
    if r["stav"] == "Čeká na doplnění":
        r["chybejici"] = "číslo objednávky; doklad o koupi" if r["bez_obj"] else "fotka vady"
    else:
        r["chybejici"] = ""
    r["navrhoduvodneni"] = NAVRH_TXT[r["navrh"]] if r["navrh"] else ""
    r["jistota"] = rnd.choices(["Vysoká", "Střední", "Nízká"], [5, 3, 1])[0] if r["navrh"] else ""
    r["posudek"] = POSUDEK[r["typ"]] if r["posudek_pavel"] else ""
    r["oduvodneni"] = ODUV[r["rozhodnuti"]] if r["rozhodnuti"] else ""
    if r["mimo_zaruku"]:
        r["oduvodneni"] = "Reklamace uplatněna po skončení 24měsíční záruky (čl. 3 reklamačního řádu). Zákazníkovi nabídnuta placená oprava."
    if r["stav"] == "Vyřízeno" and r["rozhodnuti"] != "Zamítnuto":
        cena = o["cena"]
        podil = {"Výměna": (0.6, 1.0), "Oprava": (0.1, 0.4), "Vrácení peněz": (1.0, 1.0), "Sleva": (0.1, 0.3)}[r["rozhodnuti"]]
        r["naklady"] = f"{round(cena * rnd.uniform(*podil), 2):.2f}"
    elif r["stav"] == "Vyřízeno":
        r["naklady"] = "0.00"
    else:
        r["naklady"] = ""
    r["schvalil"] = "Jitka" if r["stav"] == "Vyřízeno" and r["rozhodnuti"] == "Zamítnuto" else ""
    if r["schvalil"]:
        r["komentar"] = "Schvaluji zamítnutí, odůvodnění je v pořádku."
    elif r["vraceno"]:
        r["komentar"] = "Vracím k doplnění: z fotky nejde poznat, jestli jde o náraz. Doplň prosím posudek technika."
    else:
        r["komentar"] = ""

# ---------------------------------------------------------------------------
# E-maily E-01 až E-08
# ---------------------------------------------------------------------------
MAILBOX = "reklamace@pohodaspotrebice.cz"
e05 = novy_zakaznik("CZ", False)
e06 = novy_zakaznik("CZ", True)
o1, o2, o3, o4, o7, o8 = E["01"], E["02"], E["03"], E["04"], E["07"], E["08"]
k1 = lambda o: o["_z"]["krestni"]

MAILY = {
    "01": dict(od=o1, subject="Reklamace kávovaru KV-450", cas="08:52", foto="kryt-g300.jpg", jazyk="cs", kanal="E-mail",
               text=(f"Dobrý den,\n\nv dubnu jsem u vás koupila espresso automat Pohoda KV-450 (objednávka {o1['cislo']}). "
                     "Minulý týden jsem si ráno dělala kávu a po zapnutí jsem si všimla, že přes celý plastový kryt ovládacího panelu vede prasklina. "
                     "Kávovar nikdy nespadl, nic do něj nenarazilo, stojí pořád na stejném místě na lince. "
                     "Posílám fotku a prosím o výměnu.\n\nDěkuji,\n" + o1["zakaznik"]),
               popis="Na espresso automatu KV-450 praskl plastový kryt ovládacího panelu po zapnutí, bez pádu nebo nárazu.",
               typ=T1, chybi=[], mimo=False),
    "02": dict(od=o2, subject="Vysavač nejde zapnout", cas="09:03", foto=None, jazyk="cs", kanal="E-mail",
               text=(f"Dobrý den,\n\nnáš tyčový vysavač TV-25 (objednávka {o2['cislo']}) včera přestal fungovat. "
                     "Je nabitý, kontrolka svítí, ale po stisknutí tlačítka se nic nestane, motor ani necukne. "
                     "Zkoušeli jsme ho nechat nabíjet celou noc, bez změny. Co máme dělat?\n\nS pozdravem\n" + o2["zakaznik"]),
               popis="Tyčový vysavač TV-25 od včerejška nejde zapnout, i když je nabitý.",
               typ=T2, chybi=["fotka vady"], mimo=False),
    "03": dict(od={"zakaznik": "Formulár e-shopu", "email": "formular@pohodaspotrebice.sk"}, subject="Nová reklamácia z e-shopu SK",
               cas="09:10", foto="t150-spojka.jpg", jazyk="sk", kanal="Formulář e-shopu",
               text=(f"Nová reklamácia z formulára pohodaspotrebice.sk\n\nMeno: {o3['zakaznik']}\nE-mail: {o3['email']}\n"
                     f"Číslo objednávky: {o3['cislo']}\nVýrobok: Umývačka riadu Pohoda MY-60\n"
                     "Popis: Pri prvom umývaní začala okolo rýchlospojky prívodnej hadice unikať voda. "
                     "Hadicu sme pripojili presne podľa návodu, aj tak kvapká na podlahu. "
                     "Umývačku sme hneď vypli a zavreli ventil. Prikladám fotku, prosím o výmenu."),
               popis="Myčka MY-60 při prvním mytí teče kolem rychlospojky přívodní hadice.",
               typ=T3, chybi=[], mimo=False),
    "04": dict(od=o4, subject="Chýba diel v balení", cas="09:21", foto=None, jazyk="sk", kanal="E-mail",
               text=(f"Dobrý deň,\n\nobjednal som si prívodnú hadicu s rýchlospojkou HD-15 (objednávka {o4['cislo']}). "
                     "Po rozbalení som zistil, že v balení chýba redukcia na ventil, ktorá je uvedená v obsahu balenia. "
                     "Bez nej hadicu nemôžem pripojiť. Prosím o doposlanie.\n\nĎakujem,\n" + o4["zakaznik"]),
               popis="V balení přívodní hadice HD-15 chybí redukce na ventil uvedená v obsahu balení.",
               typ=T4, chybi=["fotka vady"], mimo=False),
    "05": dict(od={"zakaznik": e05["jmeno"], "email": e05["email"]}, subject="Robotický vysavač nenabíjí", cas="09:34",
               foto=None, jazyk="cs", kanal="E-mail",
               text=("Dobrý den,\n\nmáme od vás robotický vysavač RV-50 a poslední dva týdny se nevrací do nabíjecí stanice a nenabíjí se. "
                     "Když ho na stanici postavím ručně, kontrolka jen chvíli bliká a zhasne. "
                     "Číslo objednávky teď nemůžu najít, kupovala to manželka. Prosím o radu, co dál.\n\nDěkuji\n" + e05["jmeno"]),
               popis="Robotický vysavač RV-50 se dva týdny nevrací do stanice a nenabíjí se.",
               typ=T2, chybi=["číslo objednávky", "fotka vady"], mimo=False),
    "06": dict(od={"zakaznik": e06["jmeno"], "email": e06["email"]}, subject="Ruční vysavač nejde nabít", cas="09:47",
               foto=None, jazyk="cs", kanal="E-mail",
               text=("Dobrý den,\n\nv září jsem v prodejně ElektroDům koupila váš ruční vysavač HV-10. "
                     "Od minulého týdne nejde nabít ani spustit, nabíječka je zapojená, ale kontrolka nesvítí. "
                     "Účtenku ještě hledám, snad ji někde najdu. Můžete mi poradit, jak postupovat?\n\nS pozdravem\n" + e06["jmeno"]),
               popis="Ruční vysavač HV-10 koupený v prodejně ElektroDům nejde nabít ani spustit.",
               typ=T2, chybi=["doklad o koupi", "fotka vady"], mimo=True),
    "07": dict(od=o7, subject="Prasklý kryt KV-450", cas="10:05", foto="kryt-roh.jpg", jazyk="cs", kanal="E-mail",
               text=f"Dobrý den, na kávovaru KV-450 je prasklý kryt, prosím o nový. Objednávka {o7['cislo']}.\n{o7['zakaznik']}",
               popis="Na kávovaru KV-450 je prasklý kryt panelu, zákazník žádá nový.",
               typ=T6, chybi=[], mimo=False),
    "08": dict(od=o8, subject="Myčka teče u hadice", cas="10:18", foto="t150-spojka.jpg", jazyk="cs", kanal="E-mail",
               text=(f"Dobrý den,\n\nmyčka Pohoda MY-60 (objednávka {o8['cislo']}) nám dvě sezóny sloužila bez problémů, "
                     "ale teď začala téct voda kolem rychlospojky přívodní hadice. "
                     "Pod myčkou je po každém mytí mokro. Posílám fotku a prosím o opravu.\n\nDěkuji\n" + o8["zakaznik"]),
               popis="Myčka MY-60 po dvou sezónách teče kolem rychlospojky přívodní hadice.",
               typ=T3, chybi=[], mimo=False),
}
PRODUKT_MAIL = {"01": K1, "02": "TV-25", "03": K2, "04": "HD-15", "05": "RV-50", "06": "HV-10", "07": K1, "08": K2}


def hdr(s):
    return Header(s, "utf-8").encode()


def eml(nn, m):
    od = m["od"]
    b = f"==POHODA-E{nn}=="
    lines = [f"From: {hdr(od['zakaznik'])} <{od['email']}>", f"To: {MAILBOX}", f"Subject: {hdr(m['subject'])}",
             f"Date: Wed, 18 Nov 2026 {m['cas']}:00 +0100", f"Message-ID: <e{nn}.tym12@example.cz>",
             "MIME-Version: 1.0", f'Content-Type: multipart/mixed; boundary="{b}"', "",
             f"--{b}", "Content-Type: text/plain; charset=utf-8", "Content-Transfer-Encoding: 8bit", "",
             m["text"], ""]
    if m["foto"]:
        data = open(os.path.join(FOTKY, m["foto"]), "rb").read()
        lines += [f"--{b}", f'Content-Type: image/jpeg; name="{m["foto"]}"', "Content-Transfer-Encoding: base64",
                  f'Content-Disposition: attachment; filename="{m["foto"]}"', "",
                  base64.encodebytes(data).decode("ascii").rstrip("\n"), ""]
    lines += [f"--{b}--", ""]
    return "\r\n".join(lines)


def ai_json(nn, m):
    o = E.get(nn)
    jmeno = o["zakaznik"] if o else m["od"]["zakaznik"]
    email = o["email"] if o else m["od"]["email"]
    return {"cislo_objednavky": o["cislo"] if o else None, "jmeno": jmeno, "email": email,
            "kod_produktu": PRODUKT_MAIL[nn], "jazyk": m["jazyk"], "kanal": m["kanal"],
            "popis_cesky": m["popis"], "popis_fotky": POPIS_FOTKY[m["foto"]] if m["foto"] else None,
            "typ_vady": m["typ"], "chybejici_udaje": m["chybi"], "nakup_mimo_eshop": m["mimo"]}


# ---------------------------------------------------------------------------
# Kontrolní čísla (počítaná ze stejných dat, která jdou do CSV)
# ---------------------------------------------------------------------------
def kc():
    otev = [r for r in rek if r["stav"] != "Vyřízeno"]
    ohrozene = [r for r in otev if r["stav"] != "Po lhůtě" and 30 - r["upl"] <= 5]
    rozhodnute = [r for r in rek if r["rozhodnuti"]]
    uznane = [r for r in rozhodnute if r["rozhodnuti"] != "Zamítnuto"]
    vyrizene = [r for r in rek if r["stav"] == "Vyřízeno"]
    pp = Counter(r["produkt"] for r in rek)
    top = pp.most_common(2)
    k1t1 = [r for r in rek if r["produkt"] == K1 and r["typ"] == T1]
    d1 = Counter(r["rozhodnuti"] for r in k1t1 if r["stav"] == "Vyřízeno")

    def v3(mena):
        return round(sum(float(r["naklady"]) for r in vyrizene if r["naklady"] and P[r["produkt"]]["kat"] == 100000000
                         and r["objednavka"] and r["objednavka"]["mena"] == mena), 2)

    out = {"datum.dnes": fmt(DNES),
           "pocet.produkt": len(PRODUKTY), "pocet.typvady": len(TYPY), "pocet.objednavka": len(objednavky),
           "pocet.objednavka_sk": sum(1 for o in objednavky if o["zeme"] == "SK"), "pocet.reklamace": len(rek),
           "pocet.otevrene": len(otev), "pocet.ohrozene": len(ohrozene),
           "pocet.po_lhute": sum(1 for r in rek if r["stav"] == "Po lhůtě"),
           "pocet.cekanadoplneni": sum(1 for r in rek if r["stav"] == "Čeká na doplnění"),
           "pocet.mimo_zaruku_objednavky": sum(1 for o in objednavky if o["datumnakupu"] < HRANICE_ZARUKY)}
    for k, v in KATEGORIE.items():
        out[f"kategorie.{k}"] = v
    out["typvady.3"] = T3
    out.update({"kotva.k1.kod": K1, "kotva.k1.nazev": P[K1]["nazev"], "kotva.k2.kod": K2, "kotva.k2.nazev": P[K2]["nazev"]})
    out["e01.cislo"] = "R-2026-14231"
    out["e01.termin"] = fmt(DNES + dt.timedelta(days=30))
    for nn, m in MAILY.items():
        o = E.get(nn)
        out[f"e{nn}.zakaznik"] = o["zakaznik"] if o else m["od"]["zakaznik"]
        out[f"e{nn}.email"] = o["email"] if o else m["od"]["email"]
        out[f"e{nn}.objednavka"] = o["cislo"] if o else ""
        out[f"e{nn}.produkt_kod"] = PRODUKT_MAIL[nn]
        out[f"e{nn}.datum_nakupu"] = fmt(o["datumnakupu"]) if o else ""
        out[f"e{nn}.typ_vady"] = m["typ"]
    out["e08.konec_zaruky"] = fmt(add_months(o8["datumnakupu"], 24))
    out["podil_uznanych"] = round(100 * len(uznane) / len(rozhodnute), 1)
    out["doba_vyrizeni"] = round(sum(r["upl"] - r["vyr"] for r in vyrizene) / len(vyrizene), 1)
    out["top_produkt"] = top[0][0]
    out["test.ohrozene_cisla"] = sorted(r["cislo"] for r in ohrozene)
    out["test.klara_po_lhute"] = sum(1 for r in rek if r["stav"] == "Po lhůtě" and r["vyrizuje"] == "Klára")
    out["test.klara_ohrozene"] = sum(1 for r in ohrozene if r["vyrizuje"] == "Klára")
    out["test.d1_rozhodnuti"] = dict(sorted(d1.items()))
    out["test.v1_k1_30dni"] = sum(1 for r in k1t1 if r["upl"] < 30)
    out["test.v3_naklady_czk"] = v3("CZK")
    out["test.v3_naklady_eur"] = v3("EUR")
    out["test.prodejna"] = sum(1 for r in rek if r["kanal"] == "Prodejna")
    return out, top


KC, TOP = kc()

# ---------------------------------------------------------------------------
# Asserty podle Receptu
# ---------------------------------------------------------------------------
kat = Counter(p["kat"] for p in P.values())
assert len(P) == 15 and kat == {100000000: 5, 100000001: 4, 100000002: 3, 100000003: 3}, kat
assert P[K1]["kat"] == 100000000 and P[K2]["kat"] == 100000002
assert "KP-450" in P and P["KP-450"]["kat"] == 100000003
import re
assert all(re.fullmatch(r"[A-Z]{1,3}-\d{2,3}", k) for k in P)
assert all(p["cena"] % 100 == 90 for p in P.values())
assert all(p["cena"] < 1000 for p in P.values() if p["kat"] == 100000003)
assert sum(not p["aktivni"] for p in P.values()) == 1 and P[K1]["aktivni"] and P[K2]["aktivni"]
assert len(TYPY) == 8 and [t[0] for t in TYPY][2] == T3
assert "prasklina vycházející z otlaku nebo rohu = náraz" in TYP[T6]["popis"].lower()
assert [(t[2], t[3], t[4]) for t in TYPY] == [(True, "Výměna", False), (True, "Oprava", True), (True, "Výměna", True),
                                              (True, "Oprava", False), (True, "Výměna", False), (False, "Zamítnuto", True),
                                              (False, "Zamítnuto", False), (True, None, True)]
assert len(objednavky) == 300
assert sum(o["zeme"] == "CZ" for o in objednavky) == 210 and sum(o["zeme"] == "SK" for o in objednavky) == 90
assert len({o["cislo"] for o in objednavky}) == 300 and len({o["email"] for o in objednavky}) == 300
assert all(o["cislo"].startswith(f"EO-{o['zeme']}-{o['datumnakupu'].year}-") for o in objednavky)
assert all(add_months(DNES, -26) <= o["datumnakupu"] <= DNES - dt.timedelta(days=7) for o in objednavky)
assert KC["pocet.mimo_zaruku_objednavky"] == 8
assert all((o["mena"] == "CZK") == (o["zeme"] == "CZ") for o in objednavky)
assert all(o["cena"] == round(P[o["produkt_kod"]]["cena"] / 25) - 0.01 for o in objednavky if o["zeme"] == "SK")
assert all(o["email"].endswith(".cz" if o["zeme"] == "CZ" else ".sk") for o in objednavky)

assert len(rek) == 120
st = Counter(r["stav"] for r in rek)
assert st == {"Nová": 15, "Čeká na doplnění": 6, "Posuzuje se": 14, "U technika": 3, "Ke schválení": 2,
              "Rozhodnuto": 5, "Po lhůtě": 2, "Vyřízeno": 73}, st
otev = [r for r in rek if r["stav"] != "Vyřízeno"]
assert len(otev) == 47
ohr = [r for r in otev if r["stav"] != "Po lhůtě" and 25 <= r["upl"] <= 30]
assert len(ohr) == 4 and all(0 <= 30 - r["upl"] <= 5 for r in ohr)
assert all(0 <= r["upl"] <= 19 for r in otev if r["stav"] != "Po lhůtě" and r not in ohr)
assert all(32 <= r["upl"] <= 40 for r in rek if r["stav"] == "Po lhůtě")
vyr = [r for r in rek if r["stav"] == "Vyřízeno"]
assert all(35 <= r["upl"] <= 365 and 3 <= r["upl"] - r["vyr"] <= 29 for r in vyr)
assert Counter(r["rozhodnuti"] for r in vyr) == {"Výměna": 30, "Oprava": 20, "Vrácení peněz": 6, "Sleva": 3, "Zamítnuto": 14}
bez = [r for r in rek if not r["objednavka"]]
assert len(bez) == 4 and all(r["stav"] == "Čeká na doplnění" and r["chybejici"] for r in bez)
assert all(r["chybejici"] for r in rek if r["stav"] == "Čeká na doplnění")
assert all(r["zeme"] == ("Česko" if r["objednavka"]["zeme"] == "CZ" else "Slovensko") for r in rek if r["objednavka"])
assert Counter(r["kanal"] for r in rek) == {"E-mail": 60, "Formulář e-shopu": 36, "Telefon": 18, "Prodejna": 6}
assert Counter(r["vyrizuje"] for r in rek) == {"Klára": 110, "Pavel": 10}
pavel = [r for r in rek if r["vyrizuje"] == "Pavel"]
assert sum(r["stav"] == "U technika" for r in pavel) == 3 and sum(r["stav"] == "Vyřízeno" and bool(r["posudek"]) for r in pavel) == 7
assert sum(1 for r in rek if r["stav"] == "Posuzuje se" and r["vyrizuje"] == "Klára" and r["komentar"]) == 2
assert sum(1 for r in rek if r["navrh"]) == 60
vn = [r for r in vyr if r["navrh"]]
assert sum(r["shoda"] for r in vn) == round(0.8 * len(vn))
k1t1 = [r for r in rek if r["produkt"] == K1 and r["typ"] == T1]
assert len(k1t1) == 6
assert sorted(r["upl"] for r in k1t1 if r["stav"] != "Vyřízeno") == sorted(r["upl"] for r in k1t1 if r["upl"] <= 20)
assert sum(1 for r in k1t1 if r["stav"] != "Vyřízeno" and 5 <= r["upl"] <= 20) == 2
assert sum(1 for r in k1t1 if r["stav"] == "Vyřízeno") == 4 and KC["test.d1_rozhodnuti"].get("Zamítnuto") == 1
assert KC["test.v1_k1_30dni"] == 2
for r in rek:
    if r["fotka_soubor"] == "kryt-g300.jpg":
        assert r["produkt"] == K1 and r["typ"] == T1
    elif r["fotka_soubor"] == "t150-spojka.jpg":
        assert r["produkt"] == K2 and r["typ"] in (T1, T3)
    else:
        assert r["fotka_soubor"] == ""
assert all(os.path.exists(os.path.join(FOTKY, f)) for f in POPIS_FOTKY)
for r in vyr:
    if r["rozhodnuti"] == "Zamítnuto":
        assert float(r["naklady"]) == 0
    else:
        assert 0.1 * r["objednavka"]["cena"] - 0.01 <= float(r["naklady"]) <= r["objednavka"]["cena"] + 0.001
cisla = [r["cislo"] for r in rek]
assert len(set(cisla)) == 120
assert all(re.fullmatch(r"R-(2025|2026)-\d{5}", c) and 10000 <= int(c[-5:]) <= 14199 and c[2:6] == str(r["den"].year)
           for c, r in zip(cisla, rek))
assert all(TYP[r["typ"]]["uznatelna"] or r["rozhodnuti"] in (None, "Zamítnuto") for r in rek)
assert all(r["vzaruce"] == "Ano" for r in rek if r["rozhodnuti"] and r["rozhodnuti"] != "Zamítnuto")
# reference: objednávky, produkty a typy vad existují
cisla_obj = {o["cislo"] for o in objednavky}
assert all(r["objednavka"]["cislo"] in cisla_obj for r in rek if r["objednavka"])
assert all(r["produkt"] in P and r["typ"] in TYP for r in rek)
email_obj = {o["cislo"] for o in E.values()}
assert not any(r["objednavka"] and r["objednavka"]["cislo"] in email_obj for r in rek)
# e-maily a pasti
assert all(nn in MAILY for nn in ["01", "02", "03", "04", "05", "06", "07", "08"])
assert all(o["cislo"] in cisla_obj for o in E.values())
assert all(PRODUKT_MAIL[nn] in P and MAILY[nn]["typ"] in TYP for nn in MAILY)
assert o1["_z"]["krestni"] == "Jana" and o1["zeme"] == "CZ" and o1["produkt_kod"] == K1 and o1["datumnakupu"] == add_months(DNES, -7)
assert P[o2["produkt_kod"]]["kat"] == 100000001 and MAILY["02"]["foto"] is None
assert o3["zeme"] == "SK" and o3["produkt_kod"] == K2 and o3["datumnakupu"] == add_months(DNES, -5) and o3["_z"]["zena"]
assert o3["email"] in MAILY["03"]["text"] and MAILY["03"]["od"]["email"] != o3["email"]
assert o4["zeme"] == "SK" and P[o4["produkt_kod"]]["kat"] == 100000003 and MAILY["04"]["foto"] is None
assert all(e05["email"] != o["email"] and e05["jmeno"] != o["zakaznik"] for o in objednavky) and "EO-" not in MAILY["05"]["text"]
assert P[PRODUKT_MAIL["05"]]["kat"] == 100000001 and P[PRODUKT_MAIL["06"]]["kat"] == 100000001
assert all(e06["email"] != o["email"] for o in objednavky) and "EO-" not in MAILY["06"]["text"] and MAILY["06"]["mimo"]
assert "doklad o koupi" in MAILY["06"]["chybi"]
assert o7["produkt_kod"] == K1 and o7["datumnakupu"] == add_months(DNES, -6) and MAILY["07"]["foto"] == "kryt-roh.jpg"
assert o8["produkt_kod"] == K2 and o8["datumnakupu"] == add_months(DNES, -26) and add_months(o8["datumnakupu"], 24) < DNES
assert add_months(o8["datumnakupu"], 26) == DNES  # záruka skončila před 2 měsíci
assert all(add_months(E[n]["datumnakupu"], 24) > DNES for n in ["01", "02", "03", "04", "07"])
assert all(o["cislo"] in MAILY[n]["text"] for n, o in E.items())
# kontrolní čísla
assert KC["pocet.produkt"] == 15 and KC["pocet.typvady"] == 8 and KC["pocet.objednavka"] == 300
assert KC["pocet.objednavka_sk"] == 90 and KC["pocet.reklamace"] == 120 and KC["pocet.otevrene"] == 47
assert KC["pocet.ohrozene"] == 4 and KC["pocet.po_lhute"] == 2 and KC["pocet.cekanadoplneni"] == 6
assert KC["test.prodejna"] == 6 and len(KC["test.ohrozene_cisla"]) == 4
assert TOP[0][1] > TOP[1][1], f"top_produkt není jednoznačný: {TOP}"

# ---------------------------------------------------------------------------
# Zápis
# ---------------------------------------------------------------------------
os.makedirs(ZALOHA, exist_ok=True)


def zapis_csv(nazev, hlavicka, radky):
    with open(os.path.join(DATA, nazev), "w", encoding="utf-8", newline="") as f:
        w = csv.writer(f, lineterminator="\n")
        w.writerow(hlavicka)
        w.writerows(radky)


ano = lambda b: "Ano" if b else "Ne"
zapis_csv("produkt.csv", ["kod", "nazev", "kategorie", "cena", "zaruka", "aktivni"],
          [[p["kod"], p["nazev"], KATEGORIE[p["kat"]], f"{p['cena']:.2f}", 24, ano(p["aktivni"])] for p in P.values()])
zapis_csv("typvady.csv", ["nazev", "kod", "uznatelna", "vychozireseni", "vyzadujetechnika", "popisproai"],
          [[t["nazev"], t["kod"], ano(t["uznatelna"]), t["vychozi"] or "", ano(t["technik"]), t["popis"]] for t in TYP.values()])
zapis_csv("objednavka.csv", ["cislo", "produkt_kod", "zakaznik", "email", "zeme", "datumnakupu", "cena", "mena"],
          [[o["cislo"], o["produkt_kod"], o["zakaznik"], o["email"], "Česko" if o["zeme"] == "CZ" else "Slovensko",
            o["datumnakupu"].isoformat(), f"{o['cena']:.2f}", o["mena"]] for o in objednavky])
H = ["cislo", "stav", "kanal", "zeme", "jazyk", "produkt_kod", "objednavka_cislo", "typvady_nazev", "zakaznik", "email",
     "popiszakaznika", "popiscesky", "fotka_soubor", "popisfotky", "uplatneno_pred_dny", "vzaruce", "chybejici",
     "navrhai", "navrhoduvodneni", "jistota", "posudek", "rozhodnuti", "oduvodneni", "naklady", "schvalil", "komentar",
     "vyrizuje", "vyrizeno_pred_dny", "shodasai"]
zapis_csv("reklamace.csv", H, [[
    r["cislo"], r["stav"], r["kanal"], r["zeme"], r["jazyk"], r["produkt"],
    r["objednavka"]["cislo"] if r["objednavka"] else "", r["typ"], r["zakaznik"], r["email"],
    r["popiszakaznika"], r["popiscesky"], r["fotka_soubor"], r["popisfotky"], r["upl"], r["vzaruce"], r["chybejici"],
    r["navrh"] or "", r["navrhoduvodneni"], r["jistota"], r["posudek"], r["rozhodnuti"] or "", r["oduvodneni"],
    r["naklady"], r["schvalil"], r["komentar"], r["vyrizuje"], "" if r["vyr"] is None else r["vyr"],
    ano(r["shoda"]) if "shoda" in r else ""] for r in sorted(rek, key=lambda x: x["cislo"])])

for nn, m in MAILY.items():
    with open(os.path.join(VSTUPY, f"E-{nn}.eml"), "w", encoding="utf-8", newline="") as f:
        f.write(eml(nn, m))
    with open(os.path.join(ZALOHA, f"E-{nn}.json"), "w", encoding="utf-8", newline="\n") as f:
        json.dump(ai_json(nn, m), f, ensure_ascii=False, indent=2)
        f.write("\n")
with open(os.path.join(ROOT, "kontrolni-cisla.json"), "w", encoding="utf-8", newline="\n") as f:
    json.dump(KC, f, ensure_ascii=False, indent=2)
    f.write("\n")

print("OK: všechny asserty prošly")
print(f"  podil_uznanych={KC['podil_uznanych']} %  doba_vyrizeni={KC['doba_vyrizeni']} dní  top_produkt={KC['top_produkt']} {TOP}")
