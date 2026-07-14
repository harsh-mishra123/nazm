import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserById } from "@/lib/users/queries";
import { UsernameForm } from "./username-form";

export const metadata = {
  title: "Complete Your Profile -- nazm",
};

export default async function CompleteProfilePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await getUserById(userId);
  if (dbUser?.username) {
    redirect("/");
  }

  const clerkUser = await currentUser();
  const displayName = clerkUser?.firstName
    ? `${clerkUser.firstName}${clerkUser.lastName ? ` ${clerkUser.lastName}` : ""}`
    : null;

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1
            className="text-4xl"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Choose your username
          </h1>
          {displayName && (
            <p className="text-muted-foreground">
              Welcome, {displayName}. Pick a username to get started.
            </p>
          )}
          {!displayName && (
            <p className="text-muted-foreground">
              Pick a username to complete your profile.
            </p>
          )}
        </div>

        <UsernameForm />

        <p className="text-xs text-center text-muted-foreground">
          Your username must be 3-30 characters, start with a letter,
          and contain only lowercase letters, numbers, and underscores.
        </p>
      </div>
    </div>
  );
}
