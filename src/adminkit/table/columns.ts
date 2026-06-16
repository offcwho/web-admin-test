import type { Icon } from '@/adminkit/ui/primitives';

export type ColType = 'text' | 'badge' | 'image' | 'icon';
export type BadgeColor = 'green' | 'red' | 'amber' | 'gray';

export interface ColumnConfig {
  type: ColType;
  key: string;
  label?: string;
  sortable?: boolean;
  searchable?: boolean;
  align?: 'left' | 'right' | 'center';
  weight?: 'bold';
  money?: string;
  colors?: Record<string, BadgeColor>;
  labels?: Record<string, string>;
  circular?: boolean;
  icon?: keyof typeof Icon;
  format?: (value: any, row: any) => any;
}

class Column {
  config: ColumnConfig;
  constructor(type: ColType, key: string) { this.config = { type, key }; }
  label(v: string) { this.config.label = v; return this; }
  sortable(v = true) { this.config.sortable = v; return this; }
  searchable(v = true) { this.config.searchable = v; return this; }
  alignEnd() { this.config.align = 'right'; return this; }
  alignCenter() { this.config.align = 'center'; return this; }
  formatStateUsing(fn: (value: any, row: any) => any) { this.config.format = fn; return this; }
}
class TextCol extends Column {
  weight(w: 'bold') { this.config.weight = w; return this; }
  money(currency = 'RUB') { this.config.money = currency; this.config.align = 'right'; return this; }
}
class BadgeCol extends Column {
  /** map состояния -> цвет: {active:'green', draft:'amber'} */
  colors(m: Record<string, BadgeColor>) { this.config.colors = m; return this; }
  /** map состояния -> подпись: {active:'Активен'} */
  labels(m: Record<string, string>) { this.config.labels = m; return this; }
}
class ImageCol extends Column { circular() { this.config.circular = true; return this; } }
class IconCol extends Column { icon(name: keyof typeof Icon) { this.config.icon = name; return this; } }

export const TextColumn = { make: (key: string) => new TextCol('text', key) };
export const BadgeColumn = { make: (key: string) => new BadgeCol('badge', key) };
export const ImageColumn = { make: (key: string) => new ImageCol('image', key) };
export const IconColumn = { make: (key: string) => new IconCol('icon', key) };
export type AnyColumn = Column;

/* ---------- actions ---------- */
export interface ActionConfig {
  name: string;
  label?: string;
  icon?: keyof typeof Icon;
  color?: 'default' | 'danger';
  onClick?: (row: any) => void;
  kind?: 'edit' | 'delete' | 'custom';
}
class ActionBuilder {
  config: ActionConfig;
  constructor(name: string, kind: ActionConfig['kind'] = 'custom') { this.config = { name, kind }; }
  label(v: string) { this.config.label = v; return this; }
  icon(name: keyof typeof Icon) { this.config.icon = name; return this; }
  color(c: 'default' | 'danger') { this.config.color = c; return this; }
  danger() { this.config.color = 'danger'; return this; }
  action(fn: (row: any) => void) { this.config.onClick = fn; return this; }
}
export const Action = { make: (name: string) => new ActionBuilder(name, 'custom') };
export const EditAction = { make: () => new ActionBuilder('edit', 'edit').label('Редактировать').icon('pencil') };
export const DeleteAction = { make: () => new ActionBuilder('delete', 'delete').label('Удалить').icon('trash').danger() };
export type AnyAction = ActionBuilder;
