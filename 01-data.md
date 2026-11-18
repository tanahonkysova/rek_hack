# Část 1: Data v Dataverse

| | |
|---|---|
| **Kdo** | data + aplikace (1 člověk) |
| **Čas** | 9:45-10:45 (schéma 9:45-10:30, recept a generátor dat 10:15-10:40 po skončení části 0), kontrola mentora v 11:15 |
| **Nástroje** | AI agent v terminálu s pluginem `dataverse` (skilly dv-connect, dv-metadata, dv-data), Python 3 |
| **Výstup** | solution `Reklamace` se 4 tabulkami, data vaší firmy vygenerovaná podle receptu, `kontrolni-cisla.json`, `data/vstupy/` (e-maily pro F1 a agenta), `reklamace-schema.json` |

## Popis

Struktura dat je pevné jádro zadání: tabulky, logické názvy, typy, hodnoty choice, výpočty, pravidla, počty záznamů a záměrné pasti mají všechny týmy stejné. Na nich stojí flow, agent, report a kontrola mentora.

Obsah dat je vaše firma. Agent podle sekce `## Podklady pro data` v `brand/firma.md` navrhne ceník výrobků a typické vady z vašeho oboru, nechá je potvrdit a napíše generátor `data/generuj.py`. Ten vyrobí CSV, e-maily E-01 až E-08 pro F1 a agenta a soubor `kontrolni-cisla.json`. Výrobce kávovarů tak bude reklamovat kávovary, výrobce nářadí nářadí, a čísla, jména a částky v Ověřeních všech částí se berou z `kontrolni-cisla.json`, ne ze zadání.

Když generátor do 10:45 neprojde, naimportujete základní sadu ze starter-kitu (grily, sekačky a tlakové čističe) a pokračujete s ní.

## Spuštění

Vložte agentovi v terminálu:

```
Přečti soubor 02-use-casy/reklamace-stavba/01-data.md a proveď sekci „Postup pro agenta" krok po kroku.
Dodržuj sekci „Pravidla pro agenta". Hodnoty v <ostrých závorkách> se mě zeptej před krokem,
který je potřebuje. Po každém kroku proveď jeho Ověření a pokračuj, jen když projde.
Když ověření neprojde dvakrát, zastav se a popiš mi problém.
```

## Pravidla pro agenta

1. Logické názvy, typy, délky a hodnoty choice ber **přesně** ze Specifikace. Nic nepřejmenovávej, nepřidávej ani nevynechávej. Jediná výjimka jsou popisky choice Kategorie, které nastaví krok 4 podle receptu.
2. `{p}` je prefix publisheru týmu, zjisti ho v kroku 1.
3. Choice zakládej s čísly ze Specifikace (100000000 a dál), flow, agent a report na ně odkazují číslem.
4. Všechno do solution `Reklamace`.
5. Nic nemaž bez mého potvrzení, kromě testovacích záznamů, které krok povoluje smazat.
6. Do Objednávky (replika z ERP) zapisuje jen import.
7. Po každém kroku napiš jednou větou, co vzniklo, a výsledek ověření.
8. Sloupce pro výzvu týmu zakládej až v kroku 7 a jen ty, které jsou v `navrh-reseni.md` v sekci Výzva. Existující sloupce kvůli výzvě neměň.
9. Data generuje skript, ne ty ručně. Počty, rozložení stavů, pasti a kotvy z Receptu na data jsou pevné, z `firma.md` bereš jen obsah (výrobky, vady, ceny, jména, texty). O skutečné firmě nic nevymýšlej, výrobky a zákazníci jsou smyšlení, i když odpovídají oboru.
10. Kontrolní čísla nikdy nepočítej z hlavy ani je neopisuj ze zadání. Bere je jen generátor ze stejných dat, která zapisuje do CSV.

## Vstupy

| Hodnota | Odkud |
|---|---|
| `<URL prostředí>` | portál, sekce Můj tým |
| `<lab účet>` | portál, sekce Můj tým |
| `<lab účty týmu>` | portál, mapování na persony Klára, Pavel, Jitka, Radek |
| `<číslo týmu>` | portál, sekce Můj tým (seed generátoru, stejné číslo jako v `navrh-reseni.md`) |
| podklady pro data | `brand/firma.md`, sekce `## Podklady pro data` z části 0 |
| fotky kotev | `starter-kit/fotky/` (kryt-g300.jpg, kryt-roh.jpg, t150-spojka.jpg) |
| základní sada (záloha) | `starter-kit/data-zaklad/*.csv`, `starter-kit/data-zaklad/vstupy/`, `starter-kit/kontrolni-cisla-zaklad.json` |

## Specifikace

### Tabulky

