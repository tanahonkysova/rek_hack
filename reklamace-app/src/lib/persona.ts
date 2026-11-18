import { createContext, useContext } from 'react'
import { PERSONY, type Persona, type PersonaId } from './schema'

const KLIC = 'reklamace.persona'

export function nactiPersonu(): Persona {
  let id: string | null = null
  try {
    id = window.localStorage.getItem(KLIC)
  } catch {
    id = null
  }
  return PERSONY.find((p) => p.id === id) ?? PERSONY[0]
}

export function ulozPersonu(id: PersonaId) {
  try {
    window.localStorage.setItem(KLIC, id)
  } catch {
    /* localStorage nedostupné – volba platí jen do obnovení */
  }
}

export const PersonaContext = createContext<Persona>(PERSONY[0])
export const usePersona = () => useContext(PersonaContext)
