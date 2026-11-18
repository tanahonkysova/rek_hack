# Pohoda Servis — Memory Bank

## Project
- Path: C:\Hackathon\reklamace-app
- App name: Pohoda Servis (Code App, React 18 + Vite + TypeScript)
- Environment: Training12 (a6e76ae4-41cc-e656-b96f-bd359611a015), Dataverse https://org37b4cbab.crm.dynamics.com
- App URL: https://apps.powerapps.com/play/e/a6e76ae4-41cc-e656-b96f-bd359611a015/app/e9b1056d-f22f-45e7-b7d9-96691c633eb6
- CLI: pa 1.4.2 (npx --no-install pa)

## Completed steps (02-aplikace.md)
- [x] 0 Volby týmu (navrh-reseni.md → Aplikace)
- [x] 1 Projekt + Dataverse: rek_reklamace, rek_produkt, rek_objednavka, rek_typvady, systemuser
- [x] 2 Brand (src/brand), horní lišta P2 C (+ Nový požadavek, klávesa N), přepínač Jsem: (localStorage reklamace.persona)
- [x] 3 Fronta P1 C (seznam + detail vpravo), P3 dny ve stavu + záruka, hledání
- [x] 4 Formulář Nový / Upravit
- [x] 5 Detail + rozhodnutí (lib/pravidla.ts), fotka
- [x] 6 V servisu (karty pro tablet), U vedoucí (ohrožené + ke schválení, kulance zvýrazněné), Typy vad
- [x] 7 P5 c Kalendář lhůt, V2 blok Kulance
- [x] 8 Build + push, snímky v demo/snimky

## Known issues
- rek_zbyvadni v Dataverse prázdné; aplikace počítá Lhůta − dnes (formulář zapisuje snapshot při uložení).
- SDK downloadImage vrací pro chybějící fotku prázdný string; záloha get(select rek_fotka) rozhodne Bez fotky.
- Všechny persony = jeden lab účet LabAdmin12, sdílení s jiným účtem neproběhlo.

## Redeploy
npm run build && npx --no-install pa app push
