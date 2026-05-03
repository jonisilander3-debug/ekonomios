import type {
  WorkspaceDensity,
  WorkspaceLayout,
  WorkspaceRoleKey,
  WorkspaceRolePreset,
  WorkspaceWidgetId
} from './backoffice.types';

export const availableWorkspaceWidgetIds: WorkspaceWidgetId[] = [
  'invoices',
  'bookkeeping',
  'receipts',
  'customers',
  'time',
  'payroll',
  'bank',
  'calendar'
];

const SYSTEM_DEFAULT_ORDER: WorkspaceWidgetId[] = [
  'customers',
  'invoices',
  'bookkeeping',
  'receipts',
  'time',
  'payroll',
  'bank',
  'calendar'
];

const DEFAULT_DENSITY: WorkspaceDensity = 'normal';

export const systemWorkspaceLayoutPreset = createWorkspacePreset({
  presetSource: 'system',
  title: 'Systemets standard',
  widgetOrder: SYSTEM_DEFAULT_ORDER,
  hiddenWidgets: [],
  pinnedWidgets: [],
  widgetSizes: {},
  density: DEFAULT_DENSITY
});

export const workspaceRolePresets: Record<WorkspaceRoleKey, WorkspaceRolePreset> = {
  admin: createWorkspacePreset({
    roleKey: 'admin',
    presetSource: 'role',
    title: 'Standard for admin',
    widgetOrder: ['customers', 'bank', 'invoices', 'bookkeeping', 'calendar', 'receipts', 'time', 'payroll'],
    hiddenWidgets: [],
    pinnedWidgets: ['customers', 'bank', 'invoices'],
    widgetSizes: {
      customers: 'lg',
      bank: 'lg',
      invoices: 'md',
      bookkeeping: 'md'
    },
    density: 'normal'
  }),
  ekonomi: createWorkspacePreset({
    roleKey: 'ekonomi',
    presetSource: 'role',
    title: 'Standard for ekonomi',
    widgetOrder: ['customers', 'bank', 'bookkeeping', 'invoices', 'receipts', 'payroll', 'calendar', 'time'],
    hiddenWidgets: [],
    pinnedWidgets: ['customers', 'bank', 'bookkeeping', 'invoices'],
    widgetSizes: {
      customers: 'lg',
      bank: 'lg',
      bookkeeping: 'md',
      invoices: 'md'
    },
    density: 'normal'
  }),
  projektledare: createWorkspacePreset({
    roleKey: 'projektledare',
    presetSource: 'role',
    title: 'Standard for projektledare',
    widgetOrder: ['customers', 'time', 'calendar', 'invoices', 'receipts', 'bank', 'payroll', 'bookkeeping'],
    hiddenWidgets: ['bank', 'payroll', 'bookkeeping'],
    pinnedWidgets: ['customers', 'time'],
    widgetSizes: {
      customers: 'lg',
      time: 'md',
      calendar: 'md'
    },
    density: 'normal'
  })
};

export function createWorkspacePreset(input: {
  roleKey?: WorkspaceRoleKey;
  presetSource: 'role' | 'system';
  title: string;
  widgetOrder: WorkspaceWidgetId[];
  hiddenWidgets: WorkspaceWidgetId[];
  pinnedWidgets: WorkspaceWidgetId[];
  widgetSizes: Partial<Record<WorkspaceWidgetId, 'sm' | 'md' | 'lg'>>;
  density: WorkspaceDensity;
}): WorkspaceRolePreset {
  const layout = normalizeWorkspaceLayout({
    widgetOrder: input.widgetOrder,
    hiddenWidgets: input.hiddenWidgets,
    pinnedWidgets: input.pinnedWidgets,
    widgetSizes: input.widgetSizes,
    density: input.density,
    updatedAt: now()
  });

  return {
    ...layout,
    roleKey: input.roleKey,
    presetSource: input.presetSource,
    title: input.title
  };
}

export function normalizeWorkspaceLayout(layout: WorkspaceLayout): WorkspaceLayout {
  const normalizeLegacyWidgetId = (item: string) => (item === 'projects' ? 'customers' : item);
  const uniqueVisible = Array.from(new Set(layout.widgetOrder.map((item) => normalizeLegacyWidgetId(item)))).filter((item): item is WorkspaceWidgetId =>
    availableWorkspaceWidgetIds.includes(item as WorkspaceWidgetId)
  );
  const remaining = availableWorkspaceWidgetIds.filter((item) => !uniqueVisible.includes(item));
  const hiddenWidgets = Array.from(new Set(layout.hiddenWidgets.map((item) => normalizeLegacyWidgetId(item)))).filter((item): item is WorkspaceWidgetId =>
    availableWorkspaceWidgetIds.includes(item as WorkspaceWidgetId)
  );
  const pinnedWidgets = Array.from(new Set(layout.pinnedWidgets.map((item) => normalizeLegacyWidgetId(item)))).filter((item): item is WorkspaceWidgetId =>
    availableWorkspaceWidgetIds.includes(item as WorkspaceWidgetId)
  );
  const widgetSizes = Object.fromEntries(
    Object.entries(layout.widgetSizes).map(([key, value]) => [normalizeLegacyWidgetId(key), value]).filter(([key, value]) =>
      availableWorkspaceWidgetIds.includes(key as WorkspaceWidgetId) &&
      (value === 'sm' || value === 'md' || value === 'lg')
    )
  ) as Partial<Record<WorkspaceWidgetId, 'sm' | 'md' | 'lg'>>;

  return {
    widgetOrder: [...uniqueVisible, ...remaining],
    hiddenWidgets,
    pinnedWidgets,
    widgetSizes,
    density: layout.density,
    updatedAt: layout.updatedAt
  };
}

function now() {
  return new Date().toISOString();
}
