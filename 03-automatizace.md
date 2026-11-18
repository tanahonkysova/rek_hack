# Část 3: Automatizace (Power Automate)

| | |
|---|---|
| **Kdo** | automatizace + agent (1 člověk) |
| **Čas** | F1 10:45-12:15, F2 14:00-14:30 |
| **Nástroje** | AI agent v terminálu s pluginem `power-automate` (Flow Agent MCP, skilly build-flow, debug-flow) |
| **Vstupy** | `reklamace-schema.json`, `kontrolni-cisla.json` a e-maily `data/vstupy/E-01.eml` až `E-08.eml` z části 1, `brand/email-sablona.html`, `brand/email-texty.json`, sdílená schránka reklamace@ |
| **Výstup** | F1 a F2 v solution Reklamace, flow F3 podle výzvy |

## Popis

F1 z e-mailu nebo formuláře e-shopu s AI založí reklamaci s fotkou a pošle potvrzení nebo výzvu v jazyce zákazníka. F2 pošle zamítnutí a vyšší vrácení peněz ke schválení. Řešení navrhuje agent, ne flow. Ručně založené reklamace (část 2) F1 nezpracovává a F2 je schvaluje stejně jako ostatní.

Pevné jádro jsou AI prompt, kroky F1 (vytěžení, dohledání objednávky, záruka, lhůta, větvení potvrzení a výzvy) a pravidla F2 (co jde ke schválení). Kudy Jitka schvaluje, co v žádosti uvidí, kam chodí zprávy Kláře, co je v potvrzení zákazníkovi navíc a jak zprávy zní, si volí tým v kroku 0. Třetí flow vzniká jen u výzvy.

## Spuštění

```
Přečti soubor 02-use-casy/reklamace-stavba/03-automatizace.md a proveď sekci „Postup pro agenta" krok po kroku
přes Flow Agent. Dodržuj „Pravidla pro agenta" a Specifikace F1 a F2. Logické názvy a hodnoty choice
ber z reklamace-schema.json. Začni krokem 0: přečti navrh-reseni.md a brand/firma.md a polož mi otázky
z „Voleb týmu" po jedné. Po každém kroku proveď Ověření a pokračuj, jen když projde.
```

## Pravidla pro agenta

1. Flows stav přes Flow Agent MCP (create_flow, validate_flow, preflight_flow, run_flow), akce jako `OpenApiConnection`.
2. Připojení hledej přes list_connections a pick_or_create_connection. Chybějící založ a řekni, které musím potvrdit.
3. Všechny flows do solution Reklamace s connection references.
4. Filtry na choice číslem z `reklamace-schema.json`.
5. Validaci nikdy neobcházej.
6. Do Objednávky flows nezapisují.
7. Zákazníkovi jde jen potvrzení přijetí a výzva k doplnění, v jazyce reklamace. Volby týmu ani výzva na tom nic nemění.
8. Interní zprávy a žádost o schválení piš podle tónu a slovníku v `navrh-reseni.md` a `brand/firma.md`.

## Vstupy

| Hodnota | Odkud |
|---|---|
| `<schránka>` | sdílená schránka reklamace@ z portálu |
| `<SharePoint web>` | z portálu, knihovna `Reklamace` (pokud neexistuje, založ ji) pro šablonu e-mailu a logo |
| `<účet Kláry>`, `<účet Jitky>`, `<účet Pavla>` (jen výzva V4) | mapování person v `reklamace-schema.json` |
| `<URL aplikace>` | odkaz na Code App z části 2 (kvůli odkazu na detail ve schválení) |
| odesílání e-mailů | skript ze starter-kitu (`starter-kit/posli-emaily.ps1`) s parametrem složky `data/vstupy/`, posílá e-maily vaší firmy, ne základní sady |

## Volby týmu

Agent je položí v kroku 0 po jedné a zapíše do `navrh-reseni.md`, sekce Automatizace. A1 nemá výchozí odpověď. Když tým řekne „vyber za nás", agent vezme možnost číslo ((N - 1) mod 3) + 1, kde N je číslo týmu z `brand/firma.md` (1 = A, 2 = B, 3 = C), a řekne, kterou.

