// Shared error types for EVPS application
// These types bridge client-side NeverThrow usage with backend Convex error handling

// Base error types that correspond to common application error categories
export type AppErrorType = 
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND_ERROR' 
  | 'PERMISSION_ERROR'
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR'
  | 'CONVEX_ERROR';

// Base application error interface
export interface AppError {
  readonly type: AppErrorType;
  readonly message: string;
  readonly details?: Record<string, unknown>;
  readonly timestamp?: string;
}

// Concrete error classes for different error types
export class ValidationError implements AppError {
  readonly type = 'VALIDATION_ERROR' as const;
  readonly timestamp = new Date().toISOString();

  constructor(
    public readonly message: string,
    public readonly details?: Record<string, string[]>
  ) {}
}

export class NotFoundError implements AppError {
  readonly type = 'NOT_FOUND_ERROR' as const;
  readonly timestamp = new Date().toISOString();

  constructor(
    public readonly message: string,
    public readonly details?: Record<string, unknown>
  ) {}
}

export class PermissionError implements AppError {
  readonly type = 'PERMISSION_ERROR' as const;
  readonly timestamp = new Date().toISOString();

  constructor(
    public readonly message: string,
    public readonly details?: Record<string, unknown>
  ) {}
}

export class NetworkError implements AppError {
  readonly type = 'NETWORK_ERROR' as const;
  readonly timestamp = new Date().toISOString();

  constructor(
    public readonly message: string,
    public readonly details?: Record<string, unknown>
  ) {}
}

export class ServerError implements AppError {
  readonly type = 'SERVER_ERROR' as const;
  readonly timestamp = new Date().toISOString();

  constructor(
    public readonly message: string,
    public readonly details?: Record<string, unknown>
  ) {}
}

export class ConvexError implements AppError {
  readonly type = 'CONVEX_ERROR' as const;
  readonly timestamp = new Date().toISOString();

  constructor(
    public readonly message: string,
    public readonly details?: Record<string, unknown>
  ) {}
}

// Union type for all possible application errors
export type EVPSError = 
  | ValidationError
  | NotFoundError
  | PermissionError
  | NetworkError
  | ServerError
  | ConvexError;

// Utility functions for creating common errors
export const createValidationError = (
  message: string, 
  fieldErrors?: Record<string, string[]>
): ValidationError => new ValidationError(message, fieldErrors);

export const createNotFoundError = (
  resource: string, 
  identifier?: string
): NotFoundError => new NotFoundError(
  `${resource} ${identifier ? `'${identifier}' ` : ''}not found`
);

export const createPermissionError = (
  action: string, 
  resource?: string
): PermissionError => new PermissionError(
  `Permission denied: Cannot ${action} ${resource || 'resource'}`
);

export const createNetworkError = (
  message = 'Network request failed'
): NetworkError => new NetworkError(message);

export const createServerError = (
  message = 'Internal server error'
): ServerError => new ServerError(message);

export const createConvexError = (
  message: string, 
  convexError?: unknown
): ConvexError => new ConvexError(message, { originalError: convexError });

// Type guards for error checking
export const isValidationError = (error: unknown): error is ValidationError =>
  error instanceof ValidationError;

export const isNotFoundError = (error: unknown): error is NotFoundError =>
  error instanceof NotFoundError;

export const isPermissionError = (error: unknown): error is PermissionError =>
  error instanceof PermissionError;

export const isNetworkError = (error: unknown): error is NetworkError =>
  error instanceof NetworkError;

export const isServerError = (error: unknown): error is ServerError =>
  error instanceof ServerError;

export const isConvexError = (error: unknown): error is ConvexError =>
  error instanceof ConvexError;

export const isEVPSError = (error: unknown): error is EVPSError =>
  isValidationError(error) ||
  isNotFoundError(error) ||
  isPermissionError(error) ||
  isNetworkError(error) ||
  isServerError(error) ||
  isConvexError(error);

// Error conversion utilities for interfacing with different systems
export const fromConvexError = (convexError: unknown): ConvexError => {
  if (convexError instanceof Error) {
    return new ConvexError(convexError.message, { stack: convexError.stack });
  }
  return new ConvexError('Unknown Convex error', { originalError: convexError });
};

export const toDisplayMessage = (error: EVPSError): string => {
  switch (error.type) {
    case 'VALIDATION_ERROR':
      return error.message;
    case 'NOT_FOUND_ERROR':
      return error.message;
    case 'PERMISSION_ERROR':
      return 'You do not have permission to perform this action.';
    case 'NETWORK_ERROR':
      return 'Network connection failed. Please check your connection and try again.';
    case 'SERVER_ERROR':
      return 'A server error occurred. Please try again later.';
    case 'CONVEX_ERROR':
      return `Database error: ${error.message}`;
    default:
      return 'An unexpected error occurred.';
  }
};