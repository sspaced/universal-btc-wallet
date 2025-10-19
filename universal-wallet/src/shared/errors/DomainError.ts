export abstract class DomainError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;

  constructor(message: string, public readonly context?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends DomainError {
  readonly code = 'VALIDATION_ERROR';
  readonly statusCode = 400;
}

export class SecurityError extends DomainError {
  readonly code = 'SECURITY_ERROR';
  readonly statusCode = 403;
}

export class BusinessRuleViolation extends DomainError {
  readonly code = 'BUSINESS_RULE_VIOLATION';
  readonly statusCode = 422;
}

export class NotFoundError extends DomainError {
  readonly code = 'NOT_FOUND';
  readonly statusCode = 404;
}

export class UnexpectedError extends DomainError {
  readonly code = 'UNEXPECTED_ERROR';
  readonly statusCode = 500;
}

export class CryptoError extends DomainError {
  readonly code = 'CRYPTO_ERROR';
  readonly statusCode = 500;
}

export class NetworkError extends DomainError {
  readonly code = 'NETWORK_ERROR';
  readonly statusCode = 503;
}