import { notFound } from "next/navigation";
import { getPoetBySlug } from "@/lib/poets/queries";
import { PoemCard } from "@/components/poem-card";
import type { Metadata } from "next";
import Image from "next/image";

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

  return (
    <div className="space-y-10">
      {/* Poet Profile */}
      <header className="flex items-start gap-6">
        <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center text-3xl text-muted-foreground overflow-hidden shrink-0 relative">
          {poet.imageUrl ? (
            <Image
              src={poet.imageUrl}
              alt={poet.name}
              width={80}
              height={80}
              unoptimized
              className="w-full h-full object-cover"
            />
          ) : (
            <span style={{ fontFamily: "'Instrument Serif', serif" }}>
              {poet.name.charAt(0)}
            </span>
          )}
        </div>

        <div className="space-y-2">
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
      </header>

      {/* Poems */}
      {poet.poems.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-muted-foreground">No published poems yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {poet.poems.map((poem) => (
            <PoemCard
              key={poem.id}
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
    </div>
  );
}
