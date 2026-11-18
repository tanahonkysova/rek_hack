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
(vyplní část 3)

## Agent
(vyplní část 4)

## Power BI
(vyplní část 5)

## Demo
(vyplní část 6)
