"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export async function toggleLike(poemId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Sign in to like poems");

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
