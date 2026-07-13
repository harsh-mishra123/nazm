import { getPoemCount } from "@/lib/poems/queries";
import { getPoetCount } from "@/lib/poets/queries";
import { getAllCategories } from "@/lib/categories/queries";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [totalPoems, publishedPoems, poetCount, categories] = await Promise.all([
    getPoemCount(),
    getPoemCount(true),
    getPoetCount(),
    getAllCategories(),
  ]);

  const stats = [
    { label: "Total Poems", value: totalPoems, href: "/admin/poems" },
    { label: "Published", value: publishedPoems, href: "/admin/poems" },
    { label: "Poets", value: poetCount, href: "/admin/poets" },
    { label: "Categories", value: categories.length, href: "/admin/categories" },
  ];

  return (
    <div className="space-y-8">
      <h1
        className="text-3xl font-normal"
        style={{ fontFamily: "'Instrument Serif', serif" }}
      >
        Dashboard
      </h1>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-2xl border border-border/50 bg-card/50 p-6 hover:bg-card/80 transition-colors"
          >
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p
              className="text-3xl mt-1"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              {stat.value}
            </p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex gap-3">
        <Link
          href="/admin/poems/new"
          className="liquid-glass rounded-full px-6 py-2.5 text-sm text-foreground transition-transform hover:scale-[1.03]"
        >
          + New Poem
        </Link>
        <Link
          href="/admin/poets/new"
          className="liquid-glass rounded-full px-6 py-2.5 text-sm text-foreground transition-transform hover:scale-[1.03]"
        >
          + New Poet
        </Link>
      </div>
    </div>
  );
}
