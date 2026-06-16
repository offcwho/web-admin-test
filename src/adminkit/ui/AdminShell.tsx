'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, Button } from './primitives';
import { useTheme } from '../theme';

export interface NavItem { label: string; href: string; icon?: keyof typeof Icon; badge?: string | number }
export interface NavGroup { title?: string; items: NavItem[] }
export interface LayoutShow {
  search?: boolean; user?: boolean; themeToggle?: boolean; notifications?: boolean; promo?: boolean; workspace?: boolean;
}
export interface Workspace { name: string; sub?: string }

const DEFAULT_NAV: NavGroup[] = [{ items: [
  { href: '/', label: 'Dashboard', icon: 'home' },
  { href: '/products', label: 'Products', icon: 'box' },
  { href: '/components', label: 'Components', icon: 'grid' },
] }];

export function AdminShell({
  title, actions, children,
  brand = 'AdminKit', nav = DEFAULT_NAV, user, onLogout,
  show = {}, workspace,
}: {
  title: string; actions?: React.ReactNode; children: React.ReactNode;
  brand?: string; nav?: NavGroup[]; user?: { name: string; role?: string };
  onLogout?: () => void; show?: LayoutShow; workspace?: Workspace;
}) {
  const path = usePathname();
  const { mode, toggle } = useTheme();
  const s: Required<LayoutShow> = { search: true, user: true, themeToggle: true, notifications: true, promo: false, workspace: true, ...show };
  const active = (href: string) => (href === '/' ? path === '/' : path.startsWith(href));

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand"><span className="logo"><Icon.spark size={18} /></span> {brand}</div>

        {s.workspace && workspace && (
          <div className="workspace">
            <div className="ws-ic"><Icon.box size={16} /></div>
            <div style={{ minWidth: 0 }}>
              <div className="ws-name">{workspace.name}</div>
              {workspace.sub && <div className="ws-sub">{workspace.sub}</div>}
            </div>
          </div>
        )}

        <nav className="nav">
          {nav.map((group, gi) => (
            <div className="nav-group" key={gi}>
              {group.title && <div className="s-label">{group.title}</div>}
              {group.items.map((n) => {
                const I = (n.icon && Icon[n.icon]) || Icon.grid;
                return (
                  <Link key={n.label} href={n.href} className={`nav-link ${active(n.href) ? 'active' : ''}`}>
                    <I size={19} /><span>{n.label}</span>
                    {n.badge != null && <span className="nav-badge">{n.badge}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="s-foot">
          {s.promo && (
            <div className="promo">
              <h4><Icon.spark size={15} /> Boost with AI</h4>
              <p>Reusable components for your admin.</p>
              <Button style={{ width: '100%', justifyContent: 'center' }}>Upgrade to Pro</Button>
            </div>
          )}
          {s.themeToggle && (
            <button className="theme-toggle" onClick={toggle} title="Сменить тему">
              {mode === 'light' ? <Icon.moon size={16} /> : <Icon.sun size={16} />}
              <span>{mode === 'light' ? 'Тёмная тема' : 'Светлая тема'}</span>
            </button>
          )}
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <h1 className="page-title">{title}</h1>

          {s.search && (
            <div className="topbar-search">
              <Icon.search size={16} /><input placeholder="Search for anything here…" />
            </div>
          )}

          <div className="topbar-right">
            {actions}
            {s.themeToggle && (
              <button className="icon-btn round" onClick={toggle} title="Сменить тему">
                {mode === 'light' ? <Icon.moon size={18} /> : <Icon.sun size={18} />}
              </button>
            )}
            {s.notifications && (
              <button className="icon-btn round" title="Уведомления" style={{ position: 'relative' }}>
                <Icon.bell size={18} /><span className="ping" />
              </button>
            )}
            {s.user && user && (
              <div className="topbar-user">
                <div className="av" />
                <div style={{ minWidth: 0 }}>
                  <div className="nm">{user.name}</div>
                  {user.role && <div className="rl">{user.role}</div>}
                </div>
                {onLogout && <button className="icon-btn" title="Выйти" onClick={onLogout}><Icon.x size={16} /></button>}
              </div>
            )}
          </div>
        </header>

        <div className="content page-enter">{children}</div>
      </div>
    </div>
  );
}
