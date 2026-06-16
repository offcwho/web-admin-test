'use client';
import React from 'react';
import { Icon, Button } from '../ui/primitives';
import type { BadgeColor } from '../table/columns';

export interface StatusStep { value: string; label: string; color?: BadgeColor }

/** Статусный воркфлоу: степпер + кнопка перевода на следующий шаг (и клик по любому шагу). */
export function StatusFlow({ statuses, value, onChange, busy }: {
  statuses: StatusStep[]; value: string; onChange: (next: string) => void; busy?: boolean;
}) {
  const idx = Math.max(0, statuses.findIndex((s) => s.value === value));
  const next = statuses[idx + 1];
  return (
    <div className="flow">
      <div className="flow-steps">
        {statuses.map((s, i) => {
          const done = i < idx, current = i === idx;
          return (
            <React.Fragment key={s.value}>
              <button
                type="button"
                className={`flow-step ${done ? 'done' : ''} ${current ? 'current' : ''}`}
                disabled={busy}
                onClick={() => onChange(s.value)}
                title={`Установить: ${s.label}`}
              >
                <span className="flow-dot">{done ? <Icon.check size={14} /> : i + 1}</span>
                <span className="flow-label">{s.label}</span>
              </button>
              {i < statuses.length - 1 && <span className={`flow-line ${i < idx ? 'done' : ''}`} />}
            </React.Fragment>
          );
        })}
      </div>
      {next && (
        <Button disabled={busy} onClick={() => onChange(next.value)}>
          <Icon.truck size={16} /> {busy ? '…' : `Перевести в «${next.label}»`}
        </Button>
      )}
    </div>
  );
}
