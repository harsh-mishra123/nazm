import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserSavedPoems } from "@/lib/interactions/queries";
import { PoemCard } from "@/components/poem-card";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Saved Poems — nazm",
  description: "Your saved poems collection.",
};

export default async function SavedPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const saves = await getUserSavedPoems(userId);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1
          className="text-4xl sm:text-5xl font-normal"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Saved Poems
        </h1>
        <p className="text-muted-foreground text-sm">
          Your personal collection of saved poems.
        </p>
      </div>

      {saves.length === 0 ? (
        <div className="py-20 text-center space-y-3">
          <p className="text-muted-foreground">
            You haven&apos;t saved any poems yet.
          </p>
          <Link
            href="/poems"
            className="inline-block text-sm text-foreground underline underline-offset-4 hover:text-foreground/80 transition-colors"
          >
            Browse poems →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {saves.map((save) => (
            <PoemCard
              key={save.id}
              title={save.poem.title}
              slug={save.poem.slug}
              content={save.poem.content}
              coverUrl={save.poem.coverUrl}
              poet={save.poem.poet}
              category={save.poem.category}
              likeCount={save.poem._count.likes}
              commentCount={save.poem._count.comments}
            />
          ))}
        </div>
      )}
    </div>
  );
}
