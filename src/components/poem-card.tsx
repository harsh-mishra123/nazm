import Link from "next/link";
import { truncate } from "@/lib/utils";

interface PoemCardProps {
  title: string;
  slug: string;
  content: string;
  coverUrl?: string | null;
  poet: { name: string; slug: string };
  category?: { name: string; slug: string } | null;
  likeCount: number;
  commentCount: number;
}

export function PoemCard({
  title,
  slug,
  content,
  poet,
  category,
  likeCount,
  commentCount,
}: PoemCardProps) {
  return (
    <Link href={`/poems/${slug}`} className="group block">
      <article className="rounded-2xl border border-border/50 bg-card/50 p-6 transition-all duration-300 hover:border-border hover:bg-card/80 hover:shadow-lg hover:shadow-black/5">
        {/* Category badge */}
        {category && (
          <span className="inline-block text-xs text-muted-foreground bg-muted/50 rounded-full px-3 py-1 mb-3">
            {category.name}
          </span>
        )}

        {/* Title */}
        <h3
          className="text-xl font-normal mb-2 text-foreground group-hover:text-foreground/90 transition-colors"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          {title}
        </h3>

        {/* Excerpt */}
        <p className="text-sm text-muted-foreground leading-relaxed mb-4 whitespace-pre-line">
          {truncate(content, 120)}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="hover:text-foreground transition-colors">
            by {poet.name}
          </span>
          <div className="flex items-center gap-3">
            <span>{likeCount} ♥</span>
            <span>{commentCount} 💬</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
