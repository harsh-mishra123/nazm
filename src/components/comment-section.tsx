"use client";

import { useTransition } from "react";
import { addComment, deleteComment } from "@/lib/comments/actions";
import { formatDate } from "@/lib/utils";
import { Trash2, Loader2 } from "lucide-react";

interface Comment {
  id: string;
  text: string;
  userId: string;
  createdAt: Date;
}

interface CommentSectionProps {
  poemId: string;
  comments: Comment[];
  currentUserId: string | null;
  isAdmin: boolean;
}

export function CommentSection({
  poemId,
  comments,
  currentUserId,
  isAdmin,
}: CommentSectionProps) {
  const [addPending, startAddTransition] = useTransition();
  const [deletePending, startDeleteTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUserId) {
      window.location.href = "/sign-in";
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.set("poemId", poemId);
    const form = e.currentTarget;

    startAddTransition(async () => {
      await addComment(formData);
      form.reset();
    });
  };

  const handleDelete = (commentId: string) => {
    startDeleteTransition(() => {
      deleteComment(commentId);
    });
  };

  return (
    <div className="space-y-6">
      <h3
        className="text-2xl font-normal"
        style={{ fontFamily: "'Instrument Serif', serif" }}
      >
        Comments ({comments.length})
      </h3>

      {/* Add comment form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          name="text"
          placeholder={
            currentUserId
              ? "Share your thoughts on this poem..."
              : "Sign in to comment"
          }
          required
          disabled={!currentUserId || addPending}
          className="w-full rounded-xl bg-muted/30 border border-border/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 resize-none min-h-[100px] transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!currentUserId || addPending}
          className="liquid-glass rounded-full px-6 py-2.5 text-sm text-foreground transition-transform hover:scale-[1.03] disabled:opacity-50 disabled:hover:scale-100"
        >
          {addPending ? (
            <span className="flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" /> Posting...
            </span>
          ) : (
            "Post Comment"
          )}
        </button>
      </form>

      {/* Comments list */}
      <div className="space-y-4">
        {comments.length === 0 && (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No comments yet. Be the first to share your thoughts.
          </p>
        )}
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="rounded-xl border border-border/30 bg-card/30 p-4 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {formatDate(comment.createdAt)}
              </span>
              {(comment.userId === currentUserId || isAdmin) && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  disabled={deletePending}
                  className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                  aria-label="Delete comment"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
              {comment.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
