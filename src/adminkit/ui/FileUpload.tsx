'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from './primitives';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  url: string;       // object URL for preview (or remote url)
  file?: File;       // present for newly added files
}

export interface FileUploadProps {
  label?: string;
  hint?: string;
  /** включает множественный выбор — тот самый "атрибут" */
  multiple?: boolean;
  /** напр. "image/*" или "image/png,image/jpeg" */
  accept?: string;
  /** максимум файлов (только при multiple) */
  maxFiles?: number;
  /** максимальный размер одного файла, МБ */
  maxSizeMB?: number;
  /** показывать бейдж "Обложка" на первом изображении */
  coverBadge?: boolean;
  value?: UploadedFile[];
  onChange?: (files: UploadedFile[]) => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);
const fmt = (b: number) => b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`;

export function FileUpload({
  label, hint, multiple = false, accept = 'image/*',
  maxFiles = 8, maxSizeMB = 5, coverBadge = true, value, onChange,
}: FileUploadProps) {
  const [internal, setInternal] = useState<UploadedFile[]>([]);
  const files = value ?? internal;
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const created = useRef<string[]>([]);

  const set = useCallback((next: UploadedFile[]) => {
    if (!value) setInternal(next);
    onChange?.(next);
  }, [value, onChange]);

  // cleanup object URLs created here
  useEffect(() => () => { created.current.forEach((u) => URL.revokeObjectURL(u)); }, []);

  const accepts = (f: File) => {
    if (!accept || accept === '*') return true;
    return accept.split(',').some((a) => {
      a = a.trim();
      if (a.endsWith('/*')) return f.type.startsWith(a.slice(0, -1));
      return f.type === a;
    });
  };

  const add = useCallback((list: FileList | File[]) => {
    setError('');
    const incoming = Array.from(list);
    const valid: UploadedFile[] = [];
    for (const f of incoming) {
      if (!accepts(f)) { setError(`Файл "${f.name}" не подходит по типу (${accept})`); continue; }
      if (f.size > maxSizeMB * 1048576) { setError(`Файл "${f.name}" больше ${maxSizeMB} МБ`); continue; }
      const url = URL.createObjectURL(f);
      created.current.push(url);
      valid.push({ id: uid(), name: f.name, size: f.size, url, file: f });
    }
    if (!valid.length) return;
    if (!multiple) { set([valid[0]]); return; }
    const merged = [...files, ...valid].slice(0, maxFiles);
    if (files.length + valid.length > maxFiles) setError(`Максимум ${maxFiles} файлов`);
    set(merged);
  }, [accept, files, maxFiles, maxSizeMB, multiple, set]);

  const remove = (id: string) => set(files.filter((f) => f.id !== id));

  return (
    <div className="field">
      {label && <label>{label}</label>}
      <div
        className={`dropzone ${drag ? 'drag' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); add(e.dataTransfer.files); }}
      >
        <div className="big">
          <Icon.upload size={26} />
          <div><b>Нажмите для загрузки</b> или перетащите сюда</div>
          <div style={{ fontSize: 12 }}>
            {accept} · до {maxSizeMB} МБ{multiple ? ` · до ${maxFiles} файлов` : ' · один файл'}
          </div>
        </div>
        <input
          ref={inputRef} type="file" hidden
          multiple={multiple} accept={accept}
          onChange={(e) => { if (e.target.files) add(e.target.files); e.target.value = ''; }}
        />
      </div>

      {error && <span className="err" style={{ marginTop: 8 }}>{error}</span>}
      {hint && !error && <span className="hint" style={{ marginTop: 8 }}>{hint}</span>}

      {files.length > 0 && (
        <div className="dz-grid">
          {files.map((f, i) => (
            <div className="dz-item" key={f.id}>
              {coverBadge && multiple && i === 0 && <span className="cover">Обложка</span>}
              <img src={f.url} alt={f.name} />
              <button type="button" className="rm" title="Удалить" onClick={() => remove(f.id)}><Icon.x size={14} /></button>
              <div className="meta">{f.name} · {fmt(f.size)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
