'use client';
import { RequireAuth, AdminLayout, Card } from '@/adminkit';

export default function StatsPage() {
  return (
    <RequireAuth role="admin">
      <AdminLayout title="Аналитика" show={{ search: false }}>
        <Card style={{ padding: 28 }}>
          <p className="muted" style={{ margin: 0 }}>Пример страницы с отключённым поиском в топбаре
            (<code className="code-pill">show={'{{ search: false }}'}</code>). Сюда можно положить графики через виджеты дашборда.</p>
        </Card>
      </AdminLayout>
    </RequireAuth>
  );
}
