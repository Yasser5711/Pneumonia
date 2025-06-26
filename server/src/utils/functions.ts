import type { FastifyRequest } from 'fastify';
export function realIp(req: FastifyRequest) {
  return (
    (req.headers['cf-connecting-ip'] as string | undefined) ??
    (req.headers['true-client-ip'] as string | undefined) ??
    req.ip // déjà corrigé par trustProxy
  );
}
