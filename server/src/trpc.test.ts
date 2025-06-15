import { describe, expect, it } from 'vitest';
import { createContext } from './trpc';

const makeFakeRequest = (headers = {}) => ({ headers }) as any;
const makeFakeResponse = () => ({}) as any;
describe('🧩 tRPC Context and Auth Middleware', () => {
  it('extracts apiKey from request headers', () => {
    const ctx = createContext({
      req: makeFakeRequest({ 'x-api-key': 'abc123' }),
      res: makeFakeResponse(),
    });
    expect(ctx.apiKey).toBe('abc123');
  });

  it('returns undefined if no apiKey header', () => {
    const ctx = createContext({ req: makeFakeRequest(), res: makeFakeResponse() });
    expect(ctx.apiKey).toBeUndefined();
  });
});
