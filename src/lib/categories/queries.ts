import { db } from "@/lib/db";

export async function getAllCategories() {
  return db.category.findMany({
    include: {
      _count: { select: { poems: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function getCategoryBySlug(slug: string) {
  return db.category.findUnique({
    where: { slug },
    include: {
      poems: {
        where: { published: true },
        include: {
          poet: { select: { id: true, name: true, slug: true } },
          _count: { select: { likes: true, comments: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}
