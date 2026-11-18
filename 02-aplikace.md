# Část 2: Aplikace (Code App)

| | |
|---|---|
| **Kdo** | data + aplikace (1-2 lidé) |
| **Čas** | 10:45-12:15 |
| **Nástroje** | AI agent v terminálu s pluginem `code-apps-preview` (skilly create-code-app, add-dataverse, deploy) |
| **Vstupy** | `reklamace-schema.json` a `kontrolni-cisla.json` z části 1, složka `brand/` a `navrh-reseni.md` z části 0 |
| **Výstup** | Code App „Reklamace" spuštěná z prostředí týmu, v brandu vaší firmy |

## Popis

Fronta podle lhůty, ruční založení a úprava reklamace, detail s fotkou, objednávkou a návrhem AI, rozhodnutí se schválením, fronta technika a číselník typů vad. Persony přepíná výběr „Jsem:".

Specifikace obrazovek je jádro: co aplikace musí umět a jak se chová (lhůty, záruka, pravidla schválení, ruční zadání). Jak vypadá fronta, co Klára vidí na první pohled, jak se jmenují obrazovky a jeden prvek navíc si zvolí tým v kroku 0. Dva týmy se stejným zadáním tak postaví dvě různé aplikace nad stejnými daty.

## Spuštění

```
Přečti soubor 02-use-casy/reklamace-stavba/02-aplikace.md a proveď sekci „Postup pro agenta" krok po kroku.
Dodržuj „Pravidla pro agenta" a „Specifikaci obrazovek". Logické názvy ber z reklamace-schema.json.
Začni krokem 0: přečti navrh-reseni.md a brand/firma.md a polož mi otázky z „Voleb týmu" po jedné.
Po každém kroku proveď Ověření, ukaž mi výsledek v prohlížeči a pokračuj, jen když projde.
```

## Pravidla pro agenta

1. Stack: Power Apps Code App, React 18, Vite, TypeScript. Data jen přes vygenerované služby Dataverse (`pac code add-data-source`).
2. Logické názvy a hodnoty choice z `reklamace-schema.json`.
3. Barvy jen z proměnných `brand/tokens.css` (`var(--brand-*)`, `var(--lhuta-*)`, `var(--navrh-*)`). Po každém kroku spusť `grep -rn "#[0-9a-fA-F]\{6\}" src` a nálezy mimo `src/brand/` nahraď proměnnými.
4. Žádné UI knihovny navíc, ikony jako inline SVG.
5. Částky v měně objednávky: `Intl.NumberFormat('cs-CZ', { style: 'currency', currency })` („12 990 Kč", „219,00 €"), data `d. M. yyyy`.
6. Objednávku a Produkt aplikace jen čte.
7. Každá tabulka, do které uživatel zapisuje (Reklamace, Typ vady), má formulář „+ Nový" a v detailu „Upravit". Je to povinná část aplikace, ne doplněk.
8. Texty česky, pojmy podle slovníku v `navrh-reseni.md` (např. „Servisní požadavky" místo „Reklamace"). Logické názvy a hodnoty choice se slovníkem nemění.
9. Obrazovky a pole mimo Specifikaci přidávej jen ty, které jsou v `navrh-reseni.md` v sekcích Aplikace a Výzva. Žádné nové tabulky.
10. Volby týmu nesmí rozbít jádro: fronta s lhůtami, formuláře „+ Nová reklamace" a „Upravit", detail s rozhodnutím a pravidly schválení, Technik, Ke schválení a Typy vad existují v každé variantě a projdou svým Ověřením.

## Volby týmu

Agent je položí v kroku 0 po jedné, ke každé ukáže výchozí odpověď a možnosti. Když je odpověď obecná, doptá se na příklad. Odpovědi zapíše do `navrh-reseni.md`, sekce Aplikace.

