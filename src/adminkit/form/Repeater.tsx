'use client';
import React from 'react';
import { FieldControl } from './FieldControl';
import { Icon } from '@/adminkit/ui/primitives';
import type { FieldConfig } from './fields';

function blankItem(sub: FieldConfig[]): Record<string, any> {
  const o: Record<string, any> = {};
  for (const s of sub) o[s.name] = s.default ?? (s.type === 'toggle' || s.type === 'checkbox' ? false : s.type === 'file' || s.type === 'tags' ? [] : '');
  return o;
}

export function RepeaterControl({ config, value, onChange }: {
  config: FieldConfig;
  value: Record<string, any>[];
  onChange: (v: Record<string, any>[]) => void;
}) {
  const items = Array.isArray(value) ? value : [];
  const sub = config.schema ?? [];
  const cols = config.columns ?? 1;

  const add = () => { if (config.maxItems && items.length >= config.maxItems) return; onChange([...items, blankItem(sub)]); };
  const remove = (i: number) => { if (config.minItems && items.length <= config.minItems) return; onChange(items.filter((_, idx) => idx !== i)); };
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir; if (j < 0 || j >= items.length) return;
    const cp = [...items]; [cp[i], cp[j]] = [cp[j], cp[i]]; onChange(cp);
  };
  const setField = (i: number, name: string, val: any) => onChange(items.map((it, idx) => idx === i ? { ...it, [name]: val } : it));

  return (
    <div className="field">
      {config.label && <label>{config.label}{config.required && <span className="req"> *</span>}</label>}
      <div className="rpt">
        {items.length === 0 && <div className="rpt-empty muted">Пока пусто — добавьте первую строку</div>}
        {items.map((item, i) => (
          <div className="rpt-item" key={i}>
            <div className="rpt-head">
              <span className="rpt-num">
                #{i + 1}{config.itemLabelKey && item[config.itemLabelKey] ? ` · ${item[config.itemLabelKey]}` : ''}
              </span>
              <div className="rpt-tools">
                {config.reorderable && (
                  <>
                    <button type="button" className="icon-btn" onClick={() => move(i, -1)} disabled={i === 0} style={{ transform: 'rotate(180deg)' }}><Icon.chevron size={16} /></button>
                    <button type="button" className="icon-btn" onClick={() => move(i, 1)} disabled={i === items.length - 1}><Icon.chevron size={16} /></button>
                  </>
                )}
                <button type="button" className="icon-btn" onClick={() => remove(i)} title="Удалить"><Icon.trash size={16} /></button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: cols === 2 ? '1fr 1fr' : '1fr', gap: '0 14px' }}>
              {sub.map((s) => (
                <div key={s.name} style={{ gridColumn: (s.colSpan ?? (s.type === 'textarea' ? 2 : 1)) === 2 ? '1 / -1' : 'auto' }}>
                  <FieldControl field={s} value={item[s.name]} onChange={(v) => setField(i, s.name, v)} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={add}>
        <Icon.plus size={15} /> {config.addActionLabel ?? 'Добавить'}
      </button>
      {config.hint && <span className="hint" style={{ marginTop: 8 }}>{config.hint}</span>}
    </div>
  );
}
