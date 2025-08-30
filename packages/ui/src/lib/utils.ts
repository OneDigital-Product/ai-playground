import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Validation utilities for medical plan forms
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate premium values - must be positive and within reasonable limits
 */
export function validatePremium(value: number): ValidationResult {
  if (value < 0) {
    return { isValid: false, error: "Premium cannot be negative" };
  }
  if (value > 50000) {
    return { isValid: false, error: "Premium exceeds reasonable limit ($50,000)" };
  }
  return { isValid: true };
}

/**
 * Validate deductible values - must be positive and within reasonable limits
 */
export function validateDeductible(value: number): ValidationResult {
  if (value < 0) {
    return { isValid: false, error: "Deductible cannot be negative" };
  }
  if (value > 25000) {
    return { isValid: false, error: "Deductible exceeds reasonable limit ($25,000)" };
  }
  return { isValid: true };
}

/**
 * Validate percentage values - must be between 0 and 100
 */
export function validatePercentage(value: number): ValidationResult {
  if (value < 0) {
    return { isValid: false, error: "Percentage cannot be negative" };
  }
  if (value > 100) {
    return { isValid: false, error: "Percentage cannot exceed 100%" };
  }
  return { isValid: true };
}

/**
 * Validate copay values - must be positive and within reasonable limits
 */
export function validateCopay(value: number): ValidationResult {
  if (value < 0) {
    return { isValid: false, error: "Copay cannot be negative" };
  }
  if (value > 1000) {
    return { isValid: false, error: "Copay exceeds reasonable limit ($1,000)" };
  }
  return { isValid: true };
}

/**
 * Validate out-of-pocket maximum values - must be positive and within reasonable limits
 */
export function validateOutOfPocketMax(value: number): ValidationResult {
  if (value < 0) {
    return { isValid: false, error: "Out-of-pocket maximum cannot be negative" };
  }
  if (value > 50000) {
    return { isValid: false, error: "Out-of-pocket maximum exceeds reasonable limit ($50,000)" };
  }
  return { isValid: true };
}

/**
 * Validate plan year - must be reasonable year range
 */
export function validatePlanYear(value: number): ValidationResult {
  const currentYear = new Date().getFullYear();
  if (value < currentYear - 5) {
    return { isValid: false, error: `Plan year cannot be before ${currentYear - 5}` };
  }
  if (value > currentYear + 10) {
    return { isValid: false, error: `Plan year cannot be after ${currentYear + 10}` };
  }
  return { isValid: true };
}

/**
 * Sanitize string input to prevent XSS and clean up whitespace
 */
export function sanitizeStringInput(input: string): string {
  return input.trim().replace(/[<>]/g, '').replace(/\s+/g, ' ');
}

/**
 * Validate against dangerous patterns that could indicate injection attacks
 */
export function validateInputSafety(input: string): ValidationResult {
  const dangerousPatterns = /<script|javascript:|data:|on\w+=/i;
  if (dangerousPatterns.test(input)) {
    return { isValid: false, error: "Input contains potentially dangerous content" };
  }
  return { isValid: true };
}
