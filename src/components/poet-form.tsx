"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

interface PoetFormProps {
  action: (formData: FormData) => Promise<{ success: boolean }>;
  defaultValues?: {
    id?: string;
    name?: string;
    bio?: string | null;
    imageUrl?: string | null;
  };
}

export function PoetForm({ action, defaultValues }: PoetFormProps) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await action(formData);
      if (result.success) {
        router.push("/admin/poets");
      }
    });
  };

  const inputClass =
    "w-full rounded-xl bg-muted/30 border border-border/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {defaultValues?.id && (
        <input type="hidden" name="id" value={defaultValues.id} />
      )}

      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Name</label>
        <input
          name="name"
          required
          defaultValue={defaultValues?.name}
          placeholder="Poet's name"
          className={inputClass}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Bio (optional)</label>
        <textarea
          name="bio"
          defaultValue={defaultValues?.bio || ""}
          placeholder="A brief biography..."
          rows={4}
          className={`${inputClass} resize-y`}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">
          Image URL (optional)
        </label>
        <input
          name="imageUrl"
          type="url"
          defaultValue={defaultValues?.imageUrl || ""}
          placeholder="https://..."
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="liquid-glass rounded-full px-8 py-3 text-sm text-foreground transition-transform hover:scale-[1.03] disabled:opacity-50 disabled:hover:scale-100"
      >
        {pending
          ? "Saving..."
          : defaultValues?.id
            ? "Update Poet"
            : "Create Poet"}
      </button>
    </form>
  );
}
