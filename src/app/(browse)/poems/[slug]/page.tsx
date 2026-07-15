import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getPoemBySlug } from "@/lib/poems/queries";
import { getCommentsByPoemId } from "@/lib/comments/queries";
import { getUserLike, getUserSave } from "@/lib/interactions/queries";
import { formatDate } from "@/lib/utils";
import { checkIsAdmin } from "@/lib/auth";
import { InteractionButtons } from "@/components/interaction-buttons";
import { CommentSection } from "@/components/comment-section";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface PoemPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PoemPageProps): Promise<Metadata> {
  const { slug } = await params;
  const poem = await getPoemBySlug(slug);
  if (!poem) return { title: "Poem Not Found — nazm" };

  return {
    title: `${poem.title} by ${poem.poet.name} — nazm`,
    description: poem.content.slice(0, 160),
  };
}

export default async function PoemPage({ params }: PoemPageProps) {
  const { slug } = await params;
  const poem = await getPoemBySlug(slug);

  if (!poem || !poem.published) {
    notFound();
  }

  const { userId } = await auth();
  const comments = await getCommentsByPoemId(poem.id);

  let isLiked = false;
  let isSaved = false;
  if (userId) {
    const [like, save] = await Promise.all([
      getUserLike(userId, poem.id),
      getUserSave(userId, poem.id),
    ]);
    isLiked = !!like;
    isSaved = !!save;
  }

  return (
    <article className="max-w-3xl mx-auto space-y-10">
      {/* Header */}
      <header className="space-y-4">
        {poem.category && (
          <Link
            href={`/poems?category=${poem.category.slug}`}
            className="inline-block text-xs text-muted-foreground bg-muted/50 rounded-full px-3 py-1 hover:text-foreground transition-colors"
          >
            {poem.category.name}
          </Link>
        )}

        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-normal leading-[1.05]"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          {poem.title}
        </h1>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link
            href={`/poets/${poem.poet.slug}`}
            className="hover:text-foreground transition-colors"
          >
            by {poem.poet.name}
          </Link>
          <span>·</span>
          <time>{formatDate(poem.createdAt)}</time>
        </div>


      </header>

      {/* Poem content */}
      <div className="prose prose-invert max-w-none">
        <div className="text-foreground/90 text-lg leading-[1.8] whitespace-pre-line">
          {poem.content}
        </div>
      </div>

      {/* Recitation Videos */}
      {poem.videos.length > 0 && (
        <section className="space-y-4">
          <h2
            className="text-2xl font-normal"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Recitations
          </h2>
          <div className="grid gap-4">
            {poem.videos.map((video) => (
              <div
                key={video.id}
                className="rounded-2xl overflow-hidden border border-border/30"
              >
                <video
                  controls
                  playsInline
                  className="w-full aspect-video"
                  preload="metadata"
                >
                  <source src={video.videoUrl} type="video/mp4" />
                </video>
                {video.title && (
                  <div className="p-3 text-sm text-muted-foreground">
                    {video.title}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Interaction buttons */}
      <div className="py-2 border-y border-border/30 flex items-center justify-between">
        <InteractionButtons
          poemId={poem.id}
          poemTitle={poem.title}
          likeCount={poem._count.likes}
          isLiked={isLiked}
          isSaved={isSaved}
          isSignedIn={!!userId}
        />
      </div>

      {/* Comments */}
      <CommentSection
        poemId={poem.id}
        comments={comments}
        currentUserId={userId}
        isAdmin={await checkIsAdmin()}
      />
    </article>
  );
}
