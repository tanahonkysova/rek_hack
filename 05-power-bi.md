# Část 5: Power BI report

| | |
|---|---|
| **Kdo** | Power BI + demo (1 člověk, Windows s Power BI Desktop) |
| **Čas** | 14:30-15:15 |
| **Nástroje** | Power BI Desktop, AI agent v terminálu s pluginy `pbip`, `reports` a `semantic-models` |
| **Vstupy** | `reklamace-schema.json`, `kontrolni-cisla.json`, `navrh-reseni.md`, `brand/firma.md`, `brand/pbi-theme.json` a logo |
| **Výstup** | PBIP projekt `report/Reklamace.pbip` nad daty z Dataverse v tématu vaší firmy |

## Popis

Report pro Jitku a Radka na jedné stránce: otevřené a ohrožené reklamace, podíl uznaných, doba vyřízení a vady podle produktu.

Jádro je model a 5 měr, na nich stojí ověření. Pro koho je stránka, co je na ní nahoře, jak se jmenuje, které průřezy má a jeden vizuál pro výzvu si volí tým v kroku 0.

## Spuštění

Krok 1 udělá člověk v Power BI Desktop, zbytek AI agent:

```
Přečti soubor 02-use-casy/reklamace-stavba/05-power-bi.md a proveď sekci „Postup pro agenta":
nejdřív krok 0 (otázky z „Voleb týmu" po jedné), pak od kroku 2. Dodržuj „Pravidla pro agenta"
a „Specifikaci reportu". Logické názvy ber z reklamace-schema.json. Po každém kroku proveď Ověření.
```

## Pravidla pro agenta

1. Pracuj se soubory PBIP ve složce `report/`. Před úpravou mi řekni, ať Desktop zavřu, po úpravě ať ho otevřu.
2. Míry do tabulky `Klíčová čísla` (název `Measures` je rezervovaný).
3. Choice sloupce jsou čísla, popisky jsou ve sloupcích `…name`. Filtry číslem z `reklamace-schema.json`.
4. Do modelu nenačítej `{p}_popiszakaznika`, `{p}_fotka`, `{p}_email` ani jméno zákazníka. Z Objednávky jen číslo, produkt, zemi, datum nákupu, cenu a měnu.
5. Barvy jen z tématu, názvy složek vizuálů jen ASCII.
6. Míry ověř dotazem DAX a vypiš hodnoty.
7. Názvy stránek, nadpisy a popisky os podle slovníku v `navrh-reseni.md`. Názvy tabulek a měr v modelu zůstávají podle Specifikace.

## Volby týmu

Agent je položí v kroku 0 po jedné a zapíše do `navrh-reseni.md`, sekce Power BI. R1 nemá výchozí odpověď. Když tým řekne „vyber za nás", agent vezme variantu číslo ((N - 1) mod 3) + 1 (1 = A, 2 = B, 3 = C), kde N je číslo týmu z `brand/firma.md`, a řekne, kterou.

| # | Otázka | Výchozí | Možnosti a doptání |
|---|---|---|---|
| R1 | Pro koho je stránka a na jakou otázku odpovídá? | bez výchozí, vybírá tým | A: Jitka, „Stihneme lhůty?" (stránka Reklamace). B: Radek, „Které produkty a vady selhávají?" (stránka Kvalita). C: vedení servisu, „Rozhodujeme stejně a rychle?" (stránka Rozhodování). Doptej se, co ta persona dnes v pátek dělá v Excelu |
| R2 | Který ukazatel je nejdůležitější? | podle R1 | Bude první a větší než ostatní. Když `firma.md` má cílové číslo pilotu (A6), dej ho do podtitulku karty |
| R3 | Jaké průřezy? Nejvýš 3 | Země, Kategorie, Měsíc | Země, Kategorie, Měsíc, Kanál, Vyřizuje, Typ vady |
| R4 | Jak se stránka jmenuje? | podle slovníku | Agent navrhne 3 názvy, např. „Pátek ve 3", „Kvalita výrobků", „Servis Brno" |

## Specifikace reportu

### Model

