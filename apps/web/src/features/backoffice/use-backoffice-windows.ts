'use client';

import { useState } from 'react';

import type { BackofficeWindowItem, BackofficeWindowTarget } from './backoffice-workspace.types';

function createWindowWidgetId(target: BackofficeWindowTarget) {
  if (target.kind === 'queue') {
    if (target.queueType === 'receipt_review' || target.queueType === 'document_review') return 'receipts';
    if (target.queueType === 'customer_questions') return 'customers';
    if (target.queueType === 'vat_review') return 'bookkeeping';
    if (target.queueType === 'payroll_review') return 'payroll';
    if (target.queueType === 'tasks') return 'calendar';
    return 'bookkeeping';
  }

  if (target.kind === 'company') return 'customers';
  if (target.kind === 'case') return 'bookkeeping';
  return 'customers';
}

function createWindowRoute(target: BackofficeWindowTarget) {
  if (target.kind === 'queue') return target.queueType ? `/backoffice/koer/${target.queueType}` : '/backoffice';
  if (target.kind === 'company') return target.companyId ? `/backoffice/bolag/${target.companyId}` : '/backoffice';
  if (target.kind === 'case') return target.caseId ? `/backoffice/arenden/${target.caseId}` : '/backoffice/arenden';
  return '/backoffice/inkorg';
}

function createWindowId(target: BackofficeWindowTarget) {
  if (target.kind === 'queue') return `queue:${target.queueType}`;
  if (target.kind === 'company') return `company:${target.companyId}`;
  if (target.kind === 'case') return `case:${target.caseId}`;
  return 'inbox';
}

function createWindowTitle(target: BackofficeWindowTarget) {
  if (target.kind === 'queue') return 'Arbetskö';
  if (target.kind === 'company') return 'Företagsprofil';
  if (target.kind === 'case') return 'Ärende';
  return 'Inkorg';
}

export function useBackofficeWindows() {
  const [windows, setWindows] = useState<BackofficeWindowItem[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);

  const openWindow = (target: BackofficeWindowTarget) => {
    const id = createWindowId(target);

    setWindows((current) => {
      const existing = current.find((item) => item.id === id);
      if (existing) {
        const nextZ = current.reduce((max, item) => Math.max(max, item.zIndex), 20) + 1;
        return current.map((item) =>
          item.id === id ? { ...item, state: 'open', zIndex: nextZ } : item
        );
      }

      const nextZ = current.reduce((max, item) => Math.max(max, item.zIndex), 20) + 1;
      return [
        ...current,
        {
          ...target,
          id,
          widgetId: createWindowWidgetId(target),
          title: createWindowTitle(target),
          route: createWindowRoute(target),
          state: 'open',
          zIndex: nextZ,
          position: { x: 60 + current.length * 24, y: 120 + current.length * 20 },
          size: { width: 860, height: 620 }
        }
      ];
    });

    setActiveWindowId(id);
  };

  const closeWindow = (windowId: string) => {
    setWindows((current) => current.filter((item) => item.id !== windowId));
    setActiveWindowId((current) => (current === windowId ? null : current));
  };

  const focusWindow = (windowId: string) => {
    setWindows((current) => {
      const nextZ = current.reduce((max, item) => Math.max(max, item.zIndex), 20) + 1;
      return current.map((item) => (item.id === windowId ? { ...item, zIndex: nextZ, state: 'open' } : item));
    });
    setActiveWindowId(windowId);
  };

  const minimizeWindow = (windowId: string) => {
    setWindows((current) => current.map((item) => (item.id === windowId ? { ...item, state: 'minimized' } : item)));
    setActiveWindowId((current) => (current === windowId ? null : current));
  };

  const toggleMaximizeWindow = (windowId: string) => {
    setWindows((current) =>
      current.map((item) =>
        item.id === windowId
          ? { ...item, state: item.state === 'maximized' ? 'open' : 'maximized' }
          : item
      )
    );
    setActiveWindowId(windowId);
  };

  const updateWindowPosition = (windowId: string, position: BackofficeWindowItem['position']) => {
    setWindows((current) => current.map((item) => (item.id === windowId ? { ...item, position } : item)));
  };

  const toggleTaskbarWindow = (windowId: string) => {
    const item = windows.find((entry) => entry.id === windowId);
    if (!item) return;

    if (item.state === 'minimized') {
      focusWindow(windowId);
      return;
    }

    if (activeWindowId === windowId) {
      minimizeWindow(windowId);
      return;
    }

    focusWindow(windowId);
  };

  return {
    windows,
    activeWindowId,
    openWindow,
    closeWindow,
    focusWindow,
    minimizeWindow,
    toggleMaximizeWindow,
    updateWindowPosition,
    toggleTaskbarWindow
  };
}
