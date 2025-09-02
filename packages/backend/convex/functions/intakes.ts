import { v } from "convex/values";
import { query, mutation, action } from "../_generated/server.js";
import { api } from "../_generated/api.js";
import { generateIntakeId } from "../utils/idGenerator.js";
import { calculateComplexity, type SectionsFlags } from "../utils/complexity.js";
import { escapeCsv, sortForExport } from "../utils/csv.js";
import {
  intakeCreateValidator,
  statusValidator,
  listFiltersValidator,
  validateNonEmptyString,
  validatePlanYear,
  sectionsValidator,
  sectionCodeValidator
} from "../validators/shared.js";
import { applyFiltersAndSorting, type ListArgs } from "./helpers/listFilters.js";
import type { Doc } from "../_generated/dataModel.js";

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
    // Strategy: Prefer indexed lookups when a single selective filter is present.
    // Otherwise, fallback to full scan and filter in-memory (e.g., substring filters).

    let results: Array<Doc<"intakes">> = [];

    // Helper to de-duplicate by _id when unioning queries
    const dedupeById = (arr: typeof results) => {
      const map = new Map<string, (typeof results)[number]>();
      for (const r of arr) map.set(String(r._id), r);
      return Array.from(map.values());
    };

    const hasSingle = (arr?: unknown[]) => Array.isArray(arr) && arr.length === 1;
    const hasMany = (arr?: unknown[]) => Array.isArray(arr) && arr.length > 1;

    // 1) Use most selective index if possible
    if (hasSingle(args.status)) {
      results = await ctx.db
        .query("intakes")
        .withIndex("by_status", (q) => q.eq("status", args.status![0]!))
        .collect();
    } else if (hasSingle(args.complexityBand)) {
      results = await ctx.db
        .query("intakes")
        .withIndex("by_complexityBand", (q) => q.eq("complexityBand", args.complexityBand![0]!))
        .collect();
    } else if (typeof args.planYear === "number") {
      results = await ctx.db
        .query("intakes")
        .withIndex("by_planYear", (q) => q.eq("planYear", args.planYear!))
        .collect();
    } else {
      // Fallback: full scan
      results = await ctx.db.query("intakes").collect();
    }

    // 2) If multiple values provided for an indexed field, union queries for each value
    if (hasMany(args.status)) {
      let union: typeof results = [];
      for (const s of args.status as NonNullable<typeof args.status>) {
        const chunk = await ctx.db
          .query("intakes")
          .withIndex("by_status", (q) => q.eq("status", s))
          .collect();
        union = union.concat(chunk);
      }
      results = dedupeById(union);
    }
    if (hasMany(args.complexityBand)) {
      let union: typeof results = [];
      for (const b of args.complexityBand as NonNullable<typeof args.complexityBand>) {
        const chunk = await ctx.db
          .query("intakes")
          .withIndex("by_complexityBand", (q) => q.eq("complexityBand", b))
          .collect();
        union = union.concat(chunk);
      }
      results = dedupeById(union);
    }

    // 3) Apply remaining filters (and re-apply indexable ones for conjunction), then sort
    return applyFiltersAndSorting(results, args as unknown as ListArgs);
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

// Delete intake with cascading cleanup (action for storage operations)
export const deleteIntake = action({
  args: { intakeId: v.string() },
  handler: async (ctx, args) => {
    const intake = await ctx.runQuery(api.functions.intakes.get, { intakeId: args.intakeId });
    
    if (!intake) {
      throw new Error("Intake not found");
    }
    
    // Get all uploads for this intake
    const uploads = await ctx.runQuery(api.functions.uploads.listByIntake, { intakeId: args.intakeId });
    
    // Delete all upload files from storage and database records
    for (const upload of uploads) {
      try {
        // Delete file from storage
        await ctx.storage.delete(upload.storedKey);
        
        // Delete upload record
        await ctx.runMutation(api.functions.uploads.remove, { uploadId: upload._id });
      } catch (error) {
        // Continue even if deletion fails (record might already be deleted)
        console.warn(`Failed to delete upload ${upload._id}:`, error);
      }
    }
    
    // Delete all sections for this intake
    await ctx.runMutation(api.functions.sections.deleteByIntake, { intakeId: args.intakeId });
    
    // Delete the intake itself
    await ctx.runMutation(api.functions.intakes.remove, { intakeId: args.intakeId });
    
    return { success: true };
  },
});