P1 a P5 nemají výchozí odpověď, tým musí vybrat. Když řekne „vyber za nás", agent vezme možnost číslo ((N - 1) mod počet možností) + 1, kde N je číslo týmu z `brand/firma.md` (u P1 ze 3 možností, u P5 ze 4 možností a až d), a řekne, kterou.

| # | Otázka | Výchozí | Možnosti a doptání |
|---|---|---|---|
| P1 | Jak vypadá fronta? | bez výchozí, vybírá tým | A: tabulka seřazená podle lhůty. B: karty ve 4 skupinách podle lhůty (Po lhůtě, 5 a méně dnů, 6 až 10, víc než 10), na kartě miniatura fotky. C: seznam vlevo a detail vpravo na jedné obrazovce (Klára nepřepíná stránky). Doptej se, kolik reklamací Klára denně zpracuje a jestli pracuje na dvou monitorech |
| P2 | Jak má vypadat navigace? | A | A: horní lišta. B: levý panel s ikonami a počty (Fronta 47, Technik 3), který jde sbalit. C: horní lišta a vpravo rychlá akce „+ Nová reklamace" s klávesovou zkratkou N |
| P3 | Co je ve frontě navíc? Nejvýš 2 údaje | nic navíc | Miniatura fotky, kanál ikonou, jistota AI, dny ve stavu (`modifiedon`), štítek V záruce / Mimo záruku. Navrhni podle toho, co zákazníka podle `firma.md` trápí nejvíc (rychlost → dny ve stavu, férovost → jistota AI) |
| P4 | Má Pavel nebo Jitka jinou domovskou obrazovku nebo zobrazení než v tabulce přepínače? | podle tabulky | Např. Pavel velké karty pro tablet s fotkou přes celou šířku, Jitka ohrožené lhůty nahoře a pod nimi Ke schválení |
| P5 | Jeden vlastní prvek (vyberte 1) | bez výchozí, vybírá tým | a: panel „Podobné reklamace" v detailu (stejný produkt a typ vady, jejich rozhodnutí a shoda s AI, aby se stejná vada rozhodovala stejně). b: porovnání fotky a Popisu fotky vedle sebe se zvětšením a otočením. c: kalendář lhůt na 14 dní dopředu nad frontou (počet reklamací s lhůtou v daný den). d: rychlé věty do Odůvodnění rozhodnutí podle typu vady a stylu zamítnutí z `firma.md`. e: vlastní nápad týmu, když nepotřebuje novou tabulku a vejde se do 30 minut |
| P6 | Jak mluví aplikace? | podle tónu ve `firma.md` | Titulek aplikace, texty prázdných stavů (např. „Nic po lhůtě." nebo „Dnes žádná reklamace nehoří."), potvrzovací hlášky. Agent navrhne 3 varianty, tým vybere |

Ukázka zápisu v `navrh-reseni.md`:

```markdown
## Aplikace
- Název aplikace: Servis Brno
- Fronta (P1): B karty podle lhůty
- Navigace (P2): B levý panel s počty
- Fronta navíc (P3): miniatura fotky, jistota AI
- Persony (P4): Pavel velké karty pro tablet
- Vlastní prvek (P5): a podobné reklamace
- Texty (P6): vstřícné, prázdný stav „Dnes žádná reklamace nehoří."
- Výzva v aplikaci: V4 plán výjezdů na obrazovce Technik
```

## Specifikace obrazovek

### Rozložení a přepínač

- Hlavička nebo panel podle P2: logo a název aplikace z P6 nebo název firmy, navigace (Fronta, Technik, Ke schválení, Typy vad, popisky podle slovníku), přepínač „Jsem:".
- Hustota podle charakteru v `brand/brand.md` (A hutná: řádek tabulky 32 px, B čistá: 40 px, C vlídná: 48 px) a zařízení z C6.
- Přepínač: Klára (reklamační specialistka) → Fronta; Pavel (servisní technik) → Technik; Jitka (vedoucí zákaznického servisu) → Ke schválení. Změny z P4 mají přednost. Uloženo v `localStorage` pod `reklamace.persona`, mapování na systemuserid v `reklamace-schema.json`.

