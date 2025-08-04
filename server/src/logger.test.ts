import { beforeEach, describe, expect, it } from 'vitest';

import { LoggerNotInitializedError } from './errors';
import { logger, setLogger } from './logger';

beforeEach(() => {
  setLogger(undefined as any);
});
describe('🧩 Logger utils', () => {
  it('throws if getLogger is called before setLogger', () => {
    expect(() => {
      logger();
    }).toThrow(LoggerNotInitializedError);
  });

  it('returns the logger after initialization', () => {
    const fakeLogger = {
      info: () => {},
      warn: () => {},
      error: () => {},
      debug: () => {},
      fatal: () => {},
      trace: () => {},
      child: () => ({}),
    } as any;

    setLogger(fakeLogger);

    const log = logger();
    expect(log).toBe(fakeLogger);
  });
});
