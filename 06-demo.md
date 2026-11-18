# Část 6: Demo

| | |
|---|---|
| **Kdo** | celý tým, vede člověk z části 5 |
| **Čas** | 15:30-16:00 příprava a zkouška, na pódiu 6 minut |
| **Vstupy** | hotové části 0 až 5, `reklamace-schema.json`, `kontrolni-cisla.json`, `navrh-reseni.md`, `brand/firma.md`, e-maily `data/vstupy/E-01.eml`, `E-03.eml` a `E-07.eml` vaší firmy |

## Popis

Příběh od e-mailu zákaznice Jany po Power BI, s výrobky, vadami a zákazníky vaší firmy, se slovenskou reklamací, sporným případem se schválením a reklamací zadanou ručně z telefonu, nad živými daty. Jeden krok ukáže vaši variantu: vlastní prvek aplikace, dovednost agenta a výzvu. Porota uvidí několik týmů se stejným zadáním, proto začněte vaší firmou a skončete tím, čím se vaše řešení liší.

## Spuštění přípravy dat

```
Přečti soubor 02-use-casy/reklamace-stavba/06-demo.md a proveď sekci „Postup pro agenta".
Začni krokem 0 (otázky z „Voleb týmu" po jedné). Nic nemaž bez mého potvrzení.
Na konci mi vypiš výsledek Kontroly před pódiem.
```

## Volby týmu

Agent je položí v kroku 0 po jedné a zapíše do `navrh-reseni.md`, sekce Demo. S3 nemá výchozí odpověď, tým vybírá. Když řekne „vyber za nás", agent vezme dvojici číslo ((N - 1) mod 5) + 1 z řady: 1 vlastní prvek a výzva, 2 dovednost agenta a výzva, 3 vlastní prvek a dovednost agenta, 4 kanál schválení a výzva, 5 stránka reportu a vlastní prvek.

| # | Otázka | Výchozí | Možnosti a doptání |
|---|---|---|---|
| S1 | Jakou větou demo začne? | návrh agenta | Agent navrhne 3 úvodní věty (20 s) z `firma.md`: kdo jste, co zákazníka při reklamaci trápí, cílové číslo. Např. „Loni u nás 160 reklamací přeteklo lhůtu. Za 6 minut uvidíte, proč letos žádná." |
| S2 | Kdo hraje koho? | | Kdo z týmu mluví za Janu, Kláru, Pavla a Jitku a kdo kliká. Jeden člověk nejvýš za 2 persony |
| S3 | Co ukážete v kroku Vaše varianta (40 s)? | bez výchozí, vybírá tým | Vyberte nejvýš 2 z: vlastní prvek aplikace (P5), dovednost agenta (G4), výzva, kanál schválení (A1), stránka reportu (R1). Doptej se, která věc nejvíc odpovídá problému z `firma.md` |
| S4 | Jak demo skončí? | návrh agenta | Jedna věta, co by pilot potřeboval dál (z A6 a A7 ve `firma.md`), např. „Další krok: formulář reklamace přímo na e-shopu a napojení objednávek z ERP v reálném čase." |

## Postup pro agenta

### Krok 0: Volby týmu

- **Akce:** přečti `navrh-reseni.md` a `brand/firma.md`. Polož otázky S1 až S4 po jedné, u S1 a S4 napiš návrhy. Doplň scénář o úvod, krok Vaše varianta a závěr a zapiš sekci Demo včetně upraveného scénáře.
- **Ověření:** sekce Demo má úvodní větu, rozdělení rolí, obsah kroku Vaše varianta a závěrečnou větu. Celkový čas scénáře je nejvýš 6 minut.

### Krok 1: Úklid testovacích dat

- **Akce:** najdi reklamace s Uplatněno dne = dnes a typy vad založené dnes. Vypiš je a po mém potvrzení smaž. Reklamacím ze vzorových dat, které dnes agent posoudil nebo někdo upravil, vrať původní stav a vyprázdni sloupce Návrh AI a sloupce výzvy, které testy vyplnily. Data, která potřebuje krok 9 scénáře, nech podle mého pokynu.
- **Ověření:** počty proti `kontrolni-cisla.json`: Reklamace = `pocet.reklamace`, otevřené = `pocet.otevrene`, ohrožené lhůtou = `pocet.ohrozene`, typů vad = `pocet.typvady`.

