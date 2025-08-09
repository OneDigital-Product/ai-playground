import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const send = mutation({
  args: { content: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Not authenticated");
    }

    const messageId = await ctx.db.insert("messages", {
      userId,
      content: args.content,
      createdAt: Date.now(),
    });

    return messageId;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_created")
      .order("desc")
      .take(50);

    // Get user profiles for display names
    const messagesWithProfiles = await Promise.all(
      messages.map(async (message) => {
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_userId", (q) => q.eq("userId", message.userId))
          .first();

        return {
          ...message,
          displayName: profile?.displayName || "Anonymous",
        };
      }),
    );

    return messagesWithProfiles.reverse();
  },
});
