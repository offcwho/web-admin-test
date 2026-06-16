# AdminKit — переиспользуемая админка для Next.js (в стиле FilamentPHP)

Декларативный набор: задаёшь **схемы** форм/таблиц и **ресурсы** — вёрстку писать не нужно.
Есть провайдеры авторизации и главный конфиг-провайдер с `backendUrl`.
Дизайн: тёмный сайдбар (Workly) + светлый контент с таблицей (bringova).

## Запуск
```bash
npm install
npm run dev          # http://localhost:3002
```
Демо открывается в режиме `demo: true` (данные в памяти, без бэка). Вход — любой email/пароль.

- `/login` — готовый экран входа (`<LoginScreen />`)
- `/products` — целая CRUD-страница из **одного** компонента `<ResourcePage>` (без вёрстки)
- `/components` — витрина `SchemaForm` и `SchemaTable`

---

## 1. Главный провайдер — `AdminKitProvider`
Хранит центральную информацию (backendUrl и т.д.) и поднимает авторизацию.
`src/app/providers.tsx`:
```tsx
import { AdminKitProvider, AdminKitConfig, jwtAuth } from '@/adminkit';

const config: AdminKitConfig = {
  appName: 'AdminKit',
  brand: 'AdminKit',
  backendUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:9000/api',
  navigation: [
    { href: '/products', label: 'Products', icon: 'box' },
    { href: '/components', label: 'Components', icon: 'grid' },
  ],
  auth: jwtAuth(),   // провайдер авторизации (см. ниже)
  demo: false,       // false -> ресурсы ходят в backendUrl
};

export function Providers({ children }) {
  return <AdminKitProvider config={config}>{children}</AdminKitProvider>;
}
```
Доступ из любого места: `const { config, api } = useAdminKit();`

## 2. Провайдеры авторизации
Авторизация — это сменная стратегия `AuthBackend`:
```ts
interface AuthBackend {
  login(api, { email, password }): Promise<{ token, user }>;
  me(api): Promise<AuthUser>;
}
```
В комплекте:
- `jwtAuth({ loginPath?, mePath?, tokenField? })` — под твой NestJS (`/auth/login` → `{accessToken,user}`, `/auth/me`).
- `demoAuth(user?)` — заглушка без бэка.
- Можно написать свой (OAuth, сессии и т.п.) — просто объект с `login`/`me`.

Хелперы:
```tsx
const { user, login, logout, loading } = useAuth();      // состояние/действия
<RequireAuth role="admin">…</RequireAuth>                 // гард страницы
<LoginScreen role="admin" redirectTo="/products" />       // готовый экран входа
```

## 3. Ресурс — CRUD из коробки (как Filament Resource)
Связываешь модель → схему таблицы и формы → эндпоинт. `src/resources/products.ts`:
```ts
export const productResource = createResource<Product>({
  label: 'Products', singular: 'товар', endpoint: '/products',
  columns: () => [
    TextColumn.make('name').label('Название').sortable().searchable().weight('bold'),
    TextColumn.make('price').label('Цена').money('RUB').sortable(),
    BadgeColumn.make('status').colors({ active: 'green', draft: 'amber', out: 'red' })
      .labels({ active: 'Активен', draft: 'Черновик', out: 'Нет в наличии' }),
  ],
  form: () => [
    TextInput.make('name').label('Название').required(),
    Select.make('category').required().options({ '...': '...' }),
    NumberInput.make('price').label('Цена, ₽').required().min(0),
    Toggle.make('published').default(true),
    FileUpload.make('images').multiple().image().maxFiles(6),   // ← мультизагрузка
  ],
  demoData: [ /* для demo:true */ ],
});
```
И вся страница со списком, поиском, сортировкой, пагинацией, модалкой создания/редактирования
и удалением — это:
```tsx
// src/app/products/page.tsx
export default function ProductsPage() {
  return (
    <RequireAuth role="admin">
      <ResourcePage resource={productResource} />
    </RequireAuth>
  );
}
```
`ResourcePage` сам ходит в `backendUrl + endpoint` (GET список, POST/PATCH/DELETE),
а при `demo:true` работает на `demoData` в памяти.