// Internal mutation for deleting intake record
export const remove = mutation({
  args: { intakeId: v.string() },
  handler: async (ctx, args) => {
    const intake = await ctx.db
      .query("intakes")
      .withIndex("by_intakeId", (q) => q.eq("intakeId", args.intakeId))
      .unique();
    
    if (!intake) {
      throw new Error("Intake not found");
    }
    
    await ctx.db.delete(intake._id);
    return { success: true };
  },
});

// Update section flags (changed and/or included)
export const updateSectionFlags = mutation({
  args: {
    intakeId: v.string(),
    sectionCode: sectionCodeValidator,
    changed: v.optional(v.boolean()),
    included: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const intake = await ctx.db
      .query("intakes")
      .withIndex("by_intakeId", (q) => q.eq("intakeId", args.intakeId))
      .unique();
    
    if (!intake) {
      throw new Error("Intake not found");
    }
    
    // Build update object
    const updateData: {
      updatedAt: string;
      sectionsChangedFlags?: SectionsFlags;
      sectionsIncludedFlags?: SectionsFlags;
      complexityScore?: number;
      complexityBand?: "Minimal" | "Low" | "Medium" | "High";
    } = {
      updatedAt: new Date().toISOString(),
    };
    
    // Update changed flags if provided
    if (args.changed !== undefined) {
      updateData.sectionsChangedFlags = {
        ...intake.sectionsChangedFlags,
        [args.sectionCode]: args.changed,
      };
    }
    
    // Update included flags if provided
    if (args.included !== undefined) {
      updateData.sectionsIncludedFlags = {
        ...intake.sectionsIncludedFlags,
        [args.sectionCode]: args.included,
      };
    }
    
    // Recalculate complexity if changed flags were updated
    if (updateData.sectionsChangedFlags) {
      const { score, band } = calculateComplexity({
        sections_changed_flags: updateData.sectionsChangedFlags,
        guide_type: intake.guideType,
        communications_add_ons: intake.communicationsAddOns,
      });
      
      updateData.complexityScore = score;
      updateData.complexityBand = band;
    }
    
    await ctx.db.patch(intake._id, updateData);
    
    return { 
      success: true, 
      complexityScore: updateData.complexityScore,
      complexityBand: updateData.complexityBand 
    };
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
    sortBy: v.optional(
      v.union(
        v.literal("clientName"),
        v.literal("requestorName"),
        v.literal("guideType"),
        v.literal("communicationsAddOns"),
        v.literal("complexityBand"),
        v.literal("dateReceived"),
        v.literal("status"),
        v.literal("requestedProductionTime")
      )
    ),
    order: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
  },
  handler: async (ctx, args) => {
    // Pull all and filter like list; export scale is typically small enough
    let intakes = await ctx.db.query("intakes").collect();

    const filters = args.filters || {};

    if (filters.status && filters.status.length > 0) {
      intakes = intakes.filter((i) => filters.status!.includes(i.status));
    }
    if (filters.complexityBand && filters.complexityBand.length > 0) {
      intakes = intakes.filter((i) => filters.complexityBand!.includes(i.complexityBand));
    }
    if (filters.requestorName) {
      const needle = filters.requestorName.toLowerCase();
      intakes = intakes.filter((i) => i.requestorName.toLowerCase().includes(needle));
    }
    if (typeof filters.planYear === "number") {
      intakes = intakes.filter((i) => i.planYear === filters.planYear);
    }
    if (filters.requestedProductionTime && filters.requestedProductionTime.length > 0) {
      const set = new Set(filters.requestedProductionTime);
      intakes = intakes.filter((i) => set.has(i.requestedProductionTime));
    }

    // Sort
    const sortBy = args.sortBy || "dateReceived";
    const order = args.order || "desc";
    intakes = sortForExport(intakes, sortBy, order);

    // CSV header and rows
    const headers = [
      "Intake ID",
      "Client Name",
      "Plan Year",
      "Requestor Name",
      "Status",
      "Complexity Band",
      "Complexity Score",
      "Guide Type",
      "Communications Add-ons",
      "Requested Production Time",
      "Date Received",
      "Payroll Storage URL",
      "General Notes",
    ];

    const rows = intakes.map((i) =>
      [
        i.intakeId,
        i.clientName,
        i.planYear,
        i.requestorName,
        i.status,
        i.complexityBand,
        i.complexityScore,
        i.guideType,
        i.communicationsAddOns,
        i.requestedProductionTime,
        i.dateReceived,
        i.payrollStorageUrl,
        i.notesGeneral || "",
      ]
        .map(escapeCsv)
        .join(",")
    );

    return [headers.join(","), ...rows].join("\n");
  },
});
