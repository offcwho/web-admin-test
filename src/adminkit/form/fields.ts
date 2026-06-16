import type { UploadedFile } from '@/adminkit/ui/FileUpload';
import type { StorageAdapter } from '../storage';
import type { Api } from '../api';

export type FieldType = 'text' | 'textarea' | 'number' | 'select' | 'toggle' | 'checkbox' | 'date' | 'tags' | 'file' | 'repeater';
export type Validator = (value: any, values: Record<string, any>) => string | undefined;

export interface FieldConfig {
  type: FieldType;
  name: string;
  label?: string;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  default?: any;
  colSpan?: 1 | 2;
  disabled?: boolean;
  options?: { value: string; label: string }[];
  optionsEndpoint?: { path: string; valueKey: string; labelKey: string };
  loadOptions?: (api: Api, values?: Record<string, any>) => Promise<{ value: string; label: string }[]>;
  searchable?: boolean;
  dependsOn?: string;
  dependsParam?: string;
  rows?: number;
  multiple?: boolean;
  accept?: string;
  maxFiles?: number;
  maxSizeMB?: number;
  min?: number;
  max?: number;
  // repeater
  schema?: FieldConfig[];
  columns?: 1 | 2;
  defaultItems?: number;
  minItems?: number;
  maxItems?: number;
  reorderable?: boolean;
  addActionLabel?: string;
  itemLabelKey?: string;
  slugFrom?: string;
  storage?: StorageAdapter;
  rules: Validator[];
}

class Field {
  config: FieldConfig;
  constructor(type: FieldType, name: string) { this.config = { type, name, rules: [] }; }
  label(v: string) { this.config.label = v; return this; }
  placeholder(v: string) { this.config.placeholder = v; return this; }
  hint(v: string) { this.config.hint = v; return this; }
  default(v: any) { this.config.default = v; return this; }
  columnSpan(v: 1 | 2) { this.config.colSpan = v; return this; }
  disabled(v = true) { this.config.disabled = v; return this; }
  rule(fn: Validator) { this.config.rules.push(fn); return this; }
  required(v = true) {
    this.config.required = v;
    if (v) this.rule((val) => (val === '' || val == null || (Array.isArray(val) && !val.length)) ? 'Обязательное поле' : undefined);
    return this;
  }
  minLength(n: number) { return this.rule((v) => (typeof v === 'string' && v.length < n) ? `Минимум ${n} символов` : undefined); }
  maxLength(n: number) { return this.rule((v) => (typeof v === 'string' && v.length > n) ? `Максимум ${n} символов` : undefined); }
  email() { return this.rule((v) => (v && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) ? 'Некорректный email' : undefined); }
}

class TextField extends Field {
  numeric() { this.config.type = 'number'; return this; }
  /** автозаполнять это поле slug'ом из другого поля (пока его не отредактируют вручную) */
  slugFrom(field: string) { this.config.slugFrom = field; return this; }
}
class NumberField extends Field {
  min(n: number) { this.config.min = n; return this; }
  max(n: number) { this.config.max = n; return this; }
}
class SelectField extends Field {
  /** options: массив или объект {value: label} */
  options(o: { value: string; label: string }[] | Record<string, string>) {
    this.config.options = Array.isArray(o) ? o : Object.entries(o).map(([value, label]) => ({ value, label: String(label) }));
    return this;
  }
  /** подтянуть варианты из другой таблицы по API: optionsFrom('/categories', { value:'id', label:'name' }) */
  optionsFrom(path: string, map: { value?: string; label?: string } = {}) {
    this.config.optionsEndpoint = { path, valueKey: map.value ?? 'id', labelKey: map.label ?? 'name' };
    return this;
  }
  /** кастомный загрузчик вариантов (values — текущие значения формы, для зависимых селектов) */
  loadOptions(fn: (api: Api, values?: Record<string, any>) => Promise<{ value: string; label: string }[]>) {
    this.config.loadOptions = fn;
    return this;
  }
  /** поиск внутри селекта (комбобокс) — удобно, когда вариантов много */
  searchable(v = true) { this.config.searchable = v; return this; }
  /** зависит от другого поля: при смене родителя список перезагружается, выбор сбрасывается.
   *  Для optionsFrom значение родителя уходит query-параметром (по умолчанию имя = имя поля-родителя). */
  dependsOn(field: string, opts: { param?: string } = {}) {
    this.config.dependsOn = field;
    this.config.dependsParam = opts.param ?? field;
    return this;
  }
}
class TextareaField extends Field { rows(n: number) { this.config.rows = n; return this; } }
class FileField extends Field {
  multiple(v = true) { this.config.multiple = v; return this; }
  image() { this.config.accept = 'image/*'; return this; }
  accept(v: string) { this.config.accept = v; return this; }
  storage(adapter: StorageAdapter) { this.config.storage = adapter; return this; }
  maxFiles(n: number) { this.config.maxFiles = n; return this; }
  maxSizeMB(n: number) { this.config.maxSizeMB = n; return this; }
}

/** Фабрики в стиле Filament: TextInput.make('name')... */
export const TextInput = { make: (name: string) => new TextField('text', name) };
export const Textarea = { make: (name: string) => new TextareaField('textarea', name) };
export const NumberInput = { make: (name: string) => new NumberField('number', name) };
export const Select = { make: (name: string) => new SelectField('select', name) };
export const Toggle = { make: (name: string) => new Field('toggle', name) };
export const Checkbox = { make: (name: string) => new Field('checkbox', name) };
export const DatePicker = { make: (name: string) => new Field('date', name) };
export const TagsInput = { make: (name: string) => new Field('tags', name) };
export const FileUpload = { make: (name: string) => new FileField('file', name) };

class RepeaterField extends Field {
  /** подполя одной строки */
  schema(fields: AnyField[]) { this.config.schema = fields.map((f) => f.config); return this; }
  columns(n: 1 | 2) { this.config.columns = n; return this; }
  defaultItems(n: number) { this.config.defaultItems = n; return this; }
  minItems(n: number) { this.config.minItems = n; return this.rule((v) => (Array.isArray(v) && v.length < n) ? `Минимум ${n} строк(и)` : undefined); }
  maxItems(n: number) { this.config.maxItems = n; return this; }
  reorderable(v = true) { this.config.reorderable = v; return this; }
  addActionLabel(s: string) { this.config.addActionLabel = s; return this; }
  /** показывать значение этого подполя в заголовке строки */
  itemLabel(key: string) { this.config.itemLabelKey = key; return this; }
}
export const Repeater = { make: (name: string) => new RepeaterField('repeater', name) };

export type AnyField = Field;
export type { UploadedFile };
