'use client';

import { useMemo } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';

import type { WorkspaceWidgetId } from './workspace-layout.types';

export function useWidgetInteractions(input: {
  widgetId: WorkspaceWidgetId;
  isSelected: boolean;
  onSelect: (widgetId: WorkspaceWidgetId) => void;
  onOpen: (widgetId: WorkspaceWidgetId) => void;
  onContextMenu: (widgetId: WorkspaceWidgetId, position: { x: number; y: number }) => void;
}) {
  return useMemo(
    () => ({
      onClick: () => {
        if (input.isSelected) {
          input.onOpen(input.widgetId);
          return;
        }

        input.onSelect(input.widgetId);
      },
      onDoubleClick: () => input.onOpen(input.widgetId),
      onKeyDown: (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          input.onOpen(input.widgetId);
          return;
        }

        if (event.key === ' ') {
          event.preventDefault();
          input.onSelect(input.widgetId);
        }
      },
      onContextMenu: (event: MouseEvent) => {
        event.preventDefault();
        input.onSelect(input.widgetId);
        input.onContextMenu(input.widgetId, {
          x: event.clientX,
          y: event.clientY
        });
      }
    }),
    [input]
  );
}
