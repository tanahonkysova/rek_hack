import { useEffect, useState } from 'react'

// Jednoduchý hash router (aplikace běží v iframe Power Apps, hash je bezpečný).
function aktualniCesta(): string {
  const h = window.location.hash.replace(/^#/, '')
  return h || '/'
}

export function navigate(cesta: string) {
  if (aktualniCesta() !== cesta) window.location.hash = cesta
}

export function useRoute(): string {
  const [cesta, setCesta] = useState(aktualniCesta())
  useEffect(() => {
    const onHash = () => setCesta(aktualniCesta())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return cesta
}

/** Porovná cestu se vzorem typu /reklamace/:id/upravit a vrátí parametry. */
export function match(vzor: string, cesta: string): Record<string, string> | null {
  const a = vzor.split('/').filter(Boolean)
  const b = cesta.split('?')[0].split('/').filter(Boolean)
  if (a.length !== b.length) return null
  const params: Record<string, string> = {}
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith(':')) params[a[i].slice(1)] = decodeURIComponent(b[i])
    else if (a[i] !== b[i]) return null
  }
  return params
}
