import type { FastifyBaseLogger } from 'fastify';

let logger_: FastifyBaseLogger;

export const setLogger = (log: FastifyBaseLogger) => {
  logger_ = log;
};

const getLogger = (): FastifyBaseLogger => {
  if (!logger_) throw new Error('Logger not initialized');
  return logger_;
};
export const logger = () => getLogger();
