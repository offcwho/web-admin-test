import {
  createResource, TextColumn, BadgeColumn,
  TextInput, Textarea, NumberInput, Select, Toggle, FileUpload, Repeater,
} from '@/adminkit';

export interface Product {
  id: string; name: string; category: string; price: number;
  status: 'active' | 'draft' | 'out';
}

export const productResource = createResource<Product>({
  name: 'products',
  label: 'Products',
  singular: 'товар',
  endpoint: '/products',          // POST/PATCH/DELETE сюда при demo:false
  columns: () => [
    TextColumn.make('name').label('Название').sortable().searchable().weight('bold'),
    TextColumn.make('category').label('Категория').searchable()
      .formatStateUsing((v) => (v && typeof v === 'object') ? (v as any).name : (v ?? '—')),
    TextColumn.make('price').label('Цена').money('RUB').sortable(),
    BadgeColumn.make('status').label('Статус')
      .colors({ active: 'green', draft: 'amber', out: 'red' })
      .labels({ active: 'Активен', draft: 'Черновик', out: 'Нет в наличии' }),
  ],
  form: () => [
    TextInput.make('name').label('Название').required().placeholder('Каскадная люстра…'),
    TextInput.make('slug').label('Slug').required().slugFrom('name')
      .hint('Заполняется автоматически из названия, можно поправить вручную'),
    // категория выбирается из другой таблицы (/categories): value = id, подпись = name
    Select.make('categoryId').label('Категория').required().searchable()
      .optionsFrom('/categories', { value: 'id', label: 'name' }),
    Textarea.make('description').label('Описание').rows(3),
    NumberInput.make('price').label('Цена, ₽').required().min(0),
    Select.make('status').label('Статус').default('active')
      .options({ active: 'Активен', draft: 'Черновик', out: 'Нет в наличии' }),
    Toggle.make('published').label('Опубликован').default(true),
    // характеристики товара — повторяющиеся строки (на бэк уходит массив объектов)
    Repeater.make('attributes').label('Характеристики').columns(2).reorderable()
      .addActionLabel('Добавить характеристику').itemLabel('name')
      .schema([
        TextInput.make('name').label('Параметр').required().placeholder('Мощность'),
        TextInput.make('value').label('Значение').required().placeholder('60 Вт'),
      ]),
    FileUpload.make('images').label('Изображения товара')
      .multiple().image().maxFiles(6).maxSizeMB(5).hint('Первое фото станет обложкой'),
  ],
  demoData: [
    { id: '1', name: 'Каскадная люстра Divinare', category: 'Освещение', price: 14000, status: 'active' },
    { id: '2', name: 'Кресло Olive Lounge', category: 'Кресла', price: 26000, status: 'active' },
    { id: '3', name: 'Стул Carbon', category: 'Стулья', price: 8000, status: 'draft' },
    { id: '4', name: 'Торшер Ivory', category: 'Освещение', price: 15000, status: 'out' },
  ],
});
