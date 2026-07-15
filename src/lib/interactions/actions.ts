"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { ensureUserExists } from "@/lib/users/queries";

import { checkIsAdmin } from "@/lib/auth";

export async function toggleLike(poemId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Sign in to like poems");

  await ensureUserExists(userId);

  const existing = await db.like.findUnique({
    where: { userId_poemId: { userId, poemId } },
  });

  if (existing) {
    await db.like.delete({ where: { id: existing.id } });
  } else {
    await db.like.create({ data: { userId, poemId } });
  }

  // Get poem slug for revalidation
  const poem = await db.poem.findUnique({
    where: { id: poemId },
    select: { slug: true },
  });
  if (poem) revalidatePath(`/poems/${poem.slug}`);

  return { success: true, liked: !existing };
}

export async function toggleSave(poemId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Sign in to save poems");

  await ensureUserExists(userId);

  const existing = await db.save.findUnique({
    where: { userId_poemId: { userId, poemId } },
  });

  if (existing) {
    await db.save.delete({ where: { id: existing.id } });
  } else {
    await db.save.create({ data: { userId, poemId } });
  }

  const poem = await db.poem.findUnique({
    where: { id: poemId },
    select: { slug: true },
  });
  if (poem) revalidatePath(`/poems/${poem.slug}`);
  revalidatePath("/saved");

  return { success: true, saved: !existing };
}

export async function getPoemDetailsForModal(poemId: string) {
  const { userId } = await auth();
  
  const poem = await db.poem.findUnique({
    where: { id: poemId },
    select: {
      _count: { select: { likes: true } }
    }
  });

  const comments = await db.comment.findMany({
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

  let isLiked = false;
  let isSaved = false;

  if (userId) {
    const [like, save] = await Promise.all([
      db.like.findUnique({ where: { userId_poemId: { userId, poemId } } }),
      db.save.findUnique({ where: { userId_poemId: { userId, poemId } } }),
    ]);
    isLiked = !!like;
    isSaved = !!save;
  }

  const isAdmin = await checkIsAdmin();

  return {
    likeCount: poem?._count.likes ?? 0,
    isLiked,
    isSaved,
    comments,
    userId,
    isAdmin,
  };
}
