// Ikony jako inline SVG (pravidlo 4), barva přes currentColor.
type P = { size?: number; title?: string }

const svg = (size: number, title: string | undefined, children: React.ReactNode) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden={title ? undefined : true}
    role={title ? 'img' : undefined}
  >
    {title && <title>{title}</title>}
    {children}
  </svg>
)

export const IkonaPlus = ({ size = 16, title }: P) => svg(size, title, <path d="M12 5v14M5 12h14" />)
export const IkonaFronta = ({ size = 16, title }: P) =>
  svg(size, title, <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />)
export const IkonaKlic = ({ size = 16, title }: P) =>
  svg(size, title, <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z" />)
export const IkonaSchvaleni = ({ size = 16, title }: P) =>
  svg(size, title, <><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></>)
export const IkonaSeznam = ({ size = 16, title }: P) =>
  svg(size, title, <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 10h18M9 4v16" /></>)
export const IkonaTelefon = ({ size = 16, title }: P) =>
  svg(size, title, <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />)
export const IkonaObchod = ({ size = 16, title }: P) =>
  svg(size, title, <><path d="M3 9l1.5-5h15L21 9" /><path d="M4 9v11h16V9" /><path d="M9 20v-6h6v6" /></>)
export const IkonaObalka = ({ size = 16, title }: P) =>
  svg(size, title, <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 6l-10 7L2 6" /></>)
export const IkonaHodiny = ({ size = 16, title }: P) =>
  svg(size, title, <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>)
export const IkonaVykricnik = ({ size = 16, title }: P) =>
  svg(size, title, <><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /><path d="M12 9v4M12 17h.01" /></>)
export const IkonaFotka = ({ size = 16, title }: P) =>
  svg(size, title, <><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="12" cy="12" r="3.5" /><path d="M8 5l1.5-2h5L16 5" /></>)
export const IkonaZavrit = ({ size = 16, title }: P) => svg(size, title, <path d="M18 6L6 18M6 6l12 12" />)
export const IkonaZpet = ({ size = 16, title }: P) => svg(size, title, <path d="M15 18l-6-6 6-6" />)
export const IkonaTuzka = ({ size = 16, title }: P) =>
  svg(size, title, <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />)
export const IkonaKalendar = ({ size = 16, title }: P) =>
  svg(size, title, <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>)
export const IkonaStit = ({ size = 16, title }: P) =>
  svg(size, title, <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />)
export const IkonaSrdce = ({ size = 16, title }: P) =>
  svg(size, title, <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21.2l8.8-8.8a5.5 5.5 0 0 0 0-7.8z" />)
