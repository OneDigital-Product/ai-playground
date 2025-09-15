import { v } from "convex/values";
import { query, mutation } from "../_generated/server.js";

export const list = query({
  args: {
    start: v.optional(v.object({ month: v.number(), year: v.number() })),
    end: v.optional(v.object({ month: v.number(), year: v.number() })),
  },
  handler: async (ctx, args) => {
    let items = await ctx.db.query("stewardshipItems").collect();
    const encode = (m: number, y: number) => y * 100 + m;
    if (args.start) {
      const startKey = encode(args.start.month, args.start.year);
      items = items.filter((i) => encode(i.month, i.year) >= startKey);
    }
    if (args.end) {
      const endKey = encode(args.end.month, args.end.year);
      items = items.filter((i) => encode(i.month, i.year) <= endKey);
    }
    return items.sort(
      (a, b) => encode(b.month, b.year) - encode(a.month, a.year),
    );
  },
});

export const create = mutation({
  args: {
    description: v.string(),
    month: v.number(),
    year: v.number(),
    category: v.optional(v.string()),
    metadata: v.optional(
      v.object({
        notes: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("stewardshipItems", {
      description: args.description,
      month: args.month,
      year: args.year,
      category: args.category,
      metadata: args.metadata,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("stewardshipItems"),
    description: v.string(),
    month: v.number(),
    year: v.number(),
    category: v.optional(v.string()),
    metadata: v.optional(
      v.object({
        notes: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    await ctx.db.patch(id, rest);
  },
});

export const remove = mutation({
  args: { id: v.id("stewardshipItems") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
