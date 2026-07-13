"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface CategoryFormProps {
  action: (formData: FormData) => Promise<{ success: boolean }>;
}

export function CategoryForm({ action }: CategoryFormProps) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const form = e.currentTarget;

    startTransition(async () => {
      await action(formData);
      form.reset();
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <input
        name="name"
        required
        placeholder="New category name"
        className="flex-1 rounded-xl bg-muted/30 border border-border/50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
      />
      <button
        type="submit"
        disabled={pending}
        className="liquid-glass rounded-full px-6 py-2.5 text-sm text-foreground transition-transform hover:scale-[1.03] disabled:opacity-50"
      >
        {pending ? <Loader2 size={14} className="animate-spin" /> : "Add"}
      </button>
    </form>
  );
}