| Tabulka (zobrazovaný název) | Logický název | Primární sloupec | Množné číslo |
|---|---|---|---|
| Produkt | `{p}_produkt` | `{p}_kod` Text 20 | Produkty |
| Objednávka | `{p}_objednavka` | `{p}_cislo` Text 20 | Objednávky |
| Typ vady | `{p}_typvady` | `{p}_nazev` Text 100 | Typy vad |
| Reklamace | `{p}_reklamace` | `{p}_cislo` Autonumber `R-{DATETIMEUTC:yyyy}-{SEQNUM:5}` | Reklamace |

Všechny: vlastnictví User/Team, bez příloh a poznámek.

### Produkt `{p}_produkt`

| Zobrazovaný název | Logický název | Typ | Nastavení |
|---|---|---|---|
| Kód | `{p}_kod` | Text 20 | primární, povinný, např. G-300, alternativní klíč `{p}_kod_key` |
| Název | `{p}_nazev` | Text 200 | povinný |
| Kategorie | `{p}_kategorie` | Choice `Kategorie` | povinný |
| Cena (Kč) | `{p}_cena` | Decimal, 2 místa | doporučená prodejní cena v ČR |
| Záruka (měsíce) | `{p}_zaruka` | Whole number | výchozí 24 |
| Aktivní | `{p}_aktivni` | Yes/No | výchozí Ano |

### Objednávka `{p}_objednavka`

Zjednodušení: jedna objednávka = jeden produkt.

| Zobrazovaný název | Logický název | Typ | Nastavení |
|---|---|---|---|
| Číslo objednávky | `{p}_cislo` | Text 20 | primární, povinný, formát EO-CZ-2026-003881, alternativní klíč `{p}_cislo_key` |
| Produkt | `{p}_produkt` | Lookup → `{p}_produkt` | povinný |
| Zákazník | `{p}_zakaznik` | Text 100 | jméno a příjmení |
| E-mail zákazníka | `{p}_email` | Text 100, formát Email | druhý klíč pro dohledání |
| Země | `{p}_zeme` | Choice `Země` | povinný |
| Datum nákupu | `{p}_datumnakupu` | Date only | začátek záruky |
| Cena | `{p}_cena` | Decimal, 2 místa | zaplacená cena, strop pro vrácení peněz |
| Měna | `{p}_mena` | Choice `Měna` | CZ = CZK, SK = EUR |

### Typ vady `{p}_typvady`

| Zobrazovaný název | Logický název | Typ | Nastavení |
|---|---|---|---|
| Název | `{p}_nazev` | Text 100 | primární, povinný |
| Kód | `{p}_kod` | Text 10 | |
| Uznatelná | `{p}_uznatelna` | Yes/No | Ne = důvod k zamítnutí, pokud se potvrdí |
| Výchozí řešení | `{p}_vychozireseni` | Choice `Řešení` | prázdné u Nelze určit |
| Vyžaduje technika | `{p}_vyzadujetechnika` | Yes/No | Ano = před rozhodnutím posudek technika |
| Popis pro AI | `{p}_popisproai` | Multiline 2000 | jak vadu poznat z popisu a fotky |

### Reklamace `{p}_reklamace`

