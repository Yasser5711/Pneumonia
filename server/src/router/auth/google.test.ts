import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { mockDeep } from 'vitest-mock-extended';

import { createTestCaller } from '../../../test/caller';
import { mockServices } from '../../../test/services';

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
});
describe('googleRouter.googleStart', () => {
  it('returns a redirect URL for Google OAuth', async () => {
    const redirectUrl = 'https://accounts.google.com/o/oauth2/auth?client_id=123';
    const fastifyMock = mockDeep<FastifyInstance>() as any;
    fastifyMock.googleOauth = {
      generateAuthorizationUri: vi.fn().mockResolvedValueOnce(redirectUrl),
    };

    const caller = createTestCaller({ fastify: fastifyMock });
    const result = await caller.auth.google.googleStart({});

    expect(result).toEqual({ redirectUrl });
  });
});

describe('googleRouter.googleCallback', () => {
  it('chose the primary verified email', async () => {
    const fastifyMock = mockDeep<FastifyInstance>() as any;
    fastifyMock.googleOauth = {
      getAccessTokenFromAuthorizationCodeFlow: vi
        .fn()
        .mockResolvedValueOnce({ token: { access_token: 'token' } }),
    };
    mockFetchOnce({ sub: 'user-id', email: 'main@ex.com' }); // profile

    mockServices.userService.createOrUpdateOAuthUser.mockResolvedValue({ id: 'u1' });
    mockServices.apiKeyService.generateKey.mockResolvedValue({ key: 'k1' } as any);

    const caller = createTestCaller({ fastify: fastifyMock });
    const result = await caller.auth.google.googleCallback({
      code: '123',
      state: 'xyz',
    });

    expect(mockServices.userService.createOrUpdateOAuthUser).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'main@ex.com' }),
    );
    expect(result).toEqual({ apiKey: 'k1' });
  });

  it('propagate an error if Google token exchange fails', async () => {
    (fetch as unknown as Mock).mockResolvedValueOnce(new Response('oops', { status: 500 }));
    const fastifyMock = mockDeep<FastifyInstance>() as any;
    fastifyMock.googleOauth = {
      getAccessTokenFromAuthorizationCodeFlow: vi
        .fn()
        .mockResolvedValueOnce({ token: { access_token: 'token' } }),
    };
    const caller = createTestCaller({ fastify: fastifyMock });
    await expect(caller.auth.google.googleCallback({ code: 'bad', state: 'bad' })).rejects.toThrow(
      /Google request failed/,
    );
  });
});