| Tabulka v modelu | Zdroj | Sloupce |
|---|---|---|
| Reklamace | `{p}_reklamace` | id, číslo, stav (číslo, popisek), kanál, země, produkt id, objednávka id, typ vady id, uplatněno dne, zbývá dní, v záruce, návrh AI (číslo), rozhodnutí (číslo, popisek), datum vyřízení, vyřizuje (jméno) |
| Produkt | `{p}_produkt` | id, kód, název, kategorie (popisek) |
| Typ vady | `{p}_typvady` | id, název, uznatelná |
| Objednávka | `{p}_objednavka` | id, číslo |
| Kalendář | DAX `CALENDAR(DATE(2025,1,1), DATE(2027,12,31))` | Datum, Rok, Měsíc, Týden |

Vztahy: Reklamace → Produkt, Reklamace → Typ vady, Reklamace → Objednávka, Reklamace → Kalendář (Uplatněno dne).

### Míry

| Míra | Definice | Formát |
|---|---|---|
| Otevřené | počet reklamací se stavem jiným než 100000006 | `0` |
| Ohrožené lhůtou | otevřené se Zbývá dní ≤ 5 a stavem jiným než 100000007 | `0` |
| Po lhůtě | počet se stavem 100000007 | `0` |
| Podíl uznaných | rozhodnuté (Rozhodnutí neprázdné) s Rozhodnutím ≠ 100000004 / všechny rozhodnuté | `0 %` |
| Doba vyřízení | průměr dnů mezi Uplatněno dne a Datem vyřízení | `0,0 "dne"` |

### Míry podle varianty

| Varianta | Míra navíc | Definice | Formát |
|---|---|---|---|
| B Kvalita | Reklamace na 100 prodaných | počet reklamací / počet objednávek daného produktu × 100. Počet objednávek spočítej v míře přes produkt id objednávky (`TREATAS` na Produkt[id]), nový aktivní vztah nepřidávej | `0,0` |
| C Rozhodování | Shoda s AI | rozhodnuté s Shoda s AI = Ano / rozhodnuté s vyplněnou Shodou s AI | `0 %` |

Pro variantu B načti z Objednávky navíc produkt id (pravidlo 4 to dovoluje).

### Stránka varianty A „Reklamace" (1280 × 720)

| Oblast | Pozice (x, y, š, v) | Vizuál | Pole |
|---|---|---|---|
| Logo | 24, 16, 120, 40 | obrázek | logo z `brand/` |
| Nadpis | 160, 16, 520, 40 | textové pole | „Reklamace - přehled" |
| Průřezy | 704, 16, 552, 40 | 3 průřezy dropdown | Reklamace[Země], Produkt[Kategorie], Kalendář[Měsíc] |
| KPI 1 až 4 | 24 až 968, 80, 288, 120 | karta | Otevřené, Ohrožené lhůtou, Podíl uznaných, Doba vyřízení |
| Vlevo dole | 24, 220, 608, 476 | skládaný pruhový graf | Produkt[Název] top 8 podle počtu, Typ vady[Název] jako legenda |
| Vpravo dole | 648, 220, 608, 476 | spojnicový graf | Kalendář[Týden] za posledních 12 týdnů, počet přijatých a počet vyřízených |

### Stránka varianty B „Kvalita" a C „Rozhodování"

Hlavička (logo, nadpis, průřezy z R3) a řada 4 karet jsou stejně jako u varianty A, pořadí karet podle R2.

| Varianta | Karty | Vlevo dole (24, 220, 608, 476) | Vpravo dole (648, 220, 608, 476) |
|---|---|---|---|
| B Kvalita | Otevřené, Reklamace na 100 prodaných, Podíl uznaných, Po lhůtě | matice: řádky Produkt[Název], sloupce Typ vady[Název], hodnota počet reklamací, podmíněné formátování barvou z tématu | pruhový graf Reklamace na 100 prodaných podle produktu, top 8 |
| C Rozhodování | Podíl uznaných, Shoda s AI, Doba vyřízení, Ohrožené lhůtou | skupinový pruhový graf podle Vyřizuje: Podíl uznaných a Shoda s AI | sloupcový graf Doba vyřízení podle Kanálu |

### Vizuál pro výzvu

Když tým postaví výzvu, přidá jeden vizuál. Stránku nezvětšuje: vizuál nahradí pravý dolní a přesune ho do tooltipu, nebo jde na druhou stránku „Detail".

