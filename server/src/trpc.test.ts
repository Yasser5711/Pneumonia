import { describe, it, expect, vi } from 'vitest';

import * as defaultServices from './db/services/index';
import { createContext } from './trpc';

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
const makeReq = (headers: Record<string, string> = {}) => ({ headers }) as FastifyRequest;

const makeRes = () => ({}) as FastifyReply;
const makeFastify = () => ({ log: { info: () => {} } }) as unknown as FastifyInstance;
vi.mock('./utils/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));
describe('createContext()', () => {
  it('extracts apiKey when header is present', async () => {
    const ctx = await createContext({
      req: makeReq({ 'x-api-key': 'abc' }),
      res: makeRes(),
      fastify: makeFastify(),
    });

    expect(ctx.apiKey).toBe('abc');
  });

  it('sets apiKey to undefined when header missing', async () => {
    const ctx = await createContext({
      req: makeReq(),
      res: makeRes(),
      fastify: makeFastify(),
    });

    expect(ctx.apiKey).toBeUndefined();
  });

  it('injects defaultServices when no override is given', async () => {
    const ctx = await createContext({
      req: makeReq(),
      res: makeRes(),
      fastify: makeFastify(),
    });

    expect(ctx.services).toBe(defaultServices);
  });

  it('honours a custom services object when provided', async () => {
    const custom = { fake: true } as any;

    const ctx = await createContext({
      req: makeReq(),
      res: makeRes(),
      fastify: makeFastify(),
      services: custom,
    });

    expect(ctx.services).toBe(custom);
  });

  it('passes through req, res and fastify untouched', async () => {
    const req = makeReq();
    const res = makeRes();
    const fastify = makeFastify();

    const ctx = await createContext({ req, res, fastify });

    expect(ctx.req).toBe(req);
    expect(ctx.res).toBe(res);
    expect(ctx.fastify).toBe(fastify);
  });
});
