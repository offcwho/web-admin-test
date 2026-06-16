'use client';
import React from 'react';

/* ---------- inline icons (no deps) ---------- */
type IP = { size?: number };
const S = (p: any) => ({ width: p.size ?? 18, height: p.size ?? 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const });
export const Icon = {
  search: (p: IP = {}) => (<svg {...S(p)}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>),
  home: (p: IP = {}) => (<svg {...S(p)}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></svg>),
  bell: (p: IP = {}) => (<svg {...S(p)}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9" /><path d="M10 21a2 2 0 0 0 4 0" /></svg>),
  box: (p: IP = {}) => (<svg {...S(p)}><path d="M3 7 12 3l9 4-9 4-9-4Z" /><path d="M3 7v10l9 4 9-4V7" /><path d="M12 11v10" /></svg>),
  grid: (p: IP = {}) => (<svg {...S(p)}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>),
  settings: (p: IP = {}) => (<svg {...S(p)}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 0 1-4 0v-.1A1.6 1.6 0 0 0 7 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 2.6 14H2a2 2 0 0 1 0-4h.1A1.6 1.6 0 0 0 4 7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 10 2.6V2a2 2 0 0 1 4 0v.1A1.6 1.6 0 0 0 17 4l.1-.1a2 2 0 1 1 2.8 2.8L19.8 7a1.6 1.6 0 0 0 1.1 2.7H21a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1.3Z" /></svg>),
  docs: (p: IP = {}) => (<svg {...S(p)}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></svg>),
  gift: (p: IP = {}) => (<svg {...S(p)}><rect x="3" y="8" width="18" height="5" rx="1" /><path d="M5 13v8h14v-8M12 8v13M12 8S10 3 7.5 4.5 12 8 12 8Zm0 0s2-5 4.5-3.5S12 8 12 8Z" /></svg>),
  inbox: (p: IP = {}) => (<svg {...S(p)}><path d="M4 13h4l2 3h4l2-3h4" /><path d="M4 13 6 5h12l2 8v6H4Z" /></svg>),
  help: (p: IP = {}) => (<svg {...S(p)}><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .9-1 1.7" /><path d="M12 17h.01" /></svg>),
  spark: (p: IP = {}) => (<svg {...S(p)}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" /></svg>),
  dots: (p: IP = {}) => (<svg {...S(p)}><circle cx="12" cy="5" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="12" cy="19" r="1.6" /></svg>),
  upload: (p: IP = {}) => (<svg {...S(p)}><path d="M12 16V4M7 9l5-5 5 5" /><path d="M5 16v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" /></svg>),
  trash: (p: IP = {}) => (<svg {...S(p)}><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" /></svg>),
  plus: (p: IP = {}) => (<svg {...S(p)}><path d="M12 5v14M5 12h14" /></svg>),
  x: (p: IP = {}) => (<svg {...S(p)}><path d="M6 6l12 12M18 6 6 18" /></svg>),
  chevron: (p: IP = {}) => (<svg {...S(p)}><path d="m6 9 6 6 6-6" /></svg>),
  pencil: (p: IP = {}) => (<svg {...S(p)}><path d="M4 20h4L18.5 9.5a2 2 0 0 0-2.8-2.8L5 17.2 4 20Z" /></svg>),
  chat: (p: IP = {}) => (<svg {...S(p)}><path d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-5.5A8 8 0 1 1 21 12Z" /></svg>),
  check: (p: IP = {}) => (<svg {...S(p)}><path d="m20 6-11 11-5-5" /></svg>),
  sun: (p: IP = {}) => (<svg {...S(p)}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" /></svg>),
  moon: (p: IP = {}) => (<svg {...S(p)}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></svg>),
  layers: (p: IP = {}) => (<svg {...S(p)}><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 13 9 5 9-5" /></svg>),
  chart: (p: IP = {}) => (<svg {...S(p)}><path d="M4 20V10M10 20V4M16 20v-6M22 20H2" /></svg>),
  users: (p: IP = {}) => (<svg {...S(p)}><circle cx="9" cy="8" r="3.2" /><path d="M3 20a6 6 0 0 1 12 0" /><path d="M16 5.2a3.2 3.2 0 0 1 0 6M21 20a6 6 0 0 0-4-5.7" /></svg>),
  wallet: (p: IP = {}) => (<svg {...S(p)}><rect x="3" y="6" width="18" height="13" rx="2.5" /><path d="M3 10h18M17 14h1" /></svg>),
  eye: (p: IP = {}) => (<svg {...S(p)}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>),
  truck: (p: IP = {}) => (<svg {...S(p)}><path d="M3 6h11v9H3zM14 9h4l3 3v3h-7z" /><circle cx="7" cy="18" r="1.6" /><circle cx="17.5" cy="18" r="1.6" /></svg>),
};

/* ---------- Button ---------- */
type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger'; size?: 'sm' | 'md' };
export function Button({ variant = 'primary', size = 'md', className = '', ...rest }: BtnProps) {
  return <button className={`btn btn-${variant} ${size === 'sm' ? 'btn-sm' : ''} ${className}`} {...rest} />;
}

/* ---------- Badge ---------- */
export function Badge({ color = 'gray', children }: { color?: 'green' | 'red' | 'amber' | 'gray'; children: React.ReactNode }) {
  return <span className={`badge ${color}`}><span className="dot" />{children}</span>;
}

/* ---------- Card ---------- */
export function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div className="card" style={style}>{children}</div>;
}
