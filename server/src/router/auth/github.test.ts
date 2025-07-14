import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { mockDeep } from 'vitest-mock-extended';

import { createTestCaller } from '../../../test/caller';
import { mockServices } from '../../../test/services';
import { env } from '../../env';

import type { FastifyInstance } from 'fastify';
vi.stubGlobal('fetch', vi.fn());

vi.mock('../utils/session', () => ({
  getSession: () => ({ sub: 'user-id' }),
  setSession: vi.fn(),
  clearSession: vi.fn(),
}));

function mockFetchOnce(json: any, status = 200) {
  (fetch as unknown as Mock).mockResolvedValueOnce(
    new Response(JSON.stringify(json), {
      status,
      headers: { 'content-type': 'application/json' },
    }),
  );
}
beforeEach(() => {
  vi.clearAllMocks();
  env.ENABLE_LOCAL_AUTH = true;
});
describe('githubRouter.githubStart', () => {
  it('returns a redirect URL for GitHub OAuth', async () => {
    const redirectUrl = 'https://github.com/login/oauth/authorize?client_id=123';
    const fastifyMock = mockDeep<FastifyInstance>() as any;
    fastifyMock.githubOauth = {
      generateAuthorizationUri: vi.fn().mockResolvedValueOnce(redirectUrl),
    };

    const caller = createTestCaller({ fastify: fastifyMock });
    const result = await caller.auth.github.githubStart({});

    expect(result).toEqual({ redirectUrl });
  });
  it('throws if GitHub auth is disabled', async () => {
    env.ENABLE_LOCAL_AUTH = false;
    const caller = createTestCaller({});
    await expect(caller.auth.github.githubStart({})).rejects.toThrow(
      'GitHub authentication is currently disabled.',
    );
  });
});

describe('githubRouter.callback', () => {
  it('chose the primary verified email', async () => {
    mockFetchOnce({ access_token: 'token' }); // exchange
    mockFetchOnce({ id: 1, login: 'foo', email: null }); // profile
    mockFetchOnce([
      { email: 'a@ex.com', primary: false, verified: true },
      { email: 'main@ex.com', primary: true, verified: true },
    ]); // emails

    mockServices.userService.createOrUpdateOAuthUser.mockResolvedValue({ id: 'u1' });
    mockServices.apiKeyService.generateKey.mockResolvedValue({ key: 'k1' } as any);

    const caller = createTestCaller({});
    const result = await caller.auth.github.githubCallback({
      code: '123',
      state: 'xyz',
    });

    expect(mockServices.userService.createOrUpdateOAuthUser).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'main@ex.com' }),
    );
    expect(result).toEqual({ apiKey: 'k1' });
  });

  it('falls back to <id>+<login>@users.noreply for no verified email', async () => {
    mockFetchOnce({ access_token: 'token' });
    mockFetchOnce({ id: 2, login: 'bar', email: null });
    mockFetchOnce([{ email: 'x@y.com', primary: true, verified: false }]);

    mockServices.userService.createOrUpdateOAuthUser.mockResolvedValue({ id: 'u2' });
    mockServices.apiKeyService.generateKey.mockResolvedValue({ key: 'k2' } as any);

    const caller = createTestCaller({});
    await caller.auth.github.githubCallback({ code: '456', state: 'abc' });

    expect(mockServices.userService.createOrUpdateOAuthUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: '2+bar@users.noreply.github.com',
      }),
    );
  });

  it('uses profile.email directly (no emails call)', async () => {
    mockFetchOnce({ access_token: 'tok' }); // token
    mockFetchOnce({ id: 3, login: 'baz', email: 'direct@ex.com' }); // profile

    mockServices.userService.createOrUpdateOAuthUser.mockResolvedValue({ id: 'u3' });
    mockServices.apiKeyService.generateKey.mockResolvedValue({ key: 'k3' } as any);

    const caller = createTestCaller({});
    const res = await caller.auth.github.githubCallback({ code: 'c3', state: 's3' });

    expect(res).toEqual({ apiKey: 'k3' });
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(mockServices.userService.createOrUpdateOAuthUser).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'direct@ex.com' }),
    );
  });

  it('propagate an error if GitHub token exchange fails', async () => {
    (fetch as unknown as Mock).mockResolvedValueOnce(new Response('oops', { status: 500 }));

    const caller = createTestCaller({});
    await expect(caller.auth.github.githubCallback({ code: 'bad', state: 'bad' })).rejects.toThrow(
      /GitHub request failed/,
    );
  });
  it('throws if GitHub auth is disabled', async () => {
    env.ENABLE_LOCAL_AUTH = false;
    const caller = createTestCaller({});
    await expect(caller.auth.github.githubCallback({ code: '123', state: 'xyz' })).rejects.toThrow(
      'GitHub authentication is currently disabled.',
    );
  });
});
