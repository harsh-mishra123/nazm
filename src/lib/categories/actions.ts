"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { checkIsAdmin } from "@/lib/auth";
import { createCategorySchema, updateCategorySchema } from "./validations";

export async function createCategory(formData: FormData) {
  if (!(await checkIsAdmin())) throw new Error("Unauthorized");

  const raw = { name: formData.get("name") as string };
  const data = createCategorySchema.parse(raw);
  const slug = slugify(data.name);

  const existing = await db.category.findUnique({ where: { slug } });
  if (existing) throw new Error("Category already exists");

  await db.category.create({
    data: { name: data.name, slug },
  });

  revalidatePath("/admin/categories");
  return { success: true };
}

export async function updateCategory(formData: FormData) {
  if (!(await checkIsAdmin())) throw new Error("Unauthorized");

  const raw = {
    id: formData.get("id") as string,
    name: (formData.get("name") as string) || undefined,
  };

  const data = updateCategorySchema.parse(raw);

  await db.category.update({
    where: { id: data.id },
    data: {
      ...(data.name && { name: data.name, slug: slugify(data.name) }),
    },
  });

  revalidatePath("/admin/categories");
  return { success: true };
}

export async function deleteCategory(id: string) {
  if (!(await checkIsAdmin())) throw new Error("Unauthorized");

  // Nullify poems' categoryId before deleting
  await db.poem.updateMany({
    where: { categoryId: id },
    data: { categoryId: null },
  });

  await db.category.delete({ where: { id } });

  revalidatePath("/admin/categories");
  revalidatePath("/poems");
  return { success: true };
}

