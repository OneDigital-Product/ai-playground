import { 
  Result, 
  ResultAsync, 
  ok, 
  err, 
  fromPromise
} from 'neverthrow';
import { 
  EVPSError, 
  ValidationError, 
  createValidationError,
  createNetworkError,
  createServerError,
  fromConvexError
} from './errors';

// Common Result type aliases for the EVPS app
export type EVPSResult<T> = Result<T, EVPSError>;
export type EVPSResultAsync<T> = ResultAsync<T, EVPSError>;

// Validation helpers using Result for form/input validation
export const validateRequired = (value: string | undefined | null, fieldName: string): EVPSResult<string> => {
  if (!value || value.trim().length === 0) {
    return err(createValidationError(`${fieldName} is required`));
  }
  return ok(value.trim());
};

export const validateEmail = (email: string): EVPSResult<string> => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return err(createValidationError('Please enter a valid email address'));
  }
  return ok(email);
};

export const validateMinLength = (value: string, minLength: number, fieldName: string): EVPSResult<string> => {
  if (value.length < minLength) {
    return err(createValidationError(`${fieldName} must be at least ${minLength} characters`));
  }
  return ok(value);
};

export const validateMaxLength = (value: string, maxLength: number, fieldName: string): EVPSResult<string> => {
  if (value.length > maxLength) {
    return err(createValidationError(`${fieldName} must not exceed ${maxLength} characters`));
  }
  return ok(value);
};

export const validateNumberRange = (
  value: number, 
  min: number, 
  max: number, 
  fieldName: string
): EVPSResult<number> => {
  if (value < min || value > max) {
    return err(createValidationError(`${fieldName} must be between ${min} and ${max}`));
  }
  return ok(value);
};

// Promise wrapper utilities
export const safePromise = <T>(
  promise: Promise<T>, 
  errorMessage = 'Promise failed'
): EVPSResultAsync<T> => {
  return fromPromise(promise, (error) => {
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        return createNetworkError(error.message);
      }
      return createServerError(error.message);
    }
    return createServerError(errorMessage);
  });
};

// Convex-specific promise wrapper
export const safeConvexCall = <T>(
  promise: Promise<T>
): EVPSResultAsync<T> => {
  return fromPromise(promise, (error) => fromConvexError(error));
};

// Collection utilities
export const combineValidations = <T extends readonly unknown[]>(
  results: { [K in keyof T]: EVPSResult<T[K]> }
): EVPSResult<T> => {
  return Result.combine(results) as EVPSResult<T>;
};

export const combineValidationsWithAllErrors = <T extends readonly unknown[]>(
  results: { [K in keyof T]: EVPSResult<T[K]> }
): EVPSResult<T> => {
  return Result.combineWithAllErrors(results).mapErr(errors => {
    // Merge all validation errors into a single ValidationError
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allMessages = errors.map((e: any) => e.message).join('; ');
    const allDetails: Record<string, string[]> = {};
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    errors.forEach((error: any) => {
      if (error instanceof ValidationError && error.details) {
        Object.entries(error.details).forEach(([key, values]) => {
          if (!allDetails[key]) {
            allDetails[key] = [];
          }
          allDetails[key].push(...values);
        });
      }
    });
    
    return createValidationError(allMessages, allDetails);
  }) as EVPSResult<T>;
};

// Form validation chain builder
export class ValidationChain<T> {
  private constructor(private result: EVPSResult<T>) {}

  static of<T>(value: T): ValidationChain<T> {
    return new ValidationChain(ok(value));
  }

  static fromResult<T>(result: EVPSResult<T>): ValidationChain<T> {
    return new ValidationChain(result);
  }

  validate<U>(fn: (value: T) => EVPSResult<U>): ValidationChain<U> {
    return new ValidationChain(this.result.andThen(fn));
  }

  transform<U>(fn: (value: T) => U): ValidationChain<U> {
    return new ValidationChain(this.result.map(fn));
  }

  build(): EVPSResult<T> {
    return this.result;
  }
}

// Async validation chain builder
export class AsyncValidationChain<T> {
  private constructor(private result: EVPSResultAsync<T>) {}

  static of<T>(value: T): AsyncValidationChain<T> {
    return new AsyncValidationChain(ResultAsync.fromSafePromise(Promise.resolve(value)));
  }

  static fromResult<T>(result: EVPSResult<T>): AsyncValidationChain<EVPSResult<T>> {
    return new AsyncValidationChain(ResultAsync.fromSafePromise(Promise.resolve(result)));
  }

  static fromResultAsync<T>(result: EVPSResultAsync<T>): AsyncValidationChain<T> {
    return new AsyncValidationChain(result);
  }

  validate<U>(fn: (value: T) => EVPSResult<U> | EVPSResultAsync<U>): AsyncValidationChain<U> {
    return new AsyncValidationChain(this.result.andThen(fn));
  }

  transform<U>(fn: (value: T) => U | Promise<U>): AsyncValidationChain<U> {
    return new AsyncValidationChain(this.result.map(fn));
  }

  async build(): Promise<EVPSResult<T>> {
    return await this.result;
  }
}

// Utility for handling arrays of Results
export const sequenceResults = <T>(
  results: EVPSResult<T>[]
): EVPSResult<T[]> => {
  return Result.combine(results) as EVPSResult<T[]>;
};

export const sequenceResultsAsync = <T>(
  results: EVPSResultAsync<T>[]
): EVPSResultAsync<T[]> => {
  return ResultAsync.combine(results);
};

// Retry utility for async operations
export const retryAsync = <T>(
  operation: () => EVPSResultAsync<T>,
  maxRetries: number,
  delayMs = 1000
): EVPSResultAsync<T> => {
  return ResultAsync.fromSafePromise(
    (async () => {
      let lastError: EVPSError = createServerError('Max retries exceeded');
      
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        const result = await operation();
        
        if (result.isOk()) {
          return result.value;
        }
        
        lastError = result.error;
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
      
      throw lastError;
    })()
  ).mapErr(error => error as EVPSError);
};

// Debounced async operation utility
export const debounceAsync = <T extends unknown[], R>(
  fn: (...args: T) => EVPSResultAsync<R>,
  delayMs: number
): ((...args: T) => EVPSResultAsync<R>) => {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (...args: T): EVPSResultAsync<R> => {
    return ResultAsync.fromSafePromise(
      new Promise<R>((resolve, reject) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        timeoutId = setTimeout(async () => {
          try {
            const result = await fn(...args);
            if (result.isOk()) {
              resolve(result.value);
            } else {
              reject(result.error);
            }
          } catch (error) {
            reject(fromConvexError(error));
          }
        }, delayMs);
      })
    ).mapErr(error => error as EVPSError);
  };
};