import ms from 'ms';

import { env } from '../env';

import type { FastifyReply, FastifyRequest } from 'fastify';
export const setSession = ({
  res,
  userId,
  ttl = '30m',
}: {
  res: FastifyReply;
  userId: string;
  ttl?: string;
}) => {
  const maxAge = ms(ttl as ms.StringValue);
  const secure = env.NODE_ENV !== 'development';
  res.setCookie('sid', userId, {
    path: '/',
    httpOnly: true,
    signed: true,
    sameSite: secure ? 'none' : 'lax',
    secure,
    maxAge: Math.floor(maxAge / 1000),
  });
};
// export const setSession = ({ res, userId, ttl = '30d' }) => {
//   const secure = process.env.NODE_ENV !== 'development';
//   res.setCookie('sid', userId, {
//     path: '/',
//     httpOnly: true,
//     signed: true,
//     sameSite: secure ? 'none' : 'lax',
//     secure,
//     maxAge: ms(ttl) / 1000,
//   });
// };
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
