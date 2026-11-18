import { useEffect, useMemo, useState } from 'react'
import { useData, jeOtevrena, zbyvaDni, dniVeStavu, mapa, type Reklamace } from '../lib/data'
import { usePersona } from '../lib/persona'
import { navigate } from '../lib/router'
import { STAV, STAV_POPISEK, ZEME, ZEME_KOD } from '../lib/schema'
import { dniSlovo } from '../lib/format'
import { PillNavrh, StitekLhuty, StitekStav, StitekZaruka } from '../components/Stitky'
import { IkonaPlus } from '../components/Ikony'
import Detail from './Detail'
import KalendarLhut from '../components/KalendarLhut'

interface Props {
  vybraneId?: string
  zvyraznene?: string
}

const FILTR_OTEVRENE = 'otevrene'
const FILTR_VSE = 'vse'

/** Fronta (P1 C): seznam vlevo, detail vpravo na jedné obrazovce. */
export default function Fronta({ vybraneId, zvyraznene }: Props) {
  const { data, chyba } = useData()
  const persona = usePersona()
  const [filtrStav, setFiltrStav] = useState<string>(FILTR_OTEVRENE)
  const [filtrZeme, setFiltrZeme] = useState<string>('')
  const [filtrVyrizuje, setFiltrVyrizuje] = useState<'ja' | 'vsichni'>('ja')
  const [denLhuty, setDenLhuty] = useState<number | null>(null)
  const [hledat, setHledat] = useState('')

  const produkty = useMemo(() => mapa(data?.produkty ?? [], (p) => p.rek_produktid), [data])
  const typy = useMemo(() => mapa(data?.typyVad ?? [], (t) => t.rek_typvadyid), [data])

  const vsechny = useMemo(() => data?.reklamace ?? [], [data])
  const souhrn = useMemo(() => {
    const otevrene = vsechny.filter(jeOtevrena)
    return {
      otevrene: otevrene.length,
      ohrozene: otevrene.filter((r) => {
        const z = zbyvaDni(r)
        return r.rek_stav !== STAV.PoLhute && z !== null && z >= 0 && z <= 5
      }).length,
      poLhute: otevrene.filter((r) => r.rek_stav === STAV.PoLhute).length,
      cekaNaDoplneni: otevrene.filter((r) => r.rek_stav === STAV.CekaNaDoplneni).length,
    }
  }, [vsechny])

  const seznam = useMemo(() => {
    const q = hledat.trim().toLowerCase()
    const r = vsechny.filter((x) => {
      if (filtrStav === FILTR_OTEVRENE && !jeOtevrena(x)) return false
      if (filtrStav !== FILTR_OTEVRENE && filtrStav !== FILTR_VSE && x.rek_stav !== Number(filtrStav)) return false
      if (filtrZeme && x.rek_zeme !== Number(filtrZeme)) return false
      if (filtrVyrizuje === 'ja' && x._rek_vyrizuje_value && x._rek_vyrizuje_value !== persona.systemuserid) return false
      if (denLhuty !== null && (x.rek_stav === STAV.PoLhute || zbyvaDni(x) !== denLhuty)) return false
      if (q) {
        const p = x._rek_produkt_value ? produkty.get(x._rek_produkt_value) : undefined
        const text = [x.rek_cislo, x.rek_zakaznik, x.rek_email, p?.rek_kod, p?.rek_nazev].join(' ').toLowerCase()
        if (!text.includes(q)) return false
      }
      return true
    })
    // Výchozí řazení: Zbývá dní vzestupně (po lhůtě nahoře), bez lhůty na konec.
    const klic = (x: Reklamace) => (x.rek_stav === STAV.PoLhute ? -10000 : (zbyvaDni(x) ?? 100000))
    r.sort((a, b) => klic(a) - klic(b) || (a.rek_cislo ?? '').localeCompare(b.rek_cislo ?? ''))
    // Právě založený požadavek je nahoře a zvýrazněný.
    const i = zvyraznene ? r.findIndex((x) => x.rek_reklamaceid === zvyraznene) : -1
    if (i > 0) r.unshift(...r.splice(i, 1))
    return r
  }, [vsechny, filtrStav, filtrZeme, filtrVyrizuje, persona, zvyraznene, denLhuty, hledat, produkty])

  // Nově založený požadavek: zvýraznit, posunout do pohledu a potvrdit (P6).
  const nova = zvyraznene ? vsechny.find((r) => r.rek_reklamaceid === zvyraznene) : undefined
  useEffect(() => {
    if (!zvyraznene) return
    document.getElementById('r-' + zvyraznene)?.scrollIntoView({ block: 'center' })
  }, [zvyraznene, data])

  const vybrana = vybraneId ? vsechny.find((r) => r.rek_reklamaceid === vybraneId) : undefined

  return (
    <div className="fronta-obal">
    {data && <KalendarLhut reklamace={vsechny} vybranyDen={denLhuty} onVyber={setDenLhuty} />}
    <div className={'fronta' + (vybraneId ? ' fronta-s-detailem' : '')}>
      <section className="fronta-seznam" aria-label="Fronta servisních požadavků">
        <div className="fronta-hlavicka">
          <h1>Fronta servisních požadavků</h1>
          <button className="btn btn-primarni" onClick={() => navigate('/reklamace/nova')}>
            <IkonaPlus /> Nový požadavek
          </button>
        </div>

        <div className="souhrn" role="group" aria-label="Souhrn">
          <div className="souhrn-polozka">
            <span className="souhrn-cislo" data-testid="pocet-otevrene">{data ? souhrn.otevrene : '–'}</span>
            <span className="souhrn-popis">otevřených</span>
          </div>
          <div className="souhrn-polozka souhrn-kriticka">
            <span className="souhrn-cislo">{data ? souhrn.ohrozene : '–'}</span>
            <span className="souhrn-popis">5 a méně dnů{data && souhrn.poLhute > 0 ? ` · ${souhrn.poLhute} po lhůtě` : ''}</span>
          </div>
          <div className="souhrn-polozka">
            <span className="souhrn-cislo">{data ? souhrn.cekaNaDoplneni : '–'}</span>
            <span className="souhrn-popis">čeká na podklady</span>
          </div>
        </div>

        <div className="filtry">
          <label className="filtr-hledat">
            Hledat
            <input
              type="search"
              value={hledat}
              onChange={(e) => setHledat(e.target.value)}
              placeholder="Číslo, zákazník, e-mail, produkt"
            />
          </label>
          <label>
            Stav
            <select value={filtrStav} onChange={(e) => setFiltrStav(e.target.value)}>
              <option value={FILTR_OTEVRENE}>Všechny kromě Hotovo</option>
              {Object.entries(STAV_POPISEK).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
              <option value={FILTR_VSE}>Všechny včetně Hotovo</option>
            </select>
          </label>
          <label>
            Země
            <select value={filtrZeme} onChange={(e) => setFiltrZeme(e.target.value)}>
              <option value="">Česko i Slovensko</option>
              {Object.entries(ZEME).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </label>
          <label>
            Vyřizuje
            <select value={filtrVyrizuje} onChange={(e) => setFiltrVyrizuje(e.target.value as 'ja' | 'vsichni')}>
              <option value="ja">Já ({persona.jmeno})</option>
              <option value="vsichni">Všichni</option>
            </select>
          </label>
          <span className="filtry-pocet tlumene">{data ? `${seznam.length} v seznamu` : ''}</span>
        </div>

        {nova && (
          <p className="hlaska hlaska-ok" role="status">
            Požadavek {nova.rek_cislo} je založený a ve frontě.
          </p>
        )}
        {chyba && <p className="hlaska hlaska-chyba">Data se nepodařilo načíst: {chyba}</p>}
        {!data && !chyba && <p className="tlumene">Načítám frontu…</p>}
        {data && seznam.length === 0 && <p className="prazdny">Všechny požadavky jsou v termínu.</p>}

        <ul className="seznam">
          {seznam.map((r) => {
            const produkt = r._rek_produkt_value ? produkty.get(r._rek_produkt_value) : undefined
            const typ = r._rek_typvady_value ? typy.get(r._rek_typvady_value) : undefined
            const dni = dniVeStavu(r)
            const aktivni = r.rek_reklamaceid === vybraneId
            const nova = r.rek_reklamaceid === zvyraznene
            return (
              <li key={r.rek_reklamaceid}>
                <a
                  id={'r-' + r.rek_reklamaceid}
                  href={`#/reklamace/${r.rek_reklamaceid}`}
                  className={'radek' + (aktivni ? ' radek-aktivni' : '') + (nova ? ' radek-novy' : '')}
                  aria-current={aktivni ? 'true' : undefined}
                >
                  <span className="radek-lhuta">
                    <StitekLhuty zbyva={zbyvaDni(r)} stav={r.rek_stav} />
                  </span>
                  <span className="radek-hlavni">
                    <span className="radek-r1">
                      <strong className="cislo">{r.rek_cislo}</strong>
                      <span className="zeme">{r.rek_zeme !== undefined ? ZEME_KOD[r.rek_zeme] : ''}</span>
                    </span>
                    <span className="radek-r2 tlumene">
                      <span className="radek-zakaznik">{r.rek_zakaznik}</span> · {produkt?.rek_kod ?? '–'} · {typ?.rek_nazev ?? 'typ vady neurčen'}
                    </span>
                  </span>
                  <span className="radek-navrh">
                    <PillNavrh navrh={r.rek_navrhai} />
                  </span>
                  <span className="radek-stav">
                    <StitekStav stav={r.rek_stav} />
                    {dni !== null && (
                      <span className="tlumene radek-dni" title="Dny v aktuálním stavu (od poslední změny)">
                        {dni} {dniSlovo(dni)} ve stavu
                      </span>
                    )}
                  </span>
                  <span className="radek-zaruka">
                    <StitekZaruka vZaruce={r.rek_vzaruce} />
                  </span>
                </a>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="fronta-detail" aria-label="Detail servisního požadavku">
        {vybraneId ? (
          vybrana || !data ? (
            <Detail id={vybraneId} />
          ) : (
            <p className="prazdny">Servisní požadavek nenalezen.</p>
          )
        ) : (
          <div className="prazdny-detail">
            <p>Vyber servisní požadavek ze seznamu.</p>
            <p className="tlumene">Nahoře jsou požadavky s nejkratší lhůtou.</p>
          </div>
        )}
      </section>
    </div>
    </div>
  )
}