| # | Otázka | Výchozí | Možnosti a doptání |
|---|---|---|---|
| A1 | Kudy Jitka schvaluje? | bez výchozí, vybírá tým | A: aplikace Approvals v Teams (Approvals: Start and wait for an approval). B: adaptivní karta v Teams chatu (Microsoft Teams: Post adaptive card and wait for a response) s fotkou vady, tlačítky Schválit a Vrátit a polem Komentář. C: e-mail v Outlooku s tlačítky (Office 365 Outlook: Send email with options), komentář jen u A a B. Doptej se, kde Jitka tráví den a jestli schvaluje i z telefonu |
| A2 | Kam chodí zpráva Kláře, když Jitka reklamaci vrátí? | A | A: soukromá zpráva od Flow bota v Teams. B: příspěvek do kanálu Zákaznický servis se zmínkou Kláry (vidí celý tým). C: e-mail |
| A3 | Co Jitka v žádosti uvidí navíc? Nejvýš 2 | nic navíc | Fotka vady přímo v žádosti (u A1 B), stáří výrobku v měsících, Zbývá dní, cena z objednávky, počet reklamací stejného produktu a typu vady za 30 dnů |
| A4 | Co je v potvrzení zákazníkovi navíc? Nejvýš 1 věta | nic navíc | Co se bude dít dál, odkaz na reklamační řád, co si má zákazník připravit (doklad, výrobek nevyhazovat), přímá linka. Věta se doplní do `email-texty.json` v obou jazycích, text potvrzení dál nejvýš 3 věty |
| A5 | Jak zní interní zprávy? | podle tónu | Agent navrhne 3 texty (Jitka vrátila reklamaci, reklamace schválena, výzva odeslána) ve stylu z `firma.md`, tým je upraví |

Ukázka zápisu:

```markdown
## Automatizace
- Schválení (A1): B adaptivní karta s fotkou
- Zprávy Kláře (A2): B kanál Zákaznický servis se zmínkou
- Žádost navíc (A3): stáří výrobku, Zbývá dní
- Potvrzení navíc (A4): „Výrobek si prosím zatím nechte, ozveme se do 5 pracovních dnů."
- Texty (A5): „Jitka vrátila R-2026-14231: doplň posudek technika."
- Výzva v automatizaci: V1 flow F3 Opakovaná vada, práh 3 za 30 dnů, Radkovi do chatu
```

## AI prompt „Vytěžení reklamace"

Vstupy: `text_emailu` (text: předmět, odesílatel a tělo), `obrazek` (obrázek, může chybět), `typy_vad` (text: název a popis pro AI každého typu vady, jeden na řádek). Výstup JSON:

```
Z e-mailu se spotřebitelskou reklamací a z přiložené fotky vrať jen JSON s poli:
cislo_objednavky, jmeno, email, kod_produktu, jazyk, kanal, popis_cesky, popis_fotky,
typ_vady, chybejici_udaje, nakup_mimo_eshop.
- cislo_objednavky ve tvaru EO-CZ-RRRR-NNNNNN nebo EO-SK-RRRR-NNNNNN, když je v textu, jinak null.
- email: e-mail zákazníka. U formuláře z e-shopu ho vezmi z textu formuláře, ne odesílatele.
- kod_produktu: kód výrobku z ceníku (např. <kód kotvy K1>, <kód kotvy K2>), když je v textu, jinak null.
- jazyk: "cs" nebo "sk" podle jazyka zákazníka.
- kanal: "Formulář e-shopu", když e-mail poslal formulář e-shopu, jinak "E-mail".
- popis_cesky: 1 až 2 věty česky, co je s výrobkem špatně a od kdy. Nic nedoplňuj.
- popis_fotky: co je na fotce vidět (díl, druh poškození, stopy nárazu nebo otlaku). Bez fotky null.
- typ_vady: přesně jeden název ze seznamu typy_vad. Když si nejsi jistý, "Nelze určit".
- chybejici_udaje: pole textů z možností "číslo objednávky", "doklad o koupi", "fotka vady",
  "popis vady". Doklad o koupi chybí, když zákazník píše, že koupil mimo e-shop, a doklad nepřiložil.
- nakup_mimo_eshop: true, když zákazník píše, že výrobek koupil v obchodě nebo u jiného prodejce.
- Chybějící hodnoty vrať jako null. Nic si nevymýšlej.
```

