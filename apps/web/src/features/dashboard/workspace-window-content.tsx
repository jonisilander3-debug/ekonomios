'use client';

import Link from 'next/link';

import { Button } from '@ekonomi/ui';

import type { DesktopWorkspaceViewModel, WorkspaceWidgetItem } from './mock-data';
import { getWorkspaceWidgetDefinition } from './workspace-widget-definitions';
import { WorkspaceEmbeddedModule } from './workspace-module-embeds';
import { WorkspaceWidgetPreview } from './workspace-widget-preview';

export function WorkspaceWindowContent({
  widget,
  workspace
}: {
  widget: WorkspaceWidgetItem;
  workspace: DesktopWorkspaceViewModel;
}) {
  const definition = getWorkspaceWidgetDefinition(widget.id);

  return (
    <div className="space-y-4">
      {definition.windowPresentation === 'embedded' ? (
        <WorkspaceEmbeddedModule contentType={definition.windowContentType} workspace={workspace} />
      ) : (
        <>
          <WorkspaceWidgetPreview widget={widget} variant="window" />

          {widget.id === 'calendar' ? (
            <div className="grid gap-3 md:grid-cols-2">
              {workspace.upcomingDates.slice(0, 4).map((item) => (
                <div key={item.id} className="rounded-[1.2rem] border border-stone-200/80 bg-stone-50/75 p-4">
                  <p className="text-sm font-medium text-stone-950">{item.title}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-stone-500">{item.date}</p>
                  <p className="mt-2 text-sm leading-6 text-stone-500">{item.description}</p>
                </div>
              ))}
            </div>
          ) : null}
        </>
      )}

      <div className="flex justify-end">
        <Link href={widget.href}>
          <Button variant="secondary" className="rounded-full">
            Oppna hela modulen
          </Button>
        </Link>
      </div>
    </div>
  );
}
