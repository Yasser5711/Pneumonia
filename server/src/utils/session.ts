import type { FastifyReply, FastifyRequest } from 'fastify';
import ms from 'ms';

export const setSession = (res: FastifyReply, userId: string, ttl = '30m') => {
  const maxAge = ms(ttl);
  res.setCookie('sid', userId, {
    path: '/',
    httpOnly: true,
    signed: true,
    maxAge: Math.floor(maxAge / 1000),
  });
};

export const getSession = (req: FastifyRequest) => {
  const raw = req.cookies.sid;
  if (!raw) return undefined;
  if (typeof req.unsignCookie === 'function') {
    const { valid, value } = req.unsignCookie(raw);
    if (!valid) return undefined;
    return { sub: value };
  }
  return { sub: raw };
};

export const clearSession = (res: FastifyReply) => {
  res.clearCookie('sid', { path: '/' });
};
