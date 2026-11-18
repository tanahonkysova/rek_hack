import { RESENI_VRACENI, RESENI_ZAMITNUTO, STAV } from './schema'

// Limity pro schválení vedoucí: Vrácení peněz nad 5 000 Kč nebo 200 €.
export const LIMIT_VRACENI: Record<string, number> = { CZK: 5000, EUR: 200 }

/** Kam rozhodnutí půjde: Ke schválení (Zamítnuto, vyšší vrácení peněz, uznání mimo záruku), jinak Rozhodnuto. */
export function cilovyStav(rozhodnuti: number, naklady: number | null, mena: string, vZaruce?: boolean | null): number {
  if (rozhodnuti === RESENI_ZAMITNUTO) return STAV.KeSchvaleni
  if (rozhodnuti === RESENI_VRACENI && naklady !== null && naklady > (LIMIT_VRACENI[mena] ?? 5000)) return STAV.KeSchvaleni
  if (vZaruce === false) return STAV.KeSchvaleni
  return STAV.Rozhodnuto
}

