import { describe, it, expect } from 'vitest';

import { realIp } from './functions';

import type { FastifyRequest } from 'fastify';

const makeReq = (headers: Record<string, string> = {}, ip = '0.0.0.0'): FastifyRequest =>
  ({ headers, ip }) as unknown as FastifyRequest;

describe('realIp', () => {
  it('returns cf-connecting-ip when present', () => {
    const req = makeReq(
      {
        'cf-connecting-ip': '1.1.1.1',
        'true-client-ip': '2.2.2.2',
      },
      '3.3.3.3',
    );
    expect(realIp(req)).toBe('1.1.1.1');
  });

  it('falls back to true-client-ip when cf-connecting-ip is absent', () => {
    const req = makeReq({ 'true-client-ip': '2.2.2.2' }, '3.3.3.3');
    expect(realIp(req)).toBe('2.2.2.2');
  });

  it('finally falls back to req.ip when no headers found', () => {
    const req = makeReq({}, '3.3.3.3');
    expect(realIp(req)).toBe('3.3.3.3');
  });
});
