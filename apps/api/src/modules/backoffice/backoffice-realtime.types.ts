import type { BackofficeRole } from './backoffice.types';

export type BackofficeRealtimeEventType =
  | 'message.created'
  | 'message.read'
  | 'customer_message.created'
  | 'customer_message.read'
  | 'case.updated'
  | 'case.assigned'
  | 'case.escalated'
  | 'case.waiting_state_changed'
  | 'thread.linked_to_object'
  | 'rebalance.job.started'
  | 'rebalance.job.finished'
  | 'rebalance.job.failed'
  | 'rebalance.case_moved'
  | 'ops.snapshot_updated';

export interface BackofficeRealtimeEvent {
  id: string;
  type: BackofficeRealtimeEventType;
  createdAt: string;
  companyId?: string;
  caseId?: string;
  threadId?: string;
  role?: BackofficeRole;
  userId?: string;
  payload?: Record<string, string | number | boolean | null | undefined>;
}
