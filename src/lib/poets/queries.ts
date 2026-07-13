import { db } from "@/lib/db";

export async function getAllPoets() {
  return db.poet.findMany({
    include: {
      _count: { select: { poems: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function getPoetBySlug(slug: string) {
  return db.poet.findUnique({
    where: { slug },
    include: {
      poems: {
        where: { published: true },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { likes: true, comments: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { poems: true } },
    },
  });
}

export async function getPoetCount() {
  return db.poet.count();
}
