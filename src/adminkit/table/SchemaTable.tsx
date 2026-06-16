'use client';
import React from 'react';
import { DataTable, Column as DTColumn, RowAction } from '@/adminkit/ui/DataTable';
import { Badge, Icon } from '@/adminkit/ui/primitives';
import type { AnyColumn, AnyAction, ColumnConfig } from './columns';

function get(obj: any, key: string) { return key.split('.').reduce((a, k) => (a == null ? a : a[k]), obj); }

function cell(c: ColumnConfig, row: any): React.ReactNode {
  let v = get(row, c.key);
  if (c.format) v = c.format(v, row);
  switch (c.type) {
    case 'image':
      return <img className="thumb" style={c.circular ? { borderRadius: '50%' } : undefined} src={v} alt="" />;
    case 'badge': {
      const color = (c.colors && c.colors[v]) || 'gray';
      const label = (c.labels && c.labels[v]) || v;
      return <Badge color={color}>{label}</Badge>;
    }
    case 'icon': {
      const I = (c.icon && Icon[c.icon]) || Icon.check;
      return v ? <span style={{ color: 'var(--green)' }}><I size={18} /></span> : <span style={{ color: 'var(--muted)' }}>—</span>;
    }
    default:
      if (c.money != null && typeof v === 'number') v = `${v.toLocaleString('ru-RU')} ${c.money === 'RUB' ? '₽' : c.money}`;
      // защита: если в колонку попал объект — не роняем рендер
      if (v != null && typeof v === 'object') v = (v as any).name ?? (v as any).title ?? (v as any).label ?? '';
      return <span style={c.weight === 'bold' ? { fontWeight: 600 } : undefined}>{v ?? ''}</span>;
  }
}

export function SchemaTable<T>({
  columns, data, rowKey, actions, pageSize = 8, toolbar, searchable = true,
}: {
  columns: AnyColumn[];
  data: T[];
  rowKey: (row: T) => string;
  actions?: AnyAction[];
  pageSize?: number;
  toolbar?: React.ReactNode;
  searchable?: boolean;
}) {
  const cfgs = columns.map((c) => c.config);
  const cols: DTColumn<T>[] = cfgs.map((c) => ({
    key: c.key, label: c.label ?? c.key, sortable: c.sortable, align: c.align,
    render: (row: T) => cell(c, row),
  }));
  const searchKeys = cfgs.filter((c) => c.searchable).map((c) => c.key);
  const rowActions: RowAction<T>[] | undefined = actions?.map((a) => ({
    label: a.config.label ?? a.config.name,
    danger: a.config.color === 'danger',
    icon: a.config.icon ? (p) => { const I = Icon[a.config.icon!]; return <I size={p.size} />; } : undefined,
    onClick: (row: T) => a.config.onClick?.(row),
  }));
  return (
    <DataTable<T>
      columns={cols} data={data} rowKey={rowKey} actions={rowActions}
      searchable={searchable && searchKeys.length > 0} searchKeys={searchKeys.length ? searchKeys : undefined}
      pageSize={pageSize} toolbar={toolbar}
    />
  );
}
