# Část 0: Vaše firma, brand a varianta řešení

| | |
|---|---|
| **Kdo** | kdo staví aplikaci, u rozhovoru aspoň ještě jeden člen týmu |
| **Čas** | 25 minut, 9:45-10:10, souběžně s částí 1 |
| **Výstup** | `brand/` (profil firmy, tokeny, logo, téma Power BI, šablona e-mailu, texty e-mailů CZ a SK) a `navrh-reseni.md` v kořeni projektu |

## Popis

Agent s vámi vede rozhovor o vaší firmě a o tom, jak se chová k zákazníkům, když se něco pokazí: do které divize pilot patří, co přesně prodáváte, s jakými vadami se zákazníci vracejí, jak říkáte reklamaci, jak se omlouváte, jak zamítáte, co zákazník dostane v e-mailu, jak vypadá váš brand. Z odpovědí o výrobcích a vadách vygeneruje část 1 data vaší firmy: ceník, objednávky, reklamace i e-maily zákazníků budou z vašeho oboru, ne ze zadání. Na konci vám agent podle čísla týmu přidělí výzvu, kterou vaše řešení rozšíří. Z odpovědí vzniknou soubory, ze kterých čtou všechny další části. Čím konkrétněji odpovíte, tím víc se vaše řešení bude lišit od ostatních týmů.

Stačí adresa webu. Kdo nechce používat skutečnou firmu, nechá agenta navrhnout smyšlenou.

## Spuštění

Vložte agentovi v terminálu:

```
Přečti soubor 02-use-casy/reklamace-stavba/00-brand.md a proveď sekci „Postup pro agenta" krok po kroku.
Dodržuj sekci „Pravidla pro agenta" a formát souborů ze sekce „Specifikace výstupů".
Otázky mi pokládej po jedné a čekej na odpověď. Když odpovím obecně, doptej se.
```

## Pravidla pro agenta

