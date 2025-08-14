import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { createTestCaller } from '../../test/caller';
type PulseEvent = { type: 'presence'; ts: number; message: string } | { type: 'beat'; ts: number };

describe('checkPulse', () => {
  it('returns 200 OK response', async () => {
    const caller = createTestCaller({
      customSession: { isAuthenticated: true, userId: 'test-user-123' },
    });
    const result = await caller.healthRouter.checkPulse({});
    expect(result).toEqual({ message: 'Server is alive' });
  });
  it('returns 200 OK response without authentication', async () => {
    const caller = createTestCaller({ customSession: null });
    const result = await caller.healthRouter.checkPulse({});
    expect(result).toEqual({ message: 'Server is alive' });
  });
});
describe('pulse', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });
  it('emits presence and beat events in beats mode', async () => {
    const caller = createTestCaller({ customSession: null });

    const stream = (await caller.healthRouter.pulse({
      mode: 'beats',
      bpm: 72, // ~833 ms
      presenceIntervalMs: 60_000,
      jitterMs: 0,
    })) as AsyncIterable<PulseEvent>;

    const itAsync = stream[Symbol.asyncIterator]();

    const first = await itAsync.next();
    expect(first.done).toBe(false);
    expect(first.value.type).toBe('presence');

    const p2 = itAsync.next();
    await vi.advanceTimersByTimeAsync(1000);
    const second = await p2;
    expect(second.value.type).toBe('beat');

    const p3 = itAsync.next();
    await vi.advanceTimersByTimeAsync(1000);
    const third = await p3;
    expect(third.value.type).toBe('beat');

    await itAsync.return?.();
  }, 10_000);
  it('emits only presence events in presence mode', async () => {
    const caller = createTestCaller({ customSession: null });
    const stream = (await caller.healthRouter.pulse({
      mode: 'presence',
      presenceIntervalMs: 1_000,
    })) as AsyncIterable<PulseEvent>;
    const itAsync = stream[Symbol.asyncIterator]();

    const e1 = await itAsync.next();
    expect(e1.value.type).toBe('presence');

    const p2 = itAsync.next();
    await vi.advanceTimersByTimeAsync(1_500);
    const e2 = await p2;
    expect(e2.value.type).toBe('presence');

    await itAsync.return?.();
  }, 10_000);
});
