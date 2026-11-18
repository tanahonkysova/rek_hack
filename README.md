---
date: 2026-11-09
author: SBID
event: Za hranice Power Platform s AI 2.0
use-case: Vyřízení reklamací s AI asistentem
určeno: týmům, které si vyberou tento use case
---

# Vyřízení reklamací: zadání pro stavbu po částech

Celé zadání je v portálu jako interaktivní stránka `zadani-reklamace.html` a v souboru [../Vyrizeni-reklamaci.md](../Vyrizeni-reklamaci.md). Tahle složka je zadání pro AI agenta v terminálu (Claude Code, GitHub Copilot CLI nebo Codex): každý soubor je specifikace jedné části s kroky a ověřením.

Řešení stavíte jako pilot pro vaši firmu. Agent s vámi v části 0 vede rozhovor o firmě, výrobcích a typických vadách, brandu a tónu ke zákazníkům (jak se omlouváte, jak zamítáte, česky i slovensky) a podle čísla týmu vám přidělí výzvu. Výsledek uloží do `brand/` a `navrh-reseni.md`, ze kterých čtou všechny další části. Část 1 z vašich odpovědí vygeneruje data vaší firmy: ceník, objednávky, reklamace i e-maily zákazníků jsou z vašeho oboru, kontrolní čísla pro ověření jsou v `kontrolni-cisla.json`.

## Pevné jádro a vaše varianta

Stejné zadání dostane víc týmů. Aby každý postavil vlastní řešení, má každá část dvě vrstvy:

| | Co to je | Kdo rozhoduje |
|---|---|---|
| **Jádro** | logické názvy, hodnoty choice, lhůta 30 dnů, záruka, pravidla schválení, AI prompt, co agent nesmí, recept na data (počty, rozložení stavů, pasti, kotvy) | zadání, stejné pro všechny týmy (stojí na nich flow, agent, report, kontroly mentora a demo) |
| **Data** | výrobky, kategorie, oborový typ vady, ceny, zákazníci, objednávky, reklamace, texty e-mailů E-01 až E-08 a z nich spočítaná kontrolní čísla | generátor v části 1 podle `brand/firma.md` a čísla týmu, každý tým má jiná. Záloha: základní sada ze starter-kitu |
| **Varianta** | vzhled fronty a navigace, slovník firmy, tón e-mailů, jeden vlastní prvek aplikace, kanály schválení a zpráv, jméno, povaha a režim agenta, jedna dovednost agenta navíc, stránka reportu, úvod a závěr dema | tým: agent se na začátku každé části zeptá v kroku 0 „Volby týmu". Hlavní volby (fronta, vlastní prvek, povaha agenta, kanál schválení, stránka reportu, tón, krok Vaše varianta) nemají výchozí odpověď |
| **Výzva a dovednost agenta** | jedno rozšíření z 5 (opakovaná vada do výroby, kulance po záruce, náklady a dobropisy, servisní výjezd, příjem na prodejně) a jedna dovednost agenta ze 4 | přidělené podle čísla týmu N: výzva ((N - 1) mod 5) + 1, dovednost ((N - 1) mod 4) + 1. Když dva týmy s reklamacemi dostanou stejnou, druhý vezme další v pořadí (oznámí mentor) |

Všechny volby se zapisují do `navrh-reseni.md` v kořeni projektu. Když se tým rozhodne jinak, změní volbu tam a řekne agentovi, ať ji přečte znovu.

## Části

| Část | Soubor | Kdo (návrh) | Čas | Výstup, na který čekají další části |
|---|---|---|---|---|
| 0 | [00-brand.md](00-brand.md) | aplikace + aspoň 1 další člen | 9:45-10:10 | `brand/` včetně šablony e-mailu, `brand/firma.md` s podklady pro data, `navrh-reseni.md` s výzvou |
| 1 | [01-data.md](01-data.md) | data | 9:45-10:45 (schéma do 10:30, generátor dat 10:15-10:40 po části 0) | `reklamace-schema.json`, tabulky, data vaší firmy, `kontrolni-cisla.json`, e-maily `data/vstupy/`, sloupce výzvy |
| 2 | [02-aplikace.md](02-aplikace.md) | aplikace | 10:45-12:15 | aplikace Reklamace včetně ručního zadání |
| 3 | [03-automatizace.md](03-automatizace.md) kroky 1 až 3 | automatizace + agent | 10:45-12:15 | F1 příjem reklamace |
| 4 | [04-agent.md](04-agent.md) | automatizace + agent | 13:00-14:00 | agent posuzuje reklamace |
| 3 | [03-automatizace.md](03-automatizace.md) kroky 4 a 5 | automatizace + agent | 14:00-14:30 | F2 schválení, flow výzvy F3 |
| 5 | [05-power-bi.md](05-power-bi.md) | Power BI + demo | 14:30-15:15 | report |
| 6 | [06-demo.md](06-demo.md) | celý tým | 15:30-16:00 | demo |

Kontroly mentora: 11:15 (data proti `kontrolni-cisla.json`), 14:30 (F1, F2 a agent).

## Postup práce

1. Založte složku projektu, např. `C:\hackathon\reklamace`, a zkopírujte do ní `02-use-casy/` a `starter-kit/` z portálu. Číslo týmu najdete v portálu v sekci Můj tým, agent se na něj zeptá v části 0.
2. Ve složce spusťte AI agenta v terminálu. Každý člen týmu může mít vlastní terminál a vlastní část.
3. Vložte agentovi blok ze sekce **Spuštění** daného souboru.
4. Hodnoty v `<ostrých závorkách>` (URL prostředí, lab účty, schránka) jsou v portálu v sekci Můj tým.
5. Agent nejdřív položí otázky z **Voleb týmu**. Odpovídejte konkrétně, výchozí odpovědi vedou k řešení, jaké postaví i ostatní týmy. Hlavní volby výchozí odpověď nemají, na „vyber za nás" agent vybere podle čísla týmu.
6. Čísla, jména a ID v **Ověřeních** jsou zapsaná jako `kontrolni-cisla.json` → `klíč`. Hodnotu najdete v tomto souboru, každý tým má jinou.
7. Když ověření neprojde, vraťte agentovi konkrétní chybu, např. „reklamace nemá vyplněnou lhůtu".
8. Na konci části projděte **Kontrolu týmu**. Když část nestíháte, použijte **Záložní postup**. Výzvu a vlastní prvek stavte až po jádru, demo projde i bez nich.

## Společná pravidla

- Všechno patří do solution `Reklamace`. `{p}` je prefix publisheru týmu, agent ho zjistí v části 1 a zapíše do `reklamace-schema.json`.
- O řešení reklamace rozhoduje člověk. AI navrhuje a odůvodňuje, zamítnutí schvaluje vedoucí.
- Objednávky jsou replika z ERP. Nic se do nich nezapisuje a agent je nevymýšlí. Generátor je vyrobí jednou v části 1.
- Zákazníkovi automaticky odchází jen potvrzení přijetí a výzva k doplnění, v jazyce reklamace. Volby týmu ani výzva na tom nic nemění.
- Slovník firmy mění jen popisky v aplikaci, agentovi a reportu, logické názvy a hodnoty choice zůstávají.
- Nové tabulky nestavte. Obrazovky, pole, flow F3 a vizuály navíc jen podle `navrh-reseni.md`.
- Každý záznam, který zakládá člověk (Reklamace, Typ vady), jde zadat i ručně v aplikaci tlačítkem „+ Nový" a opravit tlačítkem „Upravit", nejen e-mailem s AI.
- Nic se nemaže bez potvrzení člověka.
