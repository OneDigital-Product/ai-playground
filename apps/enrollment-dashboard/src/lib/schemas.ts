import { z } from "zod";

// =============================================================================
// SHARED ENUMS
// =============================================================================

export const GuideType = {
  UPDATE_EXISTING_GUIDE: "Update Existing Guide",
  NEW_GUIDE_BUILD: "New Guide Build"
} as const;

export const CommunicationsAddOns = {
  NONE: "None",
  OE_LETTER: "OE Letter",
  OE_PRESENTATION: "OE Presentation",
  BOTH: "Both",
  OTHER: "Other",
} as const;

export const ProductionTime = {
  STANDARD: "Standard",
  RUSH: "Rush"
} as const;

export const Status = {
  NOT_STARTED: "NOT_STARTED",
  STARTED: "STARTED", 
  ROADBLOCK: "ROADBLOCK",
  READY_FOR_QA: "READY_FOR_QA",
  DELIVERED_TO_CONSULTANT: "DELIVERED_TO_CONSULTANT"
} as const;

export const SectionCode = {
  A: "A", B: "B", C: "C", D: "D", E: "E", F: "F", G: "G", H: "H", I: "I",
  J: "J", K: "K", L: "L", M: "M", N: "N", O: "O", P: "P", Q: "Q"
} as const;

export const ComplexityBand = {
  MINIMAL: "Minimal",
  LOW: "Low", 
  MEDIUM: "Medium",
  HIGH: "High"
} as const;

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export type GuideType = typeof GuideType[keyof typeof GuideType];
export type CommunicationsAddOns = typeof CommunicationsAddOns[keyof typeof CommunicationsAddOns];

// New discriminated union for a single Communications Add-On item
export type CommunicationsAddOnItem =
  | typeof CommunicationsAddOns.OE_LETTER
  | typeof CommunicationsAddOns.OE_PRESENTATION
  | { type: typeof CommunicationsAddOns.OTHER; text: string };
export type ProductionTime = typeof ProductionTime[keyof typeof ProductionTime];
export type Status = typeof Status[keyof typeof Status];
export type SectionCode = typeof SectionCode[keyof typeof SectionCode];
export type ComplexityBand = typeof ComplexityBand[keyof typeof ComplexityBand];

export type SectionsFlags = {
  A: boolean; B: boolean; C: boolean; D: boolean; E: boolean; F: boolean; G: boolean;
  H: boolean; I: boolean; J: boolean; K: boolean; L: boolean; M: boolean; N: boolean;
  O: boolean; P: boolean; Q: boolean;
};

export type IntakeCreate = {
  clientName: string;
  planYear: number;
  requestorName: string;
  payrollStorageUrl: string;
  guideType: GuideType;
  communicationsAddOns: CommunicationsAddOnItem[]; // multi-select (Other may include text)
  requestedProductionTime: ProductionTime;
  notesGeneral?: string;
  sectionsChangedFlags?: SectionsFlags;
  sectionsIncludedFlags?: SectionsFlags;
  // Optional map of section descriptions keyed by A–Q
  sectionDescriptions?: Record<string, string>;
};

export type Intake = {
  _id: string;
  intakeId: string;
  clientName: string;
  planYear: number;
  requestorName: string;
  payrollStorageUrl: string;
  guideType: GuideType;
  communicationsAddOns: CommunicationsAddOnItem[]; // multi-select (Other may include text)
  requestedProductionTime: ProductionTime;
  notesGeneral?: string;
  status: Status;
  sectionsChangedFlags: SectionsFlags;
  sectionsIncludedFlags: SectionsFlags;
  complexityScore: number;
  complexityBand: ComplexityBand;
  dateReceived: string;
  createdAt: string;
  updatedAt: string;
};

export type SectionPayload = {
  change_description?: string;
};

// =============================================================================
// ZOD SCHEMAS FOR CLIENT-SIDE VALIDATION
// =============================================================================

