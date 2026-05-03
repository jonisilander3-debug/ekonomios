import type { WorkspaceWidgetId } from './workspace-layout.types';

export type WorkspaceWindowState = 'open' | 'minimized' | 'maximized';

export interface WorkspaceWindowPosition {
  x: number;
  y: number;
}

export interface WorkspaceWindowSize {
  width: number;
  height: number;
}

export interface WorkspaceWindowItem {
  id: string;
  widgetId: WorkspaceWidgetId;
  title: string;
  route: string;
  state: WorkspaceWindowState;
  position: WorkspaceWindowPosition;
  size: WorkspaceWindowSize;
  zIndex: number;
}
