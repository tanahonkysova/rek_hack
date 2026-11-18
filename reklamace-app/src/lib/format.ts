// Formáty podle pravidla 5: částky v měně objednávky, data d. M. yyyy.

export function castka(hodnota: number | undefined | null, mena: string = 'CZK'): string {
  if (hodnota === undefined || hodnota === null || isNaN(Number(hodnota))) return '–'
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: mena }).format(Number(hodnota))
}

/** Datum 'yyyy-MM-dd' nebo ISO → Date v místním čase (bez posunu časové zóny u Date only). */
export function parseDatum(s: string | undefined | null): Date | null {
  if (!s) return null
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s)
  if (m && s.length <= 10) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  const d = new Date(s)
  return isNaN(d.getTime()) ? null : d
}

export function datum(s: string | Date | undefined | null): string {
  const d = s instanceof Date ? s : parseDatum(s)
  if (!d) return '–'
  return `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}`
}

export function dnes(): Date {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

/** yyyy-MM-dd pro Date only sloupce a <input type="date">. */
export function isoDatum(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export function pridejDny(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

export function rozdilDni(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / 86400000)
}

/** Česká slova pro počet dní: 1 den, 2–4 dny, 5+ dní. */
export function dniSlovo(n: number): string {
  const a = Math.abs(n)
  if (a === 1) return 'den'
  if (a >= 2 && a <= 4) return 'dny'
  return 'dní'
}
