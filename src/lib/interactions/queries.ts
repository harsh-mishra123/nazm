import { db } from "@/lib/db";

export async function getUserLike(userId: string, poemId: string) {
  return db.like.findUnique({
    where: { userId_poemId: { userId, poemId } },
  });
}

export async function getUserSave(userId: string, poemId: string) {
  return db.save.findUnique({
    where: { userId_poemId: { userId, poemId } },
  });
}

export async function getUserSavedPoems(userId: string) {
  return db.save.findMany({
    where: { userId },
    include: {
      poem: {
        include: {
          poet: { select: { id: true, name: true, slug: true } },
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { likes: true, comments: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getLikeCount(poemId: string) {
  return db.like.count({ where: { poemId } });
}
