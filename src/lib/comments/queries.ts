import { db } from "@/lib/db";

export async function getCommentsByPoemId(poemId: string) {
  return db.comment.findMany({
    where: { poemId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCommentCount(poemId: string) {
  return db.comment.count({ where: { poemId } });
}
