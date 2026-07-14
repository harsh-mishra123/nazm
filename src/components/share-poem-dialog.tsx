"use client";

import { useState, useTransition } from "react";
import { X, Send, Loader2, Check } from "lucide-react";
import { UserSearch } from "@/components/user-search";
import { sendPoemShare } from "@/lib/chat/actions";

interface SharePoemDialogProps {
  poemId: string;
  poemTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export function SharePoemDialog({
  poemId,
  poemTitle,
  isOpen,
  onClose,
}: SharePoemDialogProps) {
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  } | null>(null);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<"idle" | "success" | "error">("idle");

  if (!isOpen) return null;

  const handleSend = () => {
    if (!selectedUser) return;

    startTransition(async () => {
      const res = await sendPoemShare({
        recipientId: selectedUser.id,
        poemId,
        message: message.trim() || undefined,
      });

      if (res.success) {
        setResult("success");
        setTimeout(() => {
          onClose();
          // Reset state
          setSelectedUser(null);
          setMessage("");
          setResult("idle");
        }, 1500);
      } else {
        setResult("error");
      }
    });
  };

  const handleClose = () => {
    if (isPending) return;
    onClose();
    setSelectedUser(null);
    setMessage("");
    setResult("idle");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md rounded-2xl border border-border/50 bg-background p-6 space-y-5 shadow-xl">
        {/* Close */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={18} />
        </button>

        {/* Title */}
        <div className="space-y-1">
          <h2
            className="text-xl"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Share poem
          </h2>
          <p className="text-xs text-muted-foreground">
            Sharing &quot;{poemTitle}&quot;
          </p>
        </div>

        {/* User search */}
        {!selectedUser && (
          <UserSearch
            onSelect={setSelectedUser}
            placeholder="Search for a user..."
          />
        )}

        {/* Selected user */}
        {selectedUser && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-border/30">
            {selectedUser.avatarUrl ? (
              <img
                src={selectedUser.avatarUrl}
                alt=""
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-xs text-muted-foreground">
                @
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground truncate">
                @{selectedUser.username}
              </p>
              {selectedUser.displayName && (
                <p className="text-xs text-muted-foreground truncate">
                  {selectedUser.displayName}
                </p>
              )}
            </div>
            <button
              onClick={() => setSelectedUser(null)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Optional message */}
        {selectedUser && result === "idle" && (
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a message (optional)..."
            rows={2}
            maxLength={500}
            className="w-full rounded-xl bg-muted/30 border border-border/50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 resize-none transition-colors"
          />
        )}

        {/* Result */}
        {result === "success" && (
          <div className="flex items-center gap-2 text-green-500 text-sm">
            <Check size={16} />
            Poem shared
          </div>
        )}
        {result === "error" && (
          <p className="text-sm text-red-500">
            Failed to share poem. Please try again.
          </p>
        )}

        {/* Send button */}
        {selectedUser && result === "idle" && (
          <button
            onClick={handleSend}
            disabled={isPending}
            className="w-full liquid-glass rounded-xl px-6 py-3 text-sm text-foreground transition-transform hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send size={14} />
                Send
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
