import { v } from "convex/values";

// =============================================================================
// SHARED CONVEX VALIDATORS 
// =============================================================================

// Guide Type validator
export const guideTypeValidator = v.union(
  v.literal("Update Existing Guide"), 
  v.literal("New Guide Build")
);

// Communications Add-Ons validator (array)
export const communicationsAddOnsValidator = v.array(
  v.union(
    v.literal("OE Letter"),
    v.literal("OE Presentation"),
    v.literal("Other"),
    v.object({ type: v.literal("Other"), text: v.string() })
  )
);

// Production Time validator
export const productionTimeValidator = v.union(
  v.literal("Standard"),
  v.literal("Rush")
);

// Status validator
export const statusValidator = v.union(
  v.literal("NOT_STARTED"),
  v.literal("STARTED"),
  v.literal("ROADBLOCK"),
  v.literal("READY_FOR_QA"),
  v.literal("DELIVERED_TO_CONSULTANT")
);

// Section Code validator
export const sectionCodeValidator = v.union(
  v.literal("A"), v.literal("B"), v.literal("C"), v.literal("D"), v.literal("E"),
  v.literal("F"), v.literal("G"), v.literal("H"), v.literal("I"), v.literal("J"),
  v.literal("K"), v.literal("L"), v.literal("M"), v.literal("N"), v.literal("O"),
  v.literal("P"), v.literal("Q")
);

// Complexity Band validator
export const complexityBandValidator = v.union(
  v.literal("Minimal"),
  v.literal("Low"),
  v.literal("Medium"),
  v.literal("High")
);

// Sections flags validator - mirrors the schema structure
export const sectionsValidator = v.object({
  A: v.boolean(),
  B: v.boolean(),
  C: v.boolean(),
  D: v.boolean(),
  E: v.boolean(),
  F: v.boolean(),
  G: v.boolean(),
  H: v.boolean(),
  I: v.boolean(),
  J: v.boolean(),
  K: v.boolean(),
  L: v.boolean(),
  M: v.boolean(),
  N: v.boolean(),
  O: v.boolean(),
  P: v.boolean(),
  Q: v.boolean(),
});

// Intake create validator - mirrors the Zod schema
export const intakeCreateValidator = v.object({
  clientName: v.string(),
  planYear: v.number(), 
  requestorName: v.string(),
  payrollStorageUrl: v.string(),
  guideType: guideTypeValidator,
  communicationsAddOns: communicationsAddOnsValidator,
  requestedProductionTime: productionTimeValidator,
  notesGeneral: v.optional(v.string()),
  sectionsChangedFlags: v.optional(sectionsValidator),
  sectionsIncludedFlags: v.optional(sectionsValidator),
});

// Section payload validator (matches database schema with snake_case)
export const sectionPayloadValidator = v.object({
  change_description: v.optional(v.string()),
});

// Status update validator
export const statusUpdateValidator = v.object({
  status: statusValidator,
});

// List query filters validator
export const listFiltersValidator = v.object({
  status: v.optional(v.array(statusValidator)),
  complexityBand: v.optional(v.array(complexityBandValidator)),
  requestorName: v.optional(v.string()),
  planYear: v.optional(v.number()),
  requestedProductionTime: v.optional(v.array(productionTimeValidator)),
  sortBy: v.optional(v.union(
    v.literal("clientName"),
    v.literal("requestorName"),
    v.literal("guideType"),
    v.literal("communicationsAddOns"),
    v.literal("complexityBand"),
    v.literal("dateReceived"),
    v.literal("status"),
    v.literal("requestedProductionTime")
  )),
  order: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
});

// =============================================================================
// ERROR HANDLING UTILITIES
// =============================================================================

export type ConvexError = {
  error: string;
  fieldErrors?: Record<string, string[]>;
};

export function createValidationError(message: string, fieldErrors?: Record<string, string[]>): ConvexError {
  return {
    error: message,
    fieldErrors
  };
}

// Helper to validate non-empty strings (similar to Zod's min(1))
export function validateNonEmptyString(value: string, fieldName: string): string | never {
  if (!value || value.trim().length === 0) {
    throw new Error(`${fieldName} is required`);
  }
  return value.trim();
}

// Helper to validate plan year range
export function validatePlanYear(year: number): number | never {
  if (year < 2025 || year > 2026) {
    throw new Error("Plan year must be between 2025 and 2026");
  }
  return year;
}
