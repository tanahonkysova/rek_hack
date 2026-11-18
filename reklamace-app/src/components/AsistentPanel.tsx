import { useState, type ReactNode } from 'react'
import { MicrosoftCopilotStudioService } from '../generated/services/MicrosoftCopilotStudioService'
import { obnovData } from '../lib/data'
import { IkonaSrdce } from './Ikony'

/** Schématický název publikovaného agenta „Pohoda asistent“ (Copilot Studio, Training12). */
const AGENT = 'rek_Pohodaasistent'

interface Zprava {
  kdo: 'ja' | 'agent'
  text: string
}

interface Odpoved {
  responses?: string[]
  lastResponse?: string
  conversationId?: string
  ConversationId?: string
  conversationID?: string
}

function chybaText(e: unknown): string {
  if (e instanceof Error) return e.message
  return typeof e === 'string' ? e : JSON.stringify(e)
}

/** Jednoduchý Markdown → React: odstavce, odrážky, tabulky, **tučně** (bez knihoven, pravidlo 4). */
function radek(t: string): ReactNode[] {
  return t.split(/(\*\*[^*]+\*\*)/g).map((c, i) => (c.startsWith('**') && c.endsWith('**') ? <strong key={i}>{c.slice(2, -2)}</strong> : c))
}

function Markdown({ text }: { text: string }) {
  const bloky: ReactNode[] = []
  const radky = text.replace(/\r/g, '').split('\n')
  let i = 0
  while (i < radky.length) {
    const r = radky[i]
    if (r.trim().startsWith('|')) {
      const tab: string[][] = []
      while (i < radky.length && radky[i].trim().startsWith('|')) {
        const bunky = radky[i].trim().replace(/^\||\|$/g, '').split('|').map((b) => b.trim())
        if (!bunky.every((b) => /^:?-{2,}:?$/.test(b))) tab.push(bunky)
        i++
      }
      const [hlava, ...telo] = tab
      bloky.push(
        <table key={i} className="tabulka asistent-tabulka">
          <thead><tr>{hlava?.map((h, k) => <th key={k}>{radek(h)}</th>)}</tr></thead>
          <tbody>{telo.map((t, j) => <tr key={j}>{t.map((b, k) => <td key={k}>{radek(b)}</td>)}</tr>)}</tbody>
        </table>,
      )
      continue
    }
    if (/^\s*[-*•]\s+/.test(r)) {
      const pol: string[] = []
      while (i < radky.length && /^\s*[-*•]\s+/.test(radky[i])) pol.push(radky[i++].replace(/^\s*[-*•]\s+/, ''))
      bloky.push(<ul key={i}>{pol.map((p, k) => <li key={k}>{radek(p)}</li>)}</ul>)
      continue
    }
    if (r.trim()) bloky.push(<p key={i}>{radek(r.replace(/^#+\s*/, ''))}</p>)
    i++
  }
  return <>{bloky}</>
}

/** Panel „Asistent Pohoda“ v detailu: posouzení, zápis po potvrzení (G3 B), odůvodnění (D4). */
export default function AsistentPanel({ cislo, onOduvodneni }: { cislo: string; onOduvodneni: (text: string) => void }) {
  const [zpravy, setZpravy] = useState<Zprava[]>([])
  const [konverzace, setKonverzace] = useState<string | undefined>()
  const [ceka, setCeka] = useState(false)
  const [chyba, setChyba] = useState<string | null>(null)
  const [vlastni, setVlastni] = useState('')
  const [posledniOduvodneni, setPosledniOduvodneni] = useState<string | null>(null)

  const posli = async (text: string, typ: 'bezny' | 'zapis' | 'oduvodneni' = 'bezny') => {
    setCeka(true)
    setChyba(null)
    setZpravy((z) => [...z, { kdo: 'ja', text }])
    try {
      const r = await MicrosoftCopilotStudioService.ExecuteCopilotAsyncV2(
        AGENT,
        { message: `Jsem Klára. ${text}`, notificationUrl: 'https://notificationurlplaceholder' },
        konverzace,
      )
      if (r.error) throw r.error
      const d = (r.data ?? {}) as unknown as Odpoved
      const id = d.conversationId ?? d.ConversationId ?? d.conversationID
      if (id) setKonverzace(id)
      const odpoved = (d.responses?.length ? d.responses.join('\n\n') : d.lastResponse) ?? '(agent neodpověděl)'
      setZpravy((z) => [...z, { kdo: 'agent', text: odpoved }])
      if (typ === 'oduvodneni') setPosledniOduvodneni(odpoved.trim())
      // Agent mohl zapsat návrh, stav nebo kulanci → načíst data znovu.
      if (typ === 'zapis') await obnovData()
    } catch (e) {
      setChyba('Asistent neodpověděl: ' + chybaText(e))
    } finally {
      setCeka(false)
    }
  }

  return (
    <section className="blok asistent">
      <h2>
        <IkonaSrdce /> Asistent Pohoda
      </h2>
      <div className="formular-akce asistent-akce">
        <button className="btn btn-sekundarni" disabled={ceka} onClick={() => void posli(`Posuď ${cislo}.`)}>
          Posuď
        </button>
        <button
          className="btn btn-primarni"
          disabled={ceka || !konverzace}
          title={!konverzace ? 'Nejdřív nech požadavek posoudit' : undefined}
          onClick={() => void posli('Ano, potvrzuji. Zapiš návrh.', 'zapis')}
        >
          Zapsat návrh
        </button>
        <button
          className="btn"
          disabled={ceka}
          onClick={() =>
            void posli(`Napiš odůvodnění k ${cislo}. Vrať jen samotný text odůvodnění, bez nadpisu a bez dalšího komentáře.`, 'oduvodneni')
          }
        >
          Napiš odůvodnění
        </button>
      </div>

      {zpravy.length > 0 && (
        <div className="asistent-konverzace" aria-live="polite">
          {zpravy.map((z, i) => (
            <div key={i} className={'asistent-zprava zprava-' + z.kdo}>
              {z.kdo === 'agent' ? <Markdown text={z.text} /> : <p>{z.text}</p>}
            </div>
          ))}
        </div>
      )}
      {ceka && <p className="tlumene">Asistent přemýšlí… (může to trvat i 30 s)</p>}
      {chyba && <p className="hlaska hlaska-chyba">{chyba}</p>}
      {posledniOduvodneni && !ceka && (
        <button className="btn btn-akcent" onClick={() => onOduvodneni(posledniOduvodneni)}>
          Vložit do Odůvodnění rozhodnutí
        </button>
      )}

      <form
        className="asistent-dotaz"
        onSubmit={(e) => {
          e.preventDefault()
          if (!vlastni.trim()) return
          const t = vlastni.trim()
          setVlastni('')
          void posli(t.includes('R-') ? t : `${t} (${cislo})`)
        }}
      >
        <input value={vlastni} onChange={(e) => setVlastni(e.target.value)} placeholder="Zeptej se asistenta, např. Má nárok na kulanci?" disabled={ceka} />
        <button className="btn" type="submit" disabled={ceka || !vlastni.trim()}>Poslat</button>
      </form>
      <p className="tlumene asistent-poznamka">Asistent jen navrhuje. Rozhoduješ ty.</p>
    </section>
  )
}