## 4. Schema-компоненты отдельно
Если нужен не весь ресурс, а только форма или таблица:
```tsx
<SchemaForm
  schema={[ TextInput.make('name').required(), FileUpload.make('imgs').multiple().image() ]}
  onSubmit={(values) => …}
/>

<SchemaTable
  columns={[ TextColumn.make('name').sortable().searchable(), BadgeColumn.make('status').colors({…}) ]}
  data={rows} rowKey={r => r.id}
  actions={[ Action.make('msg').label('Сообщение').icon('chat').action(r => …) ]}
/>
```

---

## Доступные билдеры

**Поля формы** (`@/adminkit`): `TextInput`, `Textarea`, `NumberInput`, `Select`, `Toggle`,
`Checkbox`, `DatePicker`, `TagsInput`, `FileUpload`.
Общие методы: `.label() .required() .placeholder() .hint() .default() .columnSpan(1|2) .disabled()`
плюс валидация `.minLength() .maxLength() .email() .rule(fn)`.
Специфика: `Select.options({}) `, `Textarea.rows()`, `NumberInput.min()/.max()`,
`FileUpload.multiple().image().accept().maxFiles().maxSizeMB()`.

**Колонки таблицы**: `TextColumn` (`.money() .weight('bold') .formatStateUsing()`),
`BadgeColumn` (`.colors() .labels()`), `ImageColumn` (`.circular()`), `IconColumn` (`.icon()`).
Общие: `.label() .sortable() .searchable() .alignEnd()`.

**Действия**: `Action.make(name).label().icon().danger().action(fn)`, готовые `EditAction`, `DeleteAction`.

## Подключение к реальному бэку (твой NestJS «Свет.ру»)
1. В `providers.tsx`: `auth: jwtAuth()`, `demo: false`, `backendUrl` = твой адрес (`http://localhost:9000/api`).
2. Эндпоинт ресурса (`endpoint: '/products'`) должен отдавать массив или `{ items: [...] }` на GET
   и принимать POST/PATCH/DELETE.
3. Картинки из `FileUpload` приходят как `File[]` — для реальной загрузки добавь `fromFormValues`
   в ресурсе (например, заливка в storage и подстановка URL) или отдельный multipart-эндпоинт.

## Технически
Чистый Next.js 14 + React 18 + TypeScript, без Tailwind и UI-библиотек. Один `globals.css`
с дизайн-токенами. Низкоуровневые компоненты — в `src/components/admin`, библиотека — в `src/adminkit`.

---

## 5. Загрузка картинок (storage-адаптеры)

`FileUpload` в форме работает с файлами, но **на бэк уходит уже `string[]`** (имена/URL),
а при `multiple=false` — одна `string`. Куда физически складывать файлы — решает сменный
**storage-адаптер**, заданный в конфиге (или на конкретном поле).

### Адаптеры из коробки
```ts
// 1) хранить в самой админке (data URL в localStorage), на бэк — только имена
storage: localStorageAdapter()

// 2) заливать на бэк через multipart, на бэк — то, что вернёт сервер (url/имя)
storage: backendStorageAdapter({ endpoint: '/uploads', field: 'file', responseKey: 'url' })
```
Переопределить для одного поля:
```ts
FileUpload.make('images').multiple().image()
  .storage(backendStorageAdapter({ endpoint: '/uploads' }))
```

### Что уходит на бэк
- `FileUpload.make('images').multiple()` → `images: ["1700000000-a.jpg", "1700000001-b.jpg"]`
- `FileUpload.make('cover')` (без multiple) → `cover: "1700000000-a.jpg"` (или `null`)

Логика: новые файлы заливаются адаптером и заменяются на строки; при редактировании уже
сохранённые строки переиспользуются (через `hydrateFileFields`/`resolveFileUploads` — это
происходит автоматически в `ResourcePage`).

### Пример эндпоинта загрузки на NestJS (для `backendStorageAdapter`)
```ts
// uploads.controller.ts
@Controller('uploads')
export class UploadsController {
  @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (_req, file, cb) =>
        cb(null, `${Date.now()}-${file.originalname}`),
    }),
  }))
  upload(@UploadedFile() file: Express.Multer.File) {
    // вернёшь url — он и уйдёт в массиве images товара
    return { url: `/uploads/${file.filename}`, name: file.filename };
  }
}
```
Не забудь раздавать папку статикой (`ServeStaticModule` или `app.useStaticAssets('./uploads')`).

---

## 6. Select из другой таблицы (relationship)

