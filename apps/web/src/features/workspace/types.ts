export interface WorkspaceStatusItem {
  id: string;
  label: string;
  value: string;
  helpText: string;
}

export interface WorkspaceListItem {
  id: string;
  title: string;
  meta: string;
  secondary?: string;
  status: string;
  href?: string;
}

export interface WorkspacePageData {
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  statuses: WorkspaceStatusItem[];
  items: WorkspaceListItem[];
}
