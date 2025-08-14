import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  apps: defineTable({
    slug: v.string(),
    name: v.string(),
    active: v.boolean(),
    admins: v.array(v.id("users")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_slug", ["slug"]),

  messages: defineTable({
    userId: v.id("users"),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_created", ["createdAt"]),

  userProfiles: defineTable({
    userId: v.id("users"),
    email: v.string(),
    displayName: v.optional(v.string()),
    isAdmin: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_email", ["email"]),

  comments: defineTable({
    author: v.string(),
    content: v.string(),
  }),
});