## Specifikace F1 Příjem reklamace s AI

| # | Akce | Konektor a operace | Detail |
|---|---|---|---|
| 1 | Trigger | Office 365 Outlook: When a new email arrives in a shared mailbox (V2) | `<schránka>`, Include Attachments = Yes, Only with Attachments = No |
| 2 | Fotka | Filter array | přílohy s ContentType začínajícím `image/`, první z nich = `foto` (může být prázdné) |
| 3 | Typy vad | Dataverse: List rows + Select + Join | `{p}_typvady`, sloupce `{p}_nazev`, `{p}_popisproai`, řádky „název: popis" |
| 4 | Vytěžení | AI Builder: Run a prompt | prompt výše, vstupy z kroků 1 až 3 |
| 5 | Objednávka | Dataverse: List rows | `{p}_objednavka`, filtr `{p}_cislo eq '<cislo_objednavky>'`. Když nic a je `email`: `{p}_email eq '<email>'`, a když je `kod_produktu`, produkt s tímto kódem; řazení `{p}_datumnakupu desc`, top 1 |
| 6 | Produkt | Dataverse: List rows | podle objednávky, jinak `{p}_kod eq '<kod_produktu>'` |
| 7 | Záruka | Compose `vzaruce` | `addToTime(Datum nákupu, Produkt.Záruka, 'Month') >= formatDateTime(utcNow(), 'yyyy-MM-dd')`, bez objednávky false |
| 8 | Typ vady | Dataverse: List rows | `{p}_typvady`, filtr `{p}_nazev eq '<typ_vady>'` |
| 9 | Reklamace | Dataverse: Add a new row | `{p}_reklamace`: kanál, země (z objednávky, jinak podle jazyka), jazyk, zákazník, e-mail, `{p}_popiszakaznika` = předmět + tělo, `{p}_popiscesky`, `{p}_popisfotky`, typ vady, produkt, objednávka, `{p}_vzaruce`, `{p}_uplatnenodne` = dnes, `{p}_chybejici` = položky oddělené „; ", `{p}_vyrizuje` = `<účet Kláry>` |
| 10 | Fotka | Dataverse: Upload a file or an image | do `{p}_fotka`, jen když `foto` není prázdné |
| 11 | Větvení | Condition | objednávka nenalezena, nebo `foto` prázdné, nebo `chybejici_udaje` neprázdné |
| 12a | Výzva | Dataverse: Update a row + Office 365 Outlook: Send an email from a shared mailbox (V2) | stav 100000001; e-mail z `<schránka>`, šablona `email-sablona.html` s texty `vyzva` v jazyce reklamace, `{{chybi}}` = seznam chybějících údajů |
| 12b | Potvrzení | Office 365 Outlook: Send an email from a shared mailbox (V2) | stav zůstává 100000000; šablona s texty `potvrzeni`, `{{cislo}}` = číslo reklamace, `{{termin}}` = Lhůta ve formátu `d. M. yyyy` |

Šablonu a texty si flow načte z knihovny `Reklamace/_sablony/` (SharePoint: Get file content using path). Jazyk `sk` použije klíč `sk`, ostatní `cs`.

## Specifikace F2 Schválení rozhodnutí

