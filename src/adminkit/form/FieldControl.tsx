'use client';
import React from 'react';
import { TextInput as TI, Textarea as TA, NumberInput as NI, Select as SEL, Toggle as TG } from '@/adminkit/ui/fields';
import { SearchableSelect } from '@/adminkit/ui/Combobox';
import { FileUpload as FileUploadCtrl, UploadedFile } from '@/adminkit/ui/FileUpload';
import type { FieldConfig } from './fields';

/** Рендерит ОДНО поле по его конфигу. Не знает про загрузку remote-опций — их передают через options. */
export function FieldControl({ field: f, value, error, onChange, options, placeholder, disabled }: {
  field: FieldConfig;
  value: any;
  error?: string;
  onChange: (v: any) => void;
  options?: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
}) {
  const common = { label: f.label ?? f.name, required: f.required, hint: f.hint, error, disabled: disabled ?? f.disabled };
  switch (f.type) {
    case 'textarea':
      return <TA {...common} rows={f.rows} placeholder={f.placeholder} value={value} onChange={(e) => onChange(e.target.value)} />;
    case 'number':
      return <NI {...common} placeholder={f.placeholder} value={value} min={f.min} max={f.max} onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))} />;
    case 'select': {
      const opts = options ?? f.options ?? [];
      const ph = placeholder ?? f.placeholder ?? '— выбрать —';
      return f.searchable
        ? <SearchableSelect {...common} placeholder={ph} options={opts} value={value} onChange={onChange} />
        : <SEL {...common} placeholder={ph} options={opts} value={value} onChange={(e) => onChange(e.target.value)} />;
    }
    case 'toggle':
    case 'checkbox':
      return <div style={{ marginTop: 8 }}><TG label={f.label ?? f.name} hint={f.hint} checked={!!value} onChange={onChange} /></div>;
    case 'tags':
      return <TI {...common} placeholder={f.placeholder ?? 'через запятую'} value={Array.isArray(value) ? value.join(', ') : value} onChange={(e) => onChange(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} />;
    case 'date':
      return <TI {...common} type="date" value={value} onChange={(e) => onChange(e.target.value)} />;
    case 'file':
      return <FileUploadCtrl label={common.label} hint={f.hint} multiple={f.multiple} accept={f.accept} maxFiles={f.maxFiles} maxSizeMB={f.maxSizeMB} value={value as UploadedFile[]} onChange={onChange} />;
    default:
      return <TI {...common} placeholder={f.placeholder} value={value} onChange={(e) => onChange(e.target.value)} />;
  }
}
