'use client';
import { useEffect, useRef, useState } from 'react';
import { Icon } from './primitives';

interface Opt { value: string; label: string }

export function SearchableSelect({
  label, required, hint, error, placeholder = '— выбрать —', options, value, onChange, disabled,
}: {
  label?: string; required?: boolean; hint?: string; error?: string; placeholder?: string;
  options: Opt[]; value: string; onChange: (v: string) => void; disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const selected = options.find((o) => o.value === value);
  const filtered = q ? options.filter((o) => o.label.toLowerCase().includes(q.toLowerCase())) : options;

  return (
    <div className="field" ref={ref}>
      {label && <label>{label}{required && <span className="req"> *</span>}</label>}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          className="control"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left', cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.6 : 1 }}
        >
          <span style={{ color: selected ? 'var(--text)' : 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {selected ? selected.label : placeholder}
          </span>
          <Icon.chevron size={16} />
        </button>

        {open && !disabled && (
          <div className="menu" style={{ left: 0, right: 0, maxHeight: 260, overflow: 'auto' }}>
            <div className="t-search" style={{ minWidth: 0, marginBottom: 6 }}>
              <Icon.search size={15} />
              <input autoFocus placeholder="Поиск…" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            {filtered.length === 0 ? (
              <div className="muted" style={{ padding: '8px 10px', fontSize: 13 }}>Ничего не найдено</div>
            ) : filtered.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => { onChange(o.value); setOpen(false); setQ(''); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
                  border: 'none', background: o.value === value ? 'var(--soft)' : 'none',
                  padding: '9px 11px', borderRadius: 8, cursor: 'pointer', font: 'inherit', textAlign: 'left',
                }}
              >
                <span>{o.label}</span>
                {o.value === value && <Icon.check size={15} />}
              </button>
            ))}
          </div>
        )}
      </div>
      {error ? <span className="err">{error}</span> : hint ? <span className="hint">{hint}</span> : null}
    </div>
  );
}
