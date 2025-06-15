/* istanbul ignore file */

export class ApiKeyNotFoundError extends Error {
  constructor() {
    super('API key not found');
    this.name = 'ApiKeyNotFoundError';
  }
}

export class ApiKeyInactiveError extends Error {
  constructor() {
    super('API key is inactive');
    this.name = 'ApiKeyInactiveError';
  }
}

export class ApiKeyExpiredError extends Error {
  constructor() {
    super('API key expired');
    this.name = 'ApiKeyExpiredError';
  }
}

export class ApiKeyInvalidError extends Error {
  constructor() {
    super('Invalid API key');
    this.name = 'ApiKeyInvalidError';
  }
}

export class QuotaExceededError extends Error {
  constructor(quota: number) {
    super(`Free requests quota of ${quota} exceeded`);
    this.name = 'QuotaExceededError';
  }
}
