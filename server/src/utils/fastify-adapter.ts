import type { FastifyRequest, FastifyReply } from 'fastify';

function toStandardRequest(req: FastifyRequest): Request {
  const url = `${req.protocol}://${req.hostname}${req.originalUrl}`;
  const headers = new Headers(req.headers as Record<string, string>);
  const method = req.method;
  const hasBody = method !== 'GET' && method !== 'HEAD';
  const body = hasBody && req.body ? JSON.stringify(req.body) : null;
  return new Request(url, {
    method,
    headers,
    body,
  });
}

async function sendStandardResponse(res: FastifyReply, response: Response): Promise<void> {
  res.status(response.status);
  res.headers(Object.fromEntries(response.headers.entries()));
  res.send(await response.text());
}

export const fastifyAdapter = { toStandardRequest, sendStandardResponse };
