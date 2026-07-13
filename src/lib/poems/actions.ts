"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { checkIsAdmin } from "@/lib/auth";
import { createPoemSchema, updatePoemSchema } from "./validations";

export async function createPoem(formData: FormData) {
  if (!(await checkIsAdmin())) throw new Error("Unauthorized");

  const raw = {
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    poetId: formData.get("poetId") as string,
    categoryId: (formData.get("categoryId") as string) || undefined,
    coverUrl: (formData.get("coverUrl") as string) || undefined,
    published: formData.get("published") === "true",
  };

  const data = createPoemSchema.parse(raw);
  const slug = slugify(data.title);

  // Ensure unique slug
  const existing = await db.poem.findUnique({ where: { slug } });
  const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

  const poem = await db.poem.create({
    data: {
      title: data.title,
      slug: finalSlug,
      content: data.content,
      coverUrl: data.coverUrl || null,
      published: data.published,
      poetId: data.poetId,
      categoryId: data.categoryId || null,
    },
  });

  revalidatePath("/poems");
  revalidatePath("/admin/poems");
  return { success: true, slug: poem.slug };
}

export async function updatePoem(formData: FormData) {
  if (!(await checkIsAdmin())) throw new Error("Unauthorized");

  const raw = {
    id: formData.get("id") as string,
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    poetId: formData.get("poetId") as string,
    categoryId: (formData.get("categoryId") as string) || undefined,
    coverUrl: (formData.get("coverUrl") as string) || undefined,
    published: formData.get("published") === "true",
  };

  const data = updatePoemSchema.parse(raw);

  const poem = await db.poem.update({
    where: { id: data.id },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.content && { content: data.content }),
      ...(data.poetId && { poetId: data.poetId }),
      categoryId: data.categoryId || null,
      coverUrl: data.coverUrl || null,
      published: data.published,
    },
  });

  revalidatePath("/poems");
  revalidatePath(`/poems/${poem.slug}`);
  revalidatePath("/admin/poems");
  return { success: true };
}

export async function deletePoem(id: string) {
  if (!(await checkIsAdmin())) throw new Error("Unauthorized");

  await db.poem.delete({ where: { id } });

  revalidatePath("/poems");
  revalidatePath("/admin/poems");
  return { success: true };
}

export async function togglePublish(id: string) {
  if (!(await checkIsAdmin())) throw new Error("Unauthorized");

  const poem = await db.poem.findUnique({ where: { id } });
  if (!poem) throw new Error("Poem not found");

  await db.poem.update({
    where: { id },
    data: { published: !poem.published },
  });

  revalidatePath("/poems");
  revalidatePath(`/poems/${poem.slug}`);
  revalidatePath("/admin/poems");
  return { success: true, published: !poem.published };
}

