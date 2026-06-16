export interface Api {
  get<T = any>(path: string): Promise<T>;
  post<T = any>(path: string, body?: any): Promise<T>;
  patch<T = any>(path: string, body?: any): Promise<T>;
  delete<T = any>(path: string): Promise<T>;
  upload<T = any>(path: string, form: FormData): Promise<T>;
  baseUrl(): string;
}

export function createApi(getBase: () => string, getToken: () => string | null): Api {
  async function req(method: string, path: string, body?: any) {
    const base = getBase().replace(/\/$/, '');
    const token = getToken();
    const res = await fetch(base + path, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      let msg: any;
      try { msg = (await res.json()).message; } catch {}
      const err: any = new Error(Array.isArray(msg) ? msg.join(', ') : msg || `HTTP ${res.status}`);
      err.status = res.status;
      throw err;
    }
    if (res.status === 204) return undefined as any;
    const ct = res.headers.get('content-type') || '';
    return ct.includes('json') ? res.json() : (res.text() as any);
  }
  async function upload(path: string, form: FormData) {
    const base = getBase().replace(/\/$/, '');
    const token = getToken();
    const res = await fetch(base + path, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }, // без Content-Type: браузер сам выставит boundary
      body: form,
    });
    if (!res.ok) {
      let msg: any;
      try { msg = (await res.json()).message; } catch {}
      const err: any = new Error(Array.isArray(msg) ? msg.join(', ') : msg || `HTTP ${res.status}`);
      err.status = res.status;
      throw err;
    }
    const ct = res.headers.get('content-type') || '';
    return ct.includes('json') ? res.json() : (res.text() as any);
  }
  return {
    get: (p) => req('GET', p),
    post: (p, b) => req('POST', p, b),
    patch: (p, b) => req('PATCH', p, b),
    delete: (p) => req('DELETE', p),
    upload,
    baseUrl: getBase,
  };
}