// Section flags schema
export const sectionsSchema = z.object({
  A: z.boolean(),
  B: z.boolean(),
  C: z.boolean(),
  D: z.boolean(),
  E: z.boolean(),
  F: z.boolean(),
  G: z.boolean(),
  H: z.boolean(),
  I: z.boolean(),
  J: z.boolean(),
  K: z.boolean(),
  L: z.boolean(),
  M: z.boolean(),
  N: z.boolean(),
  O: z.boolean(),
  P: z.boolean(),
  Q: z.boolean(),
});

// Main intake create schema
export const intakeCreateSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  planYear: z.coerce.number().min(2025).max(2026), // Restrict to 2025–2026 per requirements
  requestorName: z.string().min(1, "Requestor name is required"),
  payrollStorageUrl: z
    .string()
    .min(1, "Payroll storage URL is required")
    .url("Enter a valid URL including http(s)://")
    .refine(
      (val) => {
        try {
          const u = new URL(val);
          return u.protocol === "http:" || u.protocol === "https:";
        } catch {
          return false;
        }
      },
      { message: "Enter a valid URL including http(s)://" }
    ), 
  guideType: z.enum([GuideType.UPDATE_EXISTING_GUIDE, GuideType.NEW_GUIDE_BUILD]),
  communicationsAddOns: z
    .array(
      z.union([
        z.literal(CommunicationsAddOns.OE_LETTER),
        z.literal(CommunicationsAddOns.OE_PRESENTATION),
        z.object({
          type: z.literal(CommunicationsAddOns.OTHER),
          text: z.string().min(1, "Please specify the Other communication type"),
        }),
      ])
    )
    .min(1, "Select at least one option"),
  requestedProductionTime: z.enum([ProductionTime.STANDARD, ProductionTime.RUSH]),
  notesGeneral: z.string().optional(),
  sectionsChangedFlags: sectionsSchema.optional(),
  sectionsIncludedFlags: sectionsSchema.optional(),
  // Record of section descriptions keyed by section code A–Q
  sectionDescriptions: z
    .record(
      z.enum([
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "M",
        "N",
        "O",
        "P",
        "Q",
      ]),
      z.string()
    )
    .optional(),
});

// Section payload schema (matches database with snake_case)
export const sectionPayloadSchema = z.object({
  change_description: z.string().optional(),
});

// Status update schema
export const statusUpdateSchema = z.object({
  status: z.enum([
    Status.NOT_STARTED,
    Status.STARTED,
    Status.ROADBLOCK,
    Status.READY_FOR_QA,
    Status.DELIVERED_TO_CONSULTANT
  ]),
});

// Filters schema for dashboard
export const filtersSchema = z.object({
  status: z.array(z.enum([
    Status.NOT_STARTED,
    Status.STARTED,
    Status.ROADBLOCK,
    Status.READY_FOR_QA,
    Status.DELIVERED_TO_CONSULTANT
  ])).optional(),
  complexityBand: z.array(z.enum([
    ComplexityBand.MINIMAL,
    ComplexityBand.LOW,
    ComplexityBand.MEDIUM,
    ComplexityBand.HIGH
  ])).optional(),
  requestorName: z.string().optional(),
  planYear: z.coerce.number().optional(),
  requestedProductionTime: z.array(z.enum([ProductionTime.STANDARD, ProductionTime.RUSH])).optional(),
});

// =============================================================================
// ERROR HANDLING
// =============================================================================

export type ApiError = {
  error: string;
  fieldErrors?: Record<string, string[]>;
};

export function formatZodError(error: z.ZodError): ApiError {
  const fieldErrors: Record<string, string[]> = {};
  
  error.issues.forEach((issue) => {
    const path = issue.path.join('.');
    if (!fieldErrors[path]) {
      fieldErrors[path] = [];
    }
    fieldErrors[path].push(issue.message);
  });

  return {
    error: "Validation failed",
    fieldErrors
  };
}

// Helper function to validate data and return formatted errors
export function validateIntakeCreate(data: unknown): { success: true; data: IntakeCreate } | { success: false; error: ApiError } {
  const result = intakeCreateSchema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return { success: false, error: formatZodError(result.error) };
}

export function validateSectionPayload(data: unknown): { success: true; data: SectionPayload } | { success: false; error: ApiError } {
  const result = sectionPayloadSchema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return { success: false, error: formatZodError(result.error) };
}
