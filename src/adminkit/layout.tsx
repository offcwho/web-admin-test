'use client';
import { AdminShell, LayoutShow } from '@/adminkit/ui/AdminShell';
import { useAdminKit, normalizeNav } from './config';
import { useAuth } from './auth';

/** Готовая оболочка. Навигация/тема/тумблеры берутся из конфига; show можно переопределить на странице. */
export function AdminLayout({ title, actions, show, children }:
  { title: string; actions?: React.ReactNode; show?: LayoutShow; children: React.ReactNode }) {
  const { config } = useAdminKit();
  const { user, logout } = useAuth();
  return (
    <AdminShell
      title={title}
      actions={actions}
      brand={config.brand ?? config.appName}
      nav={normalizeNav(config.navigation)}
      workspace={config.workspace}
      user={user ? { name: user.name || user.email, role: user.role } : undefined}
      onLogout={logout}
      show={{ ...config.layout, ...show }}
    >
      {children}
    </AdminShell>
  );
}
