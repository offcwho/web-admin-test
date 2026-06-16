import { createResource, TextColumn, TextInput } from "@/adminkit";

export interface Categories {
    id: string, name: string, slug: string;
}

export const categoriesResource = createResource<Categories>({
    name: 'categories',
    label: 'Categories',
    singular: 'Категорию',
    endpoint: '/categories',
    columns: () => [
        TextColumn.make('id').label('ID').sortable(),
        TextColumn.make('name').label('Название категории').searchable(),
        TextColumn.make('slug').label('Slug'),
    ],
    form: () => [
        TextInput.make('name').label('Название категории').required().placeholder('Освещение'),
        TextInput.make('slug').label('Slug').required().slugFrom('name'),
    ],
})