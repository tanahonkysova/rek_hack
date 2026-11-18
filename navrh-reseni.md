# Návrh řešení týmu Pohoda Spotřebiče (tým 12)

## Firma
Viz brand/firma.md. Jednou větou: Pohoda Spotřebiče (smyšlená) prodává kávovary, vysavače a pračky a myčky přes e-shop v Česku a na Slovensku a pilot má zajistit, že zákazník ví, že jeho reklamaci někdo řeší, a že žádná reklamace nepřeteče lhůtu (loni 180 → 0).

## Slovník
| Pojem v zadání | U nás | Kde se použije |
|---|---|---|
| reklamace | servisní požadavek | aplikace, agent, report (zákazníkovi v e-mailu dál „reklamace“ / „reklamácia“) |
| Nová / Čeká na doplnění / Posuzuje se / U technika / Ke schválení / Rozhodnuto / Vyřízeno / Po lhůtě | Nový / Čeká na podklady / Posuzujeme / V servisu / U vedoucí / Rozhodnuto / Hotovo / Po lhůtě | popisky v aplikaci a reportu, v Dataverse beze změny |
| vedoucí zákaznického servisu | vedoucí zákaznického centra | |
| servisní technik | servisní technik | |
| DOA | nefunkční při dodání | agent |
| Aquastop | pojistka proti úniku vody na přívodní hadici | agent |
| spařovací jednotka | srdce espresso automatu | agent |
| odvápnění | pravidelná údržba kávovaru; zanesení vodním kamenem bez odvápnění není vada | agent |
| kulance | vstřícné řešení po záruce | agent |
| výjezd | oprava pračky, myčky nebo sušičky technikem u zákazníka doma | agent |
| dobropis | vrácení peněz účetním dokladem | agent |

## Výzva
V2 Kulance po záruce (přidělená: tým 12, ((12 - 1) mod 5) + 1 = 2): u reklamace mimo záruku agent posoudí, jestli doporučit kulanci, a zapíše doporučení s důvodem. Návrh AI zůstává Zamítnuto.
- Okno kulance: záruka skončila před nejvýš 3 měsíci; u espresso automatů KV-450 a KV-800 nejvýš 6 měsíců. Pravidlo se zapíše přímo do instrukce agenta jako seznam modelů (bez nového sloupce na produktu). Typ vady musí být uznatelný (vodní kámen / Běžné opotřebení nikdy).
- Druh kulance: oprava zdarma, zákazník platí jen díly.
- Reklamační řád: kulance je čl. 9 Kulance po záruce, vyloučení (vodní kámen, náraz) čl. 8 Vyloučení ze záruky, způsoby vyřízení čl. 7, lhůta 30 dnů čl. 5, záruka 24 měsíců čl. 3. Knowledge pro agenta je `starter-kit/knowledge/Reklamacni-rad.pdf` (vlastní řád týmu, zdroj `Reklamacni-rad.md` vedle něj).
- Schvalování: specialistka (Klára) kulanci navrhne, vedoucí zákaznického centra (Jitka) schvaluje, stejnou cestou jako zamítnutí (stav U vedoucí).
- Test navíc: kromě E-08 (2 měsíce po záruce) založit ručně jednu reklamaci na KV-800 se zárukou skončenou před 4 až 5 měsíci a uznatelnou vadou; očekávané rek_kulance = Ano. Hodí se i do dema.
Části: 1, 2, 3, 4, 5
Nové sloupce: Doporučena kulance, Yes/No (výchozí Ne), rek_kulance, tabulka Reklamace; Důvod kulance, Multiline 2000, rek_kulanceduvod, tabulka Reklamace (založí část 1 v kroku 7)

