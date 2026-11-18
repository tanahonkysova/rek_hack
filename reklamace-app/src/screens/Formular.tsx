import { useEffect, useMemo, useState } from 'react'
import { Rek_reklamacesService } from '../generated/services/Rek_reklamacesService'
import { obnovData, useData, type Objednavka } from '../lib/data'
import { usePersona } from '../lib/persona'
import { navigate } from '../lib/router'
import {
  JAZYK_CESTINA, JAZYK_SLOVENSTINA, KANAL, KANAL_TELEFON, STAV, ZEME, ZEME_CESKO, ZEME_SLOVENSKO,
} from '../lib/schema'
import { datum, dnes, isoDatum, parseDatum, pridejDny, rozdilDni } from '../lib/format'
import { StitekLhuty, StitekZaruka } from '../components/Stitky'
import { IkonaFotka, IkonaZavrit, IkonaZpet } from '../components/Ikony'

const CHYBEJICI_TEXT = 'číslo objednávky nebo doklad o koupi'
// Ruční založení: Telefon (výchozí), Prodejna, E-mail.
const KANALY_RUCNE = [100000002, 100000003, 100000000]
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

type Pole = 'kanal' | 'uplatneno' | 'produkt' | 'typ' | 'zakaznik' | 'email' | 'popis'
const NAZEV_POLE: Record<Pole, string> = {
  kanal: 'Kanál',
  uplatneno: 'Uplatněno dne',
  produkt: 'Produkt',
  typ: 'Typ vady',
  zakaznik: 'Zákazník',
  email: 'E-mail zákazníka',
  popis: 'Popis česky',
}

function chybaText(e: unknown): string {
  if (!e) return 'neznámá chyba'
  if (e instanceof Error) return e.message
  if (typeof e === 'string') return e
  return JSON.stringify(e)
}

