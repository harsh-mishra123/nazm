import { getAllCategories } from "@/lib/categories/queries";
import { createCategory, deleteCategory } from "@/lib/categories/actions";
import { AdminDeleteButton } from "@/components/admin-buttons";
import { CategoryForm } from "@/components/category-form";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getAllCategories();

  return (
    <div className="space-y-8">
      <h1
        className="text-3xl font-normal"
        style={{ fontFamily: "'Instrument Serif', serif" }}
      >
        Categories
      </h1>

      {/* Create form */}
      <div className="max-w-md">
        <CategoryForm action={createCategory} />
      </div>

      {/* List */}
      {categories.length === 0 ? (
        <p className="text-muted-foreground py-6 text-center">
          No categories yet. Create one above.
        </p>
      ) : (
        <div className="space-y-2 max-w-md">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="rounded-xl border border-border/50 bg-card/30 p-3 flex items-center justify-between"
            >
              <div>
                <span className="text-sm">{cat.name}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  ({cat._count.poems} poem{cat._count.poems !== 1 ? "s" : ""})
                </span>
              </div>
              <AdminDeleteButton
                id={cat.id}
                action={deleteCategory}
                label="category"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