## Aplikace
- Název aplikace: Pohoda Servis
- Fronta (P1): C seznam vlevo a detail vpravo na jedné obrazovce (specialistky často na dvou monitorech, Klára nepřepíná stránky)
- Navigace (P2): C horní lišta a vpravo rychlá akce „+ Nový požadavek“ s klávesovou zkratkou N
- Fronta navíc (P3): dny ve stavu (z `modifiedon`), štítek V záruce / Mimo záruku
- Persony (P4): Pavel velké karty pro tablet u zákazníka doma, fotka přes celou šířku, tlačítka aspoň 56 px; Jitka nahoře ohrožené lhůty (≤ 5 dní), pod nimi U vedoucí (Ke schválení), kulance zvýrazněné
- Vlastní prvek (P5): c kalendář lhůt na 14 dní dopředu nad frontou
- Texty (P6): věcné vstřícné, tykání; prázdné stavy „Všechny požadavky jsou v termínu.“, „U vedoucí nic nečeká.“, „V servisu teď nic není.“; potvrzení „Požadavek R-… je založený a ve frontě.“, „Rozhodnutí uloženo, jde ke schválení vedoucí.“
- Výzva v aplikaci: V2 v detailu u požadavku mimo záruku blok Kulance s Doporučena kulance (`rek_kulance`) a Důvod kulance (`rek_kulanceduvod`) od agenta; pravidlo kulance do 3 měsíců po záruce, u KV-450 a KV-800 do 6 měsíců, oprava zdarma, zákazník platí jen díl; uznání mimo záruku jde ke schválení vedoucí (stav U vedoucí, jádro). Sloupce z `reklamace-schema.json`, sekce `"vyzva"`.
- Navíc na přání týmu: hledání ve frontě (číslo, zákazník, e-mail, produkt).
- Stav: aplikace nasazená v Training12 (https://apps.powerapps.com/play/e/a6e76ae4-41cc-e656-b96f-bd359611a015/app/e9b1056d-f22f-45e7-b7d9-96691c633eb6), kód v `reklamace-app/`, snímky v `demo/snimky/`. Sdílení s dalším lab účtem neproběhlo (tým má jen LabAdmin12).

## Automatizace
- Schválení (A1): C e-mail v Outlooku s tlačítky (Office 365 Outlook: Send email with options, Schválit / Vrátit); komentář se nesbírá, při vrácení se zapíše „vráceno e-mailem"
- Zprávy Kláře (A2): C e-mail a navíc A soukromá zpráva od Flow bota v Teams (rozhodnutí týmu 18. 11.)
- Persony v předmětech: interní e-maily začínají [Jitka] / [Klára] a obsahují jméno zákazníka, např. „[Jitka] Ke schválení: servisní požadavek R-2026-14233 (Daniel Veselý): Zamítnuto, 0,00“; zprávy v Teams začínají tučným „Pro Kláru · …“. E-maily zákazníkovi zůstávají podle brand/email-texty.json
- Žádost navíc (A3): Zbývá dní (Lhůta - dnes), počet servisních požadavků se stejným produktem a typem vady za 30 dnů
- Potvrzení navíc (A4): nic navíc (potvrzení zůstává podle brand/email-texty.json, 3 věty)
- Texty (A5), interně tykání, pojmy podle slovníku:
  - Vráceno: „Jitka ti vrátila servisní požadavek {číslo} zpět do Posuzujeme: {komentář}" (SK: „Jitka ti vrátila servisnú požiadavku {číslo} späť do Posudzujeme: {komentár}")
  - Schváleno: „Jitka schválila servisní požadavek {číslo}: {rozhodnutí}. Můžeš pokračovat." (SK: „Jitka schválila servisnú požiadavku {číslo}: {rozhodnutie}. Môžeš pokračovať.")
  - Výzva odeslána: „Servisní požadavek {číslo} čeká na podklady, zákazníkovi odešla výzva: {chybí}." (SK: „Servisná požiadavka {číslo} čaká na podklady, zákazníkovi odišla výzva: {chýba}.")
