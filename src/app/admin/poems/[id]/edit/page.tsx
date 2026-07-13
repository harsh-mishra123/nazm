import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getAllPoets } from "@/lib/poets/queries";
import { getAllCategories } from "@/lib/categories/queries";
import { updatePoem } from "@/lib/poems/actions";
import { PoemForm } from "@/components/poem-form";

interface EditPoemPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPoemPage({ params }: EditPoemPageProps) {
  const { id } = await params;

  const [poem, poets, categories] = await Promise.all([
    db.poem.findUnique({ where: { id } }),
    getAllPoets(),
    getAllCategories(),
  ]);

  if (!poem) notFound();

  return (
    <div className="space-y-6">
      <h1
        className="text-3xl font-normal"
        style={{ fontFamily: "'Instrument Serif', serif" }}
      >
        Edit Poem
      </h1>

      <PoemForm
        poets={poets}
        categories={categories}
        action={updatePoem}
        defaultValues={{
          id: poem.id,
          title: poem.title,
          content: poem.content,
          poetId: poem.poetId,
          categoryId: poem.categoryId,
          coverUrl: poem.coverUrl,
          published: poem.published,
        }}
      />
    </div>
  );
}
