'use client';
import {
  AdminKitProvider, AdminKitConfig, demoAuth, localStorageAdapter, /*, jwtAuth, backendStorageAdapter */
  vercelBlobStorageAdapter,
  jwtAuth
} from '@/adminkit';
import { upload } from '@vercel/blob/client';

const config: AdminKitConfig = {
  appName: 'AdminKit',
  brand: 'AdminKit',
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
        {href: '/categories', label: 'Категории', icon: 'grid'},
      ]
    },
    {
      title: 'Финансы', items: [
        { href: '/orders', label: 'Заказы', icon: 'wallet', badge: 3 },
        { href: '/stats', label: 'Аналитика', icon: 'chart' },
      ]
    },
  ],

  // цветовая схема и стартовая тема
  theme: { mode: 'light', accent: '#3b5bfd', accent2: '#6d5efc' },

  // какие элементы оболочки показывать
  layout: { search: true, user: true, themeToggle: true, notifications: true, workspace: true, promo: false },

  auth: jwtAuth(),
  // куда грузить картинки (любой StorageAdapter):
  //  localStorageAdapter()                                  — в самой админке (demo)
  //  backendStorageAdapter({ endpoint: '/uploads' })        — multipart на твой бэк
  //  vercelBlobStorageAdapter({ upload, handleUploadUrl: '/upload' }) — Vercel Blob (import { upload } from '@vercel/blob/client')
  //  presignedStorageAdapter({ presignPath: '/uploads/presign' }) — S3 и пр. через presigned URL
  storage: vercelBlobStorageAdapter({ upload, handleUploadUrl: '/upload' }),
  demo: false,
};

export function Providers({ children }: { children: React.ReactNode }) {
  return <AdminKitProvider config={config}>{children}</AdminKitProvider>;
}
