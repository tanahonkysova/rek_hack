import { useEffect, useState } from 'react'
import { Rek_reklamacesService } from '../generated/services/Rek_reklamacesService'
import { IkonaFotka, IkonaZavrit } from './Ikony'
import { PROSTREDI } from '../lib/schema'

function typObrazku(b: Uint8Array): string {
  if (b[0] === 0x89 && b[1] === 0x50) return 'image/png'
  if (b[0] === 0x47 && b[1] === 0x49) return 'image/gif'
  if (b[0] === 0x52 && b[1] === 0x49) return 'image/webp'
  return 'image/jpeg'
}

/** Data z hostitele mohou přijít jako Uint8Array, ArrayBuffer, pole čísel, objekt s indexy nebo base64. */
function naUrl(data: unknown): string | null {
  if (!data) return null
  if (typeof data === 'string') {
    if (data.startsWith('data:')) return data
    const s = data.replace(/\s/g, '')
    if (!/^[A-Za-z0-9+/=]+$/.test(s)) return null
    const zacatek = atob(s.slice(0, 8))
    const typ = zacatek.charCodeAt(0) === 0x89 ? 'image/png' : 'image/jpeg'
    return `data:${typ};base64,${s}`
  }
  let bajty: Uint8Array
  if (data instanceof Uint8Array) bajty = new Uint8Array(data)
  else if (data instanceof ArrayBuffer) bajty = new Uint8Array(data)
  else if (Array.isArray(data)) bajty = Uint8Array.from(data as number[])
  else if (typeof data === 'object') {
    const o = data as Record<string, unknown>
    if (Array.isArray(o.data)) bajty = Uint8Array.from(o.data as number[])
    else bajty = Uint8Array.from(Object.keys(o).filter((k) => /^\d+$/.test(k)).sort((a, b) => Number(a) - Number(b)).map((k) => Number(o[k])))
  } else return null
  if (!bajty.length) return null
  // data: URL místo blob: (hostitel Power Apps může blob: v obrázcích blokovat).
  let bin = ''
  for (let i = 0; i < bajty.length; i += 0x8000) bin += String.fromCharCode(...bajty.subarray(i, i + 0x8000))
  return `data:${typObrazku(bajty)};base64,${btoa(bin)}`
}

/** Záloha: miniatura z rek_fotka (base64 v záznamu). 'zadna' = záznam fotku nemá. */
async function nahledZeZaznamu(id: string): Promise<string | 'zadna' | null> {
  try {
    const r = await Rek_reklamacesService.get(id, { select: ['rek_reklamaceid', 'rek_fotka'] })
    if (r.error) return null
    const b64 = (r.data as unknown as { rek_fotka?: string | null } | undefined)?.rek_fotka
    if (typeof b64 === 'string' && b64) return naUrl(b64)
    return 'zadna'
  } catch {
    return null
  }
}

/** Záložní postup ze zadání: odkaz na obrázek z Web API. */
const webApiUrl = (id: string) => `${PROSTREDI}/api/data/v9.2/rek_reklamaces(${id})/rek_fotka/$value?size=full`

/** Fotka vady z rek_fotka: náhled, po kliknutí plná velikost. */
export default function Fotka({ id, popis, velka }: { id: string; popis?: string; velka?: boolean }) {
  const [nahled, setNahled] = useState<string | null>(null)
  const [plna, setPlna] = useState<string | null>(null)
  const [otevrena, setOtevrena] = useState(false)
  // nacitam → ok | zadna (záznam fotku nemá) | chyba (fotku nejde stáhnout)
  const [stav, setStav] = useState<'nacitam' | 'ok' | 'zadna' | 'chyba'>('nacitam')
  const [zalohaZkusena, setZalohaZkusena] = useState(false)

  // Obrázek se nevykreslil (rozbitá data nebo blokovaná URL): zkusit miniaturu ze záznamu, pak hláška.
  const priChybeObrazku = async () => {
    if (zalohaZkusena) return setStav('chyba')
    setZalohaZkusena(true)
    const u = await nahledZeZaznamu(id)
    if (u === 'zadna') setStav('zadna')
    else if (u && u !== nahled) setNahled(u)
    else setStav('chyba')
  }

  useEffect(() => {
    setNahled(null)
    setPlna(null)
    setStav('nacitam')
    setZalohaZkusena(false)
    let zruseno = false
    let url: string | null = null
    const zaloha = async () => {
      const u = await nahledZeZaznamu(id)
      if (zruseno) return
      setZalohaZkusena(true)
      if (u === 'zadna') setStav('zadna')
      else if (u) {
        url = u
        setNahled(u)
        setStav('ok')
      } else setStav('chyba')
    }
    // Bez fotky vrací SDK prázdná data; pak rozhodne miniatura v záznamu. Tablet technika rovnou plná velikost.
    Rek_reklamacesService.downloadImage(id, 'rek_fotka', !!velka)
      .then((r) => {
        if (zruseno) return
        const u = r.error ? null : naUrl(r.data)
        if (!u) return void zaloha()
        url = u
        setNahled(u)
        setStav('ok')
      })
      .catch(() => void zaloha())
    return () => {
      zruseno = true
      if (url && url.startsWith('blob:')) URL.revokeObjectURL(url)
    }
  }, [id, velka])

  useEffect(() => () => {
    if (plna && plna.startsWith('blob:')) URL.revokeObjectURL(plna)
  }, [plna])

  const otevri = async () => {
    setOtevrena(true)
    if (plna || velka) return
    const r = await Rek_reklamacesService.downloadImage(id, 'rek_fotka', true).catch(() => null)
    const u = r && !r.error ? naUrl(r.data) : null
    if (u) setPlna(u)
  }

  if (stav === 'zadna') {
    return (
      <div className="fotka fotka-zadna">
        <IkonaFotka size={20} /> Bez fotky
        {popis && <p className="predformat tlumene">{popis}</p>}
      </div>
    )
  }

  return (
    <div className={'fotka' + (velka ? ' fotka-velka' : '')}>
      {stav === 'chyba' ? (
        <p className="fotka-zadna">
          <IkonaFotka size={20} /> Fotku se nepodařilo načíst.{' '}
          <a href={webApiUrl(id)} target="_blank" rel="noreferrer">Otevřít fotku z Dataverse</a>
        </p>
      ) : nahled ? (
        <button type="button" className="fotka-nahled" onClick={() => void otevri()} title="Zobrazit v plné velikosti">
          <img src={nahled} alt="Fotka vady" onError={() => void priChybeObrazku()} />
        </button>
      ) : (
        <div className="fotka-nacitani tlumene">Načítám fotku…</div>
      )}
      {popis && (
        <p className="fotka-popis">
          <strong>Popis fotky:</strong> {popis}
        </p>
      )}
      {otevrena && (
        <div className="lightbox" role="dialog" aria-label="Fotka v plné velikosti" onClick={() => setOtevrena(false)}>
          <button type="button" className="btn lightbox-zavrit" onClick={() => setOtevrena(false)} aria-label="Zavřít">
            <IkonaZavrit />
          </button>
          <img src={plna ?? nahled ?? ''} alt="Fotka vady v plné velikosti" onError={() => plna && setPlna(null)} />
        </div>
      )}
    </div>
  )
}