| Výzva | Vizuál |
|---|---|
| V1 Opakovaná vada do výroby | tabulka dvojic produkt a typ vady s počtem reklamací za 30 dnů, nad prahem zvýrazněné, sloupec Hlášeno kvalitě |
| V2 Kulance po záruce | karta počet doporučených kulancí a podíl schválených (Rozhodnutí jiné než Zamítnuto) |
| V3 Náklady a dobropisy | skládaný sloupcový graf Náklady podle produktu a Typu nákladu, zvlášť CZK a EUR (průřez Měna) |
| V4 Servisní výjezd | karta počet výjezdů za 30 dnů a tabulka výjezdů na 7 dní dopředu |
| V5 Příjem na prodejně | pruhový graf otevřené reklamace podle Prodejny a karta průměrná doba od převzetí na prodejně po založení |

## Postup pro agenta

### Krok 0: Volby týmu

- **Akce:** přečti `navrh-reseni.md` a `brand/firma.md`. Když sekce Power BI už je vyplněná, ukaž ji a zeptej se, jestli platí. Jinak polož otázky R1 až R4 po jedné a zapiš sekci Power BI, včetně řádku Vizuál pro výzvu.
- **Ověření:** sekce Power BI má 4 volby a víš, kterou stránku stavíš.

### Krok 1: Připojení (dělá člověk)

- **Akce:** Power BI Desktop → zapnout Power BI Project (.pbip) ve funkcích verze Preview. Získat data → Dataverse → URL prostředí, lab účet. Tabulky Reklamace, Produkt, Typ vady, Objednávka, režim DirectQuery (jinak Import). Sloupce výzvy jsou v tabulce Reklamace z části 1, nic dalšího se nepřipojuje. Uložit jako `report/Reklamace.pbip`, Desktop zavřít.
- **Ověření:** ve složce `report/` jsou `Reklamace.SemanticModel` a `Reklamace.Report`.

### Krok 2: Model

- **Akce:** v TMDL odstraň sloupce podle pravidla 4 a ostatní nepotřebné, přejmenuj na české názvy, přidej Kalendář a vztahy.
- **Ověření:** model se v Desktopu otevře bez chyb, 5 tabulek, 4 vztahy, žádný sloupec s e-mailem nebo jménem zákazníka.

### Krok 3: Míry

- **Akce:** přidej tabulku `Klíčová čísla`, 5 měr a míru varianty z R1 (u B a C).
- **Ověření:** hodnoty měr proti `kontrolni-cisla.json`: Otevřené = `pocet.otevrene` (plus nové reklamace z testů a dema), Ohrožené lhůtou = `pocet.ohrozene`, Po lhůtě = `pocet.po_lhute`, Podíl uznaných = `podil_uznanych`, Doba vyřízení = `doba_vyrizeni` (u vyřízených z testů se mohou mírně lišit). Vypiš všechny hodnoty vedle kontrolních čísel.

### Krok 4: Téma a stránka

- **Akce:** nastav téma `brand/pbi-theme.json`, logo do registrovaných zdrojů, postav stránku varianty z R1 s názvem z R4, pořadím karet z R2 a průřezy z R3.
- **Ověření:** po otevření v Desktopu 4 karty s hodnotami z kroku 3, u varianty A a B je ve vizuálu podle produktu nahoře `kontrolni-cisla.json` → `top_produkt` a produkty jsou z ceníku vaší firmy. Snímek do `demo/snimky/pbi-stranka.png`.

### Krok 5: Vizuál pro výzvu

- **Akce:** když tým výzvu postavil, přidej vizuál z tabulky Vizuál pro výzvu. Jinak krok přeskoč.
- **Ověření:** vizuál ukazuje data zapsaná v testech výzvy (u Import po refreshi).

## Kontrola týmu

- [ ] Report má téma a logo vaší firmy.
- [ ] Nová reklamace z dema je vidět v číslech (DirectQuery hned, Import po refreshi).
- [ ] Stránka odpovídá na otázku persony z R1 a jmenuje se podle vás.

## Záložní postup

- Desktop změny nevidí: zavřete ho a otevřete `Reklamace.pbip` znovu.
- Zbývá dní v DirectQuery chybí: spočítejte ho v míře z `{p}_lhuta` a `TODAY()`.
- Bez Desktopu: postavte report v Power BI službě podle Specifikace.
