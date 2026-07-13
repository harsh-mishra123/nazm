import { auth, currentUser } from "@clerk/nextjs/server";

/**
 * Validates if the current logged-in user is the admin.
 * Checks both ADMIN_USER_ID and ADMIN_EMAIL environment variables.
 */
export async function checkIsAdmin(): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;

  const adminUserId = process.env.ADMIN_USER_ID;
  if (adminUserId && userId === adminUserId) return true;

  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress;
    if (email === adminEmail) return true;
  }

  return false;
}
