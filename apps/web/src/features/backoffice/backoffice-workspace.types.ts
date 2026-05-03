import type { WorkspaceWidgetId } from '@/features/dashboard/workspace-layout.types';
import type { BackofficeQueueType } from './backoffice-queue.types';

export type BackofficeWindowKind = 'queue' | 'company' | 'inbox' | 'case';

export interface BackofficeWindowTarget {
  kind: BackofficeWindowKind;
  queueType?: BackofficeQueueType;
  companyId?: string;
  caseId?: string;
}

export interface BackofficeWindowItem extends BackofficeWindowTarget {
  id: string;
  widgetId: WorkspaceWidgetId;
  title: string;
  route: string;
  state: 'open' | 'minimized' | 'maximized';
  zIndex: number;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
}
