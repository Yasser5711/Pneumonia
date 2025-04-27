import { describe, expect, it } from 'vitest';
import { createContext } from './trpc';

const makeFakeRequest = (headers = {}) => ({ headers }) as any;

describe('🧩 tRPC Context and Auth Middleware', () => {
  it('extracts apiKey from request headers', () => {
    const ctx = createContext({ req: makeFakeRequest({ 'x-api-key': 'abc123' }) });
    expect(ctx.apiKey).toBe('abc123');
  });

  it('returns undefined if no apiKey header', () => {
    const ctx = createContext({ req: makeFakeRequest() });
    expect(ctx.apiKey).toBeUndefined();
  });
});
