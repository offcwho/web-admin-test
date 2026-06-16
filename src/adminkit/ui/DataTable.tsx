'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from './primitives';

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'right' | 'center';
}
export interface RowAction<T> {
  label: string;
  onClick: (row: T) => void;
  icon?: (p: { size?: number }) => React.ReactNode;
  danger?: boolean;
}
export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string;
  searchable?: boolean;
  searchKeys?: string[];
  actions?: RowAction<T>[];
  pageSize?: number;
  toolbar?: React.ReactNode;
}

function get(obj: any, key: string) { return key.split('.').reduce((a, k) => (a == null ? a : a[k]), obj); }

export function DataTable<T>({ columns, data, rowKey, searchable = true, searchKeys, actions, pageSize = 8, toolbar }: DataTableProps<T>) {
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null);
  const [page, setPage] = useState(1);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpenMenu(null); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const filtered = useMemo(() => {
    let rows = data;
    if (q && searchable) {
      const keys = searchKeys ?? columns.map((c) => c.key);
      const t = q.toLowerCase();
      rows = rows.filter((r) => keys.some((k) => String(get(r, k) ?? '').toLowerCase().includes(t)));
    }
    if (sort) {
      rows = [...rows].sort((a, b) => {
        const av = get(a, sort.key), bv = get(b, sort.key);
        if (av == null) return 1; if (bv == null) return -1;
        return (av > bv ? 1 : av < bv ? -1 : 0) * sort.dir;
      });
    }
    return rows;
  }, [data, q, sort, columns, searchKeys, searchable]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const cur = Math.min(page, pages);
  const slice = filtered.slice((cur - 1) * pageSize, cur * pageSize);
  const toggleSort = (key: string) => setSort((s) => s?.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: 1 });

  return (
    <div className="card" ref={wrapRef}>
      {(searchable || toolbar) && (
        <div className="t-top">
          {searchable
            ? <div className="t-search"><Icon.search size={16} /><input placeholder="Search…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} /></div>
            : <span />}
          <div style={{ display: 'flex', gap: 10 }}>{toolbar}</div>
        </div>
      )}
      <table className="table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={c.sortable ? 'sortable' : ''} style={{ textAlign: c.align ?? 'left' }}
                onClick={() => c.sortable && toggleSort(c.key)}>
                {c.label}{sort?.key === c.key ? (sort.dir === 1 ? ' ↑' : ' ↓') : ''}
              </th>
            ))}
            {actions && <th style={{ textAlign: 'right' }}>Action</th>}
          </tr>
        </thead>
        <tbody>
          {slice.length === 0 ? (
            <tr><td colSpan={columns.length + (actions ? 1 : 0)} style={{ textAlign: 'center', color: 'var(--muted)', padding: 28 }}>Нет данных</td></tr>
          ) : slice.map((row) => {
            const k = rowKey(row);
            return (
              <tr key={k}>
                {columns.map((c) => (
                  <td key={c.key} style={{ textAlign: c.align ?? 'left' }}>
                    {c.render ? c.render(row) : String(get(row, c.key) ?? '')}
                  </td>
                ))}
                {actions && (
                  <td style={{ textAlign: 'right' }}>
                    <div className="menu-wrap">
                      <button className="icon-btn" onClick={() => setOpenMenu(openMenu === k ? null : k)}><Icon.dots size={18} /></button>
                      {openMenu === k && (
                        <div className="menu">
                          {actions.map((a) => (
                            <button key={a.label} className={a.danger ? 'danger' : ''}
                              onClick={() => { setOpenMenu(null); a.onClick(row); }}>
                              {a.icon && a.icon({ size: 16 })}{a.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="t-foot">
        <span>{filtered.length} записей</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="icon-btn" disabled={cur <= 1} onClick={() => setPage(cur - 1)} style={{ transform: 'rotate(90deg)' }}><Icon.chevron size={16} /></button>
          {cur} / {pages}
          <button className="icon-btn" disabled={cur >= pages} onClick={() => setPage(cur + 1)} style={{ transform: 'rotate(-90deg)' }}><Icon.chevron size={16} /></button>
        </span>
      </div>
    </div>
  );
}