Варианты селекта можно подтянуть из другой таблицы по API — как `relationship` в Filament:
```ts
// value = id записи, подпись = поле name; грузится с GET /categories
Select.make('categoryId').label('Категория').required()
  .optionsFrom('/categories', { value: 'id', label: 'name' })

// или произвольный загрузчик (любой источник)
Select.make('categoryId')
  .loadOptions(async (api) => {
    const cats = await api.get('/categories');
    return cats.map((c) => ({ value: c.id, label: c.name }));
  })
```
`SchemaForm` сам сходит за вариантами при открытии формы (пока грузится — в селекте «Загрузка…»),
поддерживает ответ как массивом, так и `{ items: [...] }`. На бэк уходит выбранный `value`
(в примере — `categoryId`).

> В demo-режиме (`demo: true`) запрос к `/categories` уйдёт в `backendUrl` и без бэка вернёт
> пустой список — поэтому в товарах используется реальный `optionsFrom('/categories')`,
> а на странице `/components` показан `loadOptions` со статикой (работает офлайн).

---

## 7. Поиск в селекте и зависимые селекты

**Поиск внутри селекта** (комбобокс) — когда вариантов много:
```ts
Select.make('categoryId').searchable().optionsFrom('/categories', { value: 'id', label: 'name' })
```

**Зависимые селекты** — список дочернего зависит от выбранного родителя; при смене родителя
дочерний перезагружается, а его выбор сбрасывается:
```ts
Select.make('categoryId').searchable().optionsFrom('/categories', { value: 'id', label: 'name' }),
Select.make('subcategoryId').searchable().dependsOn('categoryId')
  .optionsFrom('/subcategories', { value: 'id', label: 'name' }),
// -> GET /subcategories?categoryId=<выбранное значение>
```
Имя query-параметра по умолчанию = имя поля-родителя; меняется через `dependsOn('categoryId', { param: 'parentId' })`.
Пока родитель не выбран, дочерний селект заблокирован с подсказкой «Сначала выберите выше».

Для произвольной логики — `loadOptions(async (api, values) => …)`, где `values` это текущие
значения формы (см. пример категория → подкатегория на странице `/components`, работает офлайн).

---

## 8. Repeater — повторяющиеся группы полей (характеристики товара)

Подходит для характеристик/спецификаций: каждая строка — объект с подполями, на бэк уходит
массив объектов.
```ts
Repeater.make('attributes').label('Характеристики').columns(2)
  .reorderable().addActionLabel('Добавить характеристику').itemLabel('name')
  .schema([
    TextInput.make('name').label('Параметр').required().placeholder('Мощность'),
    TextInput.make('value').label('Значение').required().placeholder('60 Вт'),
  ])
// -> attributes: [{ name: 'Мощность', value: '60 Вт' }, { name: 'Цоколь', value: 'E27' }]
```
Методы: `.schema([...])`, `.columns(1|2)`, `.defaultItems(n)`, `.minItems(n)`, `.maxItems(n)`,
`.reorderable()`, `.addActionLabel(s)`, `.itemLabel(key)` (что показывать в заголовке строки).
Внутри строки можно использовать любые поля (`TextInput`, `Select`, `NumberInput`, `Toggle`…).

Подходит ли для характеристик: **да** — гибче простого «ключ-значение», т.к. в строку легко
добавить единицу измерения, группу, тип. Если же нужны строго пары «ключ → значение» без
доп. полей, проще плоская структура, но Repeater универсальнее и масштабируется.

---

## 9. Автозаполнение slug

Поле slug может автоматически генерироваться из другого поля (транслит кириллицы, нижний
регистр, дефисы):
```ts
TextInput.make('name').label('Название').required(),
TextInput.make('slug').label('Slug').required().slugFrom('name'),
// «Каскадная люстра Divinare» -> «kaskadnaya-lyustra-divinare»
```
Поведение: slug подстраивается под изменения исходного поля, **пока его не отредактируют
вручную** — после ручной правки автозаполнение для этой записи отключается. При открытии формы
редактирования существующий slug не затирается. Утилита доступна отдельно: `import { slugify } from '@/adminkit'`.

---

## 10. Темы, разделы, тумблеры оболочки и главная (дашборд)

Редизайн под светлый дашборд (как Zendenta) со скруглёнными панелями и анимациями
(плавные появления, hover-лифт карточек, переключение тем). Низкоуровневые компоненты
переехали из `src/components/admin` в **`src/adminkit/ui`** — всё в одном пакете.

