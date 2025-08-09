import { query } from "./_generated/server";
import { v } from "convex/values";

export const listActiveApps = query({
  args: {},
  handler: async (ctx) => {
    const apps = await ctx.db
      .query("apps")
      .filter((q) => q.eq(q.field("active"), true))
      .collect();

    return apps;
  },
});

export const getApp = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const app = await ctx.db
      .query("apps")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    return app;
  },
});