| Zobrazovaný název | Logický název | Typ | Nastavení |
|---|---|---|---|
| Číslo | `{p}_cislo` | Autonumber | primární |
| Stav | `{p}_stav` | Choice `Stav reklamace` | povinný, výchozí Nová |
| Kanál | `{p}_kanal` | Choice `Kanál` | |
| Země | `{p}_zeme` | Choice `Země` | |
| Jazyk | `{p}_jazyk` | Choice `Jazyk` | jazyk zákazníka, výchozí Čeština |
| Produkt | `{p}_produkt` | Lookup → `{p}_produkt` | z objednávky nebo podle AI |
| Objednávka | `{p}_objednavka` | Lookup → `{p}_objednavka` | prázdné = objednávka nenalezena |
| Typ vady | `{p}_typvady` | Lookup → `{p}_typvady` | navrhuje AI, potvrzuje specialistka |
| Zákazník | `{p}_zakaznik` | Text 100 | |
| E-mail zákazníka | `{p}_email` | Text 100, formát Email | |
| Popis zákazníka | `{p}_popiszakaznika` | Multiline 10000 | původní text e-mailu |
| Popis česky | `{p}_popiscesky` | Multiline 2000 | shrnutí vady česky, zapisuje F1 nebo specialistka ručně |
| Fotka vady | `{p}_fotka` | Image, max 10 240 kB, Can store full images = Ano | z přílohy e-mailu nebo nahraná ve formuláři |
| Popis fotky | `{p}_popisfotky` | Multiline 2000 | co AI na fotce vidí, zapisuje F1 |
| Uplatněno dne | `{p}_uplatnenodne` | Date only | den přijetí, od něj běží lhůta |
| Lhůta | `{p}_lhuta` | Date only, Calculated | `AddDays(30, {p}_uplatnenodne)` |
| Zbývá dní | `{p}_zbyvadni` | Whole number, Calculated | `DiffInDays(Now(), {p}_lhuta)` |
| V záruce | `{p}_vzaruce` | Yes/No | zapisuje F1 nebo ruční formulář |
| Chybějící údaje | `{p}_chybejici` | Text 300 | např. „číslo objednávky; doklad o koupi" |
| Návrh AI | `{p}_navrhai` | Choice `Návrh AI` | zapisuje agent |
| Odůvodnění návrhu | `{p}_navrhoduvodneni` | Multiline 4000 | 2 až 4 věty s citací článku, zapisuje agent |
| Jistota AI | `{p}_jistota` | Choice `Jistota` | zapisuje agent |
| Posudek technika | `{p}_posudek` | Multiline 4000 | píše technik |
| Rozhodnutí | `{p}_rozhodnuti` | Choice `Řešení` | zapisuje specialistka |
| Odůvodnění rozhodnutí | `{p}_oduvodneni` | Multiline 4000 | povinné u Zamítnuto (aplikace) |
| Náklady řešení | `{p}_naklady` | Decimal, 2 místa | v měně objednávky |
| Schválil | `{p}_schvalil` | Lookup → systemuser | zapisuje F2 |
| Komentář schvalovatele | `{p}_komentar` | Multiline 2000 | zapisuje F2 |
| Vyřizuje | `{p}_vyrizuje` | Lookup → systemuser | |
| Datum vyřízení | `{p}_datumvyrizeni` | Date only | zapisuje aplikace |
| Shoda s AI | `{p}_shodasai` | Yes/No | zapisuje aplikace |

### Hodnoty choice (všechny lokální)

| Choice | Hodnota: popisek |
|---|---|
| Kategorie | 100000000 až 100000003, popisky podle receptu (krok 4). Základní sada: 100000000 Grily · 100000001 Sekačky · 100000002 Tlakové čističe · 100000003 Příslušenství. Hodnota 100000003 je vždy příslušenství nebo náhradní díly |
| Země | 100000000 Česko · 100000001 Slovensko |
| Měna | 100000000 CZK · 100000001 EUR |
| Stav reklamace | 100000000 Nová · 100000001 Čeká na doplnění · 100000002 Posuzuje se · 100000003 U technika · 100000004 Ke schválení · 100000005 Rozhodnuto · 100000006 Vyřízeno · 100000007 Po lhůtě |
| Kanál | 100000000 E-mail · 100000001 Formulář e-shopu · 100000002 Telefon · 100000003 Prodejna |
| Jazyk | 100000000 Čeština · 100000001 Slovenština |
| Řešení | 100000000 Oprava · 100000001 Výměna · 100000002 Vrácení peněz · 100000003 Sleva · 100000004 Zamítnuto |
| Návrh AI | 100000000 Oprava · 100000001 Výměna · 100000002 Vrácení peněz · 100000003 Sleva · 100000004 Zamítnuto · 100000005 K technikovi |
| Jistota | 100000000 Vysoká · 100000001 Střední · 100000002 Nízká |

Hodnoty 100000000 až 100000004 jsou v Řešení a Návrh AI stejné, Shoda s AI se počítá porovnáním čísel.

## Recept na data

Recept je pro všechny týmy stejný. Generátor ho dodrží pro jakýkoli obor a v kroku 4 ho ověří asserty. Dnes je den akce, 18. 11. 2026. Všechna data jsou relativní k němu (`dnes`), aby lhůty a záruky dávaly stejné pasti v kterýkoli den spuštění.

### Kotvy

Fotky vad generovat nejde, proto má recept 2 kotevní výrobky, ke kterým fotky ze starter-kitu sedí. Kolem kotev se generují jména, čísla objednávek, data a ceny, kotva samotná (druh výrobku, díl a popis fotky) zůstává.

| Kotva | Druh výrobku | Fotky | Popis fotky (pevný) | Základní sada |
|---|---|---|---|---|
| K1 | výrobek s plastovým krytem ovládacího panelu | `kryt-g300.jpg` (E-01), `kryt-roh.jpg` (E-07) | E-01: „Prasklina přes plastový kryt ovládacího panelu, okraje čisté, bez stop nárazu." E-07: „Prasklina vychází z otlaku na rohu krytu, roh je promáčknutý." | G-300 Plynový gril, 3 hořáky |
| K2 | výrobek s hadicí a rychlospojkou | `t150-spojka.jpg` (E-03, E-08) | „Voda uniká kolem rychlospojky hadice, těsnění je vidět posunuté." | T-150 Tlakový čistič |

