import { getAllPoets } from "@/lib/poets/queries";
import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Poets — nazm",
  description: "Browse poets featured on nazm.",
};

export default async function PoetsPage() {
  const poets = await getAllPoets();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1
          className="text-4xl sm:text-5xl font-normal"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Poets
        </h1>
        <p className="text-muted-foreground text-sm">
          The voices behind the verses.
        </p>
      </div>

      {poets.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-muted-foreground">No poets yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {poets.map((poet) => (
            <Link
              key={poet.id}
              href={`/poets/${poet.slug}`}
              className="group block"
            >
              <div className="rounded-2xl border border-border/50 bg-card/50 p-6 transition-all duration-300 hover:border-border hover:bg-card/80 hover:shadow-lg hover:shadow-black/5">
                {/* Avatar / Initial */}
                <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center mb-4 text-xl text-muted-foreground overflow-hidden relative">
                  {poet.imageUrl ? (
                    <Image
                      src={poet.imageUrl}
                      alt={poet.name}
                      width={56}
                      height={56}
                      unoptimized
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span style={{ fontFamily: "'Instrument Serif', serif" }}>
                      {poet.name.charAt(0)}
                    </span>
                  )}
                </div>

                <h3
                  className="text-xl font-normal text-foreground group-hover:text-foreground/90 transition-colors"
                  style={{ fontFamily: "'Instrument Serif', serif" }}
                >
                  {poet.name}
                </h3>

                {poet.bio && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {poet.bio}
                  </p>
                )}

                <p className="text-xs text-muted-foreground mt-3">
                  {poet._count.poems} poem{poet._count.poems !== 1 ? "s" : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
