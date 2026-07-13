"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { X } from "lucide-react";

interface PoemModalProps {
  poem: {
    title: string;
    slug: string;
    content: string;
    poet: { name: string; slug: string };
    category?: { name: string; slug: string } | null;
    likeCount: number;
    commentCount: number;
  };
  onClose: () => void;
}

export function PoemModal({ poem, onClose }: PoemModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        animation: "modal-fade-in 0.2s ease-out both",
      }}
    >
      {/* Panel */}
      <div
        className="relative w-full sm:max-w-2xl bg-card border border-border/50 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col"
        style={{
          maxHeight: "92dvh",
          animation: "modal-slide-up 0.28s cubic-bezier(0.34,1.56,0.64,1) both",
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-8 pt-8 pb-4 shrink-0">
          <div className="space-y-1 min-w-0">
            {poem.category && (
              <span className="inline-block text-[11px] text-muted-foreground bg-muted/50 rounded-full px-3 py-0.5 mb-1">
                {poem.category.name}
              </span>
            )}
            <h2
              className="text-3xl sm:text-4xl font-normal leading-tight"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              {poem.title}
            </h2>
            <p className="text-sm text-muted-foreground">
              by{" "}
              <Link
                href={`/poets/${poem.poet.slug}`}
                className="hover:text-foreground transition-colors"
                onClick={onClose}
              >
                {poem.poet.name}
              </Link>
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 mt-1 text-muted-foreground hover:text-foreground transition-colors rounded-full p-1.5 hover:bg-muted/30"
          >
            <X size={18} />
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-border/30 mx-8 shrink-0" />

        {/* Scrollable content */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-8 py-6"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div
            className="text-foreground/90 text-lg leading-[1.9] whitespace-pre-line"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            {poem.content}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-8 py-5 border-t border-border/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{poem.likeCount} ♥</span>
            <span>{poem.commentCount} 💬</span>
          </div>
          <Link
            href={`/poems/${poem.slug}`}
            className="liquid-glass rounded-full px-5 py-2 text-sm text-foreground transition-transform hover:scale-[1.03]"
            onClick={onClose}
          >
            Open full page →
          </Link>
        </div>
      </div>
    </div>
  );
}
