import { useEffect, type ReactNode } from 'react'
import logoSvetle from '../brand/logo-svetle.svg'
import { navigate } from '../lib/router'
import { NAZEV_APLIKACE, PERSONY, type Persona, type PersonaId } from '../lib/schema'
import { IkonaFronta, IkonaKlic, IkonaPlus, IkonaSchvaleni, IkonaSeznam } from './Ikony'

interface Props {
  cesta: string
  persona: Persona
  onPersona: (id: PersonaId) => void
  children: ReactNode
}

// Navigace P2 C: horní lišta + vpravo rychlá akce „+ Nový požadavek“ (klávesa N).
const POLOZKY = [
  { cesta: '/', popisek: 'Fronta', ikona: <IkonaFronta /> },
  { cesta: '/technik', popisek: 'V servisu', ikona: <IkonaKlic /> },
  { cesta: '/schvaleni', popisek: 'U vedoucí', ikona: <IkonaSchvaleni /> },
  { cesta: '/typy-vad', popisek: 'Typy vad', ikona: <IkonaSeznam /> },
]

function jeAktivni(polozka: string, cesta: string) {
  if (polozka === '/') return cesta === '/' || cesta.startsWith('/reklamace')
  return cesta.startsWith(polozka)
}

export default function Layout({ cesta, persona, onPersona, children }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'n' && e.key !== 'N') return
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const t = e.target as HTMLElement | null
      if (t && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName))) return
      e.preventDefault()
      navigate('/reklamace/nova')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="app">
      <header className="lista">
        <a className="lista-logo" href="#/" aria-label={NAZEV_APLIKACE}>
          <img src={logoSvetle} alt="Pohoda Spotřebiče" height={36} />
          <span className="lista-nazev">{NAZEV_APLIKACE}</span>
        </a>
        <nav className="lista-nav" aria-label="Hlavní navigace">
          {POLOZKY.map((p) => (
            <a
              key={p.cesta}
              href={'#' + p.cesta}
              className={'lista-odkaz' + (jeAktivni(p.cesta, cesta) ? ' aktivni' : '')}
              aria-current={jeAktivni(p.cesta, cesta) ? 'page' : undefined}
            >
              {p.ikona}
              {p.popisek}
            </a>
          ))}
        </nav>
        <div className="lista-vpravo">
          <label className="persona">
            Jsem:
            <select value={persona.id} onChange={(e) => onPersona(e.target.value as PersonaId)}>
              {PERSONY.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.jmeno} ({p.role})
                </option>
              ))}
            </select>
          </label>
          <button className="btn btn-akcent" onClick={() => navigate('/reklamace/nova')} title="Nový servisní požadavek (klávesa N)">
            <IkonaPlus /> Nový požadavek <kbd>N</kbd>
          </button>
        </div>
      </header>
      <main className="obsah">{children}</main>
    </div>
  )
}
