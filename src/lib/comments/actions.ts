"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { checkIsAdmin } from "@/lib/auth";
import { createCommentSchema } from "./validations";

export async function addComment(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Sign in to comment");

  const raw = {
    text: formData.get("text") as string,
    poemId: formData.get("poemId") as string,
  };

  const data = createCommentSchema.parse(raw);

  // Get poem slug for revalidation
  const poem = await db.poem.findUnique({
    where: { id: data.poemId },
    select: { slug: true },
  });
  if (!poem) throw new Error("Poem not found");

  await db.comment.create({
    data: {
      text: data.text,
      userId,
      poemId: data.poemId,
    },
  });

  revalidatePath(`/poems/${poem.slug}`);
  return { success: true };
}

export async function deleteComment(commentId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const comment = await db.comment.findUnique({
    where: { id: commentId },
    include: { poem: { select: { slug: true } } },
  });

  if (!comment) throw new Error("Comment not found");

  // Only comment author or admin can delete
  const isUserAdmin = await checkIsAdmin();
  if (comment.userId !== userId && !isUserAdmin) {
    throw new Error("Unauthorized");
  }

  await db.comment.delete({ where: { id: commentId } });

  revalidatePath(`/poems/${comment.poem.slug}`);
  return { success: true };
}
