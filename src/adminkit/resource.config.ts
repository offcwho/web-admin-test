import type { AnyColumn, AnyAction } from './table/columns';
import type { AnyField } from './form/fields';
import type { FormValues } from './form/SchemaForm';
import type { AnyEntry } from './show/entries';
import type { StatusStep } from './show/StatusFlow';

export interface ResourceConfig<T = any> {
  name: string;
  label: string;                       // напр. "Товары"
  singular?: string;                   // напр. "товар"
  endpoint: string;                    // путь к API, напр. "/products"
  primaryKey?: string;                 // по умолчанию "id"
  columns: () => AnyColumn[];          // схема таблицы
  form?: () => AnyField[];             // схема формы (необяз.)
  infolist?: () => AnyEntry[];         // схема просмотра записи
  statuses?: StatusStep[];             // статусный воркфлоу
  statusField?: string;                // поле статуса (по умолчанию "status")
  rowActions?: AnyAction[];            // доп. действия в строке
  toFormValues?: (row: T) => FormValues;
  fromFormValues?: (values: FormValues) => any;
  demoData?: T[];                      // данные для demo-режима (без бэка)
}

/** Чистая функция-хелпер. Вынесена из client-компонента, чтобы её можно было
 *  вызывать в любом контексте (в т.ч. при объявлении ресурса в обычном модуле). */
export function createResource<T = any>(cfg: ResourceConfig<T>): ResourceConfig<T> { return cfg; }
