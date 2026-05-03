import type { BackofficeCaseStatus, BackofficeRole } from './types';

export type BackofficeQueueType =
  | 'bookkeeping_review'
  | 'receipt_review'
  | 'customer_questions'
  | 'exceptions'
  | 'vat_review'
  | 'payroll_review'
  | 'document_review'
  | 'tasks'
  | 'ai_signals';

export type BackofficeQueuePriority = 'low' | 'medium' | 'high' | 'critical';
export type BackofficeQueueItemStatus = 'open' | 'done' | 'flagged' | 'waiting_for_customer' | 'escalated';

export interface BackofficeQueueItem {
  id: string;
  queueType: BackofficeQueueType;
  title: string;
  summary: string;
  companyId: string;
  companyName: string;
  customerName?: string;
  priority: BackofficeQueuePriority;
  status: BackofficeQueueItemStatus;
  deadlineLabel?: string;
  sourceHref?: string;
  companyHref: string;
  caseId?: string;
  caseStatus?: BackofficeCaseStatus;
  objectLabel?: string;
  roleHint?: string;
  slaStatus?: 'healthy' | 'warning' | 'breached' | 'paused' | 'resolved';
  assignmentReason?: string;
  assigneeName?: string;
}

export interface BackofficeQueueSummary {
  id: BackofficeQueueType;
  title: string;
  description: string;
  roleHint: string;
  count: number;
  priority: BackofficeQueuePriority;
  deadlineLabel?: string;
  openHref: string;
  items: BackofficeQueueItem[];
  slaRiskCount?: number;
  slaBreachedCount?: number;
}

export interface BackofficeQueueFilter {
  priority?: BackofficeQueuePriority | 'alla';
  status?: BackofficeQueueItemStatus | 'alla';
  queueType?: BackofficeQueueType | 'alla';
  search?: string;
}

export interface BackofficeQueueViewModel {
  role: BackofficeRole;
  title: string;
  description: string;
  summaries: BackofficeQueueSummary[];
  highlightedItems: BackofficeQueueItem[];
}
