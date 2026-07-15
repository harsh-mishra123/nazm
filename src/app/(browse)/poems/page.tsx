import { getPublishedPoems } from "@/lib/poems/queries";
import { getAllCategories } from "@/lib/categories/queries";
import { PoemCard } from "@/components/poem-card";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Browse Poems — nazm",
  description: "Explore our collection of poems, organized by poet and category.",
};

export default async function PoemsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [poems, categories] = await Promise.all([
    getPublishedPoems({ categorySlug: category }),
    getAllCategories(),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1
          className="text-4xl sm:text-5xl font-normal"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Poems
        </h1>
        <p className="text-muted-foreground text-sm">
          Explore our growing collection of poetry.
        </p>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Link
            href="/poems"
            className={`text-xs rounded-full px-4 py-1.5 transition-colors ${
              !category
                ? "bg-foreground text-background"
                : "bg-muted/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/poems?category=${cat.slug}`}
              className={`text-xs rounded-full px-4 py-1.5 transition-colors ${
                category === cat.slug
                  ? "bg-foreground text-background"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      {/* Poems Grid */}
      {poems.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-muted-foreground">No poems found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {poems.map((poem) => (
            <PoemCard
              key={poem.id}
              id={poem.id}
              title={poem.title}
              slug={poem.slug}
              content={poem.content}
              coverUrl={poem.coverUrl}
              poet={poem.poet}
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
