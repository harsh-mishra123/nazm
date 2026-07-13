import { getAllPoets } from "@/lib/poets/queries";
import { deletePoet } from "@/lib/poets/actions";
import Link from "next/link";
import { AdminDeleteButton } from "@/components/admin-buttons";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function AdminPoetsPage() {
  const poets = await getAllPoets();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1
          className="text-3xl font-normal"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Poets
        </h1>
        <Link
          href="/admin/poets/new"
          className="liquid-glass rounded-full px-6 py-2.5 text-sm text-foreground transition-transform hover:scale-[1.03]"
        >
          + New Poet
        </Link>
      </div>

      {poets.length === 0 ? (
        <p className="text-muted-foreground py-10 text-center">
          No poets yet. Create your first one.
        </p>
      ) : (
        <div className="space-y-3">
          {poets.map((poet) => (
            <div
              key={poet.id}
              className="rounded-xl border border-border/50 bg-card/30 p-4 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-sm text-muted-foreground overflow-hidden shrink-0 relative">
                  {poet.imageUrl ? (
                    <Image
                      src={poet.imageUrl}
                      alt={poet.name}
                      width={40}
                      height={40}
                      unoptimized
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span style={{ fontFamily: "'Instrument Serif', serif" }}>
                      {poet.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-medium truncate">{poet.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {poet._count.poems} poem{poet._count.poems !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/admin/poets/${poet.id}/edit`}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted/30"
                >
                  Edit
                </Link>
                <AdminDeleteButton id={poet.id} action={deletePoet} label="poet" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
