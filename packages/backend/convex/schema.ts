import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  messages: defineTable({
    body: v.string(),
    author: v.string(),
  }),
  retirementPlans: defineTable({
    eligibleEmployees: v.number(),
    participants: v.number(),
    investmentReturn: v.number(),
  }),
  // Enrollment Dashboard tables
  intakes: defineTable({
    intakeId: v.string(),
    clientName: v.string(),
    planYear: v.number(),
    requestorName: v.string(),
    payrollStorageUrl: v.string(),
    guideType: v.union(v.literal("Update Existing Guide"), v.literal("New Guide Build")),
    communicationsAddOns: v.union(
      v.literal("None"), 
      v.literal("OE Letter"), 
      v.literal("OE Presentation"), 
      v.literal("Both"), 
      v.literal("Other")
    ),
    requestedProductionTime: v.union(v.literal("Standard"), v.literal("Rush")),
    notesGeneral: v.optional(v.string()),
    status: v.union(
      v.literal("NOT_STARTED"), 
      v.literal("STARTED"), 
      v.literal("ROADBLOCK"), 
      v.literal("READY_FOR_QA"), 
      v.literal("DELIVERED_TO_CONSULTANT")
    ),
    sectionsChangedFlags: v.object({
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
    }),
    sectionsIncludedFlags: v.object({
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
    }),
    complexityScore: v.number(),
    complexityBand: v.union(
      v.literal("Minimal"), 
      v.literal("Low"), 
      v.literal("Medium"), 
      v.literal("High")
    ),
    dateReceived: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_dateReceived", ["dateReceived"])
    .index("by_status", ["status"])
    .index("by_complexityBand", ["complexityBand"])
    .index("by_planYear", ["planYear"])
    .index("by_requestorName", ["requestorName"])
    .index("by_intakeId", ["intakeId"]),

  section_details: defineTable({
    intakeId: v.string(),
    sectionCode: v.union(
      v.literal("A"), v.literal("B"), v.literal("C"), v.literal("D"), v.literal("E"), 
      v.literal("F"), v.literal("G"), v.literal("H"), v.literal("I"), v.literal("J"), 
      v.literal("K"), v.literal("L"), v.literal("M"), v.literal("N"), v.literal("O"), 
      v.literal("P"), v.literal("Q")
    ),
    payload: v.object({
      change_description: v.optional(v.string()),
    }),
    createdAt: v.string(),
  })
    .index("by_intakeId", ["intakeId"])
    .index("by_intakeId_sectionCode", ["intakeId", "sectionCode"]),

  uploads: defineTable({
    intakeId: v.string(),
    kind: v.union(
      v.literal("GUIDE"), 
      v.literal("PLAN_DOC"), 
      v.literal("PAYROLL_SCREEN"), 
      v.literal("OTHER")
    ),
    originalName: v.string(),
    mimeType: v.string(),
    bytes: v.number(),
    storedKey: v.string(),
    createdAt: v.string(),
  })
    .index("by_intakeId", ["intakeId"]),
});
