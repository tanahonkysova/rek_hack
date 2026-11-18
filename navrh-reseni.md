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
- Schvalování: specialistka (Klára) kulanci navrhne, vedoucí zákaznického centra (Jitka) schvaluje, stejnou cestou jako zamítnutí (stav U vedoucí).
- Test navíc: kromě E-08 (2 měsíce po záruce) založit ručně jednu reklamaci na KV-800 se zárukou skončenou před 4 až 5 měsíci a uznatelnou vadou; očekávané rek_kulance = Ano. Hodí se i do dema.
Části: 1, 2, 3, 4, 5
Nové sloupce: Doporučena kulance, Yes/No (výchozí Ne), rek_kulance, tabulka Reklamace; Důvod kulance, Multiline 2000, rek_kulanceduvod, tabulka Reklamace (založí část 1 v kroku 7)

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
