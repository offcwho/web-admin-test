'use client';
import {
  AdminKitProvider, AdminKitConfig, demoAuth, localStorageAdapter, /*, jwtAuth, backendStorageAdapter */
  jwtAuth
} from '@/adminkit';

const config: AdminKitConfig = {
  appName: 'AdminKit v1',
  brand: 'AdminKit v1',
  backendUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:9000/api',

  // карточка рабочего пространства в сайдбаре
  workspace: { name: 'Свет.ру', sub: 'Магазин освещения' },

  // навигация с разделами (можно и плоским массивом)
  navigation: [
    {
      items: [
        { href: '/', label: 'Дашборд', icon: 'home' },
      ]
    },
    {
      title: 'Каталог', items: [
        { href: '/products', label: 'Товары', icon: 'box' },
        { href: '/categories', label: 'Категории', icon: 'grid' },
      ]
    },
    {
      title: 'Финансы', items: [
        { href: '/orders', label: 'Заказы', icon: 'wallet', badge: 3 },
      ]
    },
  ],

  // цветовая схема и стартовая тема
  theme: { mode: 'light', accent: '#3b5bfd', accent2: '#6d5efc' },

  // какие элементы оболочки показывать
  layout: { search: true, user: true, themeToggle: true, notifications: true, workspace: true, promo: false },

  auth: jwtAuth(),
  storage: localStorageAdapter(),
  demo: false,
};

export function Providers({ children }: { children: React.ReactNode }) {
  return <AdminKitProvider config={config}>{children}</AdminKitProvider>;
}
