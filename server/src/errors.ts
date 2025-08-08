export class ApiKeyGenerationError extends Error {
  constructor() {
    super('API key generation failed');
    this.name = 'ApiKeyGenerationError';
  }
}
export class ApiKeyGenerationFailedError extends Error {
  constructor(originalError: string) {
    super(`Failed to generate API key: ${originalError}`);
    this.name = 'ApiKeyGenerationFailedError';
  }
}
export class ApiKeyQuotaExceededError extends Error {
  constructor() {
    super('API key quota exceeded');
    this.name = 'ApiKeyQuotaExceededError';
  }
}
export class ApiKeyQuotaNotSetError extends Error {
  constructor() {
    super('API key quota not set');
    this.name = 'ApiKeyQuotaNotSetError';
  }
}
export class ApiKeyVerificationFailedError extends Error {
  constructor(originalError: string) {
    super(`Failed to verify API key: ${originalError}`);
    this.name = 'ApiKeyVerificationFailedError';
  }
}
export class NoApiKeyFoundForUserError extends Error {
  constructor() {
    super('No API key found for this user');
    this.name = 'NoApiKeyFoundForUserError';
  }
}
export class UserNotFoundError extends Error {
  constructor() {
    super('User not found');
    this.name = 'UserNotFoundError';
  }
}
export class ApiKeyInvalidError extends Error {
  constructor() {
    super('Invalid API key');
    this.name = 'ApiKeyInvalidError';
  }
}

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

export class QuotaExceededError extends Error {
  constructor(quota: number) {
    super(`Free requests quota of ${quota} exceeded`);
    this.name = 'QuotaExceededError';
  }
}
export class LoggerNotInitializedError extends Error {
  constructor() {
    super('Logger not initialized');
    this.name = 'LoggerNotInitializedError';
  }
}
export class GitHubRequestFailedError extends Error {
  constructor(url: string) {
    super(`GitHub request failed: ${url}`);
    this.name = 'GitHubRequestFailedError';
  }
}
export class GoogleRequestFailedError extends Error {
  constructor(url: string) {
    super(`Google request failed: ${url}`);
    this.name = 'GoogleRequestFailedError';
  }
}
export class QuotaExceededNoExistingKeyError extends Error {
  constructor(userId: string) {
    super(`Quota exceeded but no existing API key found for user ${userId}`);
    this.name = 'QuotaExceededNoExistingKeyError';
  }
}
export class MissingApiKeyError extends Error {
  constructor() {
    super('Missing API key');
    this.name = 'MissingApiKeyError';
  }
}

export class InvalidApiKeyError extends Error {
  constructor() {
    super('Invalid API key');
    this.name = 'InvalidApiKeyError';
  }
}

export class ExpiredApiKeyError extends Error {
  constructor() {
    super('API key expired');
    this.name = 'ExpiredApiKeyError';
  }
}

export class InactiveApiKeyError extends Error {
  constructor() {
    super('API key inactive');
    this.name = 'InactiveApiKeyError';
  }
}

export class ApiKeyRateLimitExceededError extends Error {
  constructor() {
    super('Rate limit exceeded');
    this.name = 'ApiKeyRateLimitExceededError';
  }
}

export class UnexpectedApiKeyValidationError extends Error {
  constructor() {
    super('Invalid or expired API key');
    this.name = 'UnexpectedApiKeyValidationError';
  }
}
export class SessionNotFoundError extends Error {
  constructor() {
    super('Session not found');
    this.name = 'SessionNotFoundError';
  }
}

export class SessionUserNotFoundError extends Error {
  constructor() {
    super('User not found');
    this.name = 'SessionUserNotFoundError';
  }
}

export class SessionInvalidUserIdError extends Error {
  constructor() {
    super('Invalid session (no user id)');
    this.name = 'SessionInvalidUserIdError';
  }
}
