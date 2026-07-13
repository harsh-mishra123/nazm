import { getAllPoets } from "@/lib/poets/queries";
import { getAllCategories } from "@/lib/categories/queries";
import { createPoem } from "@/lib/poems/actions";
import { PoemForm } from "@/components/poem-form";

export default async function NewPoemPage() {
  const [poets, categories] = await Promise.all([
    getAllPoets(),
    getAllCategories(),
  ]);

  return (
    <div className="space-y-6">
      <h1
        className="text-3xl font-normal"
        style={{ fontFamily: "'Instrument Serif', serif" }}
      >
        New Poem
      </h1>

      {poets.length === 0 ? (
        <div className="rounded-xl border border-border/50 bg-card/30 p-6 text-center">
          <p className="text-muted-foreground text-sm">
            You need to create at least one poet before adding poems.
          </p>
          <a
            href="/admin/poets/new"
            className="inline-block mt-3 text-sm text-foreground underline underline-offset-4"
          >
            Create a poet →
          </a>
        </div>
      ) : (
        <PoemForm poets={poets} categories={categories} action={createPoem} />
      )}
    </div>
  );
}