Když firma prodává výrobek, na který fotka sedí (kávovar nebo myčka s ovládacím panelem, zahradní technika s hadicí), kotva dostane jeho kód a název z oboru. Když ne, kotva zůstane jako „výrobek z pilotní řady" se jménem ze základní sady a agent to zapíše do `firma.md` jednou větou (např. „Grily a čističe jsou pilotní řada nové značky skupiny.").

### Produkt (15)

| Pravidlo | Hodnota |
|---|---|
| Počet | 15: 5 v kategorii 100000000, 4 v 100000001, 3 v 100000002, 3 příslušenství a náhradní díly v 100000003 |
| Kotvy | K1 v kategorii 100000000, K2 v kategorii 100000002; mezi příslušenstvím náhradní kryt panelu pro K1 |
| Kód | 1 až 3 písmena, pomlčka, 2 až 3 číslice (např. KV-210), jedinečný |
| Cena | podle cenové hladiny z `firma.md`, celé koruny končící 90, příslušenství pod 1 000 Kč |
| Záruka | 24 u všech |
| Aktivní | 14 Ano, 1 Ne (výrobek doprodaný, jiný než kotvy) |

### Typ vady (8)

Názvy a nastavení 7 typů jsou pevné, na nich stojí pravidla agenta a testy. Typ č. 3 je oborový: agent ho vybere z typických vad ve `firma.md` (např. „Únik vody", „Vadná baterie"). Popis pro AI všech 8 typů napiš pro výrobky firmy, u typu Mechanické poškození uživatelem vždy s větou „prasklina vycházející z otlaku nebo rohu = náraz".

| # | Název | Uznatelná | Výchozí řešení | Vyžaduje technika |
|---|---|---|---|---|
| 1 | Výrobní vada materiálu | Ano | Výměna | Ne |
| 2 | Nefunkční elektrika nebo motor | Ano | Oprava | Ano |
| 3 | oborový typ (základ: Únik plynu nebo vadný ventil) | Ano | Výměna | Ano |
| 4 | Chybějící díl v balení | Ano | Oprava | Ne |
| 5 | Poškození při přepravě | Ano | Výměna | Ne |
| 6 | Mechanické poškození uživatelem | Ne | Zamítnuto | Ano |
| 7 | Běžné opotřebení | Ne | Zamítnuto | Ne |
| 8 | Nelze určit | Ano | prázdné | Ano |

### Objednávka (300)

| Pravidlo | Hodnota |
|---|---|
| Počet | 300: 210 Česko (CZK), 90 Slovensko (EUR). Poměr je pevný bez ohledu na odpověď v `firma.md` |
| Číslo | `EO-CZ-RRRR-NNNNNN` a `EO-SK-RRRR-NNNNNN`, RRRR = rok nákupu, NNNNNN jedinečné |
| Datum nákupu | rovnoměrně od `dnes - 26 měsíců` do `dnes - 7 dní`. Přesně 8 objednávek starších než 24 měsíců (mimo záruku) |
| Cena | cena produktu, u Slovenska v EUR = cena v Kč / 25 zaokrouhlená na celá eura minus 0,01 |
| Zákazník a e-mail | smyšlená česká a slovenská jména, e-mail `jmeno.prijmeni@example.cz` nebo `.sk`, jedinečný |

### Reklamace (120)

| Pravidlo | Hodnota |
|---|---|
| Počet | 120, z toho 47 otevřených (stav jiný než 100000006) a 73 Vyřízeno |
| Stavy otevřených | Nová 15, Čeká na doplnění 6, Posuzuje se 14, U technika 3, Ke schválení 2, Rozhodnuto 5, Po lhůtě 2 |
| Ohrožené lhůtou | přesně 4 otevřené se stavem jiným než Po lhůtě mají `uplatneno_pred_dny` 25 až 30 (Zbývá dní 0 až 5). Ostatní otevřené kromě Po lhůtě 0 až 19 dní |
| Po lhůtě | 2 reklamace, `uplatneno_pred_dny` 32 až 40 |
| Vyřízeno | `uplatneno_pred_dny` 35 až 365, `vyrizeno_pred_dny` o 3 až 29 dní menší, Rozhodnutí: Výměna 30, Oprava 20, Vrácení peněz 6, Sleva 3, Zamítnuto 14 |
| Zemi a jazyk | podle objednávky, 4 otevřené reklamace bez objednávky (stav Čeká na doplnění, Chybějící údaje vyplněné) |
| Kanál | E-mail 60, Formulář e-shopu 36, Telefon 18, Prodejna 6 |
| Vyřizuje | Klára 110, Pavel 10 (3 ve stavu U technika a 7 vyřízených s posudkem). U 2 otevřených Kláry stav Posuzuje se s neprázdným Komentářem schvalovatele (vrácené od Jitky) |
| Návrh AI | vyplněný u 60 reklamací, Shoda s AI u vyřízených ve 80 % Ano |
| Kotva K1 | 2 reklamace K1 s typem Výrobní vada materiálu a `uplatneno_pred_dny` 5 až 20 (s E-01 jsou pak 3 za 30 dnů, potřebuje výzva V1) a 4 vyřízené K1 se stejným typem, z toho 1 Zamítnuto (potřebuje dovednost D1) |
| Fotky | `fotka_soubor` jen u reklamací kotev s odpovídajícím typem vady: `kryt-g300.jpg` u K1 s typem 1, `t150-spojka.jpg` u K2 s typem 3 nebo 1 |
| Náklady | u vyřízených s uznáním náklady 10 až 100 % ceny objednávky, u Zamítnuto 0 |
| Číslo | `R-2025-NNNNN` nebo `R-2026-NNNNN` podle Uplatněno dne, NNNNN mezi 10000 a 14199, jedinečné. Seed autonumber 14231 je pevný |

