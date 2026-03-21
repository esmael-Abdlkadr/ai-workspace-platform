'use client';

import { useEffect, useRef, useState } from 'react';
import type { TaskStatus } from './api';

export type SSEState = {
  currentStep: string | null;
  status: TaskStatus | null;
  notionPageUrl: string | null;
  error: string | null;
};

export function useSSE(url: string | null): SSEState {
  const [state, setState] = useState<SSEState>({
    currentStep: null,
    status: null,
    notionPageUrl: null,
    error: null,
  });
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }

    if (!url) return;

    const es = new EventSource(url);
    esRef.current = es;

    es.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data as string) as Partial<SSEState>;
        setState((prev) => ({ ...prev, ...data }));

        if (data.status === 'complete' || data.status === 'error') {
          es.close();
          esRef.current = null;
        }
      } catch {
        // ignore malformed event
      }
    };

    es.onerror = () => {
      setState((prev) => ({ ...prev, error: 'Stream connection lost' }));
      es.close();
      esRef.current = null;
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [url]);

  return state;
}
