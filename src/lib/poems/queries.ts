import { db } from "@/lib/db";

export async function getPublishedPoems({
  categorySlug,
  poetSlug,
  limit = 20,
  offset = 0,
}: {
  categorySlug?: string;
  poetSlug?: string;
  limit?: number;
  offset?: number;
} = {}) {
  return db.poem.findMany({
    where: {
      published: true,
      ...(categorySlug && { category: { slug: categorySlug } }),
      ...(poetSlug && { poet: { slug: poetSlug } }),
    },
    include: {
      poet: { select: { id: true, name: true, slug: true } },
      category: { select: { id: true, name: true, slug: true } },
      _count: { select: { likes: true, comments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });
}

export async function getPoemBySlug(slug: string) {
  return db.poem.findUnique({
    where: { slug },
    include: {
      poet: true,
      category: true,
      videos: { orderBy: { createdAt: "asc" } },
      _count: { select: { likes: true, comments: true, saves: true } },
    },
  });
}

export async function getAllPoems() {
  return db.poem.findMany({
    include: {
      poet: { select: { id: true, name: true, slug: true } },
      category: { select: { id: true, name: true, slug: true } },
      _count: { select: { likes: true, comments: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPoemCount(published?: boolean) {
  return db.poem.count({
    where: published !== undefined ? { published } : undefined,
  });
}
