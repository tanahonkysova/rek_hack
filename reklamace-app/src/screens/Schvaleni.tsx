import { useMemo } from 'react'
import { useData, jeOtevrena, zbyvaDni, mapa } from '../lib/data'
import { navigate } from '../lib/router'
import { MENA, RESENI, STAV, ZEME_KOD } from '../lib/schema'
import { castka } from '../lib/format'
import { PillNavrh, StitekLhuty, StitekStav, StitekZaruka } from '../components/Stitky'
import { IkonaSrdce } from '../components/Ikony'

/** U vedoucí (/schvaleni): pro Jitku. P4: nahoře ohrožené lhůty, pod nimi Ke schválení, kulance zvýrazněné. Jen čtení. */
export default function Schvaleni() {
  const { data, chyba } = useData()
  const produkty = useMemo(() => mapa(data?.produkty ?? [], (p) => p.rek_produktid), [data])
  const objednavky = useMemo(() => mapa(data?.objednavky ?? [], (o) => o.rek_objednavkaid), [data])

  const ohrozene = useMemo(
    () =>
      (data?.reklamace ?? [])
        .filter((r) => jeOtevrena(r) && (r.rek_stav === STAV.PoLhute || (zbyvaDni(r) ?? 99) <= 5))
        .sort((a, b) => (a.rek_stav === STAV.PoLhute ? -1000 : zbyvaDni(a) ?? 0) - (b.rek_stav === STAV.PoLhute ? -1000 : zbyvaDni(b) ?? 0)),
    [data],
  )
  const keSchvaleni = useMemo(
    () =>
      (data?.reklamace ?? [])
        .filter((r) => r.rek_stav === STAV.KeSchvaleni)
        // Kulance nahoru, pak podle lhůty.
        .sort((a, b) => Number(!!b.rek_kulance) - Number(!!a.rek_kulance) || (zbyvaDni(a) ?? 99) - (zbyvaDni(b) ?? 99)),
    [data],
  )

  const mena = (objId?: string) => {
    const o = objId ? objednavky.get(objId) : undefined
    return o?.rek_mena !== undefined ? MENA[o.rek_mena] : 'CZK'
  }

  return (
    <div className="schvaleni">
      {chyba && <p className="hlaska hlaska-chyba">Data se nepodařilo načíst: {chyba}</p>}
      {!data && !chyba && <p className="tlumene">Načítám…</p>}

      <section className="panel">
        <h1>Ohrožené lhůty {data ? <span className="tlumene">({ohrozene.length})</span> : null}</h1>
        <p className="tlumene">Otevřené požadavky po lhůtě nebo se zbývajícími 5 a méně dny.</p>
        {data && ohrozene.length === 0 && <p className="prazdny">Všechny požadavky jsou v termínu.</p>}
        {ohrozene.length > 0 && (
          <table className="tabulka">
            <thead>
              <tr>
                <th>Lhůta</th>
                <th>Číslo</th>
                <th>Zákazník</th>
                <th>Produkt</th>
                <th>Stav</th>
                <th>Návrh AI</th>
              </tr>
            </thead>
            <tbody>
              {ohrozene.map((r) => (
                <tr key={r.rek_reklamaceid} onClick={() => navigate(`/reklamace/${r.rek_reklamaceid}`)} className="klikaci">
                  <td><StitekLhuty zbyva={zbyvaDni(r)} stav={r.rek_stav} /></td>
                  <td className="cislo"><a href={`#/reklamace/${r.rek_reklamaceid}`}>{r.rek_cislo}</a></td>
                  <td>{r.rek_zakaznik} <span className="zeme">{r.rek_zeme !== undefined ? ZEME_KOD[r.rek_zeme] : ''}</span></td>
                  <td>{(r._rek_produkt_value && produkty.get(r._rek_produkt_value)?.rek_kod) ?? '–'}</td>
                  <td><StitekStav stav={r.rek_stav} /></td>
                  <td><PillNavrh navrh={r.rek_navrhai} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="panel">
        <h1>U vedoucí {data ? <span className="tlumene">({keSchvaleni.length})</span> : null}</h1>
        <p className="tlumene">Schvaluje se v Teams. Tady je přehled toho, co čeká.</p>
        {data && keSchvaleni.length === 0 && <p className="prazdny">U vedoucí nic nečeká.</p>}
        {keSchvaleni.length > 0 && (
          <table className="tabulka">
            <thead>
              <tr>
                <th>Číslo</th>
                <th>Zákazník</th>
                <th>Rozhodnutí</th>
                <th>Odůvodnění</th>
                <th className="vpravo">Náklady</th>
                <th>Návrh AI</th>
                <th>Lhůta</th>
              </tr>
            </thead>
            <tbody>
              {keSchvaleni.map((r) => (
                <tr
                  key={r.rek_reklamaceid}
                  onClick={() => navigate(`/reklamace/${r.rek_reklamaceid}`)}
                  className={'klikaci' + (r.rek_kulance ? ' radek-kulance' : '')}
                >
                  <td className="cislo">
                    <a href={`#/reklamace/${r.rek_reklamaceid}`}>{r.rek_cislo}</a>
                    {r.rek_kulance && (
                      <span className="stitek stitek-kulance" title={r.rek_kulanceduvod ?? 'Doporučena kulance'}>
                        <IkonaSrdce size={12} /> kulance
                      </span>
                    )}
                  </td>
                  <td>
                    {r.rek_zakaznik} <span className="zeme">{r.rek_zeme !== undefined ? ZEME_KOD[r.rek_zeme] : ''}</span>
                    <div><StitekZaruka vZaruce={r.rek_vzaruce} /></div>
                  </td>
                  <td><strong>{r.rek_rozhodnuti !== undefined && r.rek_rozhodnuti !== null ? RESENI[r.rek_rozhodnuti] : '–'}</strong></td>
                  <td className="bunka-text">{r.rek_oduvodneni || '–'}</td>
                  <td className="vpravo cislo">{r.rek_naklady !== undefined && r.rek_naklady !== null ? castka(r.rek_naklady, mena(r._rek_objednavka_value)) : '–'}</td>
                  <td><PillNavrh navrh={r.rek_navrhai} /></td>
                  <td><StitekLhuty zbyva={zbyvaDni(r)} stav={r.rek_stav} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
