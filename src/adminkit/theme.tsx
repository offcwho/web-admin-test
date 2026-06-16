'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark';

export interface ThemeConfig {
  mode?: ThemeMode;      // стартовая тема
  accent?: string;       // основной цвет (--primary)
  accent2?: string;      // конец градиента (--primary-2)
  radius?: number;       // базовый радиус, px
}

interface ThemeCtx { mode: ThemeMode; setMode: (m: ThemeMode) => void; toggle: () => void; }
const C = createContext<ThemeCtx | null>(null);
export function useTheme() { const v = useContext(C); if (!v) throw new Error('useTheme must be used inside <AdminKitProvider>'); return v; }

const KEY = 'adminkit_theme_mode';

export function ThemeProvider({ theme, children }: { theme?: ThemeConfig; children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(theme?.mode ?? 'light');
  useEffect(() => {
    try { const s = localStorage.getItem(KEY); if (s === 'light' || s === 'dark') setModeState(s); } catch {}
  }, []);
  const setMode = (m: ThemeMode) => { setModeState(m); try { localStorage.setItem(KEY, m); } catch {} };
  const toggle = () => setMode(mode === 'light' ? 'dark' : 'light');

  const style: React.CSSProperties = {
    minHeight: '100vh',
    ...(theme?.accent ? ({ ['--primary']: theme.accent } as any) : {}),
    ...(theme?.accent2 ? ({ ['--primary-2']: theme.accent2 } as any) : {}),
    ...(theme?.radius != null ? ({ ['--radius']: `${theme.radius}px` } as any) : {}),
  };

  return (
    <C.Provider value={{ mode, setMode, toggle }}>
      <div data-theme={mode} className="adminkit-root" style={style}>{children}</div>
    </C.Provider>
  );
}