| # | Akce | Konektor a operace | Detail |
|---|---|---|---|
| 1 | Trigger | Dataverse: When a row is added, modified or deleted | Modified, `{p}_reklamace`, Select columns `{p}_stav`, filtr `{p}_stav eq 100000004` |
| 2 | Načtení | Dataverse: Get a row by ID | reklamace, expand objednávka (cena, měna, datum nákupu) a produkt (název) |
| 3 | Schválení | podle A1: Approvals: Start and wait for an approval (Approve/Reject, First to respond), nebo Teams: Post adaptive card and wait for a response, nebo Outlook: Send email with options | Komu: `<účet Jitky>`. Nadpis „Reklamace {číslo}: {rozhodnutí}, {náklady} {měna}" (pojmy podle slovníku). Obsah: produkt, zákazník a země, V záruce, Popis česky, Návrh AI s jistotou a odůvodněním, Rozhodnutí a Odůvodnění rozhodnutí, údaje z A3, odkaz `<URL aplikace>/reklamace/{id}` |
| 4 | Schváleno | Dataverse: Update a row | stav 100000005, `{p}_schvalil` = schvalující (systemuser podle e-mailu respondenta), `{p}_komentar` = komentář |
| 5 | Vráceno | Dataverse: Update a row + zpráva podle A2 (Teams chat, kanál, nebo Outlook) | stav 100000002, `{p}_komentar` (u A1 C text „vráceno e-mailem"); zpráva vyřizující textem z A5 (obsah: Jitka vrátila reklamaci {číslo}: {komentář}) |

## Postup pro agenta

### Krok 0: Volby týmu

- **Akce:** přečti `navrh-reseni.md` a `brand/firma.md`. Když sekce Automatizace už je vyplněná, ukaž ji a zeptej se, jestli platí. Jinak polož otázky A1 až A5 po jedné, u A4 a A5 napiš návrhy textů česky i slovensky. Ukaž, co z tabulky v kroku 5 se pro výzvu týmu bude stavět. Zapiš sekci Automatizace. Větu z A4 doplň do `brand/email-texty.json` v obou jazycích.
- **Ověření:** sekce Automatizace má všech 5 voleb a řádek Výzva v automatizaci. `email-texty.json` je dál platný JSON a potvrzení má nejvýš 3 věty. Podle A1 a A2 víš, která připojení budeš potřebovat.

### Krok 1: Připravenost

- **Akce:** ověř přihlášení a prostředí. Najdi nebo založ připojení Office 365 Outlook, AI Builder (Microsoft Dataverse), Dataverse, SharePoint, Microsoft Teams a podle A1 Approvals. V knihovně `Reklamace` založ složku `_sablony` a nahraj do ní `brand/email-sablona.html`, `brand/email-texty.json` a logo. V šabloně nahraď cestu k logu odkazem na nahraný soubor.
- **Ověření:** připojení jsou Connected, soubory v `_sablony` jdou načíst.

### Krok 2: AI prompt

- **Akce:** založ AI prompt „Vytěžení reklamace" se vstupy a instrukcí výše a výstupem JSON.
- **Akce (doplnění):** v instrukci promptu nahraď `<kód kotvy K1>` a `<kód kotvy K2>` hodnotami `kontrolni-cisla.json` → `kotva.k1.kod` a `kotva.k2.kod`.
- **Ověření:** otestuj ho na `data/vstupy/E-01.eml` s jeho fotkou: cislo_objednavky = `kontrolni-cisla.json` → `e01.objednavka`, kod_produktu = `e01.produkt_kod`, jazyk cs, typ_vady Výrobní vada materiálu, chybejici_udaje prázdné. Výstup porovnej s `data/vstupy/ai-zaloha/E-01.json`. Pak na E-03: jazyk sk, kanal Formulář e-shopu, email = `e03.email`, popis_cesky česky. Pak na E-06: nakup_mimo_eshop true, chybejici_udaje obsahuje „doklad o koupi".

### Krok 3: F1

- **Akce:** vytvoř flow „F1 Příjem reklamace s AI" podle Specifikace, ulož a zapni.
- **Ověření:** pošli `data/vstupy/E-01.eml` do schránky (skript ze starter-kitu). Do 2 minut existuje reklamace `kontrolni-cisla.json` → `e01.cislo` se stavem 100000000, objednávkou `e01.objednavka`, fotkou, V záruce = Ano a Lhůtou dnes + 30. Do testovací schránky zákazníka dorazilo české potvrzení s číslem a termínem. Pošli E-03: reklamace má Jazyk Slovenština a potvrzení je slovensky. Pošli E-05: stav 100000001 a výzva k doplnění. Testovací reklamace zatím nemaž, použije je část 4.

### Krok 4: F2

- **Akce:** vytvoř flow „F2 Schválení rozhodnutí" podle Specifikace.
- **Ověření:** na reklamaci z E-05 nastav Rozhodnutí Zamítnuto, odůvodnění a stav 100000004. Do 2 minut má `<účet Jitky>` kanálem z A1 schválení s odkazem na detail a údaji z A3. Vrať ho s komentářem: reklamace je zpět ve stavu 100000002 a vyřizující má zprávu kanálem z A2 s textem z A5. Po mém potvrzení změny na reklamaci vrať.

### Krok 5: Výzva

- **Akce:** postav část výzvy z `navrh-reseni.md` podle tabulky. Když výzva v automatizaci nic nemá, krok přeskoč. Zákazníkovi F3 nic neposílá.

| Výzva | Výzva v automatizaci |
|---|---|
| V1 Opakovaná vada do výroby | Flow „F3 Opakovaná vada": trigger Dataverse Added a Modified (sloupec `{p}_typvady`) na `{p}_reklamace`. List rows reklamací se stejným `{p}_produkt` a `{p}_typvady` a Uplatněno dne za posledních 30 dnů. Když je jich aspoň práh z výzvy a žádná z nich nemá `{p}_hlasenokvalite` = Ano: zpráva Radkovi kanálem z A2 (produkt, typ vady, počet, čísla reklamací, odkaz do aplikace) a všem nalezeným Hlášeno kvalitě = Ano a Hlášeno kvalitě dne = dnes |
| V2 Kulance po záruce | F2 načte navíc `{p}_kulance` a `{p}_kulanceduvod` a u doporučené kulance je dá do žádosti o schválení na první místo |
| V3 Náklady a dobropisy | Flow „F3 Podklad pro dobropis": trigger Dataverse Modified `{p}_stav` na 100000005, podmínka `{p}_rozhodnuti` je Vrácení peněz (100000002) nebo Sleva (100000003). Zpráva do kanálu účtárny z výzvy: číslo reklamace, objednávka, zákazník, země, částka a měna, typ nákladu. Zapíše `{p}_typnakladu`, když je prázdný |
| V4 Servisní výjezd | Flow „F3 Výjezd do kalendáře": trigger Dataverse Modified `{p}_terminvyjezdu` (není prázdný). Office 365 Outlook: Create event v kalendáři `<účet Pavla>`: předmět „Výjezd {číslo}: {produkt}", začátek Termín výjezdu, délka 1 hodina, místo Adresa výjezdu, v těle Popis česky a odkaz do aplikace |
| V5 Příjem na prodejně | Flow „F3 Reklamace z prodejny": trigger Dataverse Added `{p}_reklamace` s `{p}_kanal eq 100000003`. Zpráva Kláře kanálem z A2: prodejna, produkt, Převzato na prodejně, Lhůta, odkaz do aplikace |

- **Ověření:** V1: reklamace z E-01 (produkt `kontrolni-cisla.json` → `kotva.k1.kod`, typ Výrobní vada materiálu) je s `test.v1_k1_30dni` dalšími třetí za 30 dnů, takže při prahu 3 spustí F3. Radek dostal zprávu a všechny 3 reklamace mají Hlášeno kvalitě. Druhé spuštění zprávu nepošle. Počet ve zprávě sedí s dotazem do Dataverse. V2: žádost o schválení uznání mimo záruku ukazuje kulanci. V3: rozhodnutí Vrácení peněz s Náklady 500 Kč u testovací reklamace dá zprávu do kanálu účtárny. V4: výjezd naplánovaný v aplikaci je do minuty v kalendáři Pavla. V5: reklamace z obrazovky Příjem na prodejně dá Kláře zprávu. Testovací změny po mém potvrzení vrať.

## Kontrola týmu

- [ ] E-mail i formulář z e-shopu založí reklamaci se správným kanálem a jazykem.
- [ ] Výsledek schválení je zapsaný v reklamaci.
- [ ] Schválení a zprávy chodí kanály, které jste si vybrali, a znějí jako vaše firma.

## Záložní postup

- AI Builder nemá kredity: místo kroku 4 načti JSON z `data/vstupy/ai-zaloha/E-0N.json` (podle předmětu e-mailu), soubory vyrobil generátor v části 1.
- Prompt nepřijímá obrázek: pošli jen text a `popis_fotky` vezmi z `data/vstupy/ai-zaloha/` (pevné popisy fotek kotev).
- Approvals se v Teams neobjeví: schválení je na make.powerautomate.com v sekci Schválení. U A1 B a C nejdřív ověřte, že F2 čeká na odpověď (běh ve stavu Running).
- Adaptivní karta (A1 B) se nevykreslí: vynechte fotku, zjednodušte kartu na text a 2 tlačítka, nebo přepněte na A1 A a zapište změnu do `navrh-reseni.md`.
