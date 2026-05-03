import type { DesktopWorkspaceViewModel } from './mock-data';
import type { WorkspaceWidgetId } from './workspace-layout.types';

export type WorkspaceNotificationPriority = 'high' | 'medium' | 'low';

export interface WorkspaceNotificationItem {
  id: string;
  title: string;
  description: string;
  priority: WorkspaceNotificationPriority;
  widgetId?: WorkspaceWidgetId;
  href?: string;
  actionLabel: string;
}

export function createWorkspaceNotifications(workspace: DesktopWorkspaceViewModel): WorkspaceNotificationItem[] {
  const items: WorkspaceNotificationItem[] = [];
  const invoices = workspace.widgets.find((item) => item.id === 'invoices');
  const bank = workspace.widgets.find((item) => item.id === 'bank');
  const payroll = workspace.widgets.find((item) => item.id === 'payroll');

  if (invoices?.preview?.headline.toLowerCase().includes('forfallna')) {
    items.push({
      id: 'notification-overdue-invoices',
      title: invoices.preview.headline,
      description: 'Kundfakturor ligger for uppfoljning och bor ses over idag.',
      priority: 'high',
      widgetId: 'invoices',
      actionLabel: 'Oppna fakturor'
    });
  }

  if (bank?.preview?.headline.toLowerCase().includes('stamma av')) {
    items.push({
      id: 'notification-bank-review',
      title: bank.preview.headline,
      description: 'Det finns bankposter som fortfarande paverkar avstamningen.',
      priority: 'high',
      widgetId: 'bank',
      actionLabel: 'Oppna bank'
    });
  }

  if (payroll?.preview?.headline.toLowerCase().includes('underlag')) {
    items.push({
      id: 'notification-payroll',
      title: payroll.preview.headline,
      description: 'Loneunderlag behover fortfarande ses over innan nasta steg.',
      priority: 'medium',
      widgetId: 'payroll',
      actionLabel: 'Oppna loner'
    });
  }

  workspace.todayTodos.slice(0, 2).forEach((todo) => {
    items.push({
      id: `notification-todo-${todo.id}`,
      title: todo.title,
      description: todo.detail,
      priority: todo.isImportant ? 'high' : 'medium',
      href: todo.href ?? '/uppgifter',
      actionLabel: 'Oppna uppgift'
    });
  });

  workspace.upcomingDates.slice(0, 2).forEach((item, index) => {
    items.push({
      id: `notification-date-${index}-${item.id}`,
      title: item.title,
      description: `${item.date} · ${item.description}`,
      priority: item.priority === 'Viktig' ? 'high' : item.priority === 'Snart' ? 'medium' : 'low',
      widgetId: 'calendar',
      actionLabel: 'Oppna kalender'
    });
  });

  return items.slice(0, 6);
}