### Fronta (`/`)

| Prvek | Specifikace |
|---|---|
| Souhrn nahoře | 3 čísla: otevřené reklamace, 5 a méně dnů, čeká na doplnění |
| Zobrazení | podle P1: tabulka, karty podle lhůty, nebo seznam s detailem vpravo |
| Tabulka nebo karta | číslo, zákazník, země (CZ/SK), produkt, typ vady, návrh AI jako pill v barvě `--navrh-*`, stav, štítek lhůty, navíc údaje z P3 |
| Štítek lhůty | „zbývá N dní" v barvě `--lhuta-ok` (> 10), `--lhuta-varovani` (6 až 10), `--lhuta-kriticka` (≤ 5); stav Po lhůtě = „po lhůtě" v `--lhuta-kriticka` |
| Řazení | výchozí Zbývá dní vzestupně |
| Filtry | stav (výchozí všechny kromě Vyřízeno), země, vyřizuje (výchozí já) |
| Tlačítko | „+ Nová reklamace" vpravo nahoře, otevře `/reklamace/nova` |
| Klik | otevře `/reklamace/:id` |

### Nová reklamace (`/reklamace/nova`) a Upravit (`/reklamace/:id/upravit`)

Klára zakládá reklamaci z telefonu nebo z prodejny. Stejný formulář slouží k úpravě v detailu.

| Pole | Specifikace |
|---|---|
| Kanál | povinné, Telefon (výchozí), Prodejna, E-mail |
| Uplatněno dne | povinné, výchozí dnes, nesmí být v budoucnu. V úpravě jen ke čtení (od něj běží zákonná lhůta) |
| Objednávka | nepovinný výběr z `{p}_objednavka`, hledání podle čísla, zákazníka nebo e-mailu. Po výběru doplní Produkt, Zemi a prázdné pole Zákazník a E-mail |
| Produkt | povinné, z objednávky (pak jen ke čtení), jinak výběr z `{p}_produkt` |
| Typ vady | povinné, výběr z `{p}_typvady` |
| Zákazník, E-mail zákazníka | povinné, e-mail ve tvaru adresy |
| Země | z objednávky, jinak výběr, výchozí Česko; Jazyk = Slovenština pro Slovensko, jinak Čeština |
| Popis česky | povinné, zapisuje se do `{p}_popiscesky` |
| Fotka vady | nepovinné, nahrání obrázku do `{p}_fotka` |
| V záruce | s objednávkou se počítá stejně jako v F1 (Datum nákupu + Záruka produktu ≥ Uplatněno dne). Bez objednávky zaškrtávátko „Doklad o koupi ověřen, výrobek je v záruce" |
| Náhled pod poli | Lhůta = Uplatněno dne + 30 a štítek lhůty, štítek V záruce, Mimo záruku, nebo „Bez objednávky: Čeká na doplnění" |

- Uložit nové: Stav 100000000 Nová, když je objednávka nebo zaškrtnutý doklad, jinak 100000001 Čeká na doplnění a `{p}_chybejici` = „číslo objednávky nebo doklad o koupi". `{p}_vyrizuje` = přihlášený uživatel. Pak návrat do Fronty, nový řádek je zvýrazněný.
- Uložit úpravu: doplněná objednávka nebo zaškrtnutý doklad u reklamace ve stavu Čeká na doplnění vyprázdní Chybějící údaje a nastaví Nová. Rozhodnutí, Návrh AI a Posudek se v tomto formuláři nemění.
- Chybí povinné pole: uložení neproběhne, pole mají červený okraj a pod tlačítkem je „Vyplňte povinná pole: …".
- V detailu je tlačítko „Upravit" u všech stavů kromě Vyřízeno.