### E-maily pro F1 a agenta (`data/vstupy/`)

8 souborů `E-01.eml` až `E-08.eml` (UTF-8, hlavičky From, To, Subject, tělo, příloha jako base64 z fotky kotvy) a k nim `data/vstupy/ai-zaloha/E-0N.json` s výstupem AI promptu, který má F1 dostat (záloha bez AI kreditů). Objednávky, na které e-maily odkazují, jsou mezi 300 objednávkami, reklamace z e-mailů ještě neexistují. Texty piš jako skutečný zákazník oboru firmy, 3 až 6 vět, bez šablonovitosti.

| E-mail | Jazyk a kanál | Objednávka | Produkt a fotka | Obsah | Správně |
|---|---|---|---|---|---|
| E-01 | cs, E-mail | číslo v textu, nákup `dnes - 7 měsíců` | K1, `kryt-g300.jpg` | zákaznice s křestním jménem Jana, praskl kryt panelu bez pádu, chce výměnu | V záruce, Výrobní vada materiálu, návrh Výměna, jistota Vysoká |
| E-02 | cs, E-mail | číslo v textu | jiný výrobek kategorie 100000001, bez fotky | výrobek přestal fungovat, nejde zapnout | Nefunkční elektrika nebo motor, F1 výzva k doplnění fotky |
| E-03 | sk, Formulář e-shopu | číslo SK v textu formuláře, nákup `dnes - 5 měsíců` | K2, `t150-spojka.jpg` | únik u spojky hadice při prvním použití, e-mail zákaznice jen v textu formuláře | Jazyk Slovenština, Výměna, potvrzení slovensky |
| E-04 | sk, E-mail | číslo SK v textu | příslušenství, bez fotky | v balení chybí díl | Chybějící díl v balení, F1 výzva k doplnění fotky |
| E-05 | cs, E-mail | žádné číslo, odesílatel v objednávkách není | výrobek kategorie 100000001 | popis vady bez čísla objednávky | past: objednávka nenalezena, Čeká na doplnění, agent nic nevymyslí |
| E-06 | cs, E-mail | žádná, koupeno v obchodním řetězci | výrobek kategorie 100000001 | nejde nabít nebo spustit, účtenku hledá | past: nakup_mimo_eshop, výzva k dokladu o koupi |
| E-07 | cs, E-mail | číslo v textu, nákup `dnes - 6 měsíců` | K1, `kryt-roh.jpg` | stručně „prasklý kryt, prosím o nový" | past: otlak na rohu, K technikovi, nikdy Výměna |
| E-08 | cs, E-mail | číslo v textu, nákup `dnes - 26 měsíců` (záruka skončila před 2 měsíci) | K2, `t150-spojka.jpg` | únik u spojky po 2 sezónách | past: mimo záruku, návrh Zamítnuto, nikdy uznání |

## Kontrolní čísla

`kontrolni-cisla.json` je plochý JSON v kořeni projektu. Klíče jsou pro všechny týmy stejné, hodnoty má každý tým jiné. Ověření ve všech částech na ně odkazují zápisem `kontrolni-cisla.json` → `klíč`. Data jsou ve tvaru `d. M. yyyy`, částky jako čísla.