### Тема и цвета
```ts
theme: { mode: 'light', accent: '#3b5bfd', accent2: '#6d5efc' }  // в конфиге провайдера
```
Светлая/тёмная переключаются кнопкой в сайдбаре/топбаре; выбор хранится в localStorage.
Программно: `const { mode, toggle, setMode } = useTheme();`

### Разделы в сайдбаре
```ts
navigation: [
  { items: [{ href: '/', label: 'Дашборд', icon: 'home' }] },
  { title: 'Каталог', items: [{ href: '/products', label: 'Товары', icon: 'box' }] },
  { title: 'Финансы', items: [{ href: '/orders', label: 'Заказы', icon: 'wallet', badge: 3 }] },
]
```
Можно и плоским массивом — тогда без заголовков.

### Какие элементы оболочки показывать
Глобально в конфиге `layout`, либо на конкретной странице через проп `show` у `AdminLayout`:
```tsx
<AdminLayout title="Аналитика" show={{ search: false, notifications: false }}>…</AdminLayout>
```
Доступно: `search`, `user`, `themeToggle`, `notifications`, `promo`, `workspace`.

### Главная с виджетами (можно менять/добавлять)
Главная — это массив виджетов, который ты сам формируешь:
```tsx
const widgets: DashboardWidget[] = [
  { id: 'asset', span: 1, flush: true, node: <StatCard label="Склад" value="$9.2M" icon="wallet" /> },
  { id: 'stock', span: 2, title: 'Остатки', node: <ProgressBreakdown segments={[…]} /> },
  { id: 'activity', span: 2, title: 'Последние действия', node: <RecentActivity items={[…]} /> },
];
<Dashboard widgets={widgets} />
```
Готовые виджеты: `StatCard`, `ProgressBreakdown`, `RecentActivity`. Любой свой компонент тоже
можно положить в `node`.

**Под твою будущую БД действий:** `RecentActivity` умеет грузить данные сам —
```tsx
<RecentActivity load={(api) => api.get('/activity')} />
```
когда сделаешь таблицу логов и эндпоинт `/activity` (возвращающий `[{ title, meta, time }]`),
просто подставишь `load` вместо `items` — и лента на главной заполнится из твоей базы.

---

## 11. Просмотр записи + статусный воркфлоу (как у заказов)

Для сценария «открыть заказ → собрать → отгрузить → доставить» у ресурса есть режим
просмотра (infolist) и переключение статусов. Добавляешь в конфиг ресурса:

```ts
createResource<Order>({
  // ...columns
  statusField: 'status',
  statuses: [                              // линейный воркфлоу
    { value: 'new',        label: 'Новый' },
    { value: 'assembling', label: 'Сборка' },
    { value: 'shipped',    label: 'Отгружен' },
    { value: 'delivered',  label: 'Доставлен' },
  ],
  infolist: () => [                        // что показать в окне просмотра
    TextEntry.make('number').label('Номер'),
    BadgeEntry.make('status').label('Статус').colors({...}).labels({...}),
    TextEntry.make('customer').label('Покупатель'),
    TextEntry.make('address').label('Адрес').full(),
    MoneyEntry.make('total').label('Сумма').currency('RUB'),
    DateEntry.make('createdAt').label('Создан'),
    TextEntry.make('items').label('Состав').full()
      .formatStateUsing((items) => items.map(i => `${i.name} ×${i.qty}`).join(', ')),
  ],
})
```

В таблице появляется действие **«Просмотр»** (иконка глаза) → открывается окно с инфолистом и
степпером статусов. Клик по шагу или кнопка **«Перевести в …»** меняет статус: в demo —
локально, иначе `PATCH endpoint/:id { status: '<next>' }`. Форму ресурс может не иметь вовсе
(`form` необязателен) — тогда это «только просмотр + статусы + удаление».

Готовые билдеры просмотра: `TextEntry`, `BadgeEntry`, `MoneyEntry`, `DateEntry`
(плюс `.full()` на всю ширину и `.formatStateUsing()` для своего рендера).
Компоненты доступны и отдельно: `<RecordView entries={…} row={…} />`, `<StatusFlow statuses={…} value onChange />`.

Демо: страница `/orders` — открой заказ и переведи его в «Отгружен».
