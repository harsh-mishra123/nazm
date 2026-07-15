"use client";

import { useState } from "react";
import Link from "next/link";
import { PoemModal } from "./poem-modal";
import { truncate } from "@/lib/utils";

interface PoemCardProps {
  id: string;
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
  id,
  title,
  slug,
  content,
  poet,
  category,
  likeCount,
  commentCount,
}: PoemCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="group relative text-left w-full">
        <button
          onClick={() => setOpen(true)}
          className="block w-full text-left"
          aria-label={`Read ${title}`}
        >
          <article className="rounded-2xl border border-border/50 bg-card/50 p-6 transition-all duration-300 hover:border-border hover:bg-card/80 hover:shadow-lg hover:shadow-black/5 h-full">
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
        </button>

        {/* Poet name as a real link overlaid on top — stops the modal button from firing */}
        <Link
          href={`/poets/${poet.slug}`}
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-[26px] left-6 text-xs text-muted-foreground hover:text-foreground transition-colors z-10"
          aria-label={`View ${poet.name}'s profile`}
        >
          by {poet.name}
        </Link>
      </div>

      {open && (
        <PoemModal
          poem={{ id, title, slug, content, poet, category, likeCount, commentCount }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
