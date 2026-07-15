"use client";

import { useState, useEffect } from "react";
import { Heart, Bookmark, Share2 } from "lucide-react";
import { toggleLike, toggleSave } from "@/lib/interactions/actions";
import { SharePoemDialog } from "@/components/share-poem-dialog";

interface InteractionButtonsProps {
  poemId: string;
  poemTitle: string;
  likeCount: number;
  isLiked: boolean;
  isSaved: boolean;
  isSignedIn: boolean;
  onLikeToggle?: (newLiked: boolean, newCount: number) => void;
  onSaveToggle?: (newSaved: boolean) => void;
}

export function InteractionButtons({
  poemId,
  poemTitle,
  likeCount,
  isLiked,
  isSaved,
  isSignedIn,
  onLikeToggle,
  onSaveToggle,
}: InteractionButtonsProps) {
  const [shareOpen, setShareOpen] = useState(false);
  const [likeState, setLikeState] = useState({ count: likeCount, liked: isLiked });
  const [saved, setSaved] = useState(isSaved);
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state if props change
  useEffect(() => {
    setLikeState({ count: likeCount, liked: isLiked });
  }, [likeCount, isLiked]);

  useEffect(() => {
    setSaved(isSaved);
  }, [isSaved]);

  const handleLike = async () => {
    if (!isSignedIn) {
      window.location.href = "/sign-in";
      return;
    }
    if (isLiking) return;

    const newLiked = !likeState.liked;
    const newCount = newLiked ? likeState.count + 1 : likeState.count - 1;

    // Instant local update
    setLikeState({ count: newCount, liked: newLiked });
    if (onLikeToggle) {
      onLikeToggle(newLiked, newCount);
    }

    setIsLiking(true);
    try {
      await toggleLike(poemId);
    } catch (err) {
      console.error("Failed to like:", err);
      // Rollback on failure
      const rollbackLiked = !newLiked;
      const rollbackCount = rollbackLiked ? newCount + 1 : newCount - 1;
      setLikeState({ count: rollbackCount, liked: rollbackLiked });
      if (onLikeToggle) {
        onLikeToggle(rollbackLiked, rollbackCount);
      }
    } finally {
      setIsLiking(false);
    }
  };

  const handleSave = async () => {
    if (!isSignedIn) {
      window.location.href = "/sign-in";
      return;
    }
    if (isSaving) return;

    const newSaved = !saved;
    setSaved(newSaved);
    if (onSaveToggle) {
      onSaveToggle(newSaved);
    }

    setIsSaving(true);
    try {
      await toggleSave(poemId);
    } catch (err) {
      console.error("Failed to save:", err);
      setSaved(!newSaved);
      if (onSaveToggle) {
        onSaveToggle(!newSaved);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = () => {
    if (!isSignedIn) {
      window.location.href = "/sign-in";
      return;
    }
    setShareOpen(true);
  };

  return (
    <>
      <div className="flex items-center gap-4">
        {/* Like */}
        <button
          onClick={handleLike}
          disabled={isLiking}
          className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-60"
          aria-label={likeState.liked ? "Unlike poem" : "Like poem"}
        >
          <Heart
            size={18}
            className={`transition-all duration-200 ${
              likeState.liked
                ? "fill-red-500 text-red-500 scale-110"
                : "group-hover:scale-110"
            }`}
          />
          <span
            className={`tabular-nums transition-colors ${
              likeState.liked ? "text-red-400" : ""
            }`}
          >
            {likeState.count}
          </span>
        </button>

        {/* Comment (scrolls to comment section) */}
        <button
          onClick={() => {
            const commentInput = document.querySelector('textarea[name="text"]') as HTMLTextAreaElement;
            if (commentInput) {
              commentInput.focus();
              commentInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else if (!isSignedIn) {
              window.location.href = "/sign-in";
            }
          }}
          className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Comment"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-200 group-hover:scale-110"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>Comment</span>
        </button>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-60"
          aria-label={saved ? "Unsave poem" : "Save poem"}
        >
          <Bookmark
            size={18}
            className={`transition-all duration-200 ${
              saved
                ? "fill-foreground text-foreground scale-110"
                : "group-hover:scale-110"
            }`}
          />
          <span>{saved ? "Saved" : "Save"}</span>
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Share poem"
        >
          <Share2
            size={18}
            className="transition-all duration-200 group-hover:scale-110"
          />
          <span>Share</span>
        </button>
      </div>

      <SharePoemDialog
        poemId={poemId}
        poemTitle={poemTitle}
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
      />
    </>
  );
}
