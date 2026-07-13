"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

interface Poet {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

interface PoemFormProps {
  poets: Poet[];
  categories: Category[];
  action: (formData: FormData) => Promise<{ success: boolean; slug?: string }>;
  defaultValues?: {
    id?: string;
    title?: string;
    content?: string;
    poetId?: string;
    categoryId?: string | null;
    coverUrl?: string | null;
    published?: boolean;
  };
}

export function PoemForm({
  poets,
  categories,
  action,
  defaultValues,
}: PoemFormProps) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await action(formData);
      if (result.success) {
        router.push("/admin/poems");
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
        <label className="text-sm text-muted-foreground">Title</label>
        <input
          name="title"
          required
          defaultValue={defaultValues?.title}
          placeholder="Poem title"
          className={inputClass}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Content</label>
        <textarea
          name="content"
          required
          defaultValue={defaultValues?.content}
          placeholder="Write the poem here..."
          rows={12}
          className={`${inputClass} resize-y min-h-[200px]`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Poet</label>
          <select
            name="poetId"
            required
            defaultValue={defaultValues?.poetId}
            className={inputClass}
          >
            <option value="">Select a poet</option>
            {poets.map((poet) => (
              <option key={poet.id} value={poet.id}>
                {poet.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">
            Category (optional)
          </label>
          <select
            name="categoryId"
            defaultValue={defaultValues?.categoryId || ""}
            className={inputClass}
          >
            <option value="">No category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">
          Cover Image URL (optional)
        </label>
        <input
          name="coverUrl"
          type="url"
          defaultValue={defaultValues?.coverUrl || ""}
          placeholder="https://..."
          className={inputClass}
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          name="published"
          value="true"
          defaultChecked={defaultValues?.published}
          id="published"
          className="w-4 h-4 rounded border-border accent-foreground"
        />
        <label htmlFor="published" className="text-sm text-muted-foreground">
          Publish immediately
        </label>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="liquid-glass rounded-full px-8 py-3 text-sm text-foreground transition-transform hover:scale-[1.03] disabled:opacity-50 disabled:hover:scale-100"
      >
        {pending
          ? "Saving..."
          : defaultValues?.id
            ? "Update Poem"
            : "Create Poem"}
      </button>
    </form>
  );
}
