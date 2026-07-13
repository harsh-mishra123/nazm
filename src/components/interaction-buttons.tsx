"use client";

import { useTransition } from "react";
import { Heart, Bookmark, Loader2 } from "lucide-react";
import { toggleLike, toggleSave } from "@/lib/interactions/actions";

interface InteractionButtonsProps {
  poemId: string;
  likeCount: number;
  isLiked: boolean;
  isSaved: boolean;
  isSignedIn: boolean;
}

export function InteractionButtons({
  poemId,
  likeCount,
  isLiked,
  isSaved,
  isSignedIn,
}: InteractionButtonsProps) {
  const [likePending, startLikeTransition] = useTransition();
  const [savePending, startSaveTransition] = useTransition();

  const handleLike = () => {
    if (!isSignedIn) {
      window.location.href = "/sign-in";
      return;
    }
    startLikeTransition(() => {
      toggleLike(poemId);
    });
  };

  const handleSave = () => {
    if (!isSignedIn) {
      window.location.href = "/sign-in";
      return;
    }
    startSaveTransition(() => {
      toggleSave(poemId);
    });
  };

  return (
    <div className="flex items-center gap-4">
      {/* Like */}
      <button
        onClick={handleLike}
        disabled={likePending}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
      >
        {likePending ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Heart
            size={18}
            className={isLiked ? "fill-red-500 text-red-500" : ""}
          />
        )}
        <span>{likeCount}</span>
      </button>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={savePending}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
      >
        {savePending ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Bookmark
            size={18}
            className={isSaved ? "fill-foreground text-foreground" : ""}
          />
        )}
        <span>{isSaved ? "Saved" : "Save"}</span>
      </button>
    </div>
  );
}
