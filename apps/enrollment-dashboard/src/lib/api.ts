import { ConvexError } from "convex/values";
import { ApiError } from "./schemas";

/**
 * Handles API errors from Convex mutations and queries
 * Formats both validation errors and general errors consistently
 */
export function handleApiError(error: unknown): ApiError {
  if (error instanceof ConvexError) {
    return {
      error: error.message,
    };
  }
  
  if (error instanceof Error) {
    return {
      error: error.message,
    };
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return {
      error,
    };
  }
  
  // Handle objects with error and fieldErrors (already formatted)
  if (typeof error === 'object' && error !== null && 'error' in error) {
    return error as ApiError;
  }
  
  return {
    error: 'An unexpected error occurred',
  };
}

/**
 * Type-safe wrapper for API calls that standardizes error handling
 */
export async function safeApiCall<T>(
  apiCall: () => Promise<T>
): Promise<{ success: true; data: T } | { success: false; error: ApiError }> {
  try {
    const data = await apiCall();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
}

/**
 * Formats field errors for display in forms
 */
export function getFieldError(fieldErrors: Record<string, string[]> | undefined, fieldName: string): string | undefined {
  if (!fieldErrors || !fieldErrors[fieldName]) {
    return undefined;
  }
  
  return fieldErrors[fieldName][0]; // Return first error for the field
}

/**
 * Checks if an error is a validation error (has field errors)
 */
export function isValidationError(error: ApiError): boolean {
  return error.fieldErrors !== undefined && Object.keys(error.fieldErrors).length > 0;
}