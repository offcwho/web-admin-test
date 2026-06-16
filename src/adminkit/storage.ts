import type { Api } from './api';
import type { AnyField } from './form/fields';
import type { UploadedFile } from '@/adminkit/ui/FileUpload';

/** Сменное хранилище картинок. upload() возвращает строку (имя/URL), которая уходит на бэк. */
export interface StorageAdapter {
  upload(file: File, api: Api, onProgress?: (percent: number) => void): Promise<string>;
  /** как превратить сохранённую строку в URL для превью (по умолчанию — она же) */
  resolveUrl?(value: string): string;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

/**
 * Хранит файлы прямо в самой админке (data URL в localStorage).
 * На бэк уходит ТОЛЬКО имя. Удобно для прототипа/демо без бэкенда.
 * Внимание: localStorage ~5 МБ — для тяжёлых картинок используй backendStorageAdapter.
 */
export function localStorageAdapter(prefix = 'adminkit_file_'): StorageAdapter {
  return {
    async upload(file) {
      const name = `${Date.now()}-${file.name}`;
      try { window.localStorage.setItem(prefix + name, await fileToDataUrl(file)); } catch {}
      return name;
    },
    resolveUrl(value) {
      if (/^(https?:|data:|blob:|\/)/.test(value)) return value; // уже URL
      try { return window.localStorage.getItem(prefix + value) ?? value; } catch { return value; }
    },
  };
}

/**
 * Загружает файл на бэк (multipart/form-data) и возвращает имя/URL из ответа.
 * endpoint — куда слать (POST), field — имя поля, responseKey — что взять из JSON-ответа.
 */
export function backendStorageAdapter(opts: { endpoint?: string; field?: string; responseKey?: string } = {}): StorageAdapter {
  const { endpoint = '/uploads', field = 'file', responseKey = 'url' } = opts;
  return {
    async upload(file, api) {
      const fd = new FormData();
      fd.append(field, file);
      const r: any = await api.upload(endpoint, fd);
      return r?.[responseKey] ?? r?.url ?? r?.name ?? String(r);
    },
    resolveUrl: (v) => v,
  };
}

const isUploaded = (x: any): x is UploadedFile => x && typeof x === 'object' && 'url' in x;

/** string | string[]  ->  UploadedFile[] — чтобы при редактировании показать уже сохранённые картинки */
export function hydrateFileFields(values: Record<string, any>, schema: AnyField[], storage: StorageAdapter): Record<string, any> {
  const out = { ...values };
  for (const f of schema) {
    const c = f.config;
    if (c.type !== 'file') continue;
    const adapter = c.storage ?? storage;
    const raw = out[c.name];
    const arr = Array.isArray(raw) ? raw : raw ? [raw] : [];
    out[c.name] = arr.map((item: any, i: number) =>
      isUploaded(item)
        ? item
        : { id: `h${i}-${Date.now()}`, name: String(item), size: 0, url: adapter.resolveUrl?.(String(item)) ?? String(item) }
    );
  }
  return out;
}

/**
 * UploadedFile[]  ->  string[] (если multiple) | string | null.
 * Новые файлы заливаются через адаптер, уже сохранённые строки переиспользуются.
 */
export async function resolveFileUploads(
  values: Record<string, any>,
  schema: AnyField[],
  ctx: { storage: StorageAdapter; api: Api; onProgress?: (field: string, fileId: string, percent: number) => void },
): Promise<Record<string, any>> {
  const out = { ...values };
  for (const f of schema) {
    const c = f.config;
    if (c.type !== 'file') continue;
    const adapter = c.storage ?? ctx.storage;
    const arr: UploadedFile[] = Array.isArray(out[c.name]) ? out[c.name] : [];
    const names: string[] = [];
    for (const uf of arr) {
      if (uf.file) names.push(await adapter.upload(uf.file, ctx.api, (p) => ctx.onProgress?.(c.name, uf.id, p))); // новый файл -> залить
      else names.push(uf.name);                                                                                  // уже сохранённая строка
    }
    out[c.name] = c.multiple ? names : (names[0] ?? null);
  }
  return out;
}

/* =========================================================================
 *  Дополнительные провайдеры загрузки. StorageAdapter — это просто объект с
 *  upload(file, api) -> строка (URL/имя). Добавляй свои по этому же образцу.
 * ========================================================================= */

/**
 * Vercel Blob: файл грузится напрямую в облако Vercel (минуя твой бэк), на бэк уходит URL.
 * Пакет @vercel/blob НЕ импортируется китом — ты передаёшь клиентскую функцию upload сам,
 * чтобы не плодить зависимость. В своём приложении:
 *   import { upload } from '@vercel/blob/client';
 *   storage: vercelBlobStorageAdapter({ upload, handleUploadUrl: '/upload' })
 */
export function vercelBlobStorageAdapter(opts: {
  upload: (pathname: string, file: File, options: any) => Promise<{ url: string }>;
  handleUploadUrl?: string;
  prefix?: string;
}): StorageAdapter {
  const { upload, handleUploadUrl = '/upload', prefix = '' } = opts;
  return {
    async upload(file, _api, onProgress) {
      const pathname = `${prefix}${prefix && !prefix.endsWith('/') ? '/' : ''}${file.name}`;
      const blob = await upload(pathname, file, {
        access: 'public',
        handleUploadUrl,
        onUploadProgress: (e: { percentage: number }) => onProgress?.(Math.round(e.percentage)),
      });
      return blob.url; // <- строка-ссылка уходит в payload (images: string[] / cover: string)
    },
    resolveUrl: (v) => v,
  };
}

/**
 * Шаблон под S3 (и любое presigned-хранилище): просим у бэка временный URL,
 * грузим файл прямым PUT, возвращаем публичную ссылку.
 * Бэк должен отдавать { uploadUrl, publicUrl } на GET <presignPath>?name=&type=
 *   storage: presignedStorageAdapter({ presignPath: '/uploads/presign' })
 */
export function presignedStorageAdapter(opts: { presignPath?: string } = {}): StorageAdapter {
  const { presignPath = '/uploads/presign' } = opts;
  return {
    async upload(file, api) {
      const q = `?name=${encodeURIComponent(file.name)}&type=${encodeURIComponent(file.type)}`;
      const { uploadUrl, publicUrl }: any = await api.get(`${presignPath}${q}`);
      const res = await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
      if (!res.ok) throw new Error('Не удалось загрузить файл в хранилище');
      return publicUrl;
    },
    resolveUrl: (v) => v,
  };
}
