import { v } from "convex/values";
import { query, mutation } from "../_generated/server.js";

const uploadKindValidator = v.union(
  v.literal("GUIDE"), 
  v.literal("PLAN_DOC"), 
  v.literal("PAYROLL_SCREEN"), 
  v.literal("OTHER")
);

// Create upload record
export const create = mutation({
  args: {
    intakeId: v.string(),
    kind: uploadKindValidator,
    originalName: v.string(),
    mimeType: v.string(),
    bytes: v.number(),
    storedKey: v.string(), // Convex storage ID or file key
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    
    const id = await ctx.db.insert("uploads", {
      intakeId: args.intakeId,
      kind: args.kind,
      originalName: args.originalName,
      mimeType: args.mimeType,
      bytes: args.bytes,
      storedKey: args.storedKey,
      createdAt: now,
    });
    
    return { _id: id };
  },
});

// Get upload by ID
export const get = query({
  args: { uploadId: v.id("uploads") },
  handler: async (ctx, args) => {
    const upload = await ctx.db.get(args.uploadId);
    return upload;
  },
});

// List uploads for an intake
export const listByIntake = query({
  args: { intakeId: v.string() },
  handler: async (ctx, args) => {
    const uploads = await ctx.db
      .query("uploads")
      .withIndex("by_intakeId", (q) => q.eq("intakeId", args.intakeId))
      .collect();
    
    // Sort by creation date, newest first
    return uploads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
});

// Delete upload
export const deleteUpload = mutation({
  args: { uploadId: v.id("uploads") },
  handler: async (ctx, args) => {
    const upload = await ctx.db.get(args.uploadId);
    
    if (!upload) {
      throw new Error("Upload not found");
    }
    
    // Note: In a real implementation, you would also delete the file from storage
    // For now, we just delete the record
    await ctx.db.delete(args.uploadId);
    
    return { success: true, storedKey: upload.storedKey };
  },
});

// Get upload metadata for download
export const download = query({
  args: { uploadId: v.id("uploads") },
  handler: async (ctx, args) => {
    const upload = await ctx.db.get(args.uploadId);
    
    if (!upload) {
      throw new Error("Upload not found");
    }
    
    // Return metadata needed for download
    return {
      originalName: upload.originalName,
      mimeType: upload.mimeType,
      bytes: upload.bytes,
      storedKey: upload.storedKey,
      intakeId: upload.intakeId,
    };
  },
});

// Get upload statistics for an intake
export const getStatsForIntake = query({
  args: { intakeId: v.string() },
  handler: async (ctx, args) => {
    const uploads = await ctx.db
      .query("uploads")
      .withIndex("by_intakeId", (q) => q.eq("intakeId", args.intakeId))
      .collect();
    
    const stats = {
      total: uploads.length,
      totalBytes: uploads.reduce((sum, upload) => sum + upload.bytes, 0),
      byKind: {} as Record<string, number>,
    };
    
    // Count by kind
    for (const upload of uploads) {
      stats.byKind[upload.kind] = (stats.byKind[upload.kind] || 0) + 1;
    }
    
    return stats;
  },
});

// Update upload metadata
export const updateMetadata = mutation({
  args: {
    uploadId: v.id("uploads"),
    originalName: v.optional(v.string()),
    kind: v.optional(uploadKindValidator),
  },
  handler: async (ctx, args) => {
    const upload = await ctx.db.get(args.uploadId);
    
    if (!upload) {
      throw new Error("Upload not found");
    }
    
    const updates: Partial<{
      originalName: string;
      kind: typeof upload.kind;
    }> = {};
    
    if (args.originalName !== undefined) {
      updates.originalName = args.originalName;
    }
    
    if (args.kind !== undefined) {
      updates.kind = args.kind;
    }
    
    await ctx.db.patch(args.uploadId, updates);
    
    return { success: true };
  },
});