import { NAVRH_AI, NAVRH_K_TECHNIKOVI, RESENI_ZAMITNUTO, STAV, STAV_POPISEK } from '../lib/schema'
import { dniSlovo } from '../lib/format'
import { IkonaHodiny, IkonaVykricnik } from './Ikony'

/** Štítek lhůty: > 10 ok, 6–10 varování, ≤ 5 kritická; stav Po lhůtě = „po lhůtě“. Vždy s textem (ne jen barva). */
export function StitekLhuty({ zbyva, stav }: { zbyva: number | null; stav: number }) {
  if (stav === STAV.Vyrizeno) return <span className="stitek stitek-obrys">vyřízeno</span>
  if (stav === STAV.PoLhute || (zbyva !== null && zbyva < 0)) {
    return (
      <span className="stitek lhuta-kriticka">
        <IkonaVykricnik size={12} /> po lhůtě
      </span>
    )
  }
  if (zbyva === null) return <span className="stitek stitek-obrys">bez lhůty</span>
  const trida = zbyva <= 5 ? 'lhuta-kriticka' : zbyva <= 10 ? 'lhuta-varovani' : 'lhuta-ok'
  return (
    <span className={'stitek ' + trida} title={`Zbývá ${zbyva} ${dniSlovo(zbyva)} do zákonné lhůty`}>
      {zbyva <= 5 && <IkonaHodiny size={12} />}
      zbývá {zbyva} {dniSlovo(zbyva)}
    </span>
  )
}

/** Návrh AI jako pill v barvě --navrh-*. */
export function PillNavrh({ navrh }: { navrh?: number | null }) {
  if (navrh === undefined || navrh === null) return <span className="pill pill-prazdny">neposouzeno</span>
  const trida =
    navrh === RESENI_ZAMITNUTO ? 'navrh-zamitnout' : navrh === NAVRH_K_TECHNIKOVI ? 'navrh-technik' : 'navrh-uznat'
  return <span className={'pill ' + trida}>{NAVRH_AI[navrh] ?? navrh}</span>
}

export function StitekStav({ stav }: { stav: number }) {
  return <span className={'stav stav-' + stav}>{STAV_POPISEK[stav] ?? stav}</span>
}

export function StitekZaruka({ vZaruce }: { vZaruce?: boolean | null }) {
  if (vZaruce === undefined || vZaruce === null) return null
  return vZaruce ? (
    <span className="stitek zaruka-ano">V záruce</span>
  ) : (
    <span className="stitek zaruka-ne">Mimo záruku</span>
  )
}