/** Nový servisní požadavek (/reklamace/nova) a Upravit (/reklamace/:id/upravit). */
export default function Formular({ id }: { id?: string }) {
  const { data } = useData()
  const persona = usePersona()
  const upravit = !!id
  const puvodni = id ? data?.reklamace.find((r) => r.rek_reklamaceid === id) : undefined

  const [kanal, setKanal] = useState<number>(KANAL_TELEFON)
  const [uplatneno, setUplatneno] = useState<string>(isoDatum(dnes()))
  const [objednavkaId, setObjednavkaId] = useState<string>('')
  const [hledani, setHledani] = useState('')
  const [produktId, setProduktId] = useState('')
  const [typId, setTypId] = useState('')
  const [zakaznik, setZakaznik] = useState('')
  const [email, setEmail] = useState('')
  const [zeme, setZeme] = useState<number>(ZEME_CESKO)
  const [popis, setPopis] = useState('')
  const [fotka, setFotka] = useState<File | null>(null)
  const [doklad, setDoklad] = useState(false)
  const [chyby, setChyby] = useState<Pole[]>([])
  const [jineChyby, setJineChyby] = useState<string[]>([])
  const [ukladam, setUkladam] = useState(false)
  const [nacteno, setNacteno] = useState(!upravit)

  // Předvyplnění při úpravě.
  useEffect(() => {
    if (!upravit || !puvodni || nacteno) return
    setKanal(puvodni.rek_kanal ?? KANAL_TELEFON)
    setUplatneno(puvodni.rek_uplatnenodne?.slice(0, 10) ?? isoDatum(dnes()))
    setObjednavkaId(puvodni._rek_objednavka_value ?? '')
    setProduktId(puvodni._rek_produkt_value ?? '')
    setTypId(puvodni._rek_typvady_value ?? '')
    setZakaznik(puvodni.rek_zakaznik ?? '')
    setEmail(puvodni.rek_email ?? '')
    setZeme(puvodni.rek_zeme ?? ZEME_CESKO)
    setPopis(puvodni.rek_popiscesky ?? '')
    setDoklad(!puvodni._rek_objednavka_value && puvodni.rek_vzaruce === true)
    setNacteno(true)
  }, [upravit, puvodni, nacteno])

  const objednavky = useMemo(() => data?.objednavky ?? [], [data])
  const objednavka = objednavky.find((o) => o.rek_objednavkaid === objednavkaId)
  const produkty = useMemo(
    () => (data?.produkty ?? []).filter((p) => p.rek_aktivni !== false || p.rek_produktid === produktId)
      .sort((a, b) => (a.rek_nazev ?? '').localeCompare(b.rek_nazev ?? '', 'cs')),
    [data, produktId],
  )
  const typyVad = useMemo(
    () => [...(data?.typyVad ?? [])].sort((a, b) => (a.rek_nazev ?? '').localeCompare(b.rek_nazev ?? '', 'cs')),
    [data],
  )
  const produkt = data?.produkty.find((p) => p.rek_produktid === produktId)

  const nalezene = useMemo(() => {
    const q = hledani.trim().toLowerCase()
    if (q.length < 2) return [] as Objednavka[]
    return objednavky
      .filter((o) =>
        [o.rek_cislo, o.rek_zakaznik, o.rek_email].some((v) => (v ?? '').toLowerCase().includes(q)),
      )
      .slice(0, 8)
  }, [hledani, objednavky])

  const vyberObjednavku = (o: Objednavka) => {
    setObjednavkaId(o.rek_objednavkaid)
    setHledani('')
    if (o._rek_produkt_value) setProduktId(o._rek_produkt_value)
    if (o.rek_zeme !== undefined) setZeme(o.rek_zeme)
    if (!zakaznik.trim() && o.rek_zakaznik) setZakaznik(o.rek_zakaznik)
    if (!email.trim() && o.rek_email) setEmail(o.rek_email)
  }

  // V záruce: Datum nákupu + Záruka produktu ≥ Uplatněno dne (jako F1).
  const uplatnenoDatum = parseDatum(uplatneno)
  const vZaruce: boolean | null = useMemo(() => {
    if (objednavka) {
      const nakup = parseDatum(objednavka.rek_datumnakupu)
      const pr = data?.produkty.find((p) => p.rek_produktid === objednavka._rek_produkt_value)
      if (!nakup || !uplatnenoDatum) return null
      const konec = new Date(nakup)
      konec.setMonth(konec.getMonth() + (pr?.rek_zaruka ?? 24))
      return konec >= uplatnenoDatum
    }
    return doklad ? true : null
  }, [objednavka, doklad, uplatnenoDatum, data])

  const lhutaDatum = uplatnenoDatum ? pridejDny(uplatnenoDatum, 30) : null
  const zbyva = lhutaDatum ? rozdilDni(lhutaDatum, dnes()) : null
  const maPodklady = !!objednavka || doklad
  const jazyk = zeme === ZEME_SLOVENSKO ? JAZYK_SLOVENSTINA : JAZYK_CESTINA

  const chybi = (p: Pole) => chyby.includes(p)

  const uloz = async () => {
    const c: Pole[] = []
    if (!kanal) c.push('kanal')
    if (!uplatneno) c.push('uplatneno')
    if (!produktId) c.push('produkt')
    if (!typId) c.push('typ')
    if (!zakaznik.trim()) c.push('zakaznik')
    if (!email.trim() || !EMAIL_RE.test(email.trim())) c.push('email')
    if (!popis.trim()) c.push('popis')
    const jine: string[] = []
    if (!upravit && uplatnenoDatum && uplatnenoDatum > dnes()) {
      c.push('uplatneno')
      jine.push('Uplatněno dne nesmí být v budoucnu.')
    }
    if (email.trim() && !EMAIL_RE.test(email.trim())) jine.push('E-mail zákazníka není ve tvaru adresy.')
    setChyby(c)
    setJineChyby(jine)
    if (c.length) return

    setUkladam(true)
    try {
      const zaznam: Record<string, unknown> = {
        rek_kanal: kanal,
        rek_zakaznik: zakaznik.trim(),
        rek_email: email.trim(),
        rek_zeme: zeme,
        rek_jazyk: jazyk,
        rek_popiscesky: popis.trim(),
        'rek_produkt@odata.bind': `/rek_produkts(${produktId})`,
        'rek_typvady@odata.bind': `/rek_typvadies(${typId})`,
        rek_zbyvadni: zbyva,
      }
      if (objednavkaId) zaznam['rek_objednavka@odata.bind'] = `/rek_objednavkas(${objednavkaId})`
      if (vZaruce !== null) zaznam.rek_vzaruce = vZaruce

      let cilId = id
      if (!upravit) {
        zaznam.rek_uplatnenodne = uplatneno
        zaznam['rek_vyrizuje@odata.bind'] = `/systemusers(${persona.systemuserid})`
        if (maPodklady) {
          zaznam.rek_stav = STAV.Nova
        } else {
          zaznam.rek_stav = STAV.CekaNaDoplneni
          zaznam.rek_chybejici = CHYBEJICI_TEXT
        }
        const r = await Rek_reklamacesService.create(zaznam as never)
        if (r.error) throw r.error
        cilId = (r.data as { rek_reklamaceid?: string } | undefined)?.rek_reklamaceid
      } else {
        // Doplněné podklady u Čeká na doplnění → vyprázdnit Chybějící údaje a nastavit Nová.
        if (puvodni?.rek_stav === STAV.CekaNaDoplneni && maPodklady) {
          zaznam.rek_stav = STAV.Nova
          zaznam.rek_chybejici = null
        }
        const r = await Rek_reklamacesService.update(id!, zaznam as never)
        if (r.error) throw r.error
      }

      if (fotka && cilId) {
        const f = await Rek_reklamacesService.upload(cilId, 'rek_fotka', fotka)
        if (f.error) jine.push('Fotku se nepodařilo nahrát: ' + chybaText(f.error))
      }
      await obnovData()
      if (!upravit) navigate(cilId ? `/?nova=${cilId}` : '/')
      else navigate(`/reklamace/${id}`)
    } catch (e) {
      setJineChyby([...jine, 'Uložení se nepodařilo: ' + chybaText(e)])
    } finally {
      setUkladam(false)
    }
  }

  if (upravit && !data) return <p className="tlumene">Načítám…</p>
  if (upravit && !puvodni) return <p className="prazdny">Servisní požadavek nenalezen.</p>
  if (upravit && puvodni?.rek_stav === STAV.Vyrizeno) return <p className="prazdny">Hotový požadavek už nejde upravit.</p>

  return (
    <div className="formular-stranka">
      <form
        className="panel formular"
        onSubmit={(e) => {
          e.preventDefault()
          void uloz()
        }}
        noValidate
      >
        <header className="detail-hlavicka">
          <button type="button" className="btn" onClick={() => navigate(upravit ? `/reklamace/${id}` : '/')} aria-label="Zpět">
            <IkonaZpet />
          </button>
          <h1>{upravit ? `Upravit požadavek ${puvodni?.rek_cislo ?? ''}` : 'Nový servisní požadavek'}</h1>
        </header>

        <div className="pole-mrizka">
          <fieldset className={'pole' + (chybi('kanal') ? ' pole-chyba' : '')}>
            <legend>Kanál *</legend>
            <div className="prepinace">
              {KANALY_RUCNE.map((k) => (
                <label key={k} className={'prepinac' + (kanal === k ? ' prepinac-aktivni' : '')}>
                  <input type="radio" name="kanal" checked={kanal === k} onChange={() => setKanal(k)} />
                  {KANAL[k]}
                </label>
              ))}
              {upravit && !KANALY_RUCNE.includes(kanal) && (
                <label className="prepinac prepinac-aktivni">
                  <input type="radio" name="kanal" checked readOnly />
                  {KANAL[kanal]}
                </label>
              )}
            </div>
          </fieldset>

          <label className={'pole' + (chybi('uplatneno') ? ' pole-chyba' : '')}>
            <span>Uplatněno dne *</span>
            <input
              type="date"
              value={uplatneno}
              max={isoDatum(dnes())}
              readOnly={upravit}
              disabled={upravit}
              onChange={(e) => setUplatneno(e.target.value)}
            />
            {upravit && <small className="tlumene">Od tohoto dne běží zákonná lhůta, nejde změnit.</small>}
          </label>

          <div className="pole pole-siroke objednavka-vyber">
            <span>Objednávka</span>
            {objednavka ? (
              <div className="vybrana-objednavka">
                <strong>{objednavka.rek_cislo}</strong>
                <span>{objednavka.rek_zakaznik} · {objednavka.rek_email} · nákup {datum(objednavka.rek_datumnakupu)}</span>
                {!(upravit && puvodni?._rek_objednavka_value) && (
                  <button type="button" className="btn" onClick={() => setObjednavkaId('')} aria-label="Odebrat objednávku">
                    <IkonaZavrit size={14} />
                  </button>
                )}
              </div>
            ) : (
              <>
                <input
                  type="search"
                  placeholder="Hledej číslo objednávky, zákazníka nebo e-mail"
                  value={hledani}
                  onChange={(e) => setHledani(e.target.value)}
                  autoFocus={!upravit}
                />
                {nalezene.length > 0 && (
                  <ul className="naseptavac" role="listbox">
                    {nalezene.map((o) => (
                      <li key={o.rek_objednavkaid}>
                        <button type="button" onClick={() => vyberObjednavku(o)}>
                          <strong>{o.rek_cislo}</strong> {o.rek_zakaznik}
                          <span className="tlumene"> · {o.rek_email} · {datum(o.rek_datumnakupu)}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {hledani.trim().length >= 2 && nalezene.length === 0 && (
                  <small className="tlumene">Objednávka nenalezena. Požadavek jde založit i bez ní.</small>
                )}
              </>
            )}
          </div>

          <label className={'pole' + (chybi('produkt') ? ' pole-chyba' : '')}>
            <span>Produkt *</span>
            <select value={produktId} onChange={(e) => setProduktId(e.target.value)} disabled={!!objednavka}>
              <option value="">Vyber produkt</option>
              {produkty.map((p) => (
                <option key={p.rek_produktid} value={p.rek_produktid}>{p.rek_nazev ?? p.rek_kod}</option>
              ))}
            </select>
            {objednavka && <small className="tlumene">Z objednávky.</small>}
          </label>

          <label className={'pole' + (chybi('typ') ? ' pole-chyba' : '')}>
            <span>Typ vady *</span>
            <select value={typId} onChange={(e) => setTypId(e.target.value)}>
              <option value="">Vyber typ vady</option>
              {typyVad.map((t) => (
                <option key={t.rek_typvadyid} value={t.rek_typvadyid}>{t.rek_nazev}</option>
              ))}
            </select>
          </label>

          <label className={'pole' + (chybi('zakaznik') ? ' pole-chyba' : '')}>
            <span>Zákazník *</span>
            <input value={zakaznik} onChange={(e) => setZakaznik(e.target.value)} autoComplete="off" />
          </label>

          <label className={'pole' + (chybi('email') ? ' pole-chyba' : '')}>
            <span>E-mail zákazníka *</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" />
          </label>

          <label className="pole">
            <span>Země</span>
            <select value={zeme} onChange={(e) => setZeme(Number(e.target.value))} disabled={!!objednavka}>
              {Object.entries(ZEME).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <small className="tlumene">Jazyk: {jazyk === JAZYK_SLOVENSTINA ? 'Slovenština' : 'Čeština'}</small>
          </label>

          <label className={'pole pole-siroke' + (chybi('popis') ? ' pole-chyba' : '')}>
            <span>Popis česky *</span>
            <textarea rows={4} value={popis} onChange={(e) => setPopis(e.target.value)} />
          </label>

          <label className="pole">
            <span>Fotka vady</span>
            <span className="soubor">
              <IkonaFotka />
              <input type="file" accept="image/*" onChange={(e) => setFotka(e.target.files?.[0] ?? null)} />
            </span>
            {upravit && puvodni?.rek_fotkaid && !fotka && <small className="tlumene">Fotka už je nahraná, nová ji nahradí.</small>}
          </label>

          <div className="pole">
            <span>V záruce</span>
            {objednavka ? (
              <span>
                <StitekZaruka vZaruce={vZaruce} /> <small className="tlumene">podle data nákupu a záruky {produkt?.rek_zaruka ?? 24} měsíců</small>
              </span>
            ) : (
              <label className="zaskrtavatko">
                <input type="checkbox" checked={doklad} onChange={(e) => setDoklad(e.target.checked)} />
                Doklad o koupi ověřen, výrobek je v záruce
              </label>
            )}
          </div>
        </div>

        <div className="nahled" aria-live="polite">
          <span>Lhůta <strong>{datum(lhutaDatum)}</strong></span>
          <StitekLhuty zbyva={zbyva} stav={STAV.Nova} />
          {maPodklady ? (
            <StitekZaruka vZaruce={vZaruce} />
          ) : (
            <span className="stitek stitek-obrys">Bez objednávky: Čeká na podklady</span>
          )}
        </div>

        <div className="formular-akce">
          <button type="submit" className="btn btn-primarni" disabled={ukladam}>
            {ukladam ? 'Ukládám…' : upravit ? 'Uložit úpravu' : 'Uložit požadavek'}
          </button>
          <button type="button" className="btn" onClick={() => navigate(upravit ? `/reklamace/${id}` : '/')}>
            Zrušit
          </button>
        </div>
        {chyby.length > 0 && (
          <p className="hlaska hlaska-chyba" role="alert">
            Vyplňte povinná pole: {[...new Set(chyby)].map((p) => NAZEV_POLE[p]).join(', ')}
          </p>
        )}
        {jineChyby.map((t) => (
          <p key={t} className="hlaska hlaska-chyba" role="alert">{t}</p>
        ))}
      </form>
    </div>
  )
}
