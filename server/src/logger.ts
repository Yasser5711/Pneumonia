import { LoggerNotInitializedError } from './errors';

import type { FastifyBaseLogger } from 'fastify';

let logger_: FastifyBaseLogger;

export const setLogger = (log: FastifyBaseLogger) => {
  logger_ = log;
};

/**
 * Gets the initialized logger
 * @throws {LoggerNotInitializedError} When logger is not initialized
 */
const getLogger = (): FastifyBaseLogger => {
  if (!logger_) throw new LoggerNotInitializedError();
  return logger_;
};
export const logger = () => getLogger();
