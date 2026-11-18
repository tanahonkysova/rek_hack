import { useState } from 'react'
import { Rek_typvadiesService } from '../generated/services/Rek_typvadiesService'
import { obnovData, useData, type TypVady } from '../lib/data'
import { usePersona } from '../lib/persona'
import { RESENI } from '../lib/schema'
import { IkonaPlus, IkonaZavrit } from '../components/Ikony'

function chybaText(e: unknown): string {
  if (e instanceof Error) return e.message
  return typeof e === 'string' ? e : JSON.stringify(e)
}

const BEZ_NAVRHU = ''

function FormularTypu({ typ, typy, onZavrit }: { typ: TypVady | null; typy: TypVady[]; onZavrit: (ulozeno?: string) => void }) {
  const upravit = !!typ
  const [nazev, setNazev] = useState(typ?.rek_nazev ?? '')
  const [kod, setKod] = useState(typ?.rek_kod ?? '')
  const [uznatelna, setUznatelna] = useState(typ?.rek_uznatelna ?? true)
  const [vychozi, setVychozi] = useState(
    typ?.rek_vychozireseni !== undefined && typ?.rek_vychozireseni !== null ? String(typ.rek_vychozireseni) : BEZ_NAVRHU,
  )
  const [technik, setTechnik] = useState(typ?.rek_vyzadujetechnika ?? false)
  const [popis, setPopis] = useState(typ?.rek_popisproai ?? '')
  const [chybnaPole, setChybnaPole] = useState<string[]>([])
  const [hlasky, setHlasky] = useState<string[]>([])
  const [ukladam, setUkladam] = useState(false)

  const uloz = async () => {
    const pole: string[] = []
    const h: string[] = []
    if (!upravit) {
      if (!nazev.trim()) pole.push('Název')
      else if (typy.some((t) => (t.rek_nazev ?? '').trim().toLowerCase() === nazev.trim().toLowerCase())) {
        pole.push('Název')
        h.push(`Typ vady „${nazev.trim()}“ už existuje, název musí být jedinečný.`)
      }
    }
    if (!popis.trim()) pole.push('Popis pro AI')
    setChybnaPole(pole)
    if (pole.length && !h.length) h.unshift(`Vyplňte povinná pole: ${pole.join(', ')}`)
    setHlasky(h)
    if (pole.length) return

    setUkladam(true)
    const zaznam: Record<string, unknown> = {
      rek_kod: kod.trim() || null,
      rek_uznatelna: uznatelna,
      rek_vychozireseni: vychozi === BEZ_NAVRHU ? null : Number(vychozi),
      rek_vyzadujetechnika: technik,
      rek_popisproai: popis.trim(),
    }
    try {
      if (upravit) {
        const r = await Rek_typvadiesService.update(typ!.rek_typvadyid, zaznam as never)
        if (r.error) throw r.error
      } else {
        zaznam.rek_nazev = nazev.trim()
        const r = await Rek_typvadiesService.create(zaznam as never)
        if (r.error) throw r.error
      }
      await obnovData()
      onZavrit(upravit ? `Typ vady „${typ!.rek_nazev}“ je uložený.` : `Typ vady „${nazev.trim()}“ je založený a je v nabídce formuláře.`)
    } catch (e) {
      setHlasky(['Uložení se nepodařilo: ' + chybaText(e)])
      setUkladam(false)
    }
  }

  return (
    <form
      className="panel formular typ-formular"
      onSubmit={(e) => {
        e.preventDefault()
        void uloz()
      }}
      noValidate
    >
      <header className="detail-hlavicka">
        <h2>{upravit ? `Upravit typ vady` : 'Nový typ vady'}</h2>
        <button type="button" className="btn detail-upravit" onClick={() => onZavrit()} aria-label="Zavřít">
          <IkonaZavrit />
        </button>
      </header>
      <div className="pole-mrizka">
        <label className={'pole' + (chybnaPole.includes('Název') ? ' pole-chyba' : '')}>
          <span>Název *</span>
          <input value={nazev} onChange={(e) => setNazev(e.target.value)} readOnly={upravit} disabled={upravit} autoFocus={!upravit} />
          {upravit && <small className="tlumene">Název nejde změnit (podle něj posuzuje agent).</small>}
        </label>
        <label className="pole">
          <span>Kód</span>
          <input value={kod} onChange={(e) => setKod(e.target.value)} />
        </label>
        <label className="pole">
          <span>Výchozí řešení</span>
          <select value={vychozi} onChange={(e) => setVychozi(e.target.value)}>
            <option value={BEZ_NAVRHU}>Bez návrhu</option>
            {Object.entries(RESENI).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </label>
        <div className="pole">
          <span>Vlastnosti</span>
          <label className="zaskrtavatko">
            <input type="checkbox" checked={uznatelna} onChange={(e) => setUznatelna(e.target.checked)} /> Uznatelná
          </label>
          <label className="zaskrtavatko">
            <input type="checkbox" checked={technik} onChange={(e) => setTechnik(e.target.checked)} /> Vyžaduje technika
          </label>
        </div>
        <label className={'pole pole-siroke' + (chybnaPole.includes('Popis pro AI') ? ' pole-chyba' : '')}>
          <span>Popis pro AI *</span>
          <textarea rows={5} value={popis} onChange={(e) => setPopis(e.target.value)} placeholder="Kdy jde o tento typ vady a jak ho posuzovat." />
        </label>
      </div>
      <div className="formular-akce">
        <button type="submit" className="btn btn-primarni" disabled={ukladam}>
          {ukladam ? 'Ukládám…' : 'Uložit typ vady'}
        </button>
        <button type="button" className="btn" onClick={() => onZavrit()}>
          Zrušit
        </button>
      </div>
      {hlasky.map((t) => (
        <p key={t} className="hlaska hlaska-chyba" role="alert">{t}</p>
      ))}
    </form>
  )
}

/** Typy vad (/typy-vad): číselník pro agenta. Zápis jen Jitka a Radek. */
export default function TypyVad() {
  const { data, chyba } = useData()
  const persona = usePersona()
  const muzeUpravovat = persona.id === 'Jitka' || persona.id === 'Radek'
  const [otevreny, setOtevreny] = useState<TypVady | null | 'novy'>(null)
  const [zprava, setZprava] = useState<string | null>(null)

  const typy = [...(data?.typyVad ?? [])].sort((a, b) => (a.rek_nazev ?? '').localeCompare(b.rek_nazev ?? '', 'cs'))

  return (
    <div className="typy-vad">
      <div className="fronta-hlavicka">
        <h1>Typy vad</h1>
        {muzeUpravovat && (
          <button className="btn btn-primarni" onClick={() => { setZprava(null); setOtevreny('novy') }}>
            <IkonaPlus /> Nový typ vady
          </button>
        )}
      </div>
      <p className="tlumene">Číselník, podle kterého agent posuzuje servisní požadavky.{!muzeUpravovat && ' Upravovat ho může vedoucí zákaznického centra a kvalita.'}</p>
      {zprava && <p className="hlaska hlaska-ok" role="status">{zprava}</p>}
      {chyba && <p className="hlaska hlaska-chyba">Data se nepodařilo načíst: {chyba}</p>}

      {otevreny && muzeUpravovat && (
        <FormularTypu
          key={otevreny === 'novy' ? 'novy' : otevreny.rek_typvadyid}
          typ={otevreny === 'novy' ? null : otevreny}
          typy={typy}
          onZavrit={(z) => {
            setOtevreny(null)
            if (z) setZprava(z)
          }}
        />
      )}

      <div className="panel">
        {!data && !chyba && <p className="tlumene">Načítám…</p>}
        <table className="tabulka">
          <thead>
            <tr>
              <th>Název</th>
              <th>Uznatelná</th>
              <th>Výchozí řešení</th>
              <th>Vyžaduje technika</th>
              <th>Popis pro AI</th>
            </tr>
          </thead>
          <tbody>
            {typy.map((t) => (
              <tr
                key={t.rek_typvadyid}
                className={muzeUpravovat ? 'klikaci' : undefined}
                onClick={muzeUpravovat ? () => { setZprava(null); setOtevreny(t) } : undefined}
                title={muzeUpravovat ? 'Upravit' : undefined}
              >
                <td><strong>{t.rek_nazev}</strong>{t.rek_kod ? <span className="tlumene"> · {t.rek_kod}</span> : null}</td>
                <td>{t.rek_uznatelna ? 'Ano' : 'Ne'}</td>
                <td>{t.rek_vychozireseni !== undefined && t.rek_vychozireseni !== null ? RESENI[t.rek_vychozireseni] : 'bez návrhu'}</td>
                <td>{t.rek_vyzadujetechnika ? 'Ano' : 'Ne'}</td>
                <td className="bunka-text">{t.rek_popisproai}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
