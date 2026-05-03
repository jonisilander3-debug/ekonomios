import type { WorkspaceWidgetSize, WorkspaceWidgetId } from './workspace-layout.types';

export type WorkspaceOpenMode = 'route' | 'window';
export type WorkspaceWindowContentType = WorkspaceWidgetId;
export type WorkspaceWindowPresentation = 'embedded' | 'preview';

export interface WorkspaceWidgetDefinition {
  id: WorkspaceWidgetId;
  route: string;
  defaultOpenMode: WorkspaceOpenMode;
  supportsWindowMode: boolean;
  supportsPinning: boolean;
  supportsResize: boolean;
  supportsPreview: boolean;
  supportsInlineActions: boolean;
  defaultSize: WorkspaceWidgetSize;
  windowTitle: string;
  menuDescription: string;
  windowContentType: WorkspaceWindowContentType;
  windowPresentation: WorkspaceWindowPresentation;
  launcherKeywords: string[];
}

export const workspaceWidgetDefinitions: Record<WorkspaceWidgetId, WorkspaceWidgetDefinition> = {
  invoices: {
    id: 'invoices',
    route: '/fakturor',
    defaultOpenMode: 'window',
    supportsWindowMode: true,
    supportsPinning: true,
    supportsResize: true,
    supportsPreview: true,
    supportsInlineActions: true,
    defaultSize: 'md',
    windowTitle: 'Fakturor',
    menuDescription: 'Kundfakturor och uppfoljning',
    windowContentType: 'invoices',
    windowPresentation: 'embedded',
    launcherKeywords: ['faktura', 'kundfaktura', 'reskontra', 'paminnelse']
  },
  bookkeeping: {
    id: 'bookkeeping',
    route: '/bokforing',
    defaultOpenMode: 'window',
    supportsWindowMode: true,
    supportsPinning: true,
    supportsResize: true,
    supportsPreview: true,
    supportsInlineActions: true,
    defaultSize: 'md',
    windowTitle: 'Bokforing',
    menuDescription: 'Verifikationer och avstamning',
    windowContentType: 'bookkeeping',
    windowPresentation: 'embedded',
    launcherKeywords: ['bokforing', 'verifikation', 'avstamning', 'konto']
  },
  receipts: {
    id: 'receipts',
    route: '/kvitton',
    defaultOpenMode: 'window',
    supportsWindowMode: true,
    supportsPinning: true,
    supportsResize: true,
    supportsPreview: true,
    supportsInlineActions: true,
    defaultSize: 'md',
    windowTitle: 'Kvitton',
    menuDescription: 'Underlag och kvittoflode',
    windowContentType: 'receipts',
    windowPresentation: 'embedded',
    launcherKeywords: ['kvitto', 'underlag', 'upload', 'leverantor']
  },
  customers: {
    id: 'customers',
    route: '/kunder',
    defaultOpenMode: 'window',
    supportsWindowMode: true,
    supportsPinning: true,
    supportsResize: true,
    supportsPreview: true,
    supportsInlineActions: true,
    defaultSize: 'lg',
    windowTitle: 'Kunder',
    menuDescription: 'Kundbild, projekt och relationer',
    windowContentType: 'customers',
    windowPresentation: 'embedded',
    launcherKeywords: ['kunder', 'kund', 'kundbild', 'projekt', 'relation']
  },
  time: {
    id: 'time',
    route: '/tid',
    defaultOpenMode: 'window',
    supportsWindowMode: true,
    supportsPinning: true,
    supportsResize: true,
    supportsPreview: true,
    supportsInlineActions: true,
    defaultSize: 'md',
    windowTitle: 'Tidrapport',
    menuDescription: 'Tid, narvaro och registrering',
    windowContentType: 'time',
    windowPresentation: 'embedded',
    launcherKeywords: ['tid', 'tidrapport', 'stampla', 'registrera']
  },
  payroll: {
    id: 'payroll',
    route: '/loner',
    defaultOpenMode: 'window',
    supportsWindowMode: true,
    supportsPinning: true,
    supportsResize: true,
    supportsPreview: true,
    supportsInlineActions: true,
    defaultSize: 'md',
    windowTitle: 'Loner',
    menuDescription: 'Loneunderlag och utbetalningar',
    windowContentType: 'payroll',
    windowPresentation: 'embedded',
    launcherKeywords: ['lon', 'loner', 'agi', 'underlag']
  },
  bank: {
    id: 'bank',
    route: '/bank',
    defaultOpenMode: 'window',
    supportsWindowMode: true,
    supportsPinning: true,
    supportsResize: true,
    supportsPreview: true,
    supportsInlineActions: true,
    defaultSize: 'lg',
    windowTitle: 'Bank',
    menuDescription: 'In- och utbetalningar',
    windowContentType: 'bank',
    windowPresentation: 'embedded',
    launcherKeywords: ['bank', 'transaktion', 'avstamning', 'betalning']
  },
  calendar: {
    id: 'calendar',
    route: '/dashboard#kommande-kalender',
    defaultOpenMode: 'window',
    supportsWindowMode: true,
    supportsPinning: true,
    supportsResize: true,
    supportsPreview: true,
    supportsInlineActions: true,
    defaultSize: 'md',
    windowTitle: 'Kalender',
    menuDescription: 'Viktiga datum och nasta steg',
    windowContentType: 'calendar',
    windowPresentation: 'preview',
    launcherKeywords: ['kalender', 'deadline', 'datum', 'uppgift']
  }
};

export function getWorkspaceWidgetDefinition(widgetId: WorkspaceWidgetId) {
  return workspaceWidgetDefinitions[widgetId];
}
