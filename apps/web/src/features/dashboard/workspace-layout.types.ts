import type { DashboardRole } from '@/features/platform-data/types';

export type WorkspaceWidgetId =
  | 'invoices'
  | 'bookkeeping'
  | 'receipts'
  | 'customers'
  | 'time'
  | 'payroll'
  | 'bank'
  | 'calendar';

export type WorkspaceDensity = 'normal' | 'compact';
export type WorkspaceLayoutSource = 'user' | 'role' | 'system';
export type WorkspaceRolePreset = DashboardRole;
export type WorkspaceWidgetSize = 'sm' | 'md' | 'lg';

export interface WorkspaceLayout {
  widgetOrder: WorkspaceWidgetId[];
  hiddenWidgets: WorkspaceWidgetId[];
  pinnedWidgets: WorkspaceWidgetId[];
  widgetSizes: Partial<Record<WorkspaceWidgetId, WorkspaceWidgetSize>>;
  density: WorkspaceDensity;
  updatedAt: string;
}

export interface WorkspaceLayoutPreference extends WorkspaceLayout {
  id: string;
  userId: string;
  companyId: string;
  roleKey: WorkspaceRolePreset;
}

export interface WorkspaceLayoutPreset extends WorkspaceLayout {
  roleKey?: WorkspaceRolePreset;
  presetSource: 'role' | 'system';
  title: string;
}

export interface WorkspaceCustomizationDraft {
  widgetOrder: WorkspaceWidgetId[];
  hiddenWidgets: WorkspaceWidgetId[];
  pinnedWidgets: WorkspaceWidgetId[];
  widgetSizes: Partial<Record<WorkspaceWidgetId, WorkspaceWidgetSize>>;
  density: WorkspaceDensity;
}

export interface ResolvedWorkspaceLayout {
  source: WorkspaceLayoutSource;
  layout: WorkspaceLayout;
  userPreference?: WorkspaceLayoutPreference;
  rolePreset: WorkspaceLayoutPreset;
  systemPreset: WorkspaceLayoutPreset;
  availableWidgets: WorkspaceWidgetId[];
}
