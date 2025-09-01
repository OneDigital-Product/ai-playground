import { v } from "convex/values";
import { mutation, query } from "../_generated/server.js";

export const save = mutation({
  args: {
    eligibleEmployees: v.number(),
    participants: v.number(),
    investmentReturn: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("retirementPlans", args);
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("retirementPlans").collect();
  },
});
