import { browser } from '$app/environment';
import { readable } from 'svelte/store';
import { env } from '$env/dynamic/public';

export interface MilestoneEvent {
  type: string;
  step: string;
  status: 'started' | 'complete' | 'error';
  note?: string;
  score?: number;
  maxScore?: number;
  timestamp: number;
  elapsed: number;
}

export interface MilestoneStreamOptions {
  intervalMs?: number;
  throttleMs?: number;
}

interface PollState {
  sessionId: string;
  since: number;
  lastEmit: number;
}

const DEFAULT_INTERVAL = 1500;
const DEFAULT_THROTTLE = 600;

// API base URL (same as audit.js)
const API_BASE_URL = (env.PUBLIC_API_BASE_URL && env.PUBLIC_API_BASE_URL.trim()) || 'https://ai-audit-api.fly.dev';

async function fetchMilestones(sessionId: string, since: number) {
  const url = new URL(`${API_BASE_URL}/api/milestones/${sessionId}`);
  if (since) {
    url.searchParams.set('since', String(since));
  }

  const response = await fetch(url.toString(), { credentials: 'include' });
  if (!response.ok) {
    throw new Error(`Failed to fetch milestones: ${response.status}`);
  }
  return response.json() as Promise<{ milestones: MilestoneEvent[]; nextSince: number }>;
}

export function createMilestoneStream(sessionId: string | null, options: MilestoneStreamOptions = {}) {
  const intervalMs = options.intervalMs ?? DEFAULT_INTERVAL;
  const throttleMs = options.throttleMs ?? DEFAULT_THROTTLE;

  return readable<MilestoneEvent[]>([], (set) => {
    if (!browser || !sessionId) {
      set([]);
      return () => {};
    }

    let poller: ReturnType<typeof setInterval> | null = null;
    let state: PollState = {
      sessionId,
      since: 0,
      lastEmit: 0
    };
    let buffer: MilestoneEvent[] = [];

    const emitBuffered = () => {
      if (!buffer.length) return;
      const now = Date.now();
      if (now - state.lastEmit < throttleMs) {
        return;
      }
      state.lastEmit = now;
      set(buffer.slice());
      buffer = [];
    };

    const poll = async () => {
      try {
        const { milestones, nextSince } = await fetchMilestones(state.sessionId, state.since);
        state.since = nextSince;
        if (milestones.length) {
          buffer = buffer.concat(milestones);
          emitBuffered();
        }
      } catch (error) {
        console.error('[Milestones] Poll error', error);
      }
    };

    poller = setInterval(poll, intervalMs);
    // Kick off immediately
    poll();

    const throttleId = setInterval(emitBuffered, throttleMs);

    return () => {
      if (poller) clearInterval(poller);
      clearInterval(throttleId);
    };
  });
}