### Krok 2: Čísla záznamů

- **Akce:** nastav počáteční číslo autonumber `{p}_reklamace.{p}_cislo` = 14231. Testovací záznam nezakládej.
- **Ověření:** oznam nastavenou hodnotu.

### Krok 3: Flows a agent

- **Akce:** ověř, že F1 a F2 jsou zapnuté a poslední běh skončil Succeeded. Ověř, že agent odpoví na „Které reklamace jsou ohrožené lhůtou?" seznamem reklamací `kontrolni-cisla.json` → `test.ohrozene_cisla`.
- **Ověření:** vypiš stav flows a odpověď agenta.

### Krok 4: Záložní snímky

- **Akce:** zkontroluj `demo/snimky/`: fronta, detail s fotkou a návrhem AI, vlastní prvek, odpověď agenta, odpověď agenta s dovedností navíc, slovenské potvrzení, posudek technika, schválení kanálem z A1, formulář Nová reklamace, stránka Power BI, výzva. Vypiš, co chybí.

## Scénář (6 minut)

Kroky 1 až 8 jsou jádro a ukazují je všechny týmy (průběh odpovídá průvodci klikacího dema `demo-reklamace.html`, které ukazuje základní sadu). Výrobky, zákazníci a čísla jsou vaše z `kontrolni-cisla.json`. Úvod, krok 9 a závěr jsou vaše. Pojmy říkejte podle slovníku firmy.

| # | Čas | Kdo | Co je vidět |
|---|---|---|---|
| 0 | 0:00 | podle S2 | Úvodní věta z S1, fronta v brandu firmy s výrobky firmy: `pocet.otevrene` otevřených, `pocet.ohrozene` svítí červeně |
| 1 | 0:20 | Jana | Skript pošle E-01, za minutu je ve frontě `e01.cislo` s fotkou, objednávkou a lhůtou `e01.termin`, Jana má potvrzení v tónu firmy |
| 2 | 1:00 | Klára | Agentovi: „Posuď `e01.cislo`". Agent navrhne Výměnu s citací řádu ve formátu z G2 (u G3 B Klára návrh potvrdí). V detailu Klára rozhodnutí uloží, stav Rozhodnuto |
| 3 | 1:40 | Klára | Skript pošle slovenský formulář E-03. Reklamace má český popis, potvrzení odešlo slovensky, agent připraví odpověď slovensky |
| 4 | 2:20 | Pavel | Skript pošle E-07 (otlak), agent navrhne K technikovi. Pavel na tabletu zapíše posudek „mechanické poškození" |
| 5 | 3:00 | Klára | Převezme posudek do odůvodnění a uloží Zamítnuto, F2 pošle schválení |
| 6 | 3:30 | Jitka | Schválí zamítnutí kanálem z A1, reklamace je Rozhodnuto |
| 7 | 3:55 | Klára | Zákaznice volá na linku: „+ Nová reklamace", objednávka, typ vady, popis. Lhůta dnes + 30, nový řádek nahoře ve frontě |
| 8 | 4:30 | Jitka nebo Radek | Stránka Power BI z R1, včetně reklamací z dema |
| 9 | 4:55 | podle S3 | Vaše varianta: nejvýš 2 věci z S3, každá jednou větou „proč" a jednou ukázkou |
| 10 | 5:35 | podle S2 | Závěr z S4 a co tým postavil |

## Kontrola před pódiem

- [ ] Přihlášené lab účty: Klára v aplikaci a agentovi, Pavel v aplikaci, Jitka tam, kde schvaluje podle A1, a v Power BI.
- [ ] Data a obrazovka pro krok 9 připravené (např. reklamace s doporučenou kulancí, výjezd na zítřek, hlášení kvalitě).
- [ ] Skript pro E-01, E-03 a E-07 připravený, testovací schránky zákaznic otevřené.
- [ ] Pro krok 7 vybraná objednávka a text popisu, ať se nepíše dlouho.
- [ ] Power BI na stránce Reklamace (Import: refresh těsně před vystoupením).
