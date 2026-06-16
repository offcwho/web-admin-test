import {
  createResource, TextColumn, BadgeColumn,
  TextEntry, BadgeEntry, MoneyEntry, DateEntry,
} from '@/adminkit';

export interface OrderItem { name: string; qty: number; price: number }
export interface Order {
  id: string; number: string; customer: string; phone: string; address: string;
  total: number; status: 'new' | 'assembling' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string; items: OrderItem[];
}

const COLORS = { new: 'gray', assembling: 'amber', shipped: 'green', delivered: 'green', cancelled: 'red' } as const;
const LABELS = { new: 'Новый', assembling: 'Сборка', shipped: 'Отгружен', delivered: 'Доставлен', cancelled: 'Отменён' };

export const ordersResource = createResource<Order>({
  name: 'orders',
  label: 'Заказы',
  singular: 'заказ',
  endpoint: '/orders',
  statusField: 'status',
  // линейный воркфлоу: собрать -> отгрузить -> доставить
  statuses: [
    { value: 'new', label: 'Новый' },
    { value: 'assembling', label: 'Сборка' },
    { value: 'shipped', label: 'Отгружен' },
    { value: 'delivered', label: 'Доставлен' },
  ],
  columns: () => [
    TextColumn.make('number').label('Заказ').sortable().searchable().weight('bold'),
    TextColumn.make('customer').label('Покупатель').searchable(),
    TextColumn.make('total').label('Сумма').money('RUB').sortable(),
    BadgeColumn.make('status').label('Статус').colors(COLORS).labels(LABELS),
  ],
  // схема окна просмотра
  infolist: () => [
    TextEntry.make('number').label('Номер'),
    BadgeEntry.make('status').label('Статус').colors(COLORS).labels(LABELS),
    TextEntry.make('customer').label('Покупатель'),
    TextEntry.make('phone').label('Телефон'),
    TextEntry.make('address').label('Адрес доставки').full(),
    MoneyEntry.make('total').label('Сумма').currency('RUB'),
    DateEntry.make('createdAt').label('Создан'),
    TextEntry.make('items').label('Состав заказа').full()
      .formatStateUsing((items: OrderItem[]) =>
        (items ?? []).map((i) => `${i.name} ×${i.qty}`).join(', ') || '—'),
  ],
  demoData: [
    { id: '1', number: '#2632', customer: 'Брайан Зои', phone: '+7 900 111-22-33', address: 'Москва, ул. Ленина, 1', total: 14000, status: 'new', createdAt: '2024-07-14T10:00:00Z', items: [{ name: 'Люстра Divinare', qty: 1, price: 14000 }] },
    { id: '2', number: '#2633', customer: 'Алиса Крей', phone: '+7 900 222-33-44', address: 'СПб, Невский пр., 10', total: 26000, status: 'assembling', createdAt: '2024-08-01T12:30:00Z', items: [{ name: 'Кресло Olive', qty: 1, price: 26000 }] },
    { id: '3', number: '#2634', customer: 'Юрриан ван', phone: '+7 900 333-44-55', address: 'Казань, ул. Баумана, 5', total: 16000, status: 'shipped', createdAt: '2024-08-03T09:15:00Z', items: [{ name: 'Стул Carbon', qty: 2, price: 8000 }] },
    { id: '4', number: '#2635', customer: 'Я Чин-Хо', phone: '+7 900 444-55-66', address: 'Сочи, ул. Морская, 3', total: 15000, status: 'delivered', createdAt: '2024-08-05T16:45:00Z', items: [{ name: 'Торшер Ivory', qty: 1, price: 15000 }] },
  ],
});
