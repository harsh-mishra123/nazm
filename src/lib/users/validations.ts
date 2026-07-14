import { z } from "zod/v4";

export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be at most 30 characters")
  .regex(
    /^[a-z][a-z0-9_]*$/,
    "Username must start with a letter and contain only lowercase letters, numbers, and underscores"
  );

export const claimUsernameSchema = z.object({
  username: usernameSchema,
});
