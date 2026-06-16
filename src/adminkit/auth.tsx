'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Api } from './api';

export interface AuthUser { id: string; email: string; name?: string | null; role?: string; [k: string]: any }

/** Стратегия авторизации ("провайдер авторизации"). Можно подменить на свою. */
export interface AuthBackend {
  login(api: Api, creds: { email: string; password: string }): Promise<{ token: string; user: AuthUser }>;
  me(api: Api): Promise<AuthUser>;
}

/** JWT-провайдер по умолчанию (под твой NestJS: /auth/login -> {accessToken,user}, /auth/me) */
export function jwtAuth(opts: { loginPath?: string; mePath?: string; tokenField?: string } = {}): AuthBackend {
  const { loginPath = '/auth/login', mePath = '/auth/me', tokenField = 'accessToken' } = opts;
  return {
    async login(api, creds) {
      const d: any = await api.post(loginPath, creds);
      return { token: d[tokenField] ?? d.token, user: d.user ?? d };
    },
    async me(api) { return api.get(mePath); },
  };
}

/** Заглушка-провайдер для демо без бэка */
export function demoAuth(user: AuthUser = { id: '1', email: 'admin@demo.dev', name: 'Demo Admin', role: 'admin' }): AuthBackend {
  return {
    async login() { return { token: 'demo-token', user }; },
    async me() { return user; },
  };
}

export interface TokenStore { get(): string | null; set(t: string): void; clear(): void; }

interface AuthCtx { user: AuthUser | null; loading: boolean; login: (email: string, password: string) => Promise<AuthUser>; logout: () => void; }
const Ctx = createContext<AuthCtx | null>(null);
export function useAuth() { const v = useContext(Ctx); if (!v) throw new Error('useAuth must be used inside <AdminKitProvider>'); return v; }

export function AuthProvider({ api, backend, store, children }:
  { api: Api; backend: AuthBackend; store: TokenStore; children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!store.get()) { setLoading(false); return; }
    backend.me(api)
      .then(setUser)
      .catch((e) => { if (e?.status === 401) store.clear(); setUser(null); })
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  const login = async (email: string, password: string) => {
    const { token, user } = await backend.login(api, { email, password });
    store.set(token);
    setUser(user);
    return user;
  };
  const logout = () => { store.clear(); setUser(null); };

  return <Ctx.Provider value={{ user, loading, login, logout }}>{children}</Ctx.Provider>;
}

/** Гард: пускает только авторизованных (опц. с нужной ролью), иначе редирект на login */
export function RequireAuth({ role, loginPath = '/login', children }:
  { role?: string; loginPath?: string; children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (loading) return;
    if (!user || (role && user.role !== role)) router.replace(loginPath);
  }, [loading, user, role, router, loginPath]);
  if (loading) return <div className="center"><p className="muted">Загрузка…</p></div>;
  if (!user || (role && user.role !== role)) return null;
  return <>{children}</>;
}

/** Готовый экран входа — просто положи в app/login/page.tsx */
export function LoginScreen({ role, redirectTo = '/', title = 'Вход', subtitle = 'Панель администратора', defaultEmail = '', defaultPassword = '' }:
  { role?: string; redirectTo?: string; title?: string; subtitle?: string; defaultEmail?: string; defaultPassword?: string }) {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState(defaultPassword);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setBusy(true);
    try {
      const u = await login(email, password);
      if (role && u.role !== role) throw new Error('Недостаточно прав');
      router.replace(redirectTo);
    } catch (err: any) { setError(err?.message || 'Ошибка входа'); }
    finally { setBusy(false); }
  };

  return (
    <div className="center">
      <form className="login-card" onSubmit={submit}>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <div className="field"><label>Email</label>
          <input className="control" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="field"><label>Пароль</label>
          <input className="control" type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={busy}>
          {busy ? 'Вход…' : 'Войти'}
        </button>
        {error && <div className="err" style={{ marginTop: 10 }}>{error}</div>}
      </form>
    </div>
  );
}
