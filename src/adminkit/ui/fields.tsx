'use client';
import React from 'react';

function Field({ label, required, hint, error, children }: { label?: string; required?: boolean; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="field">
      {label && <label>{label}{required && <span className="req"> *</span>}</label>}
      {children}
      {error ? <span className="err">{error}</span> : hint ? <span className="hint">{hint}</span> : null}
    </div>
  );
}

type Base = { label?: string; required?: boolean; hint?: string; error?: string };

export function TextInput({ label, required, hint, error, ...rest }: Base & React.InputHTMLAttributes<HTMLInputElement>) {
  return <Field label={label} required={required} hint={hint} error={error}><input className="control" {...rest} /></Field>;
}

export function Textarea({ label, required, hint, error, ...rest }: Base & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <Field label={label} required={required} hint={hint} error={error}><textarea className="control" {...rest} /></Field>;
}

export function NumberInput({ label, required, hint, error, ...rest }: Base & React.InputHTMLAttributes<HTMLInputElement>) {
  return <Field label={label} required={required} hint={hint} error={error}><input type="number" className="control" {...rest} /></Field>;
}

export function Select({ label, required, hint, error, options, placeholder, ...rest }: Base & React.SelectHTMLAttributes<HTMLSelectElement> & { options: { value: string; label: string }[]; placeholder?: string }) {
  return (
    <Field label={label} required={required} hint={hint} error={error}>
      <select className="control" {...rest}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </Field>
  );
}

export function Toggle({ label, hint, checked, onChange }: { label?: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <Field hint={hint}>
      <div className={`toggle ${checked ? 'on' : ''}`} onClick={() => onChange(!checked)}>
        <span className="track"><span className="knob" /></span>
        {label && <span style={{ fontSize: 14 }}>{label}</span>}
      </div>
    </Field>
  );
}
