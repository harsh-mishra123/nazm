import { db } from "@/lib/db";

export async function getCommentsByPoemId(poemId: string) {
  return db.comment.findMany({
    where: { poemId },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getCommentCount(poemId: string) {
  return db.comment.count({ where: { poemId } });
}