| Klíč | Význam |
|---|---|
| `datum.dnes` | den, ke kterému generátor počítal (18. 11. 2026) |
| `pocet.produkt`, `pocet.typvady`, `pocet.objednavka`, `pocet.objednavka_sk`, `pocet.reklamace` | 15, 8, 300, 90, 120 |
| `pocet.otevrene`, `pocet.ohrozene`, `pocet.po_lhute`, `pocet.cekanadoplneni`, `pocet.mimo_zaruku_objednavky` | 47, 4, 2, 6, 8 |
| `kategorie.100000000` až `kategorie.100000003` | popisky kategorií |
| `typvady.3` | název oborového typu vady |
| `kotva.k1.kod`, `kotva.k1.nazev`, `kotva.k2.kod`, `kotva.k2.nazev` | kotevní výrobky |
| `e01.cislo`, `e01.termin` | R-2026-14231 a Lhůta E-01 (`dnes + 30`), když E-01 přijde jako první |
| `eNN.zakaznik`, `eNN.email`, `eNN.objednavka`, `eNN.produkt_kod`, `eNN.datum_nakupu`, `eNN.typ_vady` pro NN 01 až 08 | údaje e-mailů (u E-05 a E-06 `objednavka` prázdná) |
| `e08.konec_zaruky` | datum nákupu E-08 + 24 měsíců |
| `podil_uznanych` | rozhodnuté s Rozhodnutím jiným než Zamítnuto / všechny rozhodnuté, v % na 1 desetinné místo |
| `doba_vyrizeni` | průměr dnů mezi Uplatněno dne a Datem vyřízení u Vyřízeno, na 1 desetinné místo |
| `top_produkt` | kód produktu s nejvíc reklamacemi |
| `test.ohrozene_cisla` | čísla 4 ohrožených reklamací |
| `test.klara_po_lhute`, `test.klara_ohrozene` | počty pro dovednost D3 |
| `test.d1_rozhodnuti` | počty rozhodnutí vyřízených reklamací K1 s typem Výrobní vada materiálu podle Rozhodnutí |
| `test.v1_k1_30dni` | počet reklamací K1 s typem Výrobní vada materiálu za 30 dnů bez E-01 (2) |
| `test.v3_naklady_czk`, `test.v3_naklady_eur` | součet Nákladů vyřízených reklamací kategorie 100000000 v CZK a v EUR |
| `test.prodejna` | počet reklamací s Kanálem Prodejna (6) |

### Základní sada pro mentora

Když tým jede na základní sadě, hodnoty jsou v `starter-kit/kontrolni-cisla-zaklad.json`:

| Klíč | Základní sada |
|---|---|
| `kategorie.100000000` až `.100000003` | Grily, Sekačky, Tlakové čističe, Příslušenství |
| `typvady.3` | Únik plynu nebo vadný ventil |
| `kotva.k1.kod` / `kotva.k2.kod` | G-300 / T-150 |
| `e01.cislo`, `e01.zakaznik`, `e01.objednavka`, `e01.datum_nakupu` | R-2026-14231, Jana Kovářová, EO-CZ-2026-003881, 14. 4. 2026 |
| `e01.termin` | 18. 12. 2026 |
| `e03.zakaznik`, `e03.email`, `e03.objednavka` | Zuzana Horváthová, zuzana.horvathova@example.sk, EO-SK-2026-001244 |
| `e07.zakaznik`, `e07.objednavka`, `e07.datum_nakupu` | Tomáš Král, EO-CZ-2026-005322, 30. 5. 2026 |
| `e08.zakaznik`, `e08.objednavka`, `e08.datum_nakupu`, `e08.konec_zaruky` | Petra Šimková, EO-CZ-2024-009127, 18. 9. 2024, 18. 9. 2026 |
| `top_produkt` | G-300 |
| `podil_uznanych`, `doba_vyrizeni` a klíče `test.*` | spočítá generátor základní sady, jsou v souboru |

## Postup pro agenta

### Krok 1: Připojení a solution

- **Akce:** připoj se k `<URL prostředí>` pod `<lab účet>` (skill dv-connect). Najdi publisher týmu (ten, který není Default ani Microsoft) a zjisti prefix `{p}`. Pokud solution `Reklamace` neexistuje, založ ji s tímto publisherem, zobrazovaný název „Reklamace", verze 1.0.0.0.
- **Ověření:** dotaz na `solution` s filtrem `uniquename eq 'Reklamace'` vrátí 1 záznam s publisherem s prefixem `{p}`.

### Krok 2: Produkt, Objednávka, Typ vady

- **Akce:** založ `{p}_produkt`, `{p}_objednavka` a `{p}_typvady` podle Specifikace včetně lokálních choice a alternativních klíčů `{p}_kod_key` a `{p}_cislo_key`. Kategorie zatím s popisky základní sady.
- **Ověření:** Produkt má 6 sloupců, Objednávka 8, Typ vady 6. Oba klíče jsou ve stavu Active (ověřuj po 15 s, může trvat minutu).

### Krok 3: Reklamace

- **Akce:** založ `{p}_reklamace` podle Specifikace. Primární sloupec `{p}_cislo` jako autonumber `R-{DATETIMEUTC:yyyy}-{SEQNUM:5}`. Calculated sloupce Lhůta a Zbývá dní založ až po sloupci Uplatněno dne. Publikuj customizace.
- **Ověření:** tabulka má 31 sloupců. Založ testovací reklamaci s Uplatněno dne = dnes. Číslo začíná `R-2026-`, Stav = 100000000, Lhůta = dnes + 30, Zbývá dní = 30. Záznam smaž.

