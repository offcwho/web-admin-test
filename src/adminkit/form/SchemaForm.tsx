'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/adminkit/ui/primitives';
import { useAdminKit } from '../config';
import { FieldControl } from './FieldControl';
import { RepeaterControl } from './Repeater';
import { slugify } from './slug';
import { resolveFileUploads } from '../storage';
import type { AnyField, FieldConfig } from './fields';

export type FormValues = Record<string, any>;

function initial(fields: FieldConfig[], initialValues?: FormValues): FormValues {
  const v: FormValues = {};
  for (const f of fields) {
    v[f.name] = initialValues?.[f.name] ??
      f.default ??
      (f.type === 'toggle' || f.type === 'checkbox' ? false
        : f.type === 'file' || f.type === 'tags' ? []
        : f.type === 'repeater' ? Array.from({ length: f.defaultItems ?? 0 }, () => blankItem(f.schema ?? []))
        : '');
  }
  return v;
}

function blankItem(sub: FieldConfig[]): Record<string, any> {
  const o: Record<string, any> = {};
  for (const s of sub) o[s.name] = s.default ?? (s.type === 'toggle' || s.type === 'checkbox' ? false : s.type === 'file' || s.type === 'tags' ? [] : '');
  return o;
}

export function SchemaForm({
  schema, initialValues, columns = 2, submitLabel = 'Сохранить', onSubmit, onCancel, busy,
}: {
  schema: AnyField[];
  initialValues?: FormValues;
  columns?: 1 | 2;
  submitLabel?: string;
  onSubmit: (values: FormValues) => void;
  onCancel?: () => void;
  busy?: boolean;
}) {
  const fields = useMemo(() => schema.map((f) => f.config), [schema]);
  const { api, storage } = useAdminKit();
  const [values, setValues] = useState<FormValues>(() => initial(fields, initialValues));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [remoteOptions, setRemoteOptions] = useState<Record<string, { value: string; label: string }[]>>({});
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [uploading, setUploading] = useState(false);
  useEffect(() => { setValues(initial(fields, initialValues)); setErrors({}); }, [initialValues]); // eslint-disable-line

  // 1) независимые селекты — грузим один раз
  useEffect(() => {
    let alive = true;
    const toLoad = fields.filter((f) => f.type === 'select' && !f.dependsOn && (f.optionsEndpoint || f.loadOptions));
    if (!toLoad.length) return;
    (async () => {
      const entries = await Promise.all(toLoad.map(async (f) => {
        try {
          if (f.loadOptions) return [f.name, await f.loadOptions(api)] as const;
          const ep = f.optionsEndpoint!;
          const data: any = await api.get(ep.path);
          const list: any[] = Array.isArray(data) ? data : (data.items ?? []);
          return [f.name, list.map((r) => ({ value: String(r[ep.valueKey]), label: String(r[ep.labelKey]) }))] as const;
        } catch { return [f.name, [] as { value: string; label: string }[]] as const; }
      }));
      if (alive) setRemoteOptions((o) => ({ ...o, ...Object.fromEntries(entries) }));
    })();
    return () => { alive = false; };
  }, [fields, api]);

  // 2) зависимые селекты — перезагружаем при смене родителя, выбор сбрасываем
  const dependents = useMemo(() => fields.filter((f) => f.type === 'select' && f.dependsOn && (f.optionsEndpoint || f.loadOptions)), [fields]);
  const depKey = dependents.map((f) => String(values[f.dependsOn!] ?? '')).join('|');
  const prevParent = useRef<Record<string, any>>({});
  useEffect(() => {
    let alive = true;
    dependents.forEach(async (f) => {
      const parentVal = values[f.dependsOn!];
      const prev = prevParent.current[f.name];
      prevParent.current[f.name] = parentVal;
      if (prev !== undefined && prev !== parentVal) setValues((v) => ({ ...v, [f.name]: '' })); // родитель сменился -> сброс
      if (parentVal === '' || parentVal == null) { if (alive) setRemoteOptions((o) => ({ ...o, [f.name]: [] })); return; }
      try {
        let opts: { value: string; label: string }[];
        if (f.loadOptions) opts = await f.loadOptions(api, values);
        else {
          const ep = f.optionsEndpoint!;
          const sep = ep.path.includes('?') ? '&' : '?';
          const data: any = await api.get(`${ep.path}${sep}${f.dependsParam}=${encodeURIComponent(parentVal)}`);
          const list: any[] = Array.isArray(data) ? data : (data.items ?? []);
          opts = list.map((r) => ({ value: String(r[ep.valueKey]), label: String(r[ep.labelKey]) }));
        }
        if (alive) setRemoteOptions((o) => ({ ...o, [f.name]: opts }));
      } catch { if (alive) setRemoteOptions((o) => ({ ...o, [f.name]: [] })); }
    });
    return () => { alive = false; };
  }, [depKey]); // eslint-disable-line

  // 3) автозаполнение slug из другого поля (пока slug не отредактировали вручную)
  const slugFields = useMemo(() => fields.filter((f) => f.slugFrom), [fields]);
  const lastAuto = useRef<Record<string, string>>({});
  useEffect(() => { lastAuto.current = {}; }, [initialValues]); // сброс при открытии другой записи
  const slugSrcKey = slugFields.map((f) => String(values[f.slugFrom!] ?? '')).join('|');
  useEffect(() => {
    slugFields.forEach((f) => {
      const target = slugify(String(values[f.slugFrom!] ?? ''));
      const cur = values[f.name];
      // авто, пока поле пустое или совпадает с прошлым авто-значением; иначе пользователь правил вручную
      if (cur === '' || cur === lastAuto.current[f.name]) {
        lastAuto.current[f.name] = target;
        setValues((v) => (v[f.name] === target ? v : { ...v, [f.name]: target }));
      }
    });
  }, [slugSrcKey]); // eslint-disable-line

  const set = (name: string, val: any) => setValues((v) => ({ ...v, [name]: val }));

  const validate = () => {
    const e: Record<string, string> = {};
    for (const f of fields) for (const rule of f.rules) {
      const msg = rule(values[f.name], values);
      if (msg) { e[f.name] = msg; break; }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    try {
      setUploading(true);
      setProgress({});
      // заливаем новые файлы (с прогрессом) -> в values уже строки (string[] / string)
      const resolved = await resolveFileUploads(values, schema, {
        storage, api,
        onProgress: (_field, id, percent) => setProgress((m) => ({ ...m, [id]: percent })),
      });
      onSubmit(resolved);
    } catch (e: any) {
      alert(e?.message || 'Ошибка загрузки файлов');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: columns === 2 ? '1fr 1fr' : '1fr', gap: '0 16px' }}>
        {fields.map((f) => {
          const span = (f.colSpan ?? (f.type === 'textarea' || f.type === 'file' || f.type === 'repeater' ? 2 : 1));
          const wrap = (node: React.ReactNode) => <div key={f.name} style={{ gridColumn: span === 2 ? '1 / -1' : 'auto' }}>{node}</div>;

          if (f.type === 'repeater')
            return wrap(<RepeaterControl config={f} value={values[f.name]} onChange={(v) => set(f.name, v)} />);

          if (f.type === 'select') {
            const isRemote = !f.options && !!(f.optionsEndpoint || f.loadOptions);
            const opts = f.options ?? remoteOptions[f.name] ?? [];
            const loading = isRemote && remoteOptions[f.name] === undefined;
            const waitingParent = !!f.dependsOn && !values[f.dependsOn];
            const disabled = f.disabled || waitingParent;
            const ph = waitingParent ? 'Сначала выберите выше' : loading ? 'Загрузка…' : (f.placeholder ?? '— выбрать —');
            return wrap(<FieldControl field={f} value={values[f.name]} error={errors[f.name]} onChange={(v) => set(f.name, v)} options={opts} placeholder={ph} disabled={disabled} />);
          }

          return wrap(<FieldControl field={f} value={values[f.name]} error={errors[f.name]} onChange={(v) => set(f.name, v)} progress={progress} />);
        })}
      </div>
      <div className="modal-actions">
        {onCancel && <Button variant="ghost" onClick={onCancel} disabled={busy || uploading}>Отмена</Button>}
        <Button onClick={submit} disabled={busy || uploading}>
          {uploading ? 'Загрузка файлов…' : busy ? 'Сохранение…' : submitLabel}
        </Button>
      </div>
    </div>
  );
}
