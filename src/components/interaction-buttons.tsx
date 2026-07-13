"use client";

import { useOptimistic, useTransition } from "react";
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

  // Optimistic like state: instantly reflect toggle before server responds
  const [optimisticLike, setOptimisticLike] = useOptimistic<{
    count: number;
    liked: boolean;
  }>({ count: likeCount, liked: isLiked });

  // Optimistic save state
  const [optimisticSaved, setOptimisticSaved] = useOptimistic<boolean>(isSaved);

  const handleLike = () => {
    if (!isSignedIn) {
      window.location.href = "/sign-in";
      return;
    }
    startLikeTransition(async () => {
      // Optimistic update — flip instantly
      setOptimisticLike((prev) => ({
        count: prev.liked ? prev.count - 1 : prev.count + 1,
        liked: !prev.liked,
      }));
      await toggleLike(poemId);
    });
  };

  const handleSave = () => {
    if (!isSignedIn) {
      window.location.href = "/sign-in";
      return;
    }
    startSaveTransition(async () => {
      setOptimisticSaved((prev) => !prev);
      await toggleSave(poemId);
    });
  };

  return (
    <div className="flex items-center gap-4">
      {/* Like */}
      <button
        onClick={handleLike}
        disabled={likePending}
        className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-60"
        aria-label={optimisticLike.liked ? "Unlike poem" : "Like poem"}
      >
        <Heart
          size={18}
          className={`transition-all duration-200 ${
            optimisticLike.liked
              ? "fill-red-500 text-red-500 scale-110"
              : "group-hover:scale-110"
          }`}
        />
        <span
          className={`tabular-nums transition-colors ${
            optimisticLike.liked ? "text-red-400" : ""
          }`}
        >
          {optimisticLike.count}
        </span>
      </button>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={savePending}
        className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-60"
        aria-label={optimisticSaved ? "Unsave poem" : "Save poem"}
      >
        <Bookmark
          size={18}
          className={`transition-all duration-200 ${
            optimisticSaved
              ? "fill-foreground text-foreground scale-110"
              : "group-hover:scale-110"
          }`}
        />
        <span>{optimisticSaved ? "Saved" : "Save"}</span>
      </button>
    </div>
  );
}