### Krok 4: Recept a generátor dat

- **Akce:** počkej, až část 0 zapíše do `brand/firma.md` sekci `## Podklady pro data` (nejpozději 10:15, jinak se mě zeptej, jestli jet na základní sadě). Pak:
  1. Navrhni z podkladů ceník 15 výrobků podle Receptu (kód, název, kategorie, cena), 4 popisky kategorií, oborový typ vady č. 3, Popis pro AI všech 8 typů a kotvy K1 a K2 (výrobek z oboru, nebo pilotní řada). Ukaž mi to jako 3 tabulky a doptej se, když něco neodpovídá oboru nebo cenové hladině. Bez mého potvrzení nepokračuj.
  2. Napiš `data/generuj.py` (jen standardní knihovna Pythonu, `random.Random(<číslo týmu>)`, žádné volání sítě ani AI). Skript má potvrzený katalog jako konstanty, generuje podle Receptu `data/produkt.csv`, `typvady.csv`, `objednavka.csv`, `reklamace.csv` ve formátu z kroku 5, e-maily a AI zálohy do `data/vstupy/` a `kontrolni-cisla.json` do kořene projektu.
  3. Na konci skriptu ověř asserty každé číslo z Receptu (počty, stavy, ohrožené, po lhůtě, 8 objednávek mimo záruku, 210/90, kanály, kotvy, pasti E-01 až E-08) a že každá objednávka, produkt a typ vady v e-mailech a reklamacích existuje.
  4. Spusť ho. Texty e-mailů a Popisy pro AI mi ukaž (stačí E-01, E-03, E-07), ať zní jako zákazníci našeho oboru.
  5. Změň popisky choice Kategorie v Dataverse podle receptu a publikuj.
- **Ověření:** skript doběhne bez chyby a všechny asserty projdou. Druhé spuštění dá stejné soubory (deterministický seed). `kontrolni-cisla.json` je platný JSON a má všechny klíče ze sekce Kontrolní čísla. Popisky Kategorie v Dataverse = `kategorie.*`.
- **Hlášení:** ceník, kotvy, typ vady č. 3 a hodnoty `podil_uznanych`, `doba_vyrizeni`, `top_produkt`.

### Krok 5: Import dat

- **Akce:** naimportuj v pořadí `data/produkt.csv`, `typvady.csv`, `objednavka.csv`, `reklamace.csv`.
  - Sloupce CSV odpovídají logickým názvům bez prefixu. Choice jsou v CSV jako popisky, převeď je na hodnoty ze Specifikace.
  - Lookupy: `produkt_kod` → Produkt podle `{p}_kod`, `objednavka_cislo` → Objednávka podle `{p}_cislo`, `typvady_nazev` → Typ vady podle `{p}_nazev`.
  - `reklamace.csv` má místo dat sloupce `uplatneno_pred_dny` a `vyrizeno_pred_dny`. Převeď je na `{p}_uplatnenodne` = dnes - N a `{p}_datumvyrizeni` = dnes - N, aby lhůty odpovídaly dni importu. Čísla reklamací ber z CSV.
  - Sloupce `vyrizuje` a `schvalil` obsahují jména Klára, Pavel, Jitka. Zeptej se mě na mapování na `<lab účty týmu>`; Kláru na můj účet. Když je účtů méně, namapuj zbylá jména na můj účet a řekni mi to.
  - Fotky: reklamacím, které mají v CSV sloupec `fotka_soubor`, nahraj soubor ze `starter-kit/fotky/` do `{p}_fotka`.
  - Importuj dávkami po 50.
  - Po importu nastav počáteční číslo autonumber (SetAutoNumberSeed) `{p}_reklamace.{p}_cislo` na 14231.
- **Ověření:** počty v Dataverse = `kontrolni-cisla.json` → `pocet.produkt`, `pocet.typvady`, `pocet.objednavka` (z toho `pocet.objednavka_sk` Slovensko), `pocet.reklamace`. Otevřené reklamace (stav jiný než 100000006) = `pocet.otevrene`. Otevřené se Zbývá dní ≤ 5 a stavem jiným než 100000007 = `pocet.ohrozene` a jejich čísla = `test.ohrozene_cisla`. Stav Po lhůtě = `pocet.po_lhute`. Objednávky s Datem nákupu starším než 24 měsíců = `pocet.mimo_zaruku_objednavky`. Podíl uznaných z Dataverse = `podil_uznanych`.
- **Hlášení:** tabulka počtů: Dataverse proti `kontrolni-cisla.json`.

### Krok 6: Soubor se schématem

