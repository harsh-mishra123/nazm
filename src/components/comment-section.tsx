"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { addComment, deleteComment } from "@/lib/comments/actions";
import { formatDate } from "@/lib/utils";
import { Trash2, Loader2, Send, CornerDownRight, MessageSquare } from "lucide-react";

interface CommentUser {
  id: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
}

interface Comment {
  id: string;
  text: string;
  userId: string;
  poemId: string;
  parentId: string | null;
  createdAt: Date;
  user?: CommentUser | null;
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
  const [commentsList, setCommentsList] = useState<Comment[]>(comments);
  const [addPending, setAddPending] = useState<string | null>(null); // Stores "root" or parentId of reply
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const replyFormRef = useRef<HTMLFormElement>(null);

  // Sync state if props change
  useEffect(() => {
    setCommentsList(comments);
  }, [comments]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, parentId: string | null = null) => {
    e.preventDefault();
    if (!currentUserId) {
      window.location.href = "/sign-in";
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);
    const text = (formData.get("text") as string).trim();
    if (!text) return;

    formData.set("poemId", poemId);
    if (parentId) {
      formData.set("parentId", parentId);
    }

    // Build temporary optimistic comment
    const tempId = `optimistic-${Date.now()}`;
    const optimisticComment: Comment = {
      id: tempId,
      text,
      userId: currentUserId,
      poemId,
      parentId,
      createdAt: new Date(),
      user: {
        id: currentUserId,
        username: "You",
        displayName: "You",
        avatarUrl: null,
      },
    };

    // Instant local update
    setCommentsList((prev) => [...prev, optimisticComment]);
    form.reset();
    setReplyingToId(null);
    setAddPending(parentId || "root");

    try {
      const res = await addComment(formData);
      if (res.success && res.comment) {
        // Swap temp optimistic comment with actual server comment containing full DB ID and user profile
        const serverComment: Comment = {
          ...res.comment,
          createdAt: new Date(res.comment.createdAt),
        };
        setCommentsList((prev) =>
          prev.map((c) => (c.id === tempId ? serverComment : c))
        );
      }
    } catch (err) {
      console.error("Failed to add comment:", err);
      // Rollback on failure
      setCommentsList((prev) => prev.filter((c) => c.id !== tempId));
    } finally {
      setAddPending(null);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (deletingId) return;

    setDeletingId(commentId);
    // Instant local update
    const previousComments = [...commentsList];
    setCommentsList((prev) => prev.filter((c) => c.id !== commentId && c.parentId !== commentId));

    try {
      await deleteComment(commentId);
    } catch (err) {
      console.error("Failed to delete comment:", err);
      // Rollback on failure
      setCommentsList(previousComments);
    } finally {
      setDeletingId(null);
    }
  };

  // Group comments: root level vs replies
  const rootComments = commentsList.filter((c) => !c.parentId);
  const repliesMap = commentsList.reduce((acc, curr) => {
    if (curr.parentId) {
      if (!acc[curr.parentId]) {
        acc[curr.parentId] = [];
      }
      acc[curr.parentId].push(curr);
    }
    return acc;
  }, {} as Record<string, Comment[]>);

  const renderComment = (comment: Comment, isReply = false) => {
    const isOptimistic = comment.id.startsWith("optimistic-");
    const replies = repliesMap[comment.id] || [];

    return (
      <div
        key={comment.id}
        className={`rounded-xl border border-border/30 bg-card/30 p-4 space-y-3 transition-all duration-300 ${
          isOptimistic ? "opacity-60 scale-[0.99]" : "opacity-100"
        } ${isReply ? "ml-6 sm:ml-10 border-l-2 border-l-foreground/10" : ""}`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            {/* Display username or display name */}
            <span className="font-medium text-foreground">
              {comment.user?.displayName || comment.user?.username || "Anonymous"}
            </span>
            {comment.user?.username && comment.user.username !== "You" && (
              <span className="text-muted-foreground">@{comment.user.username}</span>
            )}
            
            {/* Chat Icon/Link with Reader (only if not self and logged in) */}
            {currentUserId && comment.userId !== currentUserId && !isOptimistic && (
              <Link
                href={`/chat/new?userId=${comment.userId}`}
                className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground gap-1 ml-1 pl-2 border-l border-border/40"
                title="Start a direct chat with this reader"
              >
                <MessageSquare size={12} className="text-muted-foreground group-hover:text-foreground" />
                <span className="underline decoration-dotted underline-offset-2">Chat</span>
              </Link>
            )}

            <span className="text-muted-foreground/60">•</span>
            <span className="text-muted-foreground/80">
              {isOptimistic ? "Posting..." : formatDate(comment.createdAt)}
            </span>
          </div>

          {!isOptimistic && (comment.userId === currentUserId || isAdmin) && (
            <button
              onClick={() => handleDelete(comment.id)}
              disabled={deletingId === comment.id}
              className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
              aria-label="Delete comment"
            >
              {deletingId === comment.id ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Trash2 size={13} />
              )}
            </button>
          )}
        </div>

        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
          {comment.text}
        </p>

        {/* Action toolbar for root comments */}
        {!isReply && !isOptimistic && (
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => setReplyingToId(replyingToId === comment.id ? null : comment.id)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <CornerDownRight size={12} />
              <span>Reply</span>
            </button>
          </div>
        )}

        {/* Reply Form inside comment */}
        {replyingToId === comment.id && (
          <form
            ref={replyFormRef}
            onSubmit={(e) => handleSubmit(e, comment.id)}
            className="mt-3 space-y-2 border-t border-border/20 pt-3"
          >
            <div className="relative">
              <textarea
                name="text"
                placeholder={`Reply to ${
                  comment.user?.displayName || comment.user?.username || "reader"
                }...`}
                required
                disabled={addPending !== null}
                rows={2}
                className="w-full rounded-xl bg-muted/20 border border-border/40 px-3 py-2 pr-10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 resize-none transition-colors"
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                    e.currentTarget.form?.requestSubmit();
                  }
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">
                Ctrl+Enter to post
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setReplyingToId(null)}
                  className="rounded-full px-4 py-1.5 text-xs text-muted-foreground hover:text-foreground border border-border/40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addPending !== null}
                  className="liquid-glass rounded-full px-4 py-1.5 text-xs text-foreground flex items-center gap-1.5"
                >
                  {addPending === comment.id ? (
                    <>
                      <Loader2 size={11} className="animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send size={11} />
                      Reply
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Recursive rendering of replies stack */}
        {replies.length > 0 && (
          <div className="space-y-3 pt-2">
            {replies.map((reply) => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h3
        className="text-2xl font-normal"
        style={{ fontFamily: "'Instrument Serif', serif" }}
      >
        Comments ({commentsList.length})
      </h3>

      {/* Add root comment form */}
      <form ref={formRef} onSubmit={(e) => handleSubmit(e, null)} className="space-y-3">
        <div className="relative">
          <textarea
            name="text"
            placeholder={
              currentUserId
                ? "Share your thoughts on this poem..."
                : "Sign in to comment"
            }
            required
            disabled={!currentUserId || addPending !== null}
            rows={3}
            className="w-full rounded-xl bg-muted/30 border border-border/50 px-4 py-3 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 resize-none transition-colors disabled:opacity-50"
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.currentTarget.form?.requestSubmit();
              }
            }}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {currentUserId ? "Ctrl+Enter to post" : ""}
          </span>
          <button
            type="submit"
            disabled={!currentUserId || addPending !== null}
            className="liquid-glass rounded-full px-6 py-2.5 text-sm text-foreground transition-transform hover:scale-[1.03] disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
          >
            {addPending === "root" ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Send size={14} />
                Post
              </>
            )}
          </button>
        </div>
      </form>

      {/* Comments list */}
      <div className="space-y-4">
        {rootComments.length === 0 && (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No comments yet. Be the first to share your thoughts.
          </p>
        )}
        {rootComments.map((comment) => renderComment(comment, false))}
      </div>
    </div>
  );
}
