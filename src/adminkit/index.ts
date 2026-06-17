// провайдер и доступ к конфигу
export { AdminKitProvider, useAdminKit, normalizeNav } from './config';
export type { AdminKitConfig } from './config';
export { AdminLayout } from './layout';
export type { Api } from './api';

// тема (светлая/тёмная, акцент)
export { ThemeProvider, useTheme } from './theme';
export type { ThemeConfig, ThemeMode } from './theme';

// оболочка / типы навигации
export type { NavItem, NavGroup, LayoutShow, Workspace } from './ui/AdminShell';

// UI-примитивы
export { Button, Badge, Card, Icon } from './ui/primitives';

// главная: дашборд и виджеты
export { Dashboard } from './ui/Dashboard';
export type { DashboardWidget } from './ui/Dashboard';
export { StatCard, ProgressBreakdown, RecentActivity } from './ui/widgets';
export type { ActivityItem } from './ui/widgets';

// просмотр записи (infolist) + статусный воркфлоу
export { TextEntry, BadgeEntry, MoneyEntry, DateEntry } from './show/entries';
export type { EntryConfig, AnyEntry } from './show/entries';
export { RecordView } from './show/RecordView';
export { StatusFlow } from './show/StatusFlow';
export type { StatusStep } from './show/StatusFlow';

// хранилище картинок (загрузка)
export { localStorageAdapter, backendStorageAdapter, vercelBlobStorageAdapter, presignedStorageAdapter, resolveFileUploads, hydrateFileFields } from './storage';
export type { StorageAdapter } from './storage';

// авторизация
export { AuthProvider, useAuth, RequireAuth, LoginScreen, jwtAuth, demoAuth } from './auth';
export type { AuthBackend, AuthUser, TokenStore } from './auth';

// формы (декларативные схемы)
export { TextInput, Textarea, NumberInput, Select, Toggle, Checkbox, DatePicker, TagsInput, FileUpload, Repeater } from './form/fields';
export type { FieldConfig, Validator, UploadedFile } from './form/fields';
export { SchemaForm } from './form/SchemaForm';
export { slugify } from './form/slug';
export type { FormValues } from './form/SchemaForm';

// таблицы (декларативные колонки + действия)
export { TextColumn, BadgeColumn, ImageColumn, IconColumn, Action, EditAction, DeleteAction } from './table/columns';
export type { ColumnConfig, ActionConfig, BadgeColor } from './table/columns';
export { SchemaTable } from './table/SchemaTable';

// ресурсы (CRUD из коробки)
export { createResource } from './resource.config';
export type { ResourceConfig } from './resource.config';
export { ResourcePage } from './resource';
