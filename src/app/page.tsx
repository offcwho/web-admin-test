'use client';
import {
  RequireAuth, AdminLayout, Dashboard, DashboardWidget,
  StatCard, ProgressBreakdown, RecentActivity, Button, Icon,
} from '@/adminkit';

function Home() {
  const widgets: DashboardWidget[] = [
    { id: 'asset', span: 1, flush: true, node: <StatCard label="Стоимость склада" value="$9,212,323" delta={{ value: '8.1%', up: true }} icon="wallet" tone="primary" /> },
    { id: 'products', span: 1, flush: true, node: <StatCard label="Товаров" value="34" delta={{ value: '3', up: true }} icon="box" tone="green" /> },
    { id: 'orders', span: 1, flush: true, node: <StatCard label="Заказов сегодня" value="12" delta={{ value: '2', up: false }} icon="wallet" tone="amber" /> },
    { id: 'revenue', span: 1, flush: true, node: <StatCard label="Выручка за месяц" value="$48,210" delta={{ value: '12%', up: true }} icon="chart" tone="green" /> },

    {
      id: 'stock', span: 2, title: 'Остатки на складе',
      node: <ProgressBreakdown segments={[
        { label: 'В наличии', value: 16, color: 'var(--green)' },
        { label: 'Мало', value: 6, color: 'var(--amber)' },
        { label: 'Нет', value: 12, color: 'var(--red)' },
      ]} />,
    },
    {
      id: 'activity', span: 2, title: 'Последние действия',
      action: <Button variant="ghost" size="sm">Все</Button>,
      // demo-данные. В будущем: <RecentActivity load={(api) => api.get('/activity')} />
      node: <RecentActivity items={[
        { title: 'Добавлен товар «Люстра Divinare»', meta: 'админ', time: '5 мин', icon: 'plus' },
        { title: 'Заказ #2632 переведён в «Выполнен»', meta: 'админ', time: '1 ч', icon: 'check' },
        { title: 'Обновлены остатки в категории «Освещение»', meta: 'система', time: '3 ч', icon: 'box' },
        { title: 'Загружены изображения товара', meta: 'админ', time: 'вчера', icon: 'layers' },
      ]} />,
    },
  ];

  return (
    <AdminLayout title="Дашборд" actions={<Button><Icon.plus size={16} /> Создать</Button>}>
      <Dashboard widgets={widgets} />
    </AdminLayout>
  );
}

export default function Page() {
  return <RequireAuth role="admin"><Home /></RequireAuth>;
}
