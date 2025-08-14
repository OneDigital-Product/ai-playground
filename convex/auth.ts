import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Password({
      profile(params) {
        const email = params.email as string;

        // Validate email domain
        if (!email.endsWith("@onedigital.com")) {
          throw new Error("Email must be from @onedigital.com domain");
        }

        return {
          email: email,
          name: email,
        };
      },
    }),
  ],
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      const email = args.profile.email as string;

      // Check if user exists
      if (args.existingUserId) {
        return args.existingUserId;
      }

      // Create new user
      const userId = await ctx.db.insert("users", {
        email,
        emailVerificationTime: Date.now(),
      });

      // Check if this is the first admin user
      const isFirstAdmin = email === "aharvey@onedigital.com";

      // Create user profile
      await ctx.db.insert("userProfiles", {
        userId: userId,
        email: email,
        displayName: email,
        isAdmin: isFirstAdmin,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      return userId;
    },
  },
});
