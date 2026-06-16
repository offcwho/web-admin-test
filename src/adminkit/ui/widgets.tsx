'use client';
import React, { useEffect, useState } from 'react';
import { Icon } from './primitives';
import { useAdminKit } from '../config';

/** Карточка-метрика */
export function StatCard({ label, value, delta, icon = 'chart', tone = 'primary' }: {
  label: string; value: React.ReactNode; delta?: { value: string; up?: boolean };
  icon?: keyof typeof Icon; tone?: 'primary' | 'green' | 'amber' | 'red';
}) {
  const I = Icon[icon] ?? Icon.chart;
  return (
    <div className="stat">
      <div className={`stat-ic ${tone}`}><I size={20} /></div>
      <div style={{ minWidth: 0 }}>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
      </div>
      {delta && <span className={`stat-delta ${delta.up ? 'up' : 'down'}`}>{delta.up ? '↑' : '↓'} {delta.value}</span>}
    </div>
  );
}

/** Стопка-прогресс с легендой (как «in stock / low / out» на референсе) */
export function ProgressBreakdown({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  return (
    <div>
      <div className="bd-bar">
        {segments.map((s, i) => (
          <div key={i} className="bd-seg" style={{ width: `${(s.value / total) * 100}%`, background: s.color }} />
        ))}
      </div>
      <div className="bd-legend">
        {segments.map((s, i) => (
          <span key={i} className="bd-item"><span className="bd-dot" style={{ background: s.color }} />{s.label}: <b>{s.value}</b></span>
        ))}
      </div>
    </div>
  );
}

export interface ActivityItem { title: string; time?: string; meta?: string; icon?: keyof typeof Icon }

/**
 * Лента последних действий. Передай items напрямую ИЛИ load(api) — например в будущем
 * подтянешь из своей таблицы логов: load={(api) => api.get('/activity')}.
 */
export function RecentActivity({ items, load, empty = 'Пока нет событий' }: {
  items?: ActivityItem[]; load?: (api: ReturnType<typeof useAdminKit>['api']) => Promise<ActivityItem[]>; empty?: string;
}) {
  const { api } = useAdminKit();
  const [data, setData] = useState<ActivityItem[]>(items ?? []);
  const [loading, setLoading] = useState(!!load);
  useEffect(() => {
    if (!load) { setData(items ?? []); return; }
    let alive = true;
    setLoading(true);
    load(api).then((d) => { if (alive) setData(d); }).catch(() => {}).finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [load, items]); // eslint-disable-line

  if (loading) return <div className="muted" style={{ padding: 6 }}>Загрузка…</div>;
  if (!data.length) return <div className="muted" style={{ padding: 6 }}>{empty}</div>;

  return (
    <ul className="activity">
      {data.map((it, i) => {
        const I = (it.icon && Icon[it.icon]) || Icon.check;
        return (
          <li key={i} className="act-item">
            <span className="act-dot"><I size={14} /></span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="act-title">{it.title}</div>
              {it.meta && <div className="act-meta">{it.meta}</div>}
            </div>
            {it.time && <span className="act-time">{it.time}</span>}
          </li>
        );
      })}
    </ul>
  );
}
