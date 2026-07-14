import { db } from "@/lib/db";

/**
 * Get the current user's profile from the database.
 * Returns null if the user does not exist in our DB yet.
 */
export async function getUserById(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      displayName: true,
      email: true,
      avatarUrl: true,
      createdAt: true,
    },
  });
}

/**
 * Get a user by their username. Used for public profile pages.
 */
export async function getUserByUsername(username: string) {
  return db.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      createdAt: true,
    },
  });
}

/**
 * Check if a username is available.
 * Returns true if available, false if taken.
 */
export async function checkUsernameAvailable(username: string): Promise<boolean> {
  const existing = await db.user.findUnique({
    where: { username },
    select: { id: true },
  });
  return existing === null;
}

/**
 * Search users by username prefix. Returns public profile cards.
 * Excludes the current user from results.
 */
export async function searchUsersByPrefix(
  query: string,
  excludeUserId?: string,
  limit: number = 20
) {
  return db.user.findMany({
    where: {
      username: {
        not: null,
        startsWith: query.toLowerCase(),
        mode: "insensitive",
      },
      ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
    },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
    },
    take: limit,
    orderBy: { username: "asc" },
  });
}

/**
 * Ensure a user row exists in our database.
 * Called when we need to reference a user who may not have been
 * synced via webhook yet (e.g., first interaction).
 */
export async function ensureUserExists(userId: string) {
  const existing = await db.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!existing) {
    await db.user.create({
      data: { id: userId },
    });
  }
}
