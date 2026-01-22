/**
 * Custom error classes for Consulting Framer
 * Used by services and API routes for consistent error handling
 */

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }

  toJSON() {
    return {
      error: this.code,
      message: this.message,
      ...(this.details && { details: this.details }),
    };
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super('NOT_FOUND', `${resource} not found`);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super('UNAUTHORIZED', message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access denied') {
    super('FORBIDDEN', message);
    this.name = 'ForbiddenError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('VALIDATION_ERROR', message, details);
    this.name = 'ValidationError';
  }
}

export class UsageLimitError extends AppError {
  constructor(limit: string) {
    super('USAGE_LIMIT_EXCEEDED', `${limit} limit reached`, { upgrade: true });
    this.name = 'UsageLimitError';
  }
}

export class AuthError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('AUTH_ERROR', message, details);
    this.name = 'AuthError';
  }
}

export class AIServiceError extends AppError {
  constructor(message: string, cause?: unknown) {
    super('AI_SERVICE_ERROR', message, { cause: String(cause) });
    this.name = 'AIServiceError';
  }
}
