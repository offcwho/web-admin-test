'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { useAdminKit } from './config';
import { AdminLayout } from './layout';
import { SchemaTable } from './table/SchemaTable';
import { SchemaForm, FormValues } from './form/SchemaForm';
import { AnyAction, Action, EditAction, DeleteAction } from './table/columns';
import { resolveFileUploads, hydrateFileFields } from './storage';
import { Button, Icon } from '@/adminkit/ui/primitives';
import { RecordView } from './show/RecordView';
import { StatusFlow } from './show/StatusFlow';
import { ResourceConfig } from './resource.config';

const genId = () => Math.random().toString(36).slice(2, 9);

export function ResourcePage<T extends Record<string, any>>({ resource }: { resource: ResourceConfig<T> }) {
  const { api, config, storage } = useAdminKit();
  const pk = resource.primaryKey ?? 'id';
  const statusField = resource.statusField ?? 'status';
  const demo = !!config.demo;
  const hasForm = !!resource.form;
  const hasView = !!(resource.infolist || resource.statuses);

  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [viewing, setViewing] = useState<T | null>(null);
  const [busy, setBusy] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      if (demo) { setRows(resource.demoData ?? []); }
      else {
        const data: any = await api.get(resource.endpoint);
        setRows(Array.isArray(data) ? data : data.items ?? []);
      }
    } catch (e: any) { setError(e?.message || 'Ошибка загрузки'); }
    finally { setLoading(false); }
  }, [api, demo, resource]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setOpen(true); };
  const openEdit = (row: T) => { setEditing(row); setOpen(true); };

  const submit = async (values: FormValues) => {
    if (!resource.form) return;
    setBusy(true);
    try {
      const resolved = await resolveFileUploads(values, resource.form(), { storage, api });
      const payload = resource.fromFormValues ? resource.fromFormValues(resolved) : resolved;
      if (demo) {
        if (editing) setRows((r) => r.map((x) => x[pk] === editing[pk] ? { ...x, ...payload } : x));
        else setRows((r) => [{ [pk]: genId(), ...payload } as T, ...r]);
      } else {
        if (editing) await api.patch(`${resource.endpoint}/${editing[pk]}`, payload);
        else await api.post(resource.endpoint, payload);
        await load();
      }
      setOpen(false);
    } catch (e: any) { alert(e?.message || 'Ошибка сохранения'); }
    finally { setBusy(false); }
  };

  const remove = async (row: T) => {
    if (!confirm(`Удалить ${resource.singular ?? 'запись'}?`)) return;
    if (demo) setRows((r) => r.filter((x) => x[pk] !== row[pk]));
    else { await api.delete(`${resource.endpoint}/${row[pk]}`); await load(); }
  };

  // смена статуса из окна просмотра
  const changeStatus = async (next: string) => {
    if (!viewing) return;
    setStatusBusy(true);
    try {
      if (demo) {
        setRows((r) => r.map((x) => x[pk] === viewing[pk] ? { ...x, [statusField]: next } : x));
      } else {
        await api.patch(`${resource.endpoint}/${viewing[pk]}`, { [statusField]: next });
        await load();
      }
      setViewing((v) => (v ? ({ ...v, [statusField]: next } as T) : v));
    } catch (e: any) { alert(e?.message || 'Ошибка смены статуса'); }
    finally { setStatusBusy(false); }
  };

  const actions: AnyAction[] = [
    ...(hasView ? [Action.make('view').label('Просмотр').icon('eye').action((r: T) => setViewing(r))] : []),
    ...(hasForm ? [EditAction.make().action(openEdit)] : []),
    ...(resource.rowActions ?? []),
    DeleteAction.make().action(remove),
  ];

  const baseValues = editing ? (resource.toFormValues ? resource.toFormValues(editing) : (editing as any)) : undefined;
  const initialValues = (baseValues && resource.form) ? hydrateFileFields(baseValues, resource.form(), storage) : baseValues;

  return (
    <AdminLayout
      title={resource.label}
      actions={hasForm ? <Button onClick={openCreate}><Icon.plus size={16} /> Добавить</Button> : undefined}
    >
      {error && <div className="err" style={{ marginBottom: 12 }}>{error}</div>}
      {loading ? (
        <div className="card" style={{ padding: 28, color: 'var(--muted)' }}>Загрузка…</div>
      ) : (
        <SchemaTable<T> columns={resource.columns()} data={rows} rowKey={(r) => String(r[pk])} actions={actions} />
      )}

      {/* ===== создание / редактирование ===== */}
      {open && hasForm && (
        <div className="overlay" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editing ? `Редактировать ${resource.singular ?? ''}` : `Новый ${resource.singular ?? 'элемент'}`}</h3>
            <SchemaForm
              schema={resource.form!()}
              initialValues={initialValues as FormValues}
              busy={busy}
              onSubmit={submit}
              onCancel={() => setOpen(false)}
            />
          </div>
        </div>
      )}

      {/* ===== просмотр записи + статусный воркфлоу ===== */}
      {viewing && (
        <div className="overlay" onClick={() => setViewing(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0 }}>Просмотр {resource.singular ?? ''}</h3>
              <button className="icon-btn" onClick={() => setViewing(null)}><Icon.x size={18} /></button>
            </div>
            {resource.statuses && (
              <div style={{ margin: '18px 0' }}>
                <StatusFlow
                  statuses={resource.statuses}
                  value={String(viewing[statusField] ?? resource.statuses[0]?.value)}
                  onChange={changeStatus}
                  busy={statusBusy}
                />
              </div>
            )}

            {resource.infolist && <RecordView entries={resource.infolist()} row={viewing} />}

            {hasForm && (
              <div className="modal-actions">
                <Button variant="ghost" onClick={() => { const v = viewing; setViewing(null); openEdit(v); }}>
                  <Icon.pencil size={15} /> Редактировать
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
