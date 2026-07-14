"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { claimUsernameSchema } from "./validations";
import { ensureUserExists } from "./queries";
import { Prisma } from "@prisma/client";

/**
 * Claim a username for the current user.
 * Uses DB-level unique constraint to handle race conditions.
 */
export async function claimUsername(
  username: string
): Promise<{ success: boolean; error?: string }> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "You must be signed in" };
  }

  // Validate format
  const parsed = claimUsernameSchema.safeParse({ username });
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return { success: false, error: firstIssue?.message ?? "Invalid username" };
  }

  const cleanUsername = parsed.data.username;

  // Ensure user row exists before trying to set username
  await ensureUserExists(userId);

  // Check if user already has a username
  const currentUser = await db.user.findUnique({
    where: { id: userId },
    select: { username: true },
  });

  if (currentUser?.username) {
    return { success: false, error: "You already have a username" };
  }

  // Attempt to set username -- rely on the unique constraint
  try {
    await db.user.update({
      where: { id: userId },
      data: { username: cleanUsername },
    });
    return { success: true };
  } catch (err) {
    // Prisma unique constraint violation
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return { success: false, error: "This username is already taken" };
    }
    throw err;
  }
}
