import type { DashboardRole } from '@/features/platform-data/types';

import type { WorkspaceWidgetId } from './workspace-layout.types';
import type { WorkspaceWindowItem } from './workspace-window.types';

export interface WorkspaceSessionState {
  id: string;
  userId: string;
  companyId: string;
  roleKey: DashboardRole;
  selectedWidgetId?: WorkspaceWidgetId;
  windows: WorkspaceWindowItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ResolvedWorkspaceSessionState {
  source: 'user' | 'empty';
  session: WorkspaceSessionState | null;
  availableWidgets: WorkspaceWidgetId[];
}

export interface SaveWorkspaceSessionDraft {
  selectedWidgetId?: WorkspaceWidgetId;
  windows: WorkspaceWindowItem[];
}
