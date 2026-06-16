'use client';
import React, { createContext, useContext, useMemo } from 'react';
import { createApi, Api } from './api';
import { AuthProvider, AuthBackend, TokenStore } from './auth';
import { StorageAdapter, localStorageAdapter } from './storage';
import { ThemeProvider, ThemeConfig } from './theme';
import type { NavItem, NavGroup, LayoutShow, Workspace } from '@/adminkit/ui/AdminShell';

/** Главный конфиг панели — backendUrl и вся центральная информация */
export interface AdminKitConfig {
  appName: string;
  backendUrl: string;                       // напр. http://localhost:9000/api
  brand?: string;
  navigation?: NavItem[] | NavGroup[];      // плоский список или с разделами
  workspace?: Workspace;                    // карточка рабочего пространства в сайдбаре
  auth: AuthBackend;                         // провайдер авторизации
  storage?: StorageAdapter;                  // куда грузить картинки
  theme?: ThemeConfig;                       // цвета и стартовая тема
  layout?: LayoutShow;                       // какие элементы оболочки показывать
  tokenKey?: string;
  demo?: boolean;
}

interface Ctx { config: AdminKitConfig; api: Api; storage: StorageAdapter }
const C = createContext<Ctx | null>(null);
export function useAdminKit() { const v = useContext(C); if (!v) throw new Error('Wrap your app in <AdminKitProvider>'); return v; }

function tokenStore(key: string): TokenStore {
  return {
    get: () => (typeof window === 'undefined' ? null : localStorage.getItem(key)),
    set: (t) => { if (typeof window !== 'undefined') localStorage.setItem(key, t); },
    clear: () => { if (typeof window !== 'undefined') localStorage.removeItem(key); },
  };
}

export function AdminKitProvider({ config, children }: { config: AdminKitConfig; children: React.ReactNode }) {
  const store = useMemo(() => tokenStore(config.tokenKey ?? 'adminkit_token'), [config.tokenKey]);
  const api = useMemo(() => createApi(() => config.backendUrl, () => store.get()), [config.backendUrl, store]);
  const storage = useMemo(() => config.storage ?? localStorageAdapter(), [config.storage]);
  return (
    <C.Provider value={{ config, api, storage }}>
      <ThemeProvider theme={config.theme}>
        <AuthProvider api={api} backend={config.auth} store={store}>{children}</AuthProvider>
      </ThemeProvider>
    </C.Provider>
  );
}

/** плоский список -> один безымянный раздел */
export function normalizeNav(nav?: NavItem[] | NavGroup[]): NavGroup[] {
  if (!nav || !nav.length) return [];
  return 'items' in (nav[0] as any) ? (nav as NavGroup[]) : [{ items: nav as NavItem[] }];
}
