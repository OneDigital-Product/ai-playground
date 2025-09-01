import { v } from "convex/values";
import { query, mutation, action } from "../_generated/server.js";
import { api } from "../_generated/api.js";

const uploadKindValidator = v.union(
  v.literal("GUIDE"), 
  v.literal("PLAN_DOC"), 
  v.literal("PAYROLL_SCREEN"), 
  v.literal("OTHER")
);

// Allowed MIME types
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
  'image/png',
  'image/jpeg',
  'image/jpg',
];

export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB in bytes

// Exported helper for unit tests and shared validation
export function validateUploadInput(file: { size: number; type: string }) {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `File size (${Math.round(file.size / 1024 / 1024)}MB) exceeds maximum allowed size of 25MB`
    );
  }
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(
      `File type ${file.type} is not allowed. Allowed types: PDF, DOCX, XLSX, PNG, JPG`
    );
  }
}

// Test helper to simulate delete without Convex ctx
export async function performDeleteWithMocks(
  storage: { delete: (key: string) => Promise<any> | any },
  remover: (args: { uploadId: any }) => Promise<any> | any,
  upload: { storedKey: string; _id: any }
) {
  await storage.delete(upload.storedKey);
  await remover({ uploadId: upload._id });
}

// Upload action that handles file storage
export const uploadFile = action({
  args: {
    intakeId: v.string(),
    kind: uploadKindValidator,
    file: v.any(), // File blob
  },
  handler: async (ctx, args) => {
    const { file, intakeId, kind } = args;
    
    // Validate file
    validateUploadInput({ size: file.size, type: file.type });
    
    // Store file in Convex storage
    const storageId = await ctx.storage.store(file);
    
    // Create database record
    const uploadId = await ctx.runMutation(api.functions.uploads.create, {
      intakeId,
      kind,
      originalName: file.name,
      mimeType: file.type,
      bytes: file.size,
      storedKey: storageId,
    });
    
    return { 
      _id: uploadId._id, 
      originalName: file.name,
      mimeType: file.type,
      bytes: file.size,
      kind 
    };
  },
});

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

// Delete upload action that also removes the file from storage
export const deleteUpload = action({
  args: { uploadId: v.id("uploads") },
  handler: async (ctx, args) => {
    // Get upload metadata first
    const upload = await ctx.runQuery(api.functions.uploads.get, { uploadId: args.uploadId });
    
    if (!upload) {
      throw new Error("Upload not found");
    }
    
    // Delete file from storage
    await ctx.storage.delete(upload.storedKey);
    
    // Delete database record
    await ctx.runMutation(api.functions.uploads.remove, { uploadId: args.uploadId });
    
    return { success: true };
  },
});

// Internal mutation for deleting upload record
export const remove = mutation({
  args: { uploadId: v.id("uploads") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.uploadId);
    return { success: true };
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

// Get download URL for file
export const getDownloadUrl = action({
  args: { uploadId: v.id("uploads") },
  handler: async (ctx, args) => {
    const upload = await ctx.runQuery(api.functions.uploads.get, { uploadId: args.uploadId });
    
    if (!upload) {
      throw new Error("Upload not found");
    }
    
    // Generate signed URL for download
    const url = await ctx.storage.getUrl(upload.storedKey);
    
    return {
      url,
      originalName: upload.originalName,
      mimeType: upload.mimeType,
      bytes: upload.bytes,
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
