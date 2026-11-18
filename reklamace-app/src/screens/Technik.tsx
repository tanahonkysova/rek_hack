import { useMemo, useState } from 'react'
import { Rek_reklamacesService } from '../generated/services/Rek_reklamacesService'
import { obnovData, useData, zbyvaDni, type Reklamace } from '../lib/data'
import { RESENI, STAV } from '../lib/schema'
import { dnes, parseDatum } from '../lib/format'
import { PillNavrh, StitekLhuty, StitekZaruka } from '../components/Stitky'
import Fotka from '../components/Fotka'

function stariMesice(datumNakupu?: string): number | null {
  const d = parseDatum(datumNakupu)
  if (!d) return null
  const t = dnes()
  let m = (t.getFullYear() - d.getFullYear()) * 12 + (t.getMonth() - d.getMonth())
  if (t.getDate() < d.getDate()) m -= 1
  return Math.max(0, m)
}

function mesiceSlovo(n: number) {
  if (n === 1) return 'měsíc'
  if (n >= 2 && n <= 4) return 'měsíce'
  return 'měsíců'
}

function chybaText(e: unknown): string {
  if (e instanceof Error) return e.message
  return typeof e === 'string' ? e : JSON.stringify(e)
}

function KartaTechnika({ r }: { r: Reklamace }) {
  const { data } = useData()
  const produkt = data?.produkty.find((p) => p.rek_produktid === r._rek_produkt_value)
  const objednavka = data?.objednavky.find((o) => o.rek_objednavkaid === r._rek_objednavka_value)
  const typ = data?.typyVad.find((t) => t.rek_typvadyid === r._rek_typvady_value)
  const stari = stariMesice(objednavka?.rek_datumnakupu)

  const [posudek, setPosudek] = useState('')
  const [doporuceni, setDoporuceni] = useState('')
  const [chyby, setChyby] = useState<string[]>([])
  const [ukladam, setUkladam] = useState(false)

  const uloz = async () => {
    const c: string[] = []
    if (!doporuceni) c.push('Doporučené řešení')
    if (!posudek.trim()) c.push('Posudek technika')
    setChyby(c)
    if (c.length) return
    setUkladam(true)
    try {
      // Doporučení na začátek posudku: „Doporučuji: Výměna. …“
      const text = `Doporučuji: ${RESENI[Number(doporuceni)]}. ${posudek.trim()}`
      const v = await Rek_reklamacesService.update(r.rek_reklamaceid, { rek_posudek: text, rek_stav: STAV.PosuzujeSe } as never)
      if (v.error) throw v.error
      await obnovData()
    } catch (e) {
      setChyby(['Uložení se nepodařilo: ' + chybaText(e)])
      setUkladam(false)
    }
  }

  return (
    <article className="karta-technik">
      <header className="karta-hlavicka">
        <h2>{r.rek_cislo}</h2>
        <StitekLhuty zbyva={zbyvaDni(r)} stav={r.rek_stav} />
        <PillNavrh navrh={r.rek_navrhai} />
      </header>
      <p className="karta-produkt">
        <strong>{produkt?.rek_nazev ?? produkt?.rek_kod ?? '–'}</strong>
        {typ ? ` · ${typ.rek_nazev}` : ''}
      </p>
      <p className="tlumene">
        {stari !== null ? `Stáří výrobku ${stari} ${mesiceSlovo(stari)}` : 'Stáří výrobku neznámé (bez objednávky)'}{' '}
        <StitekZaruka vZaruce={r.rek_vzaruce} />
      </p>
      <Fotka id={r.rek_reklamaceid} popis={r.rek_popisfotky} velka />
      <p className="predformat karta-popis">{r.rek_popiscesky || '–'}</p>
      {r.rek_navrhoduvodneni && (
        <details className="sbalene">
          <summary>Odůvodnění návrhu AI</summary>
          <p className="predformat">{r.rek_navrhoduvodneni}</p>
        </details>
      )}

      <div className="technik-formular">
        <fieldset className={'pole' + (chyby.includes('Doporučené řešení') ? ' pole-chyba' : '')}>
          <legend>Doporučené řešení *</legend>
          <div className="velke-volby">
            {Object.entries(RESENI).map(([k, v]) => (
              <label key={k} className={'velka-volba' + (doporuceni === k ? ' prepinac-aktivni' : '')}>
                <input type="radio" name={'dop-' + r.rek_reklamaceid} checked={doporuceni === k} onChange={() => setDoporuceni(k)} />
                {v}
              </label>
            ))}
          </div>
        </fieldset>
        <label className={'pole' + (chyby.includes('Posudek technika') ? ' pole-chyba' : '')}>
          <span>Posudek technika *</span>
          <textarea rows={4} value={posudek} onChange={(e) => setPosudek(e.target.value)} placeholder="Co jsi zjistil a proč." />
        </label>
        <button className="btn btn-primarni btn-velke" disabled={ukladam} onClick={() => void uloz()}>
          {ukladam ? 'Ukládám…' : 'Uložit posudek'}
        </button>
        {chyby.length > 0 && (
          <p className="hlaska hlaska-chyba" role="alert">
            {chyby[0].startsWith('Uložení') ? chyby[0] : `Vyplňte povinná pole: ${chyby.join(', ')}`}
          </p>
        )}
      </div>
    </article>
  )
}

/** V servisu (/technik): požadavky ve stavu U technika podle lhůty, velké karty pro tablet (P4). */
export default function Technik() {
  const { data, chyba } = useData()
  const seznam = useMemo(
    () =>
      (data?.reklamace ?? [])
        .filter((r) => r.rek_stav === STAV.UTechnika)
        .sort((a, b) => (zbyvaDni(a) ?? 9999) - (zbyvaDni(b) ?? 9999)),
    [data],
  )

  return (
    <div className="technik">
      <h1>V servisu {data ? <span className="tlumene">({seznam.length})</span> : null}</h1>
      {chyba && <p className="hlaska hlaska-chyba">Data se nepodařilo načíst: {chyba}</p>}
      {!data && !chyba && <p className="tlumene">Načítám…</p>}
      {data && seznam.length === 0 && <p className="prazdny panel">V servisu teď nic není.</p>}
      <div className="technik-karty">
        {seznam.map((r) => (
          <KartaTechnika key={r.rek_reklamaceid} r={r} />
        ))}
      </div>
    </div>
  )
}
