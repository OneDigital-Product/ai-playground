import { z } from "zod";

// Email validation schema
export const emailSchema = z
  .string()
  .email("Invalid email address")
  .refine(
    (email) => email.endsWith("@onedigital.com"),
    "Email must be from @onedigital.com domain",
  );

// Password validation schema
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

// Message validation schema
export const messageSchema = z.object({
  content: z
    .string()
    .min(1, "Message cannot be empty")
    .max(1000, "Message too long"),
});

// App validation schema
export const appSchema = z.object({
  slug: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
  active: z.boolean(),
});
