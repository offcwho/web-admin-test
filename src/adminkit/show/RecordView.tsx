'use client';
import React from 'react';
import { Badge } from '../ui/primitives';
import type { AnyEntry, EntryConfig } from './entries';

function get(obj: any, key: string) { return key.split('.').reduce((a, k) => (a == null ? a : a[k]), obj); }

function value(c: EntryConfig, row: any): React.ReactNode {
  let v = get(row, c.key);
  if (c.format) return c.format(v, row) as React.ReactNode;
  switch (c.type) {
    case 'badge': {
      const color = (c.colors && c.colors[v]) || 'gray';
      return <Badge color={color}>{(c.labels && c.labels[v]) || v || '—'}</Badge>;
    }
    case 'money':
      return typeof v === 'number' ? `${v.toLocaleString('ru-RU')} ${c.money === 'RUB' || !c.money ? '₽' : c.money}` : '—';
    case 'date':
      return v ? new Date(v).toLocaleString('ru-RU') : '—';
    default:
      if (v != null && typeof v === 'object') v = (v as any).name ?? (v as any).title ?? '';
      return (v ?? '') === '' ? '—' : v;
  }
}

/** Просмотр записи (инфолист): подписи + значения. */
export function RecordView<T>({ entries, row }: { entries: AnyEntry[]; row: T }) {
  return (
    <div className="rv-grid">
      {entries.map((e) => (
        <div key={e.config.key} className={`rv-row ${e.config.full ? 'full' : ''}`}>
          <div className="rv-label">{e.config.label ?? e.config.key}</div>
          <div className="rv-value">{value(e.config, row)}</div>
        </div>
      ))}
    </div>
  );
}
