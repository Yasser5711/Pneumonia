import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { env } from '../env';

import { setSession, getSession, clearSession } from './session';

import type { FastifyReply, FastifyRequest } from 'fastify';

let originalEnv: typeof env;
function makeReply() {
  return {
    setCookie: vi.fn(),
    clearCookie: vi.fn(),
  } as unknown as FastifyReply;
}

function makeRequest(rawSid: string | undefined, valid = true) {
  return {
    cookies: { sid: rawSid },
    unsignCookie:
      rawSid === undefined ? undefined : () => ({ valid, value: rawSid.replace('signed-', '') }),
  } as unknown as FastifyRequest;
}

describe('setSession', () => {
  beforeEach(() => {
    originalEnv = { ...env };
    env.NODE_ENV = 'test';
  });
  afterEach(() => {
    vi.restoreAllMocks();
    Object.assign(env, originalEnv);
  });
  it('sets a signed session cookie with default 30-minute TTL', () => {
    const reply = makeReply();
    setSession({ res: reply, userId: 'user123' });

    expect(reply.setCookie).toHaveBeenCalledWith(
      'sid',
      'user123',
      expect.objectContaining({
        path: '/',
        httpOnly: true,
        signed: true,
        sameSite: 'none',
        secure: true,
        maxAge: 30 * 60, // 1 800 seconds
      }),
    );
  });
  it('sets a signed session cookie with default 30-minute TTL(dev-mode)', () => {
    env.NODE_ENV = 'development';
    const reply = makeReply();
    setSession({ res: reply, userId: 'user123' });

    expect(reply.setCookie).toHaveBeenCalledWith(
      'sid',
      'user123',
      expect.objectContaining({
        path: '/',
        httpOnly: true,
        signed: true,
        sameSite: 'lax',
        secure: false,
        maxAge: 30 * 60, // 1 800 seconds
      }),
    );
  });
  it('honours a custom ttl string (e.g. 2h)', () => {
    const reply = makeReply();
    setSession({ res: reply, userId: 'user123', ttl: '2h' });

    expect(reply.setCookie).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.objectContaining({ maxAge: 2 * 60 * 60 }),
    );
  });
});

describe('getSession', () => {
  it('returns undefined when no cookie is present', () => {
    const req = makeRequest(undefined);
    expect(getSession(req)).toBeUndefined();
  });

  it('returns undefined when cookie signature is invalid', () => {
    const req = makeRequest('signed-bad', false /* not valid */);
    expect(getSession(req)).toBeUndefined();
  });

  it('returns { sub } when signature is valid', () => {
    const req = makeRequest('signed-user123', true);
    expect(getSession(req)).toEqual({ sub: 'user123' });
  });

  it('falls back to raw cookie when unsignCookie not available', () => {
    const req = {
      cookies: { sid: 'plainUser' },
    } as unknown as FastifyRequest;

    expect(getSession(req)).toEqual({ sub: 'plainUser' });
  });
});

describe('clearSession', () => {
  it('clears the sid cookie on / path', () => {
    const reply = makeReply();
    clearSession(reply);
    expect(reply.clearCookie).toHaveBeenCalledWith('sid', { path: '/' });
  });
});
