import { useEffect, useState } from 'react'
import Layout from './components/Layout'
import { PersonaContext, nactiPersonu, ulozPersonu } from './lib/persona'
import { match, navigate, useRoute } from './lib/router'
import { PERSONY, type PersonaId } from './lib/schema'
import Fronta from './screens/Fronta'
import Formular from './screens/Formular'
import Technik from './screens/Technik'
import Schvaleni from './screens/Schvaleni'
import TypyVad from './screens/TypyVad'

function Docasne({ nazev }: { nazev: string }) {
  return (
    <section className="panel">
      <h1>{nazev}</h1>
      <p className="tlumene">Obrazovka se staví v dalším kroku.</p>
    </section>
  )
}

export default function App() {
  const cesta = useRoute()
  const [persona, setPersona] = useState(nactiPersonu)

  // Po spuštění bez konkrétní cesty otevři domovskou obrazovku uložené persony.
  useEffect(() => {
    if (!window.location.hash || window.location.hash === '#/') navigate(persona.domov)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const zmenPersonu = (id: PersonaId) => {
    const p = PERSONY.find((x) => x.id === id) ?? PERSONY[0]
    ulozPersonu(p.id)
    setPersona(p)
    navigate(p.domov)
  }

  let obrazovka
  let m: Record<string, string> | null
  if (cesta === '/' || cesta.startsWith('/?')) obrazovka = <Fronta zvyraznene={new URLSearchParams(cesta.split('?')[1] ?? '').get('nova') ?? undefined} />
  else if (match('/reklamace/nova', cesta)) obrazovka = <Formular />
  else if ((m = match('/reklamace/:id/upravit', cesta))) obrazovka = <Formular key={m.id} id={m.id} />
  else if ((m = match('/reklamace/:id', cesta))) obrazovka = <Fronta vybraneId={m.id} />
  else if (match('/technik', cesta)) obrazovka = <Technik />
  else if (match('/schvaleni', cesta)) obrazovka = <Schvaleni />
  else if (match('/typy-vad', cesta)) obrazovka = <TypyVad />
  else obrazovka = <Docasne nazev="Stránka nenalezena" />

  return (
    <PersonaContext.Provider value={persona}>
      <Layout cesta={cesta} persona={persona} onPersona={zmenPersonu}>
        {obrazovka}
      </Layout>
    </PersonaContext.Provider>
  )
}
