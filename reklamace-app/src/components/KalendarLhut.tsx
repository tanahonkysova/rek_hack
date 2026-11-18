import { useMemo } from 'react'
import { jeOtevrena, zbyvaDni, type Reklamace } from '../lib/data'
import { STAV } from '../lib/schema'
import { datum, dnes, pridejDny } from '../lib/format'
import { IkonaKalendar } from './Ikony'

const DNY = 14
const ZKRATKY = ['ne', 'po', 'út', 'st', 'čt', 'pá', 'so']

/** P5 c: kalendář lhůt na 14 dní dopředu (počet otevřených požadavků s lhůtou v daný den). */
export default function KalendarLhut({
  reklamace,
  vybranyDen,
  onVyber,
}: {
  reklamace: Reklamace[]
  vybranyDen: number | null
  onVyber: (den: number | null) => void
}) {
  const { pocty, poLhute } = useMemo(() => {
    const p = new Array<number>(DNY).fill(0)
    let po = 0
    for (const r of reklamace) {
      if (!jeOtevrena(r)) continue
      const z = zbyvaDni(r)
      if (r.rek_stav === STAV.PoLhute || (z !== null && z < 0)) {
        po++
        continue
      }
      if (z !== null && z >= 0 && z < DNY) p[z]++
    }
    return { pocty: p, poLhute: po }
  }, [reklamace])

  const max = Math.max(1, ...pocty)
  const doPeti = pocty.slice(0, 6).reduce((a, b) => a + b, 0)
  const dnesek = dnes()

  return (
    <section className="kalendar" aria-label="Kalendář lhůt na 14 dní">
      <div className="kalendar-titulek">
        <IkonaKalendar />
        <strong>Lhůty na 14 dní</strong>
        <span className="tlumene">
          do 5 dnů: <strong data-testid="kalendar-do5">{doPeti}</strong> · po lhůtě: <strong>{poLhute}</strong>
        </span>
        {vybranyDen !== null && (
          <button className="btn kalendar-zrusit" onClick={() => onVyber(null)}>
            Lhůta {datum(pridejDny(dnesek, vybranyDen))} · zrušit filtr
          </button>
        )}
      </div>
      <ol className="kalendar-dny">
        {pocty.map((n, i) => {
          const d = pridejDny(dnesek, i)
          const trida = i <= 5 ? 'den-kriticka' : i <= 10 ? 'den-varovani' : 'den-ok'
          const vikend = d.getDay() === 0 || d.getDay() === 6
          return (
            <li key={i}>
              <button
                type="button"
                className={'kalendar-den ' + trida + (vikend ? ' den-vikend' : '') + (vybranyDen === i ? ' den-vybrany' : '')}
                onClick={() => onVyber(vybranyDen === i ? null : i)}
                disabled={n === 0}
                title={`${datum(d)}: ${n} s lhůtou (zbývá ${i} dní)`}
                aria-pressed={vybranyDen === i}
              >
                <span className="den-nazev">{i === 0 ? 'dnes' : ZKRATKY[d.getDay()]}</span>
                <span className="den-datum">{d.getDate()}. {d.getMonth() + 1}.</span>
                <span className="den-sloupec" aria-hidden>
                  <span className="den-vypln" style={{ height: `${(n / max) * 100}%` }} />
                </span>
                <span className="den-pocet">{n}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
