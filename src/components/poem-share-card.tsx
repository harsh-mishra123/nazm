"use client";

import { formatDate, truncate } from "@/lib/utils";
import Link from "next/link";

interface PoemData {
  id: string;
  title: string;
  slug: string;
  content: string;
  poet: { name: string };
}

interface PoemShareCardProps {
  poem: PoemData;
}

/**
 * Compact poem card rendered inline in chat messages
 * when type is POEM_SHARE.
 */
export function PoemShareCard({ poem }: PoemShareCardProps) {
  const firstLines = poem.content
    .split("\n")
    .filter((line) => line.trim())
    .slice(0, 3)
    .join("\n");

  return (
    <Link
      href={`/poems/${poem.slug}`}
      className="block rounded-lg border border-border/30 bg-muted/20 p-3 space-y-1.5 hover:bg-muted/30 transition-colors"
    >
      <p
        className="text-sm font-medium text-foreground"
        style={{ fontFamily: "'Instrument Serif', serif" }}
      >
        {poem.title}
      </p>
      <p className="text-xs text-muted-foreground">by {poem.poet.name}</p>
      <p className="text-xs text-foreground/70 whitespace-pre-wrap leading-relaxed">
        {truncate(firstLines, 120)}
      </p>
    </Link>
  );
}