- Výzva v automatizaci: V2 Kulance po záruce, bez F3. F2 načte navíc rek_kulance a rek_kulanceduvod a u doporučené kulance je dá do žádosti o schválení na první místo
- Připojení: Microsoft Dataverse (i AI Builder prompt), Office 365 Outlook, SharePoint. Teams ani Approvals podle A1 C a A2 C nejsou potřeba
- Schránka: tým nemá sdílenou schránku reklamace@, F1 sleduje doručenou poštu LabAdmin12 (When a new email arrives V3) a odesílá z ní (Send an email V2). Šablony jsou v https://m365x29026754.sharepoint.com/sites/Training12, knihovna Reklamace/_sablony
- Poznámka: tým má jeden lab účet, Klára, Jitka i Pavel jsou LabAdmin12. Odkaz na detail v F2 (`<URL aplikace>/reklamace/{id}`) se doplní, až bude hotová aplikace z části 2

## Agent
- Jméno a povaha (G1): Asistent Pohoda, C ochránce lhůt (u každé odpovědi připomene, kolik dní zbývá, a nabídne další krok). Typická věta: „R-2026-… zbývá 3 dny. Navrhuji Výměnu, mám ti napsat odůvodnění?“
- Odpověď (G2): A tabulka
- Zápis (G3): B nejdřív návrh s odůvodněním, zápis až po potvrzení (Klára AI zatím moc nevěří, pilot nesmí rozhodovat za člověka)
- Dovednost (G4): D4 návrh odůvodnění rozhodnutí (přidělená, tým 12: ((12 - 1) mod 4) + 1 = 4), pomůže hlavně Kláře u zamítnutí a kulance
- Uvítání (G5): „Ahoj, tady Asistent Pohoda. Pošli mi číslo požadavku, nebo napiš Posuď všechny nové. Hlídám lhůty, ať nic nepropadne.“
- Startéry (G5): Posuď všechny nové reklamace · Posuď R-2026-… · Co je ohrožené lhůtou? · Napiš odůvodnění k R-2026-…
- Odmítnutí (G6): „Rozhodnutí je na tobě. Připravím ti návrh a odůvodnění a připomenu, kolik dní zbývá.“
- Odpovědi zákazníkům (G6): styl B věcný vstřícný, vykání, specialistkám tykání (B4); vzor E-03 SK: „Dobrý deň, vašu reklamáciu R-2026-… sme posúdili a uznávame ju. Umývačku riadu vám vymeníme za novú, výmenu vybavíme najneskôr do {termín}. O presnom termíne vás budeme informovať e-mailom. Ospravedlňujeme sa za komplikácie, ktoré vám to spôsobilo.“ Podpis: jméno přiřazené specialistky + „Zákaznícke centrum Pohoda“ (jméno se nepíše pevně)
- Výzva v agentovi: V2 kulance po záruce (okno 3 měsíce, KV-450 a KV-800 6 měsíců, uznatelný typ vady, oprava zdarma a zákazník platí jen díl; zapisuje rek_kulance a rek_kulanceduvod, Návrh AI zůstává Zamítnuto)
- Stav (18. 11. 2026): klasický agent „Pohoda asistent“ (bots/b6a053e6-5de3-f111-84e8-000d3a5bbb5b) v solution Reklamace, YAML v `agent-klasik/`. Instrukce (JÁDRO doslova + VARIANTA), uvítání, startéry, popis, ikona, web a obecné znalosti vypnuté, knowledge Reklamacni-rad.pdf; Dataverse MCP přidává tým v portálu. Ověření kroků 1–5 zatím NEPROBĚHLO (nedostatek času / kreditů); kontrolu kroků 3–6 v Dataverse dělá `python agent/overeni-agenta.py`. Agent z nového rozhraní (agents/553291e1-…) je nepoužívaný.
- rek_zbyvadni plní denně v 00:15 flow „Reklamace – Zbývá dní“ (solution Reklamace), aby agent mohl brát Zbývá dní ze sloupce podle JÁDRA.

## Power BI
(vyplní část 5)

## Demo
(vyplní část 6)
