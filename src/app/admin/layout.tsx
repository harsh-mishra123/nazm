import { redirect } from "next/navigation";
import { checkIsAdmin } from "@/lib/auth";
import Link from "next/link";

const ADMIN_LINKS = [
  { label: "Dashboard", href: "/admin" },
  { label: "Poems", href: "/admin/poems" },
  { label: "Poets", href: "/admin/poets" },
  { label: "Categories", href: "/admin/categories" },
] as const;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await checkIsAdmin())) redirect("/");

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border/40 bg-card/30 p-6 space-y-8 shrink-0 hidden md:block">
        <Link
          href="/"
          className="text-2xl tracking-tight text-foreground"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          nazm<sup className="text-[10px]">®</sup>
        </Link>

        <nav className="space-y-1">
          {ADMIN_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="block text-sm text-muted-foreground hover:text-foreground py-2 px-3 rounded-lg hover:bg-muted/30 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="pt-4 border-t border-border/30">
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to site
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 md:p-10 overflow-auto">
        {children}
      </main>
    </div>
  );
}
