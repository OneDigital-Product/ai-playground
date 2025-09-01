import { v } from "convex/values";
import { query, mutation } from "../_generated/server.js";
import { generateIntakeId } from "../utils/idGenerator.js";
import { calculateComplexity, type SectionsFlags } from "../utils/complexity.js";

// Section flags validator
const sectionsValidator = v.object({
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

// Create intake
export const create = mutation({
  args: {
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
    sectionsChangedFlags: v.optional(sectionsValidator),
    sectionsIncludedFlags: v.optional(sectionsValidator),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    const intakeId = generateIntakeId();
    
    // Default section flags
    const defaultSectionsChanged: SectionsFlags = {
      A: false, B: false, C: false, D: false, E: false, F: false, G: false, 
      H: false, I: false, J: false, K: false, L: false, M: false, N: false, 
      O: false, P: false, Q: false
    };
    
    const defaultSectionsIncluded: SectionsFlags = {
      A: true, B: true, C: true, D: true, E: true, F: true, G: true, 
      H: true, I: true, J: true, K: true, L: true, M: true, N: true, 
      O: true, P: true, Q: true
    };
    
    const sectionsChangedFlags = args.sectionsChangedFlags || defaultSectionsChanged;
    const sectionsIncludedFlags = args.sectionsIncludedFlags || defaultSectionsIncluded;
    
    // Calculate complexity
    const { score, band } = calculateComplexity({
      sections_changed_flags: sectionsChangedFlags,
      guide_type: args.guideType,
      communications_add_ons: args.communicationsAddOns,
    });
    
    const id = await ctx.db.insert("intakes", {
      intakeId,
      clientName: args.clientName,
      planYear: args.planYear,
      requestorName: args.requestorName,
      payrollStorageUrl: args.payrollStorageUrl,
      guideType: args.guideType,
      communicationsAddOns: args.communicationsAddOns,
      requestedProductionTime: args.requestedProductionTime,
      notesGeneral: args.notesGeneral,
      status: "NOT_STARTED",
      sectionsChangedFlags,
      sectionsIncludedFlags,
      complexityScore: score,
      complexityBand: band,
      dateReceived: now,
      createdAt: now,
      updatedAt: now,
    });
    
    return { intakeId, _id: id };
  },
});

// Get intake by intakeId
export const get = query({
  args: { intakeId: v.string() },
  handler: async (ctx, args) => {
    const intake = await ctx.db
      .query("intakes")
      .withIndex("by_intakeId", (q) => q.eq("intakeId", args.intakeId))
      .unique();
    return intake;
  },
});

// List intakes with filtering and sorting
export const list = query({
  args: {
    status: v.optional(v.array(v.union(
      v.literal("NOT_STARTED"), 
      v.literal("STARTED"), 
      v.literal("ROADBLOCK"), 
      v.literal("READY_FOR_QA"), 
      v.literal("DELIVERED_TO_CONSULTANT")
    ))),
    complexityBand: v.optional(v.array(v.union(
      v.literal("Minimal"), 
      v.literal("Low"), 
      v.literal("Medium"), 
      v.literal("High")
    ))),
    requestorName: v.optional(v.string()),
    planYear: v.optional(v.number()),
    requestedProductionTime: v.optional(v.array(v.union(v.literal("Standard"), v.literal("Rush")))),
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
  },
  handler: async (ctx, args) => {
    let results = await ctx.db.query("intakes").collect();
    
    // Apply filters
    if (args.status && args.status.length > 0) {
      results = results.filter(intake => args.status!.includes(intake.status));
    }
    
    if (args.complexityBand && args.complexityBand.length > 0) {
      results = results.filter(intake => args.complexityBand!.includes(intake.complexityBand));
    }
    
    if (args.requestorName) {
      results = results.filter(intake => 
        intake.requestorName.toLowerCase().includes(args.requestorName!.toLowerCase())
      );
    }
    
    if (args.planYear) {
      results = results.filter(intake => intake.planYear === args.planYear);
    }
    
    if (args.requestedProductionTime && args.requestedProductionTime.length > 0) {
      results = results.filter(intake => 
        args.requestedProductionTime!.includes(intake.requestedProductionTime)
      );
    }
    
    // Apply sorting
    const sortBy = args.sortBy || 'dateReceived';
    const order = args.order || 'desc';
    
    results.sort((a, b) => {
      let aVal: string | number = a[sortBy as keyof typeof a] as string | number;
      let bVal: string | number = b[sortBy as keyof typeof b] as string | number;
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
      }
      if (typeof bVal === 'string') {
        bVal = bVal.toLowerCase();
      }
      
      let comparison = 0;
      if (aVal < bVal) comparison = -1;
      if (aVal > bVal) comparison = 1;
      
      return order === 'asc' ? comparison : -comparison;
    });
    
    return results;
  },
});

// Update intake status
export const updateStatus = mutation({
  args: {
    intakeId: v.string(),
    status: v.union(
      v.literal("NOT_STARTED"), 
      v.literal("STARTED"), 
      v.literal("ROADBLOCK"), 
      v.literal("READY_FOR_QA"), 
      v.literal("DELIVERED_TO_CONSULTANT")
    ),
  },
  handler: async (ctx, args) => {
    const intake = await ctx.db
      .query("intakes")
      .withIndex("by_intakeId", (q) => q.eq("intakeId", args.intakeId))
      .unique();
    
    if (!intake) {
      throw new Error("Intake not found");
    }
    
    await ctx.db.patch(intake._id, {
      status: args.status,
      updatedAt: new Date().toISOString(),
    });
    
    return { success: true };
  },
});

// Delete intake
export const deleteIntake = mutation({
  args: { intakeId: v.string() },
  handler: async (ctx, args) => {
    const intake = await ctx.db
      .query("intakes")
      .withIndex("by_intakeId", (q) => q.eq("intakeId", args.intakeId))
      .unique();
    
    if (!intake) {
      throw new Error("Intake not found");
    }
    
    // Delete related records first
    const uploads = await ctx.db
      .query("uploads")
      .withIndex("by_intakeId", (q) => q.eq("intakeId", args.intakeId))
      .collect();
    
    const sections = await ctx.db
      .query("section_details")
      .withIndex("by_intakeId", (q) => q.eq("intakeId", args.intakeId))
      .collect();
    
    // Delete uploads
    for (const upload of uploads) {
      await ctx.db.delete(upload._id);
    }
    
    // Delete sections
    for (const section of sections) {
      await ctx.db.delete(section._id);
    }
    
    // Delete intake
    await ctx.db.delete(intake._id);
    
    return { success: true };
  },
});

// Get intake statistics
export const stats = query({
  args: {},
  handler: async (ctx) => {
    const intakes = await ctx.db.query("intakes").collect();
    
    const stats = {
      total: intakes.length,
      by_status: {} as Record<string, number>,
      by_complexity: {} as Record<string, number>,
      recent_count: 0,
    };
    
    // Count by status
    for (const intake of intakes) {
      stats.by_status[intake.status] = (stats.by_status[intake.status] || 0) + 1;
    }
    
    // Count by complexity
    for (const intake of intakes) {
      stats.by_complexity[intake.complexityBand] = (stats.by_complexity[intake.complexityBand] || 0) + 1;
    }
    
    // Recent (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoISO = sevenDaysAgo.toISOString();
    
    stats.recent_count = intakes.filter(intake => intake.dateReceived >= sevenDaysAgoISO).length;
    
    return stats;
  },
});

// Export CSV data
export const exportCsv = query({
  args: {
    filters: v.optional(v.object({
      status: v.optional(v.array(v.string())),
      complexityBand: v.optional(v.array(v.string())),
      requestorName: v.optional(v.string()),
      planYear: v.optional(v.number()),
      requestedProductionTime: v.optional(v.array(v.string())),
    })),
  },
  handler: async (ctx, args) => {
    // Get filtered intakes using the list query logic
    let intakes = await ctx.db.query("intakes").collect();
    
    const filters = args.filters || {};
    
    // Apply same filters as list function
    if (filters.status && filters.status.length > 0) {
      intakes = intakes.filter(intake => filters.status!.includes(intake.status));
    }
    
    if (filters.complexityBand && filters.complexityBand.length > 0) {
      intakes = intakes.filter(intake => filters.complexityBand!.includes(intake.complexityBand));
    }
    
    if (filters.requestorName) {
      intakes = intakes.filter(intake => 
        intake.requestorName.toLowerCase().includes(filters.requestorName!.toLowerCase())
      );
    }
    
    if (filters.planYear) {
      intakes = intakes.filter(intake => intake.planYear === filters.planYear);
    }
    
    if (filters.requestedProductionTime && filters.requestedProductionTime.length > 0) {
      intakes = intakes.filter(intake => 
        filters.requestedProductionTime!.includes(intake.requestedProductionTime)
      );
    }
    
    // Format data for CSV export
    const csvData = intakes.map(intake => ({
      intakeId: intake.intakeId,
      clientName: intake.clientName,
      planYear: intake.planYear,
      requestorName: intake.requestorName,
      status: intake.status,
      complexityBand: intake.complexityBand,
      complexityScore: intake.complexityScore,
      guideType: intake.guideType,
      communicationsAddOns: intake.communicationsAddOns,
      requestedProductionTime: intake.requestedProductionTime,
      dateReceived: intake.dateReceived,
      payrollStorageUrl: intake.payrollStorageUrl,
      notesGeneral: intake.notesGeneral || '',
    }));
    
    return csvData;
  },
});