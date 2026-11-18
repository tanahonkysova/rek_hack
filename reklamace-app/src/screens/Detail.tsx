import { useEffect, useMemo, useState } from 'react'
import { Rek_reklamacesService } from '../generated/services/Rek_reklamacesService'
import { obnovData, useData, lhuta, zbyvaDni, type Reklamace } from '../lib/data'
import { navigate } from '../lib/router'
import {
  JAZYK, JISTOTA, KANAL, MENA, NAVRH_K_TECHNIKOVI, RESENI, RESENI_VRACENI, RESENI_ZAMITNUTO, STAV, ZEME,
} from '../lib/schema'
import { castka, datum, dnes, isoDatum, parseDatum } from '../lib/format'
import { PillNavrh, StitekLhuty, StitekStav, StitekZaruka } from '../components/Stitky'
import { IkonaKlic, IkonaSrdce, IkonaTuzka, IkonaZpet } from '../components/Ikony'
import Fotka from '../components/Fotka'
import { LIMIT_VRACENI, cilovyStav } from '../lib/pravidla'

function chybaText(e: unknown): string {
  if (e instanceof Error) return e.message
  return typeof e === 'string' ? e : JSON.stringify(e)
}

function Rozhodnuti({ r, mena, cenaObjednavky, vyzadujeTechnika }: {
  r: Reklamace
  mena: string
  cenaObjednavky?: number
  vyzadujeTechnika: boolean
}) {
  const predvyplneno = r.rek_rozhodnuti ?? (r.rek_navrhai !== undefined && r.rek_navrhai !== null && r.rek_navrhai !== NAVRH_K_TECHNIKOVI ? r.rek_navrhai : undefined)
  const [reseni, setReseni] = useState<string>(predvyplneno !== undefined ? String(predvyplneno) : '')
  const [oduvodneni, setOduvodneni] = useState(r.rek_oduvodneni ?? '')
  const [naklady, setNaklady] = useState(r.rek_naklady !== undefined && r.rek_naklady !== null ? String(r.rek_naklady) : '')
  const [chyby, setChyby] = useState<string[]>([])
  const [chybnaPole, setChybnaPole] = useState<string[]>([])
  const [zprava, setZprava] = useState<string | null>(null)
  const [ukladam, setUkladam] = useState(false)

  // Při přepnutí na jiný požadavek vše načti znovu.
  useEffect(() => {
    setReseni(predvyplneno !== undefined ? String(predvyplneno) : '')
    setOduvodneni(r.rek_oduvodneni ?? '')
    setNaklady(r.rek_naklady !== undefined && r.rek_naklady !== null ? String(r.rek_naklady) : '')
    setChyby([])
    setChybnaPole([])
    setZprava(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [r.rek_reklamaceid])

  const bezPosudku = vyzadujeTechnika && !(r.rek_posudek ?? '').trim()
  const nakladyCislo = naklady.trim() === '' ? null : Number(naklady.replace(/\s/g, '').replace(',', '.'))
  const reseniCislo = reseni === '' ? null : Number(reseni)
  const nahledStavu = reseniCislo !== null ? cilovyStav(reseniCislo, nakladyCislo, mena, r.rek_vzaruce) : null

  const zapis = async (zmeny: Record<string, unknown>, text: string) => {
    setUkladam(true)
    setZprava(null)
    try {
      const v = await Rek_reklamacesService.update(r.rek_reklamaceid, zmeny as never)
      if (v.error) throw v.error
      await obnovData()
      setZprava(text)
    } catch (e) {
      setChyby(['Uložení se nepodařilo: ' + chybaText(e)])
    } finally {
      setUkladam(false)
    }
  }

  const ulozRozhodnuti = () => {
    const c: string[] = []
    const pole: string[] = []
    if (reseniCislo === null) {
      c.push('Vyberte řešení.')
      pole.push('reseni')
    }
    if (reseniCislo === RESENI_ZAMITNUTO && !oduvodneni.trim()) {
      c.push('U zamítnutí vyplňte Odůvodnění rozhodnutí.')
      pole.push('oduvodneni')
    }
    if (nakladyCislo !== null && (isNaN(nakladyCislo) || nakladyCislo < 0)) {
      c.push('Náklady řešení musí být kladné číslo.')
      pole.push('naklady')
    }
    if (reseniCislo === RESENI_VRACENI && nakladyCislo !== null && cenaObjednavky !== undefined && nakladyCislo > cenaObjednavky) {
      c.push(`Vrácení peněz nemůže být vyšší než cena z objednávky (${castka(cenaObjednavky, mena)}).`)
      pole.push('naklady')
    }
    setChyby(c)
    setChybnaPole(pole)
    if (c.length || reseniCislo === null) return
    const stav = cilovyStav(reseniCislo, nakladyCislo, mena, r.rek_vzaruce)
    const maNavrh = r.rek_navrhai !== undefined && r.rek_navrhai !== null
    void zapis(
      {
        rek_rozhodnuti: reseniCislo,
        rek_oduvodneni: oduvodneni.trim() || null,
        rek_naklady: nakladyCislo,
        rek_shodasai: maNavrh ? reseniCislo === r.rek_navrhai : null,
        rek_stav: stav,
      },
      stav === STAV.KeSchvaleni ? 'Rozhodnutí uloženo, jde ke schválení vedoucí.' : 'Rozhodnutí uloženo.',
    )
  }

  if (r.rek_stav === STAV.Vyrizeno) {
    return (
      <section className="blok">
        <h2>Rozhodnutí</h2>
        <p>
          <strong>{r.rek_rozhodnuti !== undefined ? RESENI[r.rek_rozhodnuti] : '–'}</strong>
          {r.rek_naklady ? ` · ${castka(r.rek_naklady, mena)}` : ''} · hotovo {datum(r.rek_datumvyrizeni)}
        </p>
        {r.rek_oduvodneni && <p className="predformat">{r.rek_oduvodneni}</p>}
      </section>
    )
  }

  return (
    <section className="blok rozhodnuti">
      <h2>Rozhodnutí</h2>
      {r.rek_stav === STAV.KeSchvaleni && (
        <p className="hlaska hlaska-info">Čeká na schválení vedoucí v Teams. Změnou rozhodnutí se znovu vyhodnotí, kam půjde.</p>
      )}
      <div className="pole-mrizka">
        <label className={'pole' + (chybnaPole.includes('reseni') ? ' pole-chyba' : '')}>
          <span>Řešení *</span>
          <select value={reseni} onChange={(e) => setReseni(e.target.value)}>
            <option value="">Vyber řešení</option>
            {Object.entries(RESENI).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </label>
        <label className={'pole' + (chybnaPole.includes('naklady') ? ' pole-chyba' : '')}>
          <span>Náklady řešení ({mena})</span>
          <input inputMode="decimal" value={naklady} onChange={(e) => setNaklady(e.target.value)} placeholder="0" />
          {nakladyCislo !== null && !isNaN(nakladyCislo) && <small className="tlumene">{castka(nakladyCislo, mena)}</small>}
        </label>
        <label className={'pole pole-siroke' + (chybnaPole.includes('oduvodneni') ? ' pole-chyba' : '')}>
          <span>Odůvodnění rozhodnutí{reseniCislo === RESENI_ZAMITNUTO ? ' *' : ''}</span>
          <textarea id="oduvodneni" rows={4} value={oduvodneni} onChange={(e) => setOduvodneni(e.target.value)} />
        </label>
      </div>
      {nahledStavu !== null && (
        <p className="tlumene nahled-stavu">
          Po uložení: <StitekStav stav={nahledStavu} />
          {nahledStavu === STAV.KeSchvaleni &&
            (reseniCislo === RESENI_ZAMITNUTO
              ? ' (zamítnutí schvaluje vedoucí)'
              : reseniCislo === RESENI_VRACENI && r.rek_vzaruce !== false
                ? ` (vrácení peněz nad ${castka(LIMIT_VRACENI[mena] ?? 5000, mena)})`
                : ' (uznání mimo záruku)')}
        </p>
      )}
      <div className="formular-akce">
        <span title={bezPosudku ? 'Nejdřív posudek technika' : undefined}>
          <button className="btn btn-primarni" disabled={ukladam || bezPosudku} onClick={ulozRozhodnuti}>
            Uložit rozhodnutí
          </button>
        </span>
        <button
          className="btn btn-sekundarni"
          disabled={ukladam || r.rek_stav === STAV.UTechnika}
          onClick={() => void zapis({ rek_stav: STAV.UTechnika }, 'Předáno do servisu technikovi.')}
        >
          <IkonaKlic /> K technikovi
        </button>
        {r.rek_stav === STAV.Rozhodnuto && (
          <button
            className="btn btn-akcent"
            disabled={ukladam}
            onClick={() =>
              void zapis({ rek_stav: STAV.Vyrizeno, rek_datumvyrizeni: isoDatum(dnes()) }, 'Požadavek je vyřízený.')
            }
          >
            Hotovo
          </button>
        )}
      </div>
      {bezPosudku && <p className="napoveda">Nejdřív posudek technika (typ vady vyžaduje technika).</p>}
      {chyby.map((t) => (
        <p key={t} className="hlaska hlaska-chyba" role="alert">{t}</p>
      ))}
      {zprava && <p className="hlaska hlaska-ok" role="status">{zprava}</p>}
    </section>
  )
}

// V2 Kulance po záruce: okno 3 měsíce po konci záruky, u KV-450 a KV-800 6 měsíců (navrh-reseni.md, Výzva).
const KULANCE_6_MESICU = ['KV-450', 'KV-800']

function BlokKulance({ r, datumNakupu, zarukaMesicu, kodProduktu }: {
  r: Reklamace
  datumNakupu?: string
  zarukaMesicu: number
  kodProduktu?: string
}) {
  const nakup = parseDatum(datumNakupu)
  const uplatneno = parseDatum(r.rek_uplatnenodne)
  let konec: Date | null = null
  let poZaruce: number | null = null
  if (nakup) {
    konec = new Date(nakup)
    konec.setMonth(konec.getMonth() + zarukaMesicu)
    if (uplatneno) {
      poZaruce = (uplatneno.getFullYear() - konec.getFullYear()) * 12 + (uplatneno.getMonth() - konec.getMonth())
      if (uplatneno.getDate() < konec.getDate()) poZaruce -= 1
      poZaruce = Math.max(0, poZaruce)
    }
  }
  const okno = kodProduktu && KULANCE_6_MESICU.includes(kodProduktu) ? 6 : 3
  const vOkne = poZaruce !== null && poZaruce < okno
  const posouzeno = r.rek_kulance === true || !!(r.rek_kulanceduvod ?? '').trim()

  return (
    <section className={'blok blok-kulance' + (r.rek_kulance ? ' kulance-ano' : '')} aria-label="Kulance">
      <h2>
        <IkonaSrdce /> Kulance po záruce
      </h2>
      <dl className="udaje">
        <div><dt>Konec záruky</dt><dd>{datum(konec)}</dd></div>
        <div><dt>Uplatněno po záruce</dt><dd>{poZaruce !== null ? `${poZaruce} měs.` : '–'}</dd></div>
        <div><dt>Okno kulance</dt><dd>{okno} měsíce{okno === 6 ? ` (${kodProduktu})` : ''} · {vOkne ? 'v okně' : 'mimo okno'}</dd></div>
        <div>
          <dt>Doporučena kulance</dt>
          <dd>
            {r.rek_kulance ? (
              <span className="stitek stitek-kulance">Ano</span>
            ) : posouzeno ? (
              'Ne'
            ) : (
              <span className="tlumene">agent zatím neposoudil</span>
            )}
          </dd>
        </div>
      </dl>
      {r.rek_kulanceduvod && (
        <p className="predformat"><strong>Důvod kulance:</strong> {r.rek_kulanceduvod}</p>
      )}
      <p className="tlumene">
        Kulance = oprava zdarma, zákazník platí jen díl. Typ vady musí být uznatelný. Uznání mimo záruku jde ke schválení vedoucí.
      </p>
    </section>
  )
}

/** Detail servisního požadavku (/reklamace/:id), v P1 C vpravo vedle fronty. */
export default function Detail({ id }: { id: string }) {
  const { data } = useData()
  const r = data?.reklamace.find((x) => x.rek_reklamaceid === id)
  const produkt = useMemo(() => data?.produkty.find((p) => p.rek_produktid === r?._rek_produkt_value), [data, r])
  const objednavka = useMemo(() => data?.objednavky.find((o) => o.rek_objednavkaid === r?._rek_objednavka_value), [data, r])
  const typ = useMemo(() => data?.typyVad.find((t) => t.rek_typvadyid === r?._rek_typvady_value), [data, r])

  if (!data) return <p className="tlumene">Načítám…</p>
  if (!r) return <p className="prazdny">Servisní požadavek nenalezen.</p>

  const mena = objednavka?.rek_mena !== undefined ? MENA[objednavka.rek_mena] : 'CZK'

  return (
    <article className="detail">
      <header className="detail-hlavicka">
        <button className="btn detail-zpet" onClick={() => navigate('/')} aria-label="Zpět do fronty">
          <IkonaZpet />
        </button>
        <h1>{r.rek_cislo}</h1>
        <StitekStav stav={r.rek_stav} />
        <StitekLhuty zbyva={zbyvaDni(r)} stav={r.rek_stav} />
        {r.rek_stav !== STAV.Vyrizeno && (
          <button className="btn detail-upravit" onClick={() => navigate(`/reklamace/${r.rek_reklamaceid}/upravit`)}>
            <IkonaTuzka /> Upravit
          </button>
        )}
      </header>
      <dl className="udaje udaje-radek">
        <div><dt>Kanál</dt><dd>{r.rek_kanal !== undefined ? KANAL[r.rek_kanal] : '–'}</dd></div>
        <div><dt>Země a jazyk</dt><dd>{r.rek_zeme !== undefined ? ZEME[r.rek_zeme] : '–'}, {r.rek_jazyk !== undefined ? JAZYK[r.rek_jazyk] : '–'}</dd></div>
        <div><dt>Uplatněno dne</dt><dd>{datum(r.rek_uplatnenodne)}</dd></div>
        <div><dt>Lhůta</dt><dd>{datum(lhuta(r))}</dd></div>
      </dl>

      <div className="detail-dva">
        <section className="blok">
          <h2>Zákazník a popis</h2>
          <p><strong>{r.rek_zakaznik}</strong> · <a href={`mailto:${r.rek_email}`}>{r.rek_email}</a></p>
          <p className="tlumene">{produkt?.rek_nazev ?? produkt?.rek_kod} · {typ?.rek_nazev ?? 'typ vady neurčen'}</p>
          <p className="predformat">{r.rek_popiscesky || '–'}</p>
          {r.rek_popiszakaznika && (
            <details className="sbalene">
              <summary>Popis zákazníka (originál)</summary>
              <p className="predformat">{r.rek_popiszakaznika}</p>
            </details>
          )}
        </section>
        <section className="blok">
          <h2>Fotka</h2>
          <Fotka id={r.rek_reklamaceid} popis={r.rek_popisfotky} />
        </section>
      </div>

      <section className="blok">
        <h2>Objednávka</h2>
        {objednavka ? (
          <dl className="udaje">
            <div><dt>Číslo</dt><dd>{objednavka.rek_cislo}</dd></div>
            <div><dt>Produkt</dt><dd>{produkt?.rek_nazev ?? produkt?.rek_kod}</dd></div>
            <div><dt>Datum nákupu</dt><dd>{datum(objednavka.rek_datumnakupu)}</dd></div>
            <div><dt>Cena</dt><dd>{castka(objednavka.rek_cena, mena)}</dd></div>
            <div><dt>Záruka</dt><dd><StitekZaruka vZaruce={r.rek_vzaruce} /></dd></div>
          </dl>
        ) : (
          <p>
            Objednávka nenalezena
            {r.rek_chybejici ? <> · <strong>Chybějící údaje:</strong> {r.rek_chybejici}</> : null}
          </p>
        )}
      </section>

      {objednavka && r.rek_vzaruce === false && (
        <BlokKulance
          r={r}
          datumNakupu={objednavka.rek_datumnakupu}
          zarukaMesicu={data.produkty.find((p) => p.rek_produktid === objednavka._rek_produkt_value)?.rek_zaruka ?? 24}
          kodProduktu={data.produkty.find((p) => p.rek_produktid === objednavka._rek_produkt_value)?.rek_kod}
        />
      )}

      <section className="blok">
        <h2>Návrh AI</h2>
        {r.rek_navrhai !== undefined && r.rek_navrhai !== null ? (
          <>
            <p>
              <PillNavrh navrh={r.rek_navrhai} /> jistota {r.rek_jistota !== undefined ? JISTOTA[r.rek_jistota] : '–'}
            </p>
            {r.rek_navrhoduvodneni && <p className="predformat">{r.rek_navrhoduvodneni}</p>}
          </>
        ) : (
          <p className="tlumene">Požadavek zatím není posouzený.</p>
        )}
      </section>

      {r.rek_posudek && (
        <section className="blok">
          <h2>Posudek technika</h2>
          <p className="predformat">{r.rek_posudek}</p>
        </section>
      )}

      <Rozhodnuti
        r={r}
        mena={mena}
        cenaObjednavky={objednavka?.rek_cena}
        vyzadujeTechnika={typ?.rek_vyzadujetechnika === true}
      />
    </article>
  )
}
