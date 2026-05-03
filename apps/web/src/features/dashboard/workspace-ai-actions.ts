'use client';

import type { DesktopWorkspaceViewModel, WorkspaceWidgetItem } from './mock-data';
import type { WorkspaceWidgetId } from './workspace-layout.types';

export interface WorkspaceAiAction {
  id: string;
  label: string;
  description: string;
  widgetId?: WorkspaceWidgetId;
  href?: string;
  intent: 'open-window' | 'open-route' | 'focus-widget';
}

export interface WorkspaceAiActionHandlers {
  openWidgetInWindow: (widgetId: WorkspaceWidgetId) => void;
  openWidgetInRoute: (widgetId: WorkspaceWidgetId) => void;
  openHref: (href: string) => void;
  focusWidget: (widgetId: WorkspaceWidgetId) => void;
}

function hasUrgentInvoiceSignal(widget?: WorkspaceWidgetItem) {
  return widget?.preview?.headline.toLowerCase().includes('forfallna') ?? false;
}

export function createWorkspaceAiActions(workspace: DesktopWorkspaceViewModel): WorkspaceAiAction[] {
  const invoicesWidget = workspace.widgets.find((item) => item.id === 'invoices');
  const bankWidget = workspace.widgets.find((item) => item.id === 'bank');
  const timeWidget = workspace.widgets.find((item) => item.id === 'time');
  const tasksHref = workspace.todayTodos.find((item) => item.href)?.href ?? '/uppgifter';

  const actions: WorkspaceAiAction[] = [];

  if (hasUrgentInvoiceSignal(invoicesWidget)) {
    actions.push({
      id: 'ai-overdue-invoices',
      label: 'Oppna forfallna fakturor',
      description: 'Visa de fakturor som ligger narmast uppfoljning.',
      widgetId: 'invoices',
      intent: 'open-window'
    });
  }

  if (bankWidget) {
    actions.push({
      id: 'ai-bank-review',
      label: 'Visa bankposter att stamma av',
      description: 'Oppna banken i ett fonster och ga vidare till avstamning.',
      widgetId: 'bank',
      intent: 'open-window'
    });
  }

  if (timeWidget) {
    actions.push({
      id: 'ai-missing-time',
      label: 'Oppna tid som saknas',
      description: 'Fokusera pa tidrapportering och det som saknar underlag.',
      widgetId: 'time',
      intent: 'open-window'
    });
  }

  actions.push({
    id: 'ai-open-tasks',
    label: 'Visa uppgifter som behover kontroll',
    description: 'Oppna uppgifter och ga direkt till det som bor tas nu.',
    href: tasksHref,
    intent: 'open-route'
  });

  return actions.slice(0, 4);
}

export function runWorkspaceAiAction(
  action: WorkspaceAiAction,
  handlers: WorkspaceAiActionHandlers
) {
  if (action.intent === 'focus-widget' && action.widgetId) {
    handlers.focusWidget(action.widgetId);
    return;
  }

  if (action.intent === 'open-window' && action.widgetId) {
    handlers.openWidgetInWindow(action.widgetId);
    return;
  }

  if (action.href) {
    handlers.openHref(action.href);
    return;
  }

  if (action.widgetId) {
    handlers.openWidgetInRoute(action.widgetId);
  }
}
