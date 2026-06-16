import type { BadgeColor } from '../table/columns';

export type EntryType = 'text' | 'badge' | 'money' | 'date';

export interface EntryConfig {
  type: EntryType;
  key: string;
  label?: string;
  colors?: Record<string, BadgeColor>;
  labels?: Record<string, string>;
  money?: string;
  full?: boolean;                         // на всю ширину
  format?: (value: any, row: any) => any; // кастомный рендер значения
}

class Entry {
  config: EntryConfig;
  constructor(type: EntryType, key: string) { this.config = { type, key }; }
  label(v: string) { this.config.label = v; return this; }
  full(v = true) { this.config.full = v; return this; }
  formatStateUsing(fn: (value: any, row: any) => any) { this.config.format = fn; return this; }
}
class Badge extends Entry {
  colors(m: Record<string, BadgeColor>) { this.config.colors = m; return this; }
  labels(m: Record<string, string>) { this.config.labels = m; return this; }
}
class Money extends Entry { currency(c = 'RUB') { this.config.money = c; return this; } }

export const TextEntry = { make: (key: string) => new Entry('text', key) };
export const BadgeEntry2 = { make: (key: string) => new Badge('badge', key) };
export const MoneyEntry = { make: (key: string) => new Money('money', key) };
export const DateEntry = { make: (key: string) => new Entry('date', key) };
export const BadgeEntry = BadgeEntry2;
export type AnyEntry = Entry;
