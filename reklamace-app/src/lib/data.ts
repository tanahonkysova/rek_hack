import { useEffect, useState } from 'react'
import { Rek_reklamacesService } from '../generated/services/Rek_reklamacesService'
import { Rek_produktsService } from '../generated/services/Rek_produktsService'
import { Rek_objednavkasService } from '../generated/services/Rek_objednavkasService'
import { Rek_typvadiesService } from '../generated/services/Rek_typvadiesService'
import { STAV } from './schema'
import { dnes, parseDatum, rozdilDni } from './format'

// ---------- typy (jen sloupce, které aplikace čte) ----------
export interface Reklamace {
  rek_reklamaceid: string
  rek_cislo?: string
  rek_stav: number
  rek_kanal?: number
  rek_zeme?: number
  rek_jazyk?: number
  rek_zakaznik?: string
  rek_email?: string
  rek_uplatnenodne?: string
  rek_lhuta?: string
  rek_vzaruce?: boolean
  rek_navrhai?: number
  rek_jistota?: number
  rek_navrhoduvodneni?: string
  rek_popiscesky?: string
  rek_popiszakaznika?: string
  rek_popisfotky?: string
  rek_posudek?: string
  rek_rozhodnuti?: number
  rek_oduvodneni?: string
  rek_naklady?: number
  rek_shodasai?: boolean
  rek_chybejici?: string
  rek_datumvyrizeni?: string
  rek_komentar?: string
  rek_kulance?: boolean
  rek_kulanceduvod?: string
  rek_fotkaid?: string
  rek_fotka_url?: string
  modifiedon?: string
  createdon?: string
  _rek_produkt_value?: string
  _rek_objednavka_value?: string
  _rek_typvady_value?: string
  _rek_vyrizuje_value?: string
}

export interface Produkt {
  rek_produktid: string
  rek_kod?: string
  rek_nazev?: string
  rek_kategorie?: number
  rek_cena?: number
  rek_zaruka?: number
  rek_aktivni?: boolean
}

export interface Objednavka {
  rek_objednavkaid: string
  rek_cislo?: string
  rek_zakaznik?: string
  rek_email?: string
  rek_datumnakupu?: string
  rek_cena?: number
  rek_mena?: number
  rek_zeme?: number
  _rek_produkt_value?: string
}

export interface TypVady {
  rek_typvadyid: string
  rek_nazev?: string
  rek_kod?: string
  rek_uznatelna?: boolean
  rek_vychozireseni?: number | null
  rek_vyzadujetechnika?: boolean
  rek_popisproai?: string
}

export const SLOUPCE_REKLAMACE = [
  'rek_reklamaceid', 'rek_cislo', 'rek_stav', 'rek_kanal', 'rek_zeme', 'rek_jazyk', 'rek_zakaznik', 'rek_email',
  'rek_uplatnenodne', 'rek_lhuta', 'rek_vzaruce', 'rek_navrhai', 'rek_jistota', 'rek_navrhoduvodneni', 'rek_popiscesky',
  'rek_popiszakaznika', 'rek_popisfotky', 'rek_posudek', 'rek_rozhodnuti', 'rek_oduvodneni', 'rek_naklady',
  'rek_shodasai', 'rek_chybejici', 'rek_datumvyrizeni', 'rek_komentar', 'rek_kulance', 'rek_kulanceduvod', 'rek_fotkaid', 'rek_fotka_url',
  'modifiedon', 'createdon', '_rek_produkt_value', '_rek_objednavka_value', '_rek_typvady_value', '_rek_vyrizuje_value',
]

export interface Data {
  reklamace: Reklamace[]
  produkty: Produkt[]
  objednavky: Objednavka[]
  typyVad: TypVady[]
}

function chyba(e: unknown): Error {
  if (e instanceof Error) return e
  return new Error(typeof e === 'string' ? e : JSON.stringify(e))
}

async function nacti<T>(p: Promise<{ data?: unknown; error?: unknown }>): Promise<T[]> {
  const r = await p
  if (r.error) throw chyba(r.error)
  return (r.data as T[]) ?? []
}

// ---------- jednoduchá sdílená cache ----------
let cache: Data | null = null
let probiha: Promise<Data> | null = null
const posluchaci = new Set<() => void>()

async function nactiVse(): Promise<Data> {
  const [reklamace, produkty, objednavky, typyVad] = await Promise.all([
    nacti<Reklamace>(Rek_reklamacesService.getAll({ select: SLOUPCE_REKLAMACE, top: 5000 })),
    nacti<Produkt>(Rek_produktsService.getAll({
      select: ['rek_produktid', 'rek_kod', 'rek_nazev', 'rek_kategorie', 'rek_cena', 'rek_zaruka', 'rek_aktivni'],
      top: 5000,
    })),
    nacti<Objednavka>(Rek_objednavkasService.getAll({
      select: ['rek_objednavkaid', 'rek_cislo', 'rek_zakaznik', 'rek_email', 'rek_datumnakupu', 'rek_cena', 'rek_mena', 'rek_zeme', '_rek_produkt_value'],
      top: 5000,
    })),
    nacti<TypVady>(Rek_typvadiesService.getAll({
      select: ['rek_typvadyid', 'rek_nazev', 'rek_kod', 'rek_uznatelna', 'rek_vychozireseni', 'rek_vyzadujetechnika', 'rek_popisproai'],
      top: 5000,
    })),
  ])
  return { reklamace, produkty, objednavky, typyVad }
}

export function obnovData(): Promise<Data> {
  probiha = nactiVse().then((d) => {
    cache = d
    probiha = null
    posluchaci.forEach((f) => f())
    return d
  })
  probiha.catch(() => {
    probiha = null
  })
  return probiha
}

export function useData(): { data: Data | null; chyba: string | null; obnov: () => Promise<Data> } {
  const [, setVerze] = useState(0)
  const [err, setErr] = useState<string | null>(null)
  useEffect(() => {
    const f = () => setVerze((v) => v + 1)
    posluchaci.add(f)
    if (!cache && !probiha) obnovData().catch((e) => setErr(chyba(e).message))
    else if (probiha) probiha.catch((e) => setErr(chyba(e).message))
    return () => {
      posluchaci.delete(f)
    }
  }, [])
  return { data: cache, chyba: err, obnov: obnovData }
}

// ---------- odvozené hodnoty ----------
export const jeOtevrena = (r: Reklamace) => r.rek_stav !== STAV.Vyrizeno

/** Lhůta = Uplatněno dne + 30 (rek_lhuta je calculated; záloha výpočtem). */
export function lhuta(r: Reklamace): Date | null {
  const l = parseDatum(r.rek_lhuta)
  if (l) return l
  const u = parseDatum(r.rek_uplatnenodne)
  if (!u) return null
  const d = new Date(u)
  d.setDate(d.getDate() + 30)
  return d
}

/** Zbývá dní = Lhůta − dnes (rek_zbyvadni v Dataverse zůstává prázdné, viz poznámky schématu). */
export function zbyvaDni(r: Reklamace): number | null {
  const l = lhuta(r)
  return l ? rozdilDni(l, dnes()) : null
}

/** Dny v aktuálním stavu (P3) z modifiedon. */
export function dniVeStavu(r: Reklamace): number | null {
  if (!r.modifiedon) return null
  const m = new Date(r.modifiedon)
  return Math.max(0, rozdilDni(dnes(), new Date(m.getFullYear(), m.getMonth(), m.getDate())))
}

export function mapa<T>(seznam: T[], klic: (x: T) => string): Map<string, T> {
  return new Map(seznam.map((x) => [klic(x), x]))
}
