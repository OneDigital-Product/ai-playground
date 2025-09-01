import { v } from "convex/values";
import { query, mutation } from "../_generated/server.js";
import { generateIntakeId } from "../utils/idGenerator.js";
import { calculateComplexity, type SectionsFlags } from "../utils/complexity.js";
import {
  intakeCreateValidator,
  statusValidator,
  listFiltersValidator,
  validateNonEmptyString,
  validatePlanYear,
  sectionsValidator
} from "../validators/shared.js";

// Create intake
export const create = mutation({
  args: intakeCreateValidator,
  handler: async (ctx, args) => {
    // Additional validation with consistent error handling
    const clientName = validateNonEmptyString(args.clientName, "Client name");
    const requestorName = validateNonEmptyString(args.requestorName, "Requestor name");  
    const payrollStorageUrl = validateNonEmptyString(args.payrollStorageUrl, "Payroll storage URL");
    const planYear = validatePlanYear(args.planYear);
    
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
      clientName,
      planYear,
      requestorName,
      payrollStorageUrl,
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
  args: listFiltersValidator,
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
    status: statusValidator,
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

// Update intake properties that affect complexity
export const updateComplexityFactors = mutation({
  args: {
    intakeId: v.string(),
    sectionsChangedFlags: v.optional(sectionsValidator),
    guideType: v.optional(v.union(v.literal("Update Existing Guide"), v.literal("New Guide Build"))),
    communicationsAddOns: v.optional(v.union(
      v.literal("None"),
      v.literal("OE Letter"), 
      v.literal("OE Presentation"),
      v.literal("Both"),
      v.literal("Other")
    )),
  },
  handler: async (ctx, args) => {
    const intake = await ctx.db
      .query("intakes")
      .withIndex("by_intakeId", (q) => q.eq("intakeId", args.intakeId))
      .unique();
    
    if (!intake) {
      throw new Error("Intake not found");
    }
    
    // Build update object with provided fields
    const updateData: {
      updatedAt: string;
      sectionsChangedFlags?: SectionsFlags;
      guideType?: "Update Existing Guide" | "New Guide Build";
      communicationsAddOns?: "None" | "OE Letter" | "OE Presentation" | "Both" | "Other";
      complexityScore?: number;
      complexityBand?: "Minimal" | "Low" | "Medium" | "High";
    } = {
      updatedAt: new Date().toISOString(),
    };
    
    if (args.sectionsChangedFlags !== undefined) {
      updateData.sectionsChangedFlags = args.sectionsChangedFlags;
    }
    
    if (args.guideType !== undefined) {
      updateData.guideType = args.guideType;
    }
    
    if (args.communicationsAddOns !== undefined) {
      updateData.communicationsAddOns = args.communicationsAddOns;
    }
    
    // Recalculate complexity using updated values merged with existing ones
    const updatedIntake = {
      ...intake,
      ...updateData,
    };
    
    const { score, band } = calculateComplexity({
      sections_changed_flags: updatedIntake.sectionsChangedFlags,
      guide_type: updatedIntake.guideType,
      communications_add_ons: updatedIntake.communicationsAddOns,
    });
    
    updateData.complexityScore = score;
    updateData.complexityBand = band;
    
    await ctx.db.patch(intake._id, updateData);
    
    return { success: true, complexityScore: score, complexityBand: band };
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