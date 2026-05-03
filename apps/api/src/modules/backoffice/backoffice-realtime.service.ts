import { Injectable, MessageEvent } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import type { BackofficeRealtimeEvent, BackofficeRealtimeEventType } from './backoffice-realtime.types';
import type { BackofficeRole } from './backoffice.types';

@Injectable()
export class BackofficeRealtimeService {
  private readonly events$ = new Subject<BackofficeRealtimeEvent>();

  publish(event: Omit<BackofficeRealtimeEvent, 'id' | 'createdAt'>) {
    this.events$.next({
      ...event,
      id: `evt-${Math.random().toString(36).slice(2, 10)}`,
      createdAt: new Date().toISOString()
    });
  }

  stream(filters?: {
    companyId?: string;
    role?: BackofficeRole;
    threadId?: string;
    caseId?: string;
    types?: BackofficeRealtimeEventType[];
  }): Observable<MessageEvent> {
    return this.events$.pipe(
      filter((event) => {
        if (filters?.companyId && event.companyId && filters.companyId !== event.companyId) {
          return false;
        }

        if (filters?.threadId && filters.threadId !== event.threadId) {
          return false;
        }

        if (filters?.caseId && filters.caseId !== event.caseId) {
          return false;
        }

        if (filters?.role && event.role && filters.role !== event.role) {
          return false;
        }

        if (filters?.types?.length && !filters.types.includes(event.type)) {
          return false;
        }

        return true;
      }),
      map((event) => ({
        data: event
      }))
    );
  }
}
