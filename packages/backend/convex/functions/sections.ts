import { v } from "convex/values";
import { query, mutation } from "../_generated/server.js";

const sectionCodeValidator = v.union(
  v.literal("A"), v.literal("B"), v.literal("C"), v.literal("D"), v.literal("E"), 
  v.literal("F"), v.literal("G"), v.literal("H"), v.literal("I"), v.literal("J"), 
  v.literal("K"), v.literal("L"), v.literal("M"), v.literal("N"), v.literal("O"), 
  v.literal("P"), v.literal("Q")
);

// Upsert section detail (create or update)
export const upsert = mutation({
  args: {
    intakeId: v.string(),
    sectionCode: sectionCodeValidator,
    payload: v.object({
      change_description: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    // Check if section already exists
    const existing = await ctx.db
      .query("section_details")
      .withIndex("by_intakeId_sectionCode", (q) => 
        q.eq("intakeId", args.intakeId).eq("sectionCode", args.sectionCode)
      )
      .unique();
    
    const now = new Date().toISOString();
    
    if (existing) {
      // Update existing section
      await ctx.db.patch(existing._id, {
        payload: args.payload,
      });
      return { _id: existing._id, updated: true };
    } else {
      // Create new section
      const id = await ctx.db.insert("section_details", {
        intakeId: args.intakeId,
        sectionCode: args.sectionCode,
        payload: args.payload,
        createdAt: now,
      });
      return { _id: id, updated: false };
    }
  },
});

// Get all sections for an intake
export const getByIntake = query({
  args: { intakeId: v.string() },
  handler: async (ctx, args) => {
    const sections = await ctx.db
      .query("section_details")
      .withIndex("by_intakeId", (q) => q.eq("intakeId", args.intakeId))
      .collect();
    
    return sections.sort((a, b) => a.sectionCode.localeCompare(b.sectionCode));
  },
});

// Bulk create sections
export const bulkCreate = mutation({
  args: {
    sections: v.array(v.object({
      intakeId: v.string(),
      sectionCode: sectionCodeValidator,
      payload: v.object({
        change_description: v.optional(v.string()),
      }),
    })),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    const results = [];
    
    for (const section of args.sections) {
      // Check if section already exists
      const existing = await ctx.db
        .query("section_details")
        .withIndex("by_intakeId_sectionCode", (q) => 
          q.eq("intakeId", section.intakeId).eq("sectionCode", section.sectionCode)
        )
        .unique();
      
      if (!existing) {
        // Create new section only if it doesn't exist
        const id = await ctx.db.insert("section_details", {
          intakeId: section.intakeId,
          sectionCode: section.sectionCode,
          payload: section.payload,
          createdAt: now,
        });
        results.push({ _id: id, sectionCode: section.sectionCode, created: true });
      } else {
        results.push({ _id: existing._id, sectionCode: section.sectionCode, created: false });
      }
    }
    
    return results;
  },
});

// Delete section
export const deleteSection = mutation({
  args: {
    intakeId: v.string(),
    sectionCode: sectionCodeValidator,
  },
  handler: async (ctx, args) => {
    const section = await ctx.db
      .query("section_details")
      .withIndex("by_intakeId_sectionCode", (q) => 
        q.eq("intakeId", args.intakeId).eq("sectionCode", args.sectionCode)
      )
      .unique();
    
    if (!section) {
      throw new Error("Section not found");
    }
    
    await ctx.db.delete(section._id);
    return { success: true };
  },
});

// Get specific section
export const getSection = query({
  args: {
    intakeId: v.string(),
    sectionCode: sectionCodeValidator,
  },
  handler: async (ctx, args) => {
    const section = await ctx.db
      .query("section_details")
      .withIndex("by_intakeId_sectionCode", (q) => 
        q.eq("intakeId", args.intakeId).eq("sectionCode", args.sectionCode)
      )
      .unique();
    
    return section;
  },
});