### Detail reklamace (`/reklamace/:id`)

| Oblast | Obsah |
|---|---|
| Hlavička | číslo, stav, kanál, země a jazyk, štítek lhůty, Uplatněno dne, Lhůta |
| Zákazník a popis | zákazník, e-mail, Popis česky; pod ním sbalený Popis zákazníka (originál) |
| Fotka | `{p}_fotka` v plné velikosti po kliknutí, pod ní Popis fotky |
| Objednávka | číslo, produkt, datum nákupu, cena v měně, štítek „V záruce" (`--brand-success`) nebo „Mimo záruku" (`--brand-danger`). Bez objednávky: „Objednávka nenalezena" a Chybějící údaje |
| Návrh AI | návrh jako pill, jistota, Odůvodnění návrhu. Bez návrhu text „Reklamace zatím není posouzená" |
| Posudek technika | text posudku, pokud existuje |
| Rozhodnutí | výběr Řešení (předvyplněný podle Návrhu AI, když to není K technikovi), Odůvodnění rozhodnutí (povinné u Zamítnuto), Náklady řešení |
| Tlačítka | „K technikovi" (stav 100000003); „Uložit rozhodnutí". Uložit: když je Zamítnuto, nebo Vrácení peněz s Náklady nad 5 000 Kč (CZK) nebo 200 € (EUR), nebo uznání mimo záruku, stav 100000004 Ke schválení; jinak stav 100000005 Rozhodnuto. Vždy zapíše `{p}_shodasai` (Rozhodnutí = Návrh AI, bez návrhu prázdné) |
| Vyřízeno | ve stavu Rozhodnuto tlačítko „Vyřízeno" (stav 100000006, Datum vyřízení = dnes) |

Typ vady s Vyžaduje technika = Ano a bez posudku: Uložit rozhodnutí je neaktivní s nápovědou „Nejdřív posudek technika". Vrácení peněz nad cenu z objednávky: chyba, uložení nejde.

### Technik (`/technik`)

