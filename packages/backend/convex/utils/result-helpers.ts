import { Result, ok, err, combine } from 'neverthrow';

// Backend Result helpers for internal business logic in Convex functions
// These helpers use NeverThrow internally but convert to throws at Convex boundaries

// Base error types for backend operations
export type BackendError = 
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND_ERROR'
  | 'DUPLICATE_ERROR'
  | 'PERMISSION_ERROR'
  | 'CONSTRAINT_ERROR';

// Backend Result type alias
export type BackendResult<T> = Result<T, { type: BackendError; message: string; details?: unknown }>;

// Error creation utilities
export const validationError = (message: string, details?: unknown): BackendResult<never> =>
  err({ type: 'VALIDATION_ERROR', message, details });

export const notFoundError = (message: string, details?: unknown): BackendResult<never> =>
  err({ type: 'NOT_FOUND_ERROR', message, details });

export const duplicateError = (message: string, details?: unknown): BackendResult<never> =>
  err({ type: 'DUPLICATE_ERROR', message, details });

export const permissionError = (message: string, details?: unknown): BackendResult<never> =>
  err({ type: 'PERMISSION_ERROR', message, details });

export const constraintError = (message: string, details?: unknown): BackendResult<never> =>
  err({ type: 'CONSTRAINT_ERROR', message, details });

// Validation helpers
export const validateNonEmptyString = (
  value: string | undefined | null, 
  fieldName: string
): BackendResult<string> => {
  if (!value || value.trim().length === 0) {
    return validationError(`${fieldName} is required`);
  }
  return ok(value.trim());
};

export const validateStringLength = (
  value: string, 
  minLength: number, 
  maxLength: number, 
  fieldName: string
): BackendResult<string> => {
  if (value.length < minLength) {
    return validationError(`${fieldName} must be at least ${minLength} characters`);
  }
  if (value.length > maxLength) {
    return validationError(`${fieldName} must not exceed ${maxLength} characters`);
  }
  return ok(value);
};

export const validateNumberRange = (
  value: number, 
  min: number, 
  max: number, 
  fieldName: string
): BackendResult<number> => {
  if (value < min || value > max) {
    return validationError(`${fieldName} must be between ${min} and ${max}`);
  }
  return ok(value);
};

export const validateEnum = <T extends string>(
  value: string, 
  allowedValues: readonly T[], 
  fieldName: string
): BackendResult<T> => {
  if (!(allowedValues as readonly string[]).includes(value)) {
    return validationError(
      `${fieldName} must be one of: ${allowedValues.join(', ')}`,
      { allowedValues, received: value }
    );
  }
  return ok(value as T);
};

export const validateEmail = (email: string): BackendResult<string> => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return validationError('Invalid email format');
  }
  return ok(email);
};

export const validateUrl = (url: string): BackendResult<string> => {
  try {
    new URL(url);
    return ok(url);
  } catch {
    return validationError('Invalid URL format');
  }
};

// Complex validation composition
export const validateInput = <T extends Record<string, unknown>>(
  input: T,
  validators: { [K in keyof T]: (value: T[K]) => BackendResult<T[K]> }
): BackendResult<T> => {
  const results: BackendResult<unknown>[] = [];
  const validatedFields: Partial<T> = {};

  for (const [key, validator] of Object.entries(validators)) {
    const result = validator(input[key as keyof T]);
    results.push(result);
    
    if (result.isOk()) {
      (validatedFields as any)[key] = result.value;
    }
  }

  // If any validation failed, return the first error
  for (const result of results) {
    if (result.isErr()) {
      return result as BackendResult<T>;
    }
  }

  return ok(validatedFields as T);
};

// Database operation helpers
export const validateUniqueConstraint = <T>(
  existingRecord: T | null,
  fieldName: string,
  value: string
): BackendResult<void> => {
  if (existingRecord) {
    return duplicateError(`${fieldName} '${value}' already exists`);
  }
  return ok(undefined);
};

export const validateRecordExists = <T>(
  record: T | null,
  resourceName: string,
  identifier: string
): BackendResult<T> => {
  if (!record) {
    return notFoundError(`${resourceName} '${identifier}' not found`);
  }
  return ok(record);
};

// Business logic composition helpers
export const combineResults = <T extends readonly unknown[]>(
  results: { [K in keyof T]: BackendResult<T[K]> }
): BackendResult<T> => {
  return combine(results);
};

// Safe division utility
export const safeDivision = (numerator: number, denominator: number): BackendResult<number> => {
  if (denominator === 0) {
    return constraintError('Division by zero is not allowed');
  }
  return ok(numerator / denominator);
};

// Array operation helpers
export const validateNonEmptyArray = <T>(
  array: T[] | undefined,
  fieldName: string
): BackendResult<T[]> => {
  if (!array || array.length === 0) {
    return validationError(`${fieldName} cannot be empty`);
  }
  return ok(array);
};

export const validateArrayLength = <T>(
  array: T[],
  minLength: number,
  maxLength: number,
  fieldName: string
): BackendResult<T[]> => {
  if (array.length < minLength) {
    return validationError(`${fieldName} must have at least ${minLength} items`);
  }
  if (array.length > maxLength) {
    return validationError(`${fieldName} must have at most ${maxLength} items`);
  }
  return ok(array);
};

// Date validation helpers
export const validateDateRange = (
  date: Date,
  minDate: Date,
  maxDate: Date,
  fieldName: string
): BackendResult<Date> => {
  if (date < minDate || date > maxDate) {
    return validationError(
      `${fieldName} must be between ${minDate.toISOString()} and ${maxDate.toISOString()}`
    );
  }
  return ok(date);
};

export const validateFutureDate = (date: Date, fieldName: string): BackendResult<Date> => {
  const now = new Date();
  if (date <= now) {
    return validationError(`${fieldName} must be in the future`);
  }
  return ok(date);
};

// Utility to unwrap Result for Convex compatibility
// Use this at the boundary of Convex functions to convert Result<T, E> to T or throw Error
export const unwrapOrThrow = <T>(result: BackendResult<T>): T => {
  if (result.isOk()) {
    return result.value;
  }
  
  const error = result.error;
  const errorMessage = `${error.type}: ${error.message}`;
  
  // Throw with structured error information
  const convexError = new Error(errorMessage);
  (convexError as any).code = error.type;
  (convexError as any).details = error.details;
  
  throw convexError;
};

// Utility to run validation chains and unwrap at the end
export const validateAndUnwrap = <T>(
  validation: () => BackendResult<T>
): T => {
  return unwrapOrThrow(validation());
};

// Complex business rule validation
export const validateBusinessRule = (
  condition: boolean,
  errorMessage: string,
  errorType: BackendError = 'CONSTRAINT_ERROR'
): BackendResult<void> => {
  if (!condition) {
    return err({ type: errorType, message: errorMessage });
  }
  return ok(undefined);
};

// Conditional validation
export const validateIf = <T>(
  condition: boolean,
  value: T,
  validator: (value: T) => BackendResult<T>
): BackendResult<T> => {
  if (condition) {
    return validator(value);
  }
  return ok(value);
};

// Pipeline for complex validation sequences
export const validationPipeline = <T>(
  initialValue: T,
  ...validators: ((value: T) => BackendResult<T>)[]
): BackendResult<T> => {
  let result: BackendResult<T> = ok(initialValue);
  
  for (const validator of validators) {
    result = result.andThen(validator);
    if (result.isErr()) {
      break;
    }
  }
  
  return result;
};