- **Akce:** zapiš do kořene projektu `reklamace-schema.json`: URL prostředí, prefix, ID solution, logické názvy tabulek a sloupců, názvy entity setů pro Web API, hodnoty všech choice (Kategorie s popisky z receptu) a mapování person na systemuserid.
- **Ověření:** soubor je platný JSON a obsahuje 4 tabulky.

### Krok 7: Sloupce pro výzvu týmu

- **Akce:** přečti v `navrh-reseni.md` sekci Výzva (výzvu přidělila část 0 podle čísla týmu). Podle výzvy založ v tabulce `{p}_reklamace` sloupce z tabulky níže (jen pro tuto výzvu), přidej je do solution Reklamace, publikuj a doplň je do `reklamace-schema.json` do sekce `"vyzva"`.

| Výzva | Zobrazovaný název | Logický název | Typ |
|---|---|---|---|
| V1 Opakovaná vada do výroby | Hlášeno kvalitě | `{p}_hlasenokvalite` | Yes/No, výchozí Ne |
| V1 Opakovaná vada do výroby | Hlášeno kvalitě dne | `{p}_hlasenokvalitedne` | Date only |
| V2 Kulance po záruce | Doporučena kulance | `{p}_kulance` | Yes/No, výchozí Ne |
| V2 Kulance po záruce | Důvod kulance | `{p}_kulanceduvod` | Multiline 2000 |
| V3 Náklady a dobropisy | Typ nákladu | `{p}_typnakladu` | Choice: 100000000 Výměna kusu · 100000001 Oprava · 100000002 Doprava · 100000003 Vrácení peněz · 100000004 Sleva |
| V3 Náklady a dobropisy | Číslo dobropisu | `{p}_dobropis` | Text 30 |
| V3 Náklady a dobropisy | Dobropis vystaven | `{p}_dobropisdne` | Date only |
| V4 Servisní výjezd | Výjezd | `{p}_vyjezd` | Yes/No, výchozí Ne |
| V4 Servisní výjezd | Termín výjezdu | `{p}_terminvyjezdu` | Date and time |
| V4 Servisní výjezd | Adresa výjezdu | `{p}_adresavyjezdu` | Text 300 |
| V5 Příjem na prodejně | Prodejna | `{p}_prodejna` | Text 100 |
| V5 Příjem na prodejně | Převzato na prodejně | `{p}_prevzatonaprodejne` | Date only |

  Data výzva nemění. Jen u V3 doplň rozhodnutým reklamacím (Rozhodnutí neprázdné, Náklady > 0) Typ nákladu podle Rozhodnutí: Oprava → Oprava, Výměna → Výměna kusu, Vrácení peněz → Vrácení peněz, Sleva → Sleva. U V5 doplň 6 reklamacím s Kanálem Prodejna Prodejnu ze seznamu z výzvy a Převzato na prodejně = Uplatněno dne.
- **Ověření:** metadata nových sloupců odpovídají tabulce, počty záznamů z kroku 5 se nezměnily (`pocet.reklamace`, `pocet.otevrene`), `reklamace-schema.json` je platný JSON se sekcí `"vyzva"`.

## Kontrola týmu

- [ ] V make.powerapps.com jsou v solution `Reklamace` 4 tabulky s českými názvy sloupců.
- [ ] Ceník a typy vad odpovídají oboru vaší firmy, u reklamací kotev je fotka.
- [ ] `kontrolni-cisla.json` existuje a počty v Dataverse s ním souhlasí (ukážete mentorovi v 11:15).

## Kontrola mentora v 11:15

Mentor otevře `kontrolni-cisla.json` a pustí s týmem dotazy do Dataverse na `pocet.reklamace`, `pocet.otevrene`, `pocet.ohrozene` a `podil_uznanych`. Když se liší, tým opraví import, ne kontrolní čísla.

## Záložní postup

- Generátor do 10:45 neprojde (asserty padají, katalog není potvrzený): zkopírujte `starter-kit/data-zaklad/` do `data/` a `starter-kit/kontrolni-cisla-zaklad.json` do `kontrolni-cisla.json` a importujte základní sadu krokem 5. Popisky Kategorie nechte podle základní sady. Ve `firma.md` zapište „data: základní sada".
- Import padá na lookupech: importujte bez lookupů a doplňte je druhým průchodem podle kódu, čísla a názvu.
- Zbývá dní nejde uložit s Now(): založte ho jako celé číslo a zbývající dny počítejte v aplikaci z Lhůty.
- Fotky do image sloupce nejdou: přeskočte, F1 je nahraje u nových reklamací.
- V 10:45 tabulky nestojí: naimportujte `starter-kit/Reklamace_zaloha.zip` (jen schéma, prefix `rek`, zapište ho do `reklamace-schema.json`) a pak data krokem 5, vygenerovaná, nebo základní sadu.
