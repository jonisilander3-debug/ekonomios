import type { DashboardRole } from '@/features/platform-data/types';

import type {
  ResolvedWorkspaceLayout,
  WorkspaceCustomizationDraft,
  WorkspaceDensity,
  WorkspaceLayout,
  WorkspaceLayoutPreset,
  WorkspaceWidgetId
} from './workspace-layout.types';

export const workspaceWidgetCatalog: WorkspaceWidgetId[] = [
  'invoices',
  'bookkeeping',
  'receipts',
  'customers',
  'time',
  'payroll',
  'bank',
  'calendar'
];

const defaultDensity: WorkspaceDensity = 'normal';

export const systemWorkspaceLayoutPreset: WorkspaceLayoutPreset = createWorkspaceLayoutPreset({
  presetSource: 'system',
  title: 'Systemets standard',
  widgetOrder: ['customers', 'bank', 'invoices', 'bookkeeping', 'calendar', 'receipts', 'time', 'payroll'],
  hiddenWidgets: [],
  pinnedWidgets: ['customers', 'invoices'],
  widgetSizes: {
    customers: 'lg',
    bank: 'lg',
    invoices: 'md'
  },
  density: defaultDensity
});

export const roleWorkspaceLayoutPresets: Record<DashboardRole, WorkspaceLayoutPreset> = {
  admin: createWorkspaceLayoutPreset({
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
  ekonomi: createWorkspaceLayoutPreset({
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
  projektledare: createWorkspaceLayoutPreset({
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

export function createWorkspaceLayoutPreset(input: {
  roleKey?: DashboardRole;
  presetSource: 'role' | 'system';
  title: string;
  widgetOrder: WorkspaceWidgetId[];
  hiddenWidgets: WorkspaceWidgetId[];
  pinnedWidgets: WorkspaceWidgetId[];
  widgetSizes: Partial<Record<WorkspaceWidgetId, 'sm' | 'md' | 'lg'>>;
  density: WorkspaceDensity;
}): WorkspaceLayoutPreset {
  return {
    roleKey: input.roleKey,
    presetSource: input.presetSource,
    title: input.title,
    ...normalizeWorkspaceLayout({
      widgetOrder: input.widgetOrder,
      hiddenWidgets: input.hiddenWidgets,
      pinnedWidgets: input.pinnedWidgets,
      widgetSizes: input.widgetSizes,
      density: input.density,
      updatedAt: now()
    })
  };
}

export function normalizeWorkspaceLayout(layout: WorkspaceLayout): WorkspaceLayout {
  const normalizeLegacyWidgetId = (item: string) => (item === 'projects' ? 'customers' : item);
  const widgetOrder = Array.from(new Set(layout.widgetOrder.map((item) => normalizeLegacyWidgetId(item)))).filter((item): item is WorkspaceWidgetId =>
    workspaceWidgetCatalog.includes(item as WorkspaceWidgetId)
  );
  const hiddenWidgets = Array.from(new Set(layout.hiddenWidgets.map((item) => normalizeLegacyWidgetId(item)))).filter((item): item is WorkspaceWidgetId =>
    workspaceWidgetCatalog.includes(item as WorkspaceWidgetId)
  );
  const pinnedWidgets = Array.from(new Set(layout.pinnedWidgets.map((item) => normalizeLegacyWidgetId(item)))).filter((item): item is WorkspaceWidgetId =>
    workspaceWidgetCatalog.includes(item as WorkspaceWidgetId)
  );
  const widgetSizes = Object.fromEntries(
    Object.entries(layout.widgetSizes).map(([key, value]) => [normalizeLegacyWidgetId(key), value]).filter(([key, value]) =>
      workspaceWidgetCatalog.includes(key as WorkspaceWidgetId) &&
      (value === 'sm' || value === 'md' || value === 'lg')
    )
  ) as Partial<Record<WorkspaceWidgetId, 'sm' | 'md' | 'lg'>>;

  return {
    widgetOrder: [...widgetOrder, ...workspaceWidgetCatalog.filter((item) => !widgetOrder.includes(item))],
    hiddenWidgets,
    pinnedWidgets,
    widgetSizes,
    density: layout.density,
    updatedAt: layout.updatedAt
  };
}

export function createWorkspaceLayoutFallback(
  role: DashboardRole,
  key: string,
  legacyWidgetOrder?: string[]
): ResolvedWorkspaceLayout {
  const preset = roleWorkspaceLayoutPresets[role] ?? systemWorkspaceLayoutPreset;
  const legacyOrder = (legacyWidgetOrder ?? [])
    .map((item) => (item === 'projects' ? 'customers' : item))
    .filter((item): item is WorkspaceWidgetId => workspaceWidgetCatalog.includes(item as WorkspaceWidgetId));

  const layout = normalizeWorkspaceLayout({
    widgetOrder: legacyOrder.length > 0 ? legacyOrder : preset.widgetOrder,
    hiddenWidgets: preset.hiddenWidgets,
    pinnedWidgets: preset.pinnedWidgets,
    widgetSizes: preset.widgetSizes,
    density: preset.density,
    updatedAt: now()
  });

  return {
    source: legacyOrder.length > 0 ? 'user' : 'role',
    layout,
    userPreference:
      legacyOrder.length > 0
        ? {
            id: `legacy-${key}`,
            userId: key.split(':')[0] ?? 'user-admin',
            companyId: key.split(':')[1] ?? 'company-main',
            roleKey: role,
            ...layout
          }
        : undefined,
    rolePreset: preset,
    systemPreset: systemWorkspaceLayoutPreset,
    availableWidgets: workspaceWidgetCatalog
  };
}

export function createCustomizationDraft(layout: WorkspaceLayout): WorkspaceCustomizationDraft {
  return {
    widgetOrder: [...layout.widgetOrder],
    hiddenWidgets: [...layout.hiddenWidgets],
    pinnedWidgets: [...layout.pinnedWidgets],
    widgetSizes: { ...layout.widgetSizes },
    density: layout.density
  };
}

export function draftMatchesLayout(draft: WorkspaceCustomizationDraft, layout: WorkspaceLayout) {
  return (
    draft.density === layout.density &&
    draft.hiddenWidgets.join('|') === layout.hiddenWidgets.join('|') &&
    draft.pinnedWidgets.join('|') === layout.pinnedWidgets.join('|') &&
    JSON.stringify(draft.widgetSizes) === JSON.stringify(layout.widgetSizes) &&
    draft.widgetOrder.join('|') === layout.widgetOrder.join('|')
  );
}

function now() {
  return new Date().toISOString();
}
