'use client';

import { WorkspaceWindowFrame } from '@/features/dashboard/workspace-window-frame';

import type { BackofficeCase } from './types';
import { BackofficeCompanyProfile } from './backoffice-company-profile';
import type { BackofficeCompanyProfileViewModel } from './backoffice-company.service';
import { BackofficeInbox } from './backoffice-inbox';
import type { BackofficeInboxViewModel } from './backoffice-inbox.types';
import { BackofficeQueueDetail } from './backoffice-queue-panel';
import type { BackofficeQueueSummary } from './backoffice-queue.types';
import type { BackofficeWindowItem } from './backoffice-workspace.types';

export function BackofficeWindowHost({
  windows,
  queueLookup,
  companyProfiles,
  inbox,
  caseLookup,
  onClose,
  onFocus,
  onMinimize,
  onToggleMaximize,
  onMove
}: {
  windows: BackofficeWindowItem[];
  queueLookup: Map<string, BackofficeQueueSummary>;
  companyProfiles: Map<string, BackofficeCompanyProfileViewModel>;
  inbox: BackofficeInboxViewModel;
  caseLookup: Map<string, BackofficeCase>;
  onClose: (windowId: string) => void;
  onFocus: (windowId: string) => void;
  onMinimize: (windowId: string) => void;
  onToggleMaximize: (windowId: string) => void;
  onMove: (windowId: string, position: BackofficeWindowItem['position']) => void;
}) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[60] hidden lg:block">
      {windows
        .filter((item) => item.state !== 'minimized')
        .sort((left, right) => left.zIndex - right.zIndex)
        .map((windowItem) => (
          <WorkspaceWindowFrame
            key={windowItem.id}
            windowItem={windowItem}
            onClose={() => onClose(windowItem.id)}
            onFocus={() => onFocus(windowItem.id)}
            onMinimize={() => onMinimize(windowItem.id)}
            onToggleMaximize={() => onToggleMaximize(windowItem.id)}
            onMove={(position) => onMove(windowItem.id, position)}
          >
            {windowItem.kind === 'queue' && windowItem.queueType ? (
              <BackofficeQueueDetail summary={queueLookup.get(windowItem.queueType) ?? {
                id: windowItem.queueType,
                title: 'Kö',
                description: 'Det finns ingen kö att visa just nu.',
                roleHint: 'Backoffice',
                count: 0,
                priority: 'low',
                openHref: '/backoffice',
                items: []
              }} />
            ) : null}
            {windowItem.kind === 'company' && windowItem.companyId ? (
              companyProfiles.get(windowItem.companyId) ? (
                <BackofficeCompanyProfile profile={companyProfiles.get(windowItem.companyId)!} />
              ) : (
                <div className="rounded-[1.35rem] bg-stone-50 p-5 text-sm text-stone-500">
                  Företagsprofilen kunde inte visas just nu.
                </div>
              )
            ) : null}
            {windowItem.kind === 'inbox' ? <BackofficeInbox inbox={inbox} /> : null}
            {windowItem.kind === 'case' && windowItem.caseId ? (
              <div className="space-y-4">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">Ärende</p>
                {caseLookup.get(windowItem.caseId) ? (
                  <div className="rounded-[1.35rem] border border-stone-200/80 bg-stone-50/70 p-4">
                    <p className="text-lg font-semibold text-stone-950">{caseLookup.get(windowItem.caseId)!.title}</p>
                    <p className="mt-2 text-sm leading-7 text-stone-500">{caseLookup.get(windowItem.caseId)!.description}</p>
                  </div>
                ) : (
                  <div className="rounded-[1.35rem] bg-stone-50 p-5 text-sm text-stone-500">
                    Ärendet kunde inte visas just nu.
                  </div>
                )}
              </div>
            ) : null}
          </WorkspaceWindowFrame>
        ))}
    </div>
  );
}
