import type { BackofficePriority, BackofficeThread, BackofficeThreadMessage } from './types';

export type BackofficeInboxStatus = 'unread' | 'in_progress' | 'waiting_for_customer' | 'resolved';

export interface BackofficeInboxMessage extends BackofficeThreadMessage {
  senderName: string;
  isInternal: boolean;
}

export interface BackofficeInboxThread extends Omit<BackofficeThread, 'messages'> {
  companyName: string;
  objectLabel?: string;
  objectHref?: string;
  preview: string;
  unreadCount: number;
  statusLabel: BackofficeInboxStatus;
  messages: BackofficeInboxMessage[];
}

export interface BackofficeInboxItem {
  id: string;
  companyId: string;
  companyName: string;
  title: string;
  preview: string;
  status: BackofficeInboxStatus;
  priority: BackofficePriority;
  caseId?: string;
  objectLabel?: string;
  threadHref: string;
  unreadCount: number;
}

export interface BackofficeInboxViewModel {
  items: BackofficeInboxItem[];
  threads: BackofficeInboxThread[];
  unreadCount: number;
  waitingForCustomerCount: number;
}
