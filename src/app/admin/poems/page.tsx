import { getAllPoems } from "@/lib/poems/queries";
import { deletePoem, togglePublish } from "@/lib/poems/actions";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { AdminDeleteButton, AdminToggleButton } from "@/components/admin-buttons";

export const dynamic = "force-dynamic";

export default async function AdminPoemsPage() {
  const poems = await getAllPoems();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1
          className="text-3xl font-normal"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Poems
        </h1>
        <Link
          href="/admin/poems/new"
          className="liquid-glass rounded-full px-6 py-2.5 text-sm text-foreground transition-transform hover:scale-[1.03]"
        >
          + New Poem
        </Link>
      </div>

      {poems.length === 0 ? (
        <p className="text-muted-foreground py-10 text-center">
          No poems yet. Create your first one.
        </p>
      ) : (
        <div className="space-y-3">
          {poems.map((poem) => (
            <div
              key={poem.id}
              className="rounded-xl border border-border/50 bg-card/30 p-4 flex items-center justify-between gap-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium truncate">
                    {poem.title}
                  </h3>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      poem.published
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {poem.published ? "Published" : "Draft"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span>by {poem.poet.name}</span>
                  {poem.category && <span>in {poem.category.name}</span>}
                  <span>{formatDate(poem.createdAt)}</span>
                  <span>{poem._count.likes} ♥</span>
                  <span>{poem._count.comments} 💬</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <AdminToggleButton
                  id={poem.id}
                  published={poem.published}
                  action={togglePublish}
                />
                <Link
                  href={`/admin/poems/${poem.id}/edit`}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted/30"
                >
                  Edit
                </Link>
                <AdminDeleteButton id={poem.id} action={deletePoem} label="poem" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
