import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  messages: defineTable({
    body: v.string(),
    author: v.string(),
  }),
  retirementPlans: defineTable({
    eligibleEmployees: v.number(),
    participants: v.number(),
    investmentReturn: v.number(),
  }),
});
