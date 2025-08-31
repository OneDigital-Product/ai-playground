import { v } from "convex/values";
import { query, mutation } from "../_generated/server.js";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("messages").collect();
  },
});

export const send = mutation({
  args: { body: v.string(), author: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", { body: args.body, author: args.author });
  },
});
