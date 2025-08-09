import { action } from "./_generated/server";
import { v } from "convex/values";
import {
  getAuthUserId,
  getAuthSessionId,
  retrieveAccount,
  modifyAccountCredentials,
  invalidateSessions,
} from "@convex-dev/auth/server";

export const changePassword = action({
  args: {
    email: v.string(),
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, { email, currentPassword, newPassword }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (newPassword.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    // Verify current password belongs to the same authenticated user
    const result = await retrieveAccount(ctx, {
      provider: "password",
      account: { id: email, secret: currentPassword },
    });
    if (!result) throw new Error("Current password is incorrect");

    // Ensure the retrieved account's user matches the authenticated user
    // retrieveAccount returns the user document
    const retrievedUser: any = result as any;
    if (retrievedUser._id !== userId) {
      throw new Error("Email does not match the authenticated account");
    }

    await modifyAccountCredentials(ctx, {
      provider: "password",
      account: { id: email, secret: newPassword },
    });

    const currentSessionId = await getAuthSessionId(ctx);
    await invalidateSessions(ctx, {
      userId,
      except: currentSessionId ? [currentSessionId] : [],
    });

    return { ok: true };
  },
});
