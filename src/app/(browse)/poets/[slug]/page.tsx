import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getPoetBySlug } from "@/lib/poets/queries";
import { PoemCard } from "@/components/poem-card";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

interface PoetPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PoetPageProps): Promise<Metadata> {
  const { slug } = await params;
  const poet = await getPoetBySlug(slug);
  if (!poet) return { title: "Poet Not Found — nazm" };

  return {
    title: `${poet.name} — nazm`,
    description: poet.bio || `Poems by ${poet.name} on nazm.`,
  };
}

export default async function PoetPage({ params }: PoetPageProps) {
  const { slug } = await params;
  const poet = await getPoetBySlug(slug);
  if (!poet) notFound();

  const { userId } = await auth();

  return (
    <div className="space-y-10">
      {/* Poet Profile */}
      <header className="flex flex-col sm:flex-row items-start gap-6">
        <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center text-4xl text-muted-foreground overflow-hidden shrink-0 relative ring-2 ring-border/30">
          {poet.imageUrl ? (
            <Image
              src={poet.imageUrl}
              alt={poet.name}
              width={96}
              height={96}
              unoptimized
              className="w-full h-full object-cover"
            />
          ) : (
            <span style={{ fontFamily: "'Instrument Serif', serif" }}>
              {poet.name.charAt(0)}
            </span>
          )}
        </div>

        <div className="flex-1 space-y-3">
          <div className="space-y-1">
            <h1
              className="text-4xl sm:text-5xl font-normal"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              {poet.name}
            </h1>
            {poet.bio && (
              <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
                {poet.bio}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {poet._count.poems} poem{poet._count.poems !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {/* Explore poems — scrolls down */}
            <a
              href="#poems"
              className="liquid-glass inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm text-foreground transition-transform hover:scale-[1.03]"
            >
              <BookOpen size={15} />
              Explore Poems
            </a>

            {/* Chat — opens new chat flow (requires login) */}
            {userId ? (
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm text-muted-foreground border border-border/50 hover:border-border hover:text-foreground transition-all"
              >
                <MessageCircle size={15} />
                Chat with readers
              </Link>
            ) : (
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm text-muted-foreground border border-border/50 hover:border-border hover:text-foreground transition-all"
              >
                <MessageCircle size={15} />
                Sign in to chat
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Poems section */}
      <section id="poems" className="space-y-4 scroll-mt-24">
        <h2
          className="text-2xl font-normal"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Poems
        </h2>

        {poet.poems.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-muted-foreground">No published poems yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {poet.poems.map((poem) => (
              <PoemCard
                key={poem.id}
                id={poem.id}
                title={poem.title}
                slug={poem.slug}
                content={poem.content}
                coverUrl={poem.coverUrl}
                poet={{ name: poet.name, slug: poet.slug }}
                category={poem.category}
                likeCount={poem._count.likes}
                commentCount={poem._count.comments}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