Reklamace ve stavu U technika seřazené podle lhůty. U každé fotka, Popis česky, produkt, stáří výrobku v měsících (od Data nákupu), návrh AI. Formulář: Posudek technika a doporučené řešení (Řešení). Uložit zapíše posudek, doporučení přidá na začátek posudku („Doporučuji: Výměna. …") a vrátí stav 100000002 Posuzuje se.

### Ke schválení (`/schvaleni`)

Pro Jitku: reklamace ve stavu Ke schválení s rozhodnutím, odůvodněním, náklady a návrhem AI. Jen čtení, schvaluje se v Teams (F2). Pod tabulkou seznam reklamací se Zbývá dní ≤ 5.

### Typy vad (`/typy-vad`)

Číselník, podle kterého posuzuje agent. Tabulka: Název, Uznatelná, Výchozí řešení, Vyžaduje technika, Popis pro AI. Pro Jitku a Radka tlačítko „+ Nový typ vady" a klik na řádek otevře „Upravit"; ostatní vidí jen tabulku. Formulář: Název (povinný, jedinečný, v úpravě jen ke čtení), Kód, Uznatelná, Výchozí řešení (nebo bez návrhu), Vyžaduje technika, Popis pro AI (povinný). Nový typ je hned v nabídce formuláře reklamace.

## Postup pro agenta

### Krok 0: Volby týmu

- **Akce:** přečti `navrh-reseni.md` a `brand/firma.md`. Když sekce Aplikace už je vyplněná, ukaž ji a zeptej se, jestli platí. Jinak polož otázky P1 až P6 ze sekce Volby týmu po jedné. Ukaž, co z tabulky „Výzva v aplikaci" (krok 7) se pro výzvu týmu bude stavět, a nech to potvrdit. Zapiš sekci Aplikace.
- **Ověření:** `navrh-reseni.md` má sekci Aplikace se všemi 6 volbami a řádkem Výzva v aplikaci. U P1 a P5 je volba týmu, nebo možnost podle čísla týmu s poznámkou „vybráno podle čísla týmu".

### Krok 1: Založení projektu

- **Akce:** založ Code App `reklamace-app` (skill create-code-app) v prostředí z `reklamace-schema.json`. Připoj datové zdroje Dataverse pro 4 tabulky a systemuser.
- **Ověření:** `npm run dev` běží a dočasná stránka vypíše počet reklamací = `kontrolni-cisla.json` → `pocet.reklamace`.

### Krok 2: Brand, rozložení, přepínač

- **Akce:** zkopíruj `brand/tokens.css` a logo do `src/brand/`, importuj v `main.tsx`, `body { font-family: var(--brand-font); }`. Postav navigaci podle P2 a přepínač podle Specifikace a P4, popisky podle slovníku.
- **Ověření:** hlavička nebo panel má logo a barvy firmy, navigace odpovídá P2, kontrola z pravidla 3 nic nenajde, přepnutí na Pavla otevře Technik (nebo obrazovku z P4) a volba vydrží obnovení stránky.

### Krok 3: Fronta

- **Akce:** postav obrazovku Fronta v zobrazení z P1 s údaji z P3.
- **Ověření:** počet otevřených = `kontrolni-cisla.json` → `pocet.otevrene`, nahoře (nebo v prvních skupinách karet) jsou reklamace po lhůtě (`pocet.po_lhute`) a reklamace se štítkem 5 a méně dnů s čísly z `test.ohrozene_cisla`. Filtr Slovensko funguje. Produkty ve frontě jsou z ceníku vaší firmy.

### Krok 4: Nová reklamace a Upravit

- **Akce:** postav formulář Nová reklamace a Upravit podle Specifikace a tlačítka ve Frontě a v Detailu.
- **Ověření:** prázdný formulář nejde uložit a hláška vyjmenuje povinná pole. Reklamace s objednávkou `kontrolni-cisla.json` → `e08.objednavka` (nákup před 26 měsíci), kanál Telefon, Uplatněno dne dnes: v Dataverse má Lhůtu dnes + 30, Zbývá dní 30, V záruce = Ne, stav 100000000 a číslo `R-2026-…`, ve Frontě je nahoře zvýrazněná a otevřených je o jednu víc. Reklamace bez objednávky a bez dokladu má stav 100000001 a Chybějící údaje. Upravit u ní s doplněnou objednávkou nastaví stav 100000000. Testovací reklamace po mém potvrzení smaž.

### Krok 5: Detail reklamace

- **Akce:** postav Detail včetně rozhodnutí.
- **Ověření:** u reklamace s fotkou se fotka zobrazí. Zamítnuto bez odůvodnění nejde uložit, s odůvodněním nastaví stav 100000004. Výměna s návrhem Výměna nastaví stav 100000005 a Shodu s AI = Ano. Změny vrať zpět.

### Krok 6: Technik, Ke schválení a Typy vad

- **Akce:** postav tři obrazovky včetně formuláře typu vady.
- **Ověření:** uložený posudek je v Dataverse a reklamace je zpět ve stavu Posuzuje se. Obrazovka Technik je použitelná v šířce 768 px (tablet v dílně). Jako Jitka založ typ vady „Test" s popisem pro AI: je v tabulce i ve výběru formuláře reklamace; bez popisu pro AI nejde uložit. Jako Klára tlačítko „+ Nový typ vady" nevidíš. Změny po mém potvrzení vrať.

### Krok 7: Vlastní prvek a výzva

- **Akce:** postav vlastní prvek z P5 a část výzvy pro aplikaci podle tabulky. Nová pole ber z `reklamace-schema.json`, sekce `"vyzva"`.

| Výzva | Výzva v aplikaci |
|---|---|
| V1 Opakovaná vada do výroby | Ve frontě a v detailu štítek „hlášeno kvalitě" u reklamací s Hlášeno kvalitě = Ano. V detailu počet reklamací stejného produktu a typu vady za 30 dnů |
| V2 Kulance po záruce | V detailu u reklamace mimo záruku blok Kulance: Doporučena kulance a Důvod kulance od agenta. Rozhodnutí uznání mimo záruku jde dál ke schválení (jádro) |
| V3 Náklady a dobropisy | V detailu u Rozhodnuto a Vyřízeno pole Typ nákladu, Číslo dobropisu a Dobropis vystaven (formulář „Upravit náklady"). Na Ke schválení součet nákladů za měsíc v CZK a EUR |
| V4 Servisní výjezd | Na obrazovce Technik tlačítko „Naplánovat výjezd" (Termín výjezdu povinný, Adresa výjezdu povinná, Výjezd = Ano, stav zůstává U technika) a přepínač Seznam / Plán výjezdů (výjezdy po dnech na 7 dní) |
| V5 Příjem na prodejně | Obrazovka „Příjem na prodejně" (`/prodejna`) pro tablet: Prodejna (výběr ze seznamu z výzvy), Převzato na prodejně (výchozí dnes), produkt, typ vady, zákazník, e-mail, popis, fotka. Uloží reklamaci s Kanálem Prodejna a Uplatněno dne = Převzato na prodejně. Ve frontě filtr podle prodejny |

- **Ověření:** vlastní prvek funguje nad vzorovými daty (P5 a: u reklamace `kontrolni-cisla.json` → `e01.cislo` panel ukazuje vyřízené reklamace produktu `kotva.k1.kod` s typem Výrobní vada materiálu a počty rozhodnutí sedí s `test.d1_rozhodnuti`; b: fotka reklamace `e01.cislo` jde zvětšit vedle popisu; c: součet v kalendáři na 5 dnů dopředu odpovídá počtu se Zbývá dní ≤ 5; d: rychlá věta se vloží do Odůvodnění a jde upravit). Výzva: ukaž v prohlížeči nová pole nebo obrazovku a jeden záznam s hodnotou uloženou v Dataverse. U V5 má reklamace z prodejny Lhůtu = Převzato na prodejně + 30. Ověření z kroků 3 až 6 dál projdou. Testovací záznamy po mém potvrzení smaž nebo vrať.

### Krok 8: Nasazení

- **Akce:** `npm run build`, nasazení (skill deploy, `pac code push`), sdílení s lab účty týmu. Projdi obrazovky, ověř pravidla 3 a 8.
- **Ověření:** aplikace se otevře z odkazu v prostředí pod jiným lab účtem a načte data. Snímky Fronty, Detailu, formuláře Nová reklamace a vlastního prvku ulož do `demo/snimky/`.

## Kontrola týmu

- [ ] Aplikace má logo, barvy a písmo vaší firmy.
- [ ] Reklamaci z telefonu jde založit ručně a má stejnou lhůtu jako reklamace z e-mailu.
- [ ] Zamítnutí a vyšší vrácení peněz jde ke schválení.
- [ ] Aplikace vypadá podle voleb v `navrh-reseni.md`, ne podle výchozích odpovědí.

## Záložní postup

- Code App nejde nasadit: ukažte `npm run dev` a jako zálohu postavte model-driven app „Reklamace" s pohledem Fronta (řazení podle Zbývá dní) a formuláři Reklamace a Typ vady (tlačítko Nový tam je samo).
- Fotka se nenačte: zobrazte odkaz na obrázek z Web API (`/{p}_fotka/$value`) a vraťte se k tomu v 15:15.
- Karty nebo rozdělená obrazovka z P1 nestíhají: vraťte se k tabulce (P1 A) a změnu zapište do `navrh-reseni.md`. Vlastní prvek a výzvu stavte až po jádru.
