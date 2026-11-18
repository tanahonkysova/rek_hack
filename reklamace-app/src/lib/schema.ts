// Logické názvy a hodnoty choice z reklamace-schema.json (beze změny).
// Popisky pro uživatele podle slovníku v navrh-reseni.md.

export const STAV = {
  Nova: 100000000,
  CekaNaDoplneni: 100000001,
  PosuzujeSe: 100000002,
  UTechnika: 100000003,
  KeSchvaleni: 100000004,
  Rozhodnuto: 100000005,
  Vyrizeno: 100000006,
  PoLhute: 100000007,
} as const

/** Popisky stavů podle slovníku (v Dataverse zůstávají původní). */
export const STAV_POPISEK: Record<number, string> = {
  100000000: 'Nový',
  100000001: 'Čeká na podklady',
  100000002: 'Posuzujeme',
  100000003: 'V servisu',
  100000004: 'U vedoucí',
  100000005: 'Rozhodnuto',
  100000006: 'Hotovo',
  100000007: 'Po lhůtě',
}

export const KANAL: Record<number, string> = {
  100000000: 'E-mail',
  100000001: 'Formulář e-shopu',
  100000002: 'Telefon',
  100000003: 'Prodejna',
}
export const KANAL_TELEFON = 100000002

export const ZEME: Record<number, string> = { 100000000: 'Česko', 100000001: 'Slovensko' }
export const ZEME_KOD: Record<number, string> = { 100000000: 'CZ', 100000001: 'SK' }
export const ZEME_CESKO = 100000000
export const ZEME_SLOVENSKO = 100000001

export const JAZYK: Record<number, string> = { 100000000: 'Čeština', 100000001: 'Slovenština' }
export const JAZYK_CESTINA = 100000000
export const JAZYK_SLOVENSTINA = 100000001

export const MENA: Record<number, string> = { 100000000: 'CZK', 100000001: 'EUR' }

/** Řešení / Rozhodnutí / Výchozí řešení */
export const RESENI: Record<number, string> = {
  100000000: 'Oprava',
  100000001: 'Výměna',
  100000002: 'Vrácení peněz',
  100000003: 'Sleva',
  100000004: 'Zamítnuto',
}
export const RESENI_VRACENI = 100000002
export const RESENI_ZAMITNUTO = 100000004

export const NAVRH_AI: Record<number, string> = { ...RESENI, 100000005: 'K technikovi' }
export const NAVRH_K_TECHNIKOVI = 100000005

export const JISTOTA: Record<number, string> = { 100000000: 'Vysoká', 100000001: 'Střední', 100000002: 'Nízká' }

export const KATEGORIE: Record<number, string> = {
  100000000: 'Kávovary a kuchyně',
  100000001: 'Vysavače',
  100000002: 'Praní a mytí',
  100000003: 'Příslušenství a díly',
}

export type PersonaId = 'Klara' | 'Pavel' | 'Jitka' | 'Radek'

export interface Persona {
  id: PersonaId
  jmeno: string
  role: string
  systemuserid: string
  domov: string
}

// Mapování na systemuserid z reklamace-schema.json → persony (všechny = LabAdmin12).
export const PERSONY: Persona[] = [
  { id: 'Klara', jmeno: 'Klára', role: 'specialistka reklamací', systemuserid: '7efba0aa-f2d4-f111-a05b-6045bd0965dc', domov: '/' },
  { id: 'Pavel', jmeno: 'Pavel', role: 'servisní technik', systemuserid: '7efba0aa-f2d4-f111-a05b-6045bd0965dc', domov: '/technik' },
  { id: 'Jitka', jmeno: 'Jitka', role: 'vedoucí zákaznického centra', systemuserid: '7efba0aa-f2d4-f111-a05b-6045bd0965dc', domov: '/schvaleni' },
  { id: 'Radek', jmeno: 'Radek', role: 'kvalita', systemuserid: '7efba0aa-f2d4-f111-a05b-6045bd0965dc', domov: '/' },
]

export const NAZEV_APLIKACE = 'Pohoda Servis'

/** URL prostředí z reklamace-schema.json → prostredi. */
export const PROSTREDI = 'https://org37b4cbab.crm.dynamics.com'
