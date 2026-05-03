'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { BACKOFFICE_API_BASE_URL } from './api';
import type { BackofficeRealtimeEvent, BackofficeRole } from './types';

function createRealtimeUrl(input: {
  companyId?: string;
  role?: BackofficeRole;
  threadId?: string;
  caseId?: string;
  types?: BackofficeRealtimeEvent['type'][];
}) {
  const params = new URLSearchParams();

  if (input.companyId) {
    params.set('companyId', input.companyId);
  }

  if (input.role) {
    params.set('role', input.role);
  }

  if (input.threadId) {
    params.set('threadId', input.threadId);
  }

  if (input.caseId) {
    params.set('caseId', input.caseId);
  }

  if (input.types && input.types.length > 0) {
    params.set('types', input.types.join(','));
  }

  const query = params.toString();
  return `${BACKOFFICE_API_BASE_URL}/backoffice/events/stream${query ? `?${query}` : ''}`;
}

export function useBackofficeRealtime(input: {
  enabled?: boolean;
  companyId?: string;
  role?: BackofficeRole;
  threadId?: string;
  caseId?: string;
  types?: BackofficeRealtimeEvent['type'][];
  pollingMs?: number;
  onInvalidate: (event?: BackofficeRealtimeEvent) => Promise<void> | void;
}) {
  const [mode, setMode] = useState<'realtime' | 'polling' | 'idle'>('idle');
  const [lastEventAt, setLastEventAt] = useState<string | null>(null);
  const invalidateRef = useRef(input.onInvalidate);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  invalidateRef.current = input.onInvalidate;

  const streamUrl = useMemo(
    () =>
      createRealtimeUrl({
        companyId: input.companyId,
        role: input.role,
        threadId: input.threadId,
        caseId: input.caseId,
        types: input.types
      }),
    [input.caseId, input.companyId, input.role, input.threadId, input.types]
  );

  useEffect(() => {
    if (!input.enabled) {
      setMode('idle');
      return;
    }

    let intervalId: ReturnType<typeof setInterval> | null = null;
    let eventSource: EventSource | null = null;
    let closed = false;

    const scheduleInvalidate = (event?: BackofficeRealtimeEvent) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        void invalidateRef.current(event);
      }, 180);
    };

    const startPolling = () => {
      if (intervalId || closed) {
        return;
      }

      setMode('polling');
      intervalId = setInterval(() => {
        void invalidateRef.current();
      }, input.pollingMs ?? 15000);
    };

    if (typeof window !== 'undefined' && 'EventSource' in window) {
      eventSource = new EventSource(streamUrl);
      setMode('realtime');

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as BackofficeRealtimeEvent;
          setLastEventAt(payload.createdAt);
          scheduleInvalidate(payload);
        } catch {
          scheduleInvalidate();
        }
      };

      eventSource.onerror = () => {
        eventSource?.close();
        eventSource = null;
        startPolling();
      };
    } else {
      startPolling();
    }

    return () => {
      closed = true;
      eventSource?.close();
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [input.enabled, input.pollingMs, streamUrl]);

  return {
    mode,
    isRealtime: mode === 'realtime',
    lastEventAt
  };
}
