import { beforeEach, describe, expect, it } from 'vitest';

import { createTestCaller } from '../../test/caller';
beforeEach(() => {});

describe('checkPulseRouter', () => {
  it('returns 200 OK response', async () => {
    const caller = createTestCaller({
      customSession: { isAuthenticated: true, userId: 'test-user-123' },
    });
    const result = await caller.checkPulseRouter({});
    expect(result).toEqual({ message: 'Server is alive' });
  });
  it('returns 200 OK response without authentication', async () => {
    const caller = createTestCaller({ customSession: null });
    const result = await caller.checkPulseRouter({});
    expect(result).toEqual({ message: 'Server is alive' });
  });
});