1. Ptej se po jedné otázce, v pořadí bloků A až E. Ke každé otázce nabídni výchozí odpověď a 2 až 3 konkrétní možnosti, ze kterých jde vybrat. Když uživatel napíše jen číslo nebo písmeno možnosti, ber to jako odpověď.
2. Doptávej se. Když je odpověď obecná („profesionálně", „lidsky", „jako všichni"), polož jednu doplňující otázku s konkrétními možnostmi nebo ukázkovou větou. Nejvýš 2 doplňující otázky k jedné otázce, pak vezmi, co máš.
3. Po každém bloku shrň odpovědi do 3 až 5 řádků a nech je potvrdit, než přejdeš dál.
4. Když uživatel v blocích A až D potvrdí víc než polovinu výchozích odpovědí, upozorni ho, že řešení bude vypadat jako u ostatních týmů, a navrhni 2 konkrétní věci, kterými se může odlišit.
5. Otázky s výchozí odpovědí „bez výchozí, vybírá tým" (A8 až A12 a D1) musí tým zodpovědět sám. Když řekne „vyber za nás", vyber u otázky s možnostmi možnost číslo ((N - 1) mod počet možností) + 1, kde N je číslo týmu, a řekni, kterou a proč. U otázek A8 až A12 bez možností navrhni konkrétní odpověď pro obor firmy a nech ji potvrdit.
6. O skutečné firmě nic nevymýšlej. Barvy, písmo, logo a fakta o firmě ber jen z odpovědí nebo z webu, který ti uživatel dal, a ukaž, odkud jsou. Smyšlené údaje v `brand/firma.md` označ „(smyšlené)".
7. Data v této části negeneruješ. Sbíráš podklady (blok A, otázky A8 až A12), data z nich vyrobí část 1 podle pevného receptu. Pevné zůstávají struktura dat, počty, pasti, lhůta 30 dnů, limity schválení a persony Klára, Pavel, Jitka a Radek. Zákaznice z prvního e-mailu se vždy jmenuje Jana.
8. Všechny soubory zapiš do složky `brand/` a soubor `navrh-reseni.md` do kořene projektu. Jiné soubory neměň.
9. Písmo musí mít latin-ext. Když firemní není na Google Fonts, použij nejpodobnější a řekni to.
10. Kontrast textu proti pozadí aspoň 4,5:1 (WCAG AA). Když nesplní, navrhni tmavší odstín a zeptej se.
11. Slovenské texty spisovnou slovenštinou. Když si nejsi jistý, řekni to.
12. Když tým spěchá („rychle"), polož otázky označené ★ a otázky bez výchozí odpovědi (pravidlo 5), u ostatních vezmi výchozí odpověď. Pravidlo 4 pak platí také.

## Postup pro agenta

### Krok 1: Úvod

- **Akce:** jednou větou řekni, co rozhovor přinese (profil firmy, podklady pro data vaší firmy, brand, tón e-mailů v češtině a slovenštině, přidělená výzva), že má 5 bloků a trvá kolem 25 minut. Zeptej se na číslo týmu `<číslo týmu>` z portálu (sekce Můj tým), kdo z týmu odpovídá a jestli chtějí skutečnou firmu, nebo smyšlenou.
- **Ověření:** znáš číslo týmu N a víš, jestli jde o skutečnou firmu, nebo smyšlenou. U smyšlené navrhni ke každé otázce bloku A konkrétní návrh místo výchozí odpovědi.

### Krok 2: Blok A, firma a pilot

| # | Otázka | Výchozí odpověď | Možnosti a doptání |
|---|---|---|---|
| A1 ★ | Jak se jmenuje firma nebo skupina a jak se má jmenovat v aplikaci, v e-mailech zákazníkům a v reportu? | (bez výchozí) | Celý název, zkratka do hlavičky aplikace, název, který zákazník zná z e-shopu |
| A2 ★ | Pilot je pro divizi nebo značku, která prodává spotřební výrobky koncovým zákazníkům přes vlastní e-shop v Česku a na Slovensku. Jak to zapadá do vaší firmy? | B | A: takovou divizi nebo značku máme (jak se jmenuje?), B: smyšlená divize nebo značka naší skupiny, C: celá firma je smyšlená. Doptej se, jak se jmenuje e-shop |
| A3 | Jak se jmenuje servisní centrum a kde sídlí? | „Centrum zákaznického servisu, Brno" | Doptej se, jestli má servis vlastní dílnu, nebo posílá výrobky do závodu |
| A4 | Jak velký je zákaznický servis a jak se mění v sezóně? | „12 specialistek, v sezóně duben až srpen dvojnásobek reklamací" | Brigádníci v sezóně? Dělí se specialistky podle země, nebo podle produktu? |
| A5 ★ | Co zákazníka při reklamaci trápí nejvíc? | „že neví, jestli to někdo řeší" | Rychlost odpovědi, jistota, že to někdo řeší, férové rozhodnutí, nemuset nikam jezdit, rychlá výměna. Nech seřadit první dvě, ovlivní potvrzovací e-mail a frontu |
| A6 | Proč pilot vzniká a co se má změnit? | „žádná reklamace po lhůtě, rychlejší založení" | Doptej se na jedno číslo (např. 160 reklamací po lhůtě ročně → 0, založení 12 minut → 2) |
| A7 | Co pilot nesmí? | „rozhodnout za člověka a poslat zákazníkovi zamítnutí" | Např. slibovat výměnu, posílat zákazníkovi cokoli kromě potvrzení a výzvy, ukazovat náklady specialistkám |

Otázky A8 až A12 jsou **Podklady pro data**. Část 1 z nich vygeneruje ceník, typy vad, objednávky, reklamace a e-maily zákazníků. Bez výchozí odpovědi, doptávej se, dokud nemáš konkrétní výrobky a vady.

| # | Otázka | Výchozí odpověď | Možnosti a doptání |
|---|---|---|---|
| A8 ★ | Co konkrétně divize prodává? Vyjmenujte 3 skupiny výrobků a k nim 2 až 3 příklady | bez výchozí, vybírá tým | Např. kávovary, vysavače, příslušenství. Doptej se na čtvrtou skupinu, příslušenství nebo náhradní díly. Ověř, jestli mají výrobek s plastovým ovládacím panelem a výrobek s hadicí (kotvy K1 a K2 v receptu), jinak řekni, že tyto dva budou „pilotní řada" |
| A9 ★ | S jakými vadami se zákazníci vracejí nejčastěji? | bez výchozí, vybírá tým | Doptej se na jednu vadu typickou pro váš obor (únik vody, vybitá baterie, prasklé sklo), stane se z ní typ vady č. 3. Zeptej se, co u vás bývá „zákazník to upustil" |
| A10 ★ | Jaká je cenová hladina? | bez výchozí, vybírá tým | Rozpětí nejlevnějšího a nejdražšího výrobku v Kč, cena příslušenství |
| A11 | Kolik zákazníků je ze Slovenska a jak se tam prodává? | bez výchozí, vybírá tým | Počty objednávek CZ a SK jsou v receptu pevné (210 a 90), odpověď ovlivní slovenské texty, patičku a ceny v eurech |
| A12 | Prodáváte jen přes e-shop, nebo i přes prodejny a řetězce? | bez výchozí, vybírá tým | Kolik reklamací přichází z prodejen a telefonem. Recept má pevné kanály, odpověď použije agent v textech e-mailů (koupeno v řetězci) a výzva V5 |

### Krok 3: Blok B, lidé a jazyk

| # | Otázka | Výchozí odpověď | Možnosti a doptání |
|---|---|---|---|
| B1 ★ | Jak u vás říkáte reklamaci? | „reklamace" | Servisní požadavek, ticket, případ, RMA. Slovo se použije v aplikaci, agentovi a reportu. V e-mailu zákazníkovi zůstane „reklamace" („reklamácia"), protože to je zákonný pojem, když tým nerozhodne jinak |
| B2 | Jak říkáte stavům? | názvy ze zadání | Nabídni přejmenování 8 stavů (např. Posuzuje se → V řešení, U technika → V dílně). Pořadí a čísla zůstávají |
| B3 | Jak se jmenuje role, která schvaluje zamítnutí, a role technika? | „vedoucí zákaznického servisu", „servisní technik" | Vedoucí zákaznické péče, quality manager, servisní partner, technolog |
| B4 | Tykáte si v servisu? Má agent specialistkám tykat? | „interně tykáme, agent tyká" | Agent tyká, vyká, nebo podle persony |
| B5 | Jaké zkratky a slova z oboru má agent znát? | žádné | Např. DOA (nefunkční při dodání), RMA, kulance, dobropis, servisní partner. Zapiš je do slovníku s vysvětlením |

### Krok 4: Blok C, vizuál

| # | Otázka | Výchozí odpověď | Možnosti a doptání |
|---|---|---|---|
| C1 ★ | Jaká je adresa firemního webu nebo e-shopu? Stáhnu z něj barvy, písmo a logo. | „nemáme / nechci" | |
| C2 | Máte soubor s logem (SVG nebo PNG s průhledným pozadím)? Napište cestu. | „vezmi z webu" | |
| C3 | Hlavní barva, doplňková barva a barva pro zvýraznění (HEX)? | „vezmi z webu" | Ukaž nalezené barvy z kroku 7 a nech vybrat |
| C4 | Písmo? | „vezmi z webu" | |
| C5 ★ | Jaký má být charakter aplikace? | B | A: hutná provozní (malé rohy, hodně řádků na obrazovce, specialistka vidí celou frontu). B: čistá korporátní (střední rohy, víc vzduchu). C: vlídná zákaznická (velké karty, měkké barvy, fotky výrazně). Doptej se na příklad aplikace, která se jim líbí |
| C6 | Na čem se bude aplikace hlavně používat? | „počítač v kanceláři, technik tablet" | Dva monitory, notebook, tablet v dílně. Ovlivní hustotu a velikost tlačítek |

### Krok 5: Blok D, tón ke zákazníkům

- **Akce:** podle odpovědí z bloků A a B napiš 3 ukázkové věty (potvrzení přijetí, výzva k doplnění, oznámení zamítnutí) ve 3 stylech: A formální úřední, B věcný vstřícný, C osobní empatický. Každou větu česky i slovensky. Pak polož otázky:

| # | Otázka | Výchozí odpověď | Možnosti a doptání |
|---|---|---|---|
| D1 ★ | Který styl je váš? Co byste na vybraných větách změnili? | bez výchozí, vybírá tým | A, B nebo C. Uprav věty podle odpovědi a ukaž je znovu v obou jazycích |
| D2 | Jak oslovujete a jak se podepisujete? | „vykáme, podpis Zákaznický servis a název firmy" | Podpis týmem, jménem specialistky, s přímou linkou |
| D3 ★ | Jak se omlouváte? | „omluva za komplikace v potvrzení, ne za vadu" | Omlouváme se vždy, jen když reklamaci uznáme, nikdy (děkujeme za trpělivost). Doptej se, jestli se omlouváte za zpoždění odpovědi |
| D4 ★ | Jak zamítáte? | „důvod, článek reklamačního řádu, co může zákazník udělat dál" | Nabídka placené opravy, odkaz na odvolání, telefon na vedoucí. Ukaž ukázkovou větu zamítnutí E-07 ve zvoleném stylu |
| D5 | Které fráze u vás nepoužíváte? | žádné | Např. „Vážený zákazníku", „bohužel", „dle našeho posouzení", „nemůžeme vyhovět". Zapiš jako zakázané |
| D6 | Jaká zákaznická linka a web reklamací patří do patičky e-mailu? | „smyšlené údaje, označené jako vzor" | Linka pro CZ a SK zvlášť, otevírací doba |

### Krok 6: Blok E, výzva týmu

- **Akce:** výzvu si tým nevybírá, přiděluje se podle čísla týmu: V = ((N - 1) mod 5) + 1. Např. tým 7 má V2, tým 12 má V2, tým 13 má V3. Oznam výzvu, vysvětli dvěma větami, co přidá a proč dává smysl pro jejich firmu, a polož 2 až 3 doplňující otázky z posledního sloupce. Když mentor oznámí, že stejnou výzvu u reklamací už má jiný tým, vezmi další v pořadí (po V5 V1). Výzva se staví v částech, které uvádí tabulka, po hlavních krocích. Když na ni nezbude čas, demo projde i bez ní.

| # | Výzva | Co přidá | Části | Doplňující otázky |
|---|---|---|---|---|
| V1 | Opakovaná vada do výroby | Když se u stejného produktu a typu vady za 30 dnů sejdou 3 a víc reklamací, flow F3 pošle Radkovi do Teams upozornění s počtem, reklamacemi a fotkami a reklamace označí Hlášeno kvalitě. Agent odpoví na „Je to opakovaná vada?". V reportu matice produkt × typ vady za 30 dnů | 1, 2, 3, 4, 5 | Je práh 3 reklamace za 30 dnů správně? Komu kromě Radka? Má upozornění jít jednou, nebo při každé další reklamaci? |
| V2 | Kulance po záruce | U reklamace mimo záruku agent posoudí, jestli doporučit kulantní řešení (záruka skončila před nejvýš 3 měsíci, typ vady je uznatelný), a zapíše doporučení s důvodem. Návrh AI zůstává Zamítnuto, o kulanci rozhoduje Klára a schvaluje Jitka | 1, 2, 3, 4, 5 | Kolik měsíců po záruce ještě kulance? Jaká kulance (sleva, výměna dílu, oprava zdarma)? Kdo ji schvaluje? |
| V3 | Náklady a dobropisy | U rozhodnuté reklamace typ nákladu, číslo a datum dobropisu. Flow F3 pošle po rozhodnutí s Vrácením peněz nebo Slevou podklad pro dobropis do kanálu účtárny. Agent odpoví, kolik reklamace stály. V reportu náklady podle produktu a typu nákladu | 1, 2, 3, 4, 5 | Kdo vystavuje dobropis? Kam podklad posílat (kanál, e-mail)? Počítat dopravu a servis zvlášť? |
| V4 | Servisní výjezd | Technik může místo posudku v dílně naplánovat výjezd k zákazníkovi: termín a adresa. Flow F3 založí Pavlovi událost v kalendáři. Obrazovka Technik má plán výjezdů po dnech. Agent odpoví „Co má Pavel zítra?" | 1, 2, 3, 4, 5 | Které vaše výrobky se opravují u zákazníka (velké nebo těžké kusy)? Jak daleko se jezdí? Kdo zákazníkovi termín potvrzuje? |
| V5 | Příjem na prodejně | Reklamace z prodejny řetězce: název prodejny a datum převzetí na prodejně. Obrazovka „Příjem na prodejně" pro rychlé zadání na tabletu, flow F3 pošle Kláře zprávu o nové reklamaci z prodejny. V reportu reklamace podle prodejny | 1, 2, 3, 5 | Které řetězce a prodejny (smyšlené)? Kdo na prodejně reklamaci zadává? Posílá prodejna výrobek do servisu, nebo jen doklad? |

- **Ověření:** výzva je přidělená podle vzorce (nebo podle mentora) a k ní jsou odpovědi na doplňující otázky.

### Krok 7: Brand z webu

- **Akce:** pokud uživatel dal web, stáhni úvodní stránku a z CSS a HTML zjisti: barvy použité na tlačítkách, odkazech a nadpisech (3 až 5 nejčastějších nešedých), písmo nadpisů a textu (`font-family`), logo (`<img>` nebo `<svg>` v hlavičce, `og:image`, favicon jako poslední možnost). Logo ulož do `brand/`. Krok proveď hned po otázce C1, ať můžeš v C2 až C4 ukázat, co jsi našel.
- **Ověření:** ukaž uživateli tabulku nalezených barev s HEX a kde se na webu vyskytují, název písma a cestu k uloženému logu. Nech ho vybrat hlavní, doplňkovou a zvýrazňující barvu.

### Krok 8: Paleta a kontrast

- **Akce:** z potvrzených barev odvoď paletu podle Specifikace výstupů (role barev). Barvy lhůty: zbývá víc než 10 dnů = neutrální, 6 až 10 dnů = varování, 5 a méně nebo po lhůtě = nebezpečí. Barvy návrhu AI: uznání (Oprava, Výměna, Vrácení peněz, Sleva) = úspěch, K technikovi = varování, Zamítnuto = neutrální tmavě šedá. `--brand-radius` nastav podle C5: A 4 px, B 8 px, C 14 px.
- **Ověření:** spočítej kontrast pro dvojice text/pozadí, bílá na primární, primární na bílé, text na povrchu, bílá na barvě nebezpečí. Vypiš tabulku poměrů. Každý musí být aspoň 4,5:1.

### Krok 9: Zápis souborů

- **Akce:** vytvoř soubory ze Specifikace výstupů, včetně `brand/firma.md` a `navrh-reseni.md`. Texty v `email-texty.json` piš ve stylu z D1, s omluvou podle D3, bez frází z D5.
- **Ověření:** všechny soubory existují, `tokens.json`, `pbi-theme.json` a `email-texty.json` jsou platný JSON, HEX kódy v `tokens.css`, `tokens.json` a `brand.md` jsou shodné. `navrh-reseni.md` má vyplněné sekce Firma, Slovník a Výzva.

### Krok 10: Náhled

- **Akce:** vyplň `email-sablona.html` českým potvrzením pro zákaznici Janu (příjmení libovolné, číslo R-2026-14231, termín dnes + 30 dní) do `brand/nahled-potvrzeni-cs.html` a slovenskou výzvou k doplnění do `brand/nahled-vyzva-sk.html`. Otevři oba soubory.
- **Ověření:** uživatel potvrdí, že e-maily vypadají a zní jako jejich firma a diakritika je správně v obou jazycích.

## Specifikace výstupů

### `brand/firma.md`

```markdown
# <název firmy>
Zdroj: <skutečná firma, web … / smyšlená firma>

## Firma a pilot
- Skupina / firma: <…>, e-shop: <…>
- Divize pilotu: <název>, servisní centrum <město>, <velikost servisu a sezóna>
- Jak zapadají data zadání: <A / B / C a jednou větou>
- Co zákazníka při reklamaci trápí nejvíc: 1. <…> 2. <…>
- Proč pilot: <…>, cílové číslo: <…>
- Co pilot nesmí: <…>
- Kde se aplikace používá: <…>
- Číslo týmu: <N>

## Podklady pro data
- Skupiny výrobků (A8): 1. <…> (příklady) 2. <…> 3. <…> 4. příslušenství a díly: <…>
- Kotvy: K1 výrobek s ovládacím panelem: <výrobek z oboru / pilotní řada>, K2 výrobek s hadicí: <výrobek z oboru / pilotní řada>
- Typické vady (A9): <…>, oborová vada pro typ č. 3: <…>, typický pád nebo náraz: <…>
- Cenová hladina (A10): výrobky <od … do … Kč>, příslušenství <…>
- Slovensko (A11): <…>
- Prodejní kanály (A12): <…>

## Slovník
| Pojem v zadání | U nás | Kde se použije |
|---|---|---|
| reklamace | <…> | aplikace, agent, report (zákazníkovi podle B1) |
| Nová / Čeká na doplnění / Posuzuje se / U technika / Ke schválení / Rozhodnuto / Vyřízeno / Po lhůtě | <…> | popisky v aplikaci a reportu, v Dataverse beze změny |
| vedoucí zákaznického servisu | <…> | |
| servisní technik | <…> | |
| <zkratky z B5> | <vysvětlení> | agent |

## Lidé a oslovení
Interně: <tykání/vykání>, agent specialistkám: <…>

## Tón ke zákazníkům
Styl: <A/B/C a vlastní úpravy>, oslovení a podpis: <…>
Omluva: <D3>
Zamítnutí: <D4>
Nepoužíváme: <fráze>
Patička: <linka CZ, linka SK, web reklamací>
```

### `navrh-reseni.md` (kořen projektu)

Deník rozhodnutí týmu. Část 0 vyplní první 3 sekce, další části do něj připisují své volby (krok 0 „Volby týmu" na začátku každé části). Každá část ho čte před stavbou.

```markdown
# Návrh řešení týmu <název týmu / firmy>

## Firma
Viz brand/firma.md. Jednou větou: <kdo jsme a co pilot řeší>

## Slovník
<zkopírovaná tabulka Slovník z firma.md>

## Výzva
V<číslo> <název> (přidělená: tým <N>, ((N - 1) mod 5) + 1): <co přesně stavíme, odpovědi na doplňující otázky>
Části: <seznam částí>
Nové sloupce: <logický název, typ, tabulka> (založí část 1 v kroku 7)

## Aplikace
(vyplní část 2)

## Automatizace
(vyplní část 3)

## Agent
(vyplní část 4)

## Power BI
(vyplní část 5)

## Demo
(vyplní část 6)
```

### `brand/brand.md`

```markdown
# Brand: <název firmy>
Zdroj: <web / zadáno ručně / smyšlená firma>
Charakter: <A hutná / B čistá / C vlídná>, zařízení: <C6>

## Barvy
| Role | HEX | Použití |
|---|---|---|
| primary | #...... | tlačítka, aktivní prvky |
| secondary | #...... | záhlaví, sekundární tlačítka |
| accent | #...... | zvýraznění, odznaky |
| text | #...... | běžný text |
| bg | #...... | pozadí aplikace |
| surface | #...... | karty, panely |
| success | #...... | uznáno, schváleno |
| warning | #...... | lhůta 6 až 10 dnů, K technikovi |
| danger | #...... | lhůta 5 a méně dnů, po lhůtě |

## Písmo
<název>, Google Fonts URL, náhrada Segoe UI, Arial

## Logo
logo.svg (nebo .png), logo-svetle.svg pro tmavé pozadí, logo-ctverec.png 192 × 192

## Tón komunikace
Oslovení: <vykání/tykání>, styl: <…>, podpis: <...>
Ukázkové věty (česky a slovensky):
1. <potvrzení přijetí reklamace>
2. <výzva k doplnění>
3. <oznámení zamítnutí>
```

### `brand/tokens.css`

```css
:root {
  --brand-primary: #......;
  --brand-primary-contrast: #......;   /* text na primární barvě */
  --brand-secondary: #......;
  --brand-accent: #......;
  --brand-text: #......;
  --brand-text-muted: #......;
  --brand-bg: #......;
  --brand-surface: #......;
  --brand-border: #......;
  --brand-success: #......;
  --brand-warning: #......;
  --brand-danger: #......;
  --brand-font: '<písmo>', 'Segoe UI', Arial, sans-serif;
  --brand-radius: <4, 8 nebo 14>px;
  --lhuta-ok: #......;
  --lhuta-varovani: #......;
  --lhuta-kriticka: #......;
  --navrh-uznat: #......;
  --navrh-technik: #......;
  --navrh-zamitnout: #......;
}
```

Plus `@import` písma z Google Fonts na začátku souboru.

### `brand/tokens.json`

Stejné hodnoty jako `tokens.css`, klíče bez `--` (např. `"brand-primary": "#0A5C36"`), navíc `"companyName"`, `"logo"`, `"logoLight"`, `"logoSquare"`, `"tone"`, `"character"` (A, B nebo C).

### Loga

| Soubor | Formát | Použití |
|---|---|---|
| `brand/logo.svg` nebo `logo.png` | výška aspoň 120 px, průhledné pozadí | hlavička aplikace, e-mail, report |
| `brand/logo-svetle.svg` nebo `.png` | bílá nebo světlá varianta | tmavé pozadí (pokud jde vytvořit) |
| `brand/logo-ctverec.png` | 192 × 192, průhledné pozadí | ikona agenta v Copilot Studiu |

### `brand/pbi-theme.json`

```json
{
  "name": "<název firmy>",
  "dataColors": ["<primary>", "<secondary>", "<accent>", "<4 až 8: odstíny palety>"],
  "background": "<bg>",
  "foreground": "<text>",
  "tableAccent": "<primary>",
  "good": "<success>", "neutral": "<warning>", "bad": "<danger>",
  "textClasses": {
    "callout": { "fontFace": "<písmo>, Segoe UI", "fontSize": 28, "color": "<text>" },
    "title": { "fontFace": "<písmo>, Segoe UI", "fontSize": 12, "color": "<text>" },
    "header": { "fontFace": "<písmo>, Segoe UI", "fontSize": 12, "color": "<text>" },
    "label": { "fontFace": "<písmo>, Segoe UI", "fontSize": 10, "color": "<text>" }
  }
}
```

### `brand/email-sablona.html`

- Krátký HTML e-mail do 600 px šířky, inline CSS, logo jako odkaz na obrázek nahraný do SharePointu (cestu doplní část 3), barvy z palety.
- Placeholdery přesně `{{nadpis}}`, `{{osloveni}}`, `{{text}}`, `{{cislo}}`, `{{termin}}`, `{{podpis}}`, `{{paticka}}`. Flow F1 je nahrazuje textově.
- Patička s linkou a webem reklamací z D6. Charakter z C5 se projeví na velikosti nadpisu a odsazení.

### `brand/email-texty.json`

Texty e-mailů v obou jazycích, ve stylu z D1 a s omluvou podle D3. Klíče přesně takto, nejvýš 3 věty na text:

```json
{
  "cs": {
    "potvrzeni": { "predmet": "Reklamace {{cislo}} přijata", "nadpis": "...", "text": "..." },
    "vyzva":     { "predmet": "Reklamace {{cislo}}: prosíme o doplnění", "nadpis": "...", "text": "... {{chybi}} ..." },
    "osloveni": "Dobrý den,", "podpis": "...", "paticka": "..."
  },
  "sk": {
    "potvrzeni": { "predmet": "Reklamácia {{cislo}} prijatá", "nadpis": "...", "text": "..." },
    "vyzva":     { "predmet": "Reklamácia {{cislo}}: prosíme o doplnenie", "nadpis": "...", "text": "... {{chybi}} ..." },
    "osloveni": "Dobrý deň,", "podpis": "...", "paticka": "..."
  }
}
```

Text potvrzení obsahuje číslo reklamace a termín vyřízení (`{{termin}}`). Text výzvy obsahuje seznam toho, co chybí (`{{chybi}}`), a větu, že lhůta běží od přijetí reklamace. Když tým v B1 zvolil pro zákazníky jiné slovo než reklamace, změň ho i v předmětech.

## Kontrola týmu

- [ ] Náhled českého i slovenského e-mailu má logo a barvy firmy a zní jako vaše firma.
- [ ] Tým odsouhlasil brand, který bude na pódiu.
- [ ] `brand/firma.md` popisuje vaši firmu tak, že by ji kolega z jiného týmu nepoužil.
- [ ] `brand/firma.md` má sekci Podklady pro data s konkrétními výrobky a vadami.
- [ ] Výzva je přidělená a zapsaná v `navrh-reseni.md`.

## Záložní postup

- Web blokuje stahování: barvy zadejte ručně (kapátko v prohlížeči, PowerToys Color Picker).
- Logo je jen JPG s bílým pozadím: nechte agenta pozadí odstranit, nebo použijte textové logo v primární barvě.
- Čas běží: řekněte agentovi „rychle" (otázky ★ a otázky bez výchozí odpovědi), k ostatním se vraťte v 15:15. Podklady pro data musí být v `firma.md` do 10:15, jinak část 1 pojede na základní sadě. Tokeny, texty e-mailů i slovník se mění na jednom místě.
