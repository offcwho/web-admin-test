'use client';
import {
  RequireAuth, AdminLayout, SchemaForm, SchemaTable,
  TextInput, Textarea, Select, NumberInput, Toggle, FileUpload,
  TextColumn, BadgeColumn,
} from '@/adminkit';
import { Card } from '@/adminkit/ui/primitives';

function View() {
  const formSchema = [
    TextInput.make('name').label('Имя').required().placeholder('Введите имя'),
    Select.make('category').label('Категория').searchable()
      .loadOptions(async () => [
        { value: '1', label: 'Освещение' },
        { value: '2', label: 'Кресла' },
        { value: '3', label: 'Стулья' },
      ]),
    // зависимый селект: список зависит от выбранной категории
    Select.make('subcategory').label('Подкатегория').searchable().dependsOn('category')
      .loadOptions(async (_api, values) => {
        const map: Record<string, [string, string][]> = {
          '1': [['11', 'Люстры'], ['12', 'Бра'], ['13', 'Торшеры']],
          '2': [['21', 'Офисные'], ['22', 'Лаунж'], ['23', 'Кресла-мешки']],
          '3': [['31', 'Барные'], ['32', 'Обеденные'], ['33', 'Складные']],
        };
        return (map[values?.category as string] ?? []).map(([value, label]) => ({ value, label }));
      }),
    Textarea.make('description').label('Описание').rows(3),
    NumberInput.make('price').label('Цена, ₽').required().min(0),
    Toggle.make('published').label('Опубликован').default(true),
    FileUpload.make('images').label('Галерея товара').multiple().image().maxFiles(6).maxSizeMB(5).hint('Первое — обложка'),
  ];
  const columns = [
    TextColumn.make('name').label('Название').sortable().searchable().weight('bold'),
    TextColumn.make('price').label('Цена').money('RUB').sortable(),
    BadgeColumn.make('status').label('Статус').colors({ active: 'green', draft: 'amber' }).labels({ active: 'Активен', draft: 'Черновик' }),
  ];
  const data = [
    { id: '1', name: 'Каскадная люстра', price: 14000, status: 'active' },
    { id: '2', name: 'Кресло Olive', price: 26000, status: 'draft' },
  ];

  return (
    <AdminLayout title="Components">
      <p className="section-note">Декларативные схемы в стиле Filament — вёрстку писать не нужно, передаёшь массив полей/колонок.</p>

      <Card style={{ padding: 22, marginBottom: 18 }}>
        <h3 style={{ marginTop: 0 }}>SchemaForm</h3>
        <p className="section-note"><span className="code-pill">{'<SchemaForm schema={[ TextInput.make(...).required(), FileUpload.make(...).multiple() ]} />'}</span></p>
        <SchemaForm schema={formSchema} submitLabel="Сохранить" onSubmit={(v) => alert('values: ' + Object.keys(v).join(', '))} />
      </Card>

      <h3 style={{ margin: '6px 2px 10px' }}>SchemaTable</h3>
      <p className="section-note"><span className="code-pill">{'<SchemaTable columns={[ TextColumn.make(...).sortable(), BadgeColumn.make(...).colors({}) ]} data={...} />'}</span></p>
      <SchemaTable columns={columns} data={data} rowKey={(r) => r.id} />
    </AdminLayout>
  );
}

export default function ComponentsPage() {
  return <RequireAuth role="admin"><View /></RequireAuth>;
}
