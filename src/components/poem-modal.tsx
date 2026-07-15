"use client";

import { useEffect, useRef, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { getPoemDetailsForModal } from "@/lib/interactions/actions";
import { InteractionButtons } from "@/components/interaction-buttons";
import { CommentSection } from "@/components/comment-section";

interface PoemModalProps {
  poem: {
    id: string;
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

interface CommentUser {
  id: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
}

interface ModalComment {
  id: string;
  text: string;
  userId: string;
  poemId: string;
  parentId: string | null;
  createdAt: Date;
  user?: CommentUser | null;
}

export function PoemModal({ poem, onClose }: PoemModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    likeCount: number;
    isLiked: boolean;
    isSaved: boolean;
    comments: ModalComment[];
    userId: string | null;
    isAdmin: boolean;
  } | null>(null);

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

  // Fetch comments and interaction status
  useEffect(() => {
    let isMounted = true;
    getPoemDetailsForModal(poem.id)
      .then((res) => {
        if (isMounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Error loading poem interactive details:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [poem.id]);

  const goToFullPage = () => {
    document.body.style.overflow = "";
    window.location.href = `/poems/${poem.slug}`;
  };

  const goToPoet = () => {
    document.body.style.overflow = "";
    window.location.href = `/poets/${poem.poet.slug}`;
  };

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
              <button
                onClick={goToPoet}
                className="hover:text-foreground transition-colors underline-offset-2 hover:underline"
              >
                {poem.poet.name}
              </button>
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
          className="flex-1 overflow-y-auto px-8 py-6 space-y-6"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {/* Poem body */}
          <div
            className="text-foreground/90 text-lg leading-[1.9] whitespace-pre-line"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            {poem.content}
          </div>

          {/* Social Interactions Divider */}
          <div className="border-t border-border/30 pt-6">
            {loading ? (
              <div className="flex items-center justify-center py-6 gap-2 text-sm text-muted-foreground">
                <Loader2 className="animate-spin" size={16} />
                <span>Loading interactions...</span>
              </div>
            ) : data ? (
              <div className="space-y-6">
                {/* Interaction Buttons (Like, Comment, Save, Share) */}
                <div className="py-2.5 border-y border-border/30 flex items-center justify-between">
                  <InteractionButtons
                    poemId={poem.id}
                    poemTitle={poem.title}
                    likeCount={data.likeCount}
                    isLiked={data.isLiked}
                    isSaved={data.isSaved}
                    isSignedIn={!!data.userId}
                    onLikeToggle={(newLiked, newCount) => {
                      setData((prev) =>
                        prev
                          ? {
                              ...prev,
                              isLiked: newLiked,
                              likeCount: newCount,
                            }
                          : null
                      );
                    }}
                    onSaveToggle={(newSaved) => {
                      setData((prev) =>
                        prev
                          ? {
                              ...prev,
                              isSaved: newSaved,
                            }
                          : null
                      );
                    }}
                  />
                </div>

                {/* Comment Section (Add Comment, Comments List) */}
                <CommentSection
                  poemId={poem.id}
                  comments={data.comments}
                  currentUserId={data.userId}
                  isAdmin={data.isAdmin}
                />
              </div>
            ) : (
              <div className="text-center py-4 text-sm text-muted-foreground">
                Could not load social features. Please try again.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-8 py-5 border-t border-border/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {!loading && data ? (
              <>
                <span>{data.likeCount} ♥</span>
                <span>{data.comments.length} 💬</span>
              </>
            ) : (
              <>
                <span>{poem.likeCount} ♥</span>
                <span>{poem.commentCount} 💬</span>
              </>
            )}
          </div>
          <button
            onClick={goToFullPage}
            className="liquid-glass rounded-full px-5 py-2 text-sm text-foreground transition-transform hover:scale-[1.03]"
          >
            Open full page →
          </button>
        </div>
      </div>
    </div>
  );
}
