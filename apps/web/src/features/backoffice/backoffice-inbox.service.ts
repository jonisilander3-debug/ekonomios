import type { BackofficeInboxItem, BackofficeInboxMessage, BackofficeInboxThread, BackofficeInboxViewModel } from './backoffice-inbox.types';
import type { BackofficeThread } from './types';

function mapStatus(thread: BackofficeThread): BackofficeInboxItem['status'] {
  if (thread.status === 'waiting_for_customer') {
    return 'waiting_for_customer';
  }

  if (thread.status === 'resolved') {
    return 'resolved';
  }

  const hasUnread = thread.messages.some((item) => item.status === 'unread' && item.visibility === 'external');
  return hasUnread ? 'unread' : 'in_progress';
}

function getSenderName(thread: BackofficeThread, message: BackofficeThread['messages'][number]) {
  if (message.authorIdentity?.displayName) {
    return message.authorIdentity.displayName;
  }

  if (message.senderUserId) {
    return (
      thread.participants.find((item) => item.userId === message.senderUserId)?.displayName ??
      message.senderRoleKey ??
      'Backoffice'
    );
  }

  if (message.visibility === 'external') {
    return thread.participants.find((item) => item.participantType === 'customer_contact')?.displayName ?? 'Kund';
  }

  return thread.participants.find((item) => item.participantType === 'internal_user')?.displayName ?? 'Backoffice';
}

function mapMessages(thread: BackofficeThread): BackofficeInboxMessage[] {
  return thread.messages.map((message) => ({
    ...message,
    senderName: getSenderName(thread, message),
    isInternal: message.visibility === 'internal'
  }));
}

export function createBackofficeInboxViewModel(input: {
  threads: BackofficeThread[];
}): BackofficeInboxViewModel {
  const threads: BackofficeInboxThread[] = input.threads.slice(0, 24).map((thread) => {
    const messages = mapMessages(thread);
    const statusLabel = mapStatus(thread);
    const preview =
      messages.find((item) => !item.isInternal)?.body ??
      messages[messages.length - 1]?.body ??
      'Ingen meddelandetext finns sparad an.';

    return {
      ...thread,
      companyName: thread.companyName,
      objectLabel: thread.objectLinks[0]?.label,
      objectHref: thread.objectLinks[0]?.href,
      preview,
      unreadCount: messages.filter((item) => item.status === 'unread' && !item.isInternal).length,
      statusLabel,
      messages
    };
  });

  const items: BackofficeInboxItem[] = threads.map((thread) => ({
    id: thread.id,
    companyId: thread.companyId,
    companyName: thread.companyName,
    title: thread.title,
    preview: thread.preview,
    status: thread.statusLabel,
    priority: thread.priority,
    caseId: thread.caseId,
    objectLabel: thread.objectLabel,
    threadHref: `/backoffice/inkorg?trad=${thread.id}`,
    unreadCount: thread.unreadCount
  }));

  return {
    items,
    threads,
    unreadCount: items.reduce((sum, item) => sum + item.unreadCount, 0),
    waitingForCustomerCount: items.filter((item) => item.status === 'waiting_for_customer').length
  };
}
