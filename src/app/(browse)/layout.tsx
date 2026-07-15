import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserById } from "@/lib/users/queries";
import { Navbar } from "@/components/navbar";

export default async function BrowseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  // Force signed-in users to choose a username before accessing any browse page.
  // /complete-profile lives outside this (browse) layout group, so no redirect loop.
  if (userId) {
    const user = await getUserById(userId);
    if (!user || !user.username) {
      redirect("/complete-profile");
    }
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {children}
      </main>
      <footer className="border-t border-border/40 py-8 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} nazm. All rights reserved.</p>
      </footer>
    </>
  );
}
