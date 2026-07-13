"use client";

import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";

interface AdminDeleteButtonProps {
  id: string;
  action: (id: string) => Promise<{ success: boolean }>;
  label: string;
}

export function AdminDeleteButton({
  id,
  action,
  label,
}: AdminDeleteButtonProps) {
  const [pending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm(`Are you sure you want to delete this ${label}?`)) return;
    startTransition(() => {
      action(id);
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={pending}
      className="text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1.5 rounded-lg hover:bg-destructive/10 disabled:opacity-50"
      aria-label={`Delete ${label}`}
    >
      {pending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
    </button>
  );
}

interface AdminToggleButtonProps {
  id: string;
  published: boolean;
  action: (id: string) => Promise<{ success: boolean; published: boolean }>;
}

export function AdminToggleButton({
  id,
  published,
  action,
}: AdminToggleButtonProps) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => { action(id); })}
      disabled={pending}
      className={`text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
        published
          ? "text-amber-400 hover:bg-amber-500/10"
          : "text-emerald-400 hover:bg-emerald-500/10"
      }`}
    >
      {pending ? (
        <Loader2 size={14} className="animate-spin" />
      ) : published ? (
        "Unpublish"
      ) : (
        "Publish"
      )}
    </button>
  );
}
