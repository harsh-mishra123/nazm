"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { checkIsAdmin } from "@/lib/auth";
import { createPoetSchema, updatePoetSchema } from "./validations";

export async function createPoet(formData: FormData) {
  if (!(await checkIsAdmin())) throw new Error("Unauthorized");

  const raw = {
    name: formData.get("name") as string,
    bio: (formData.get("bio") as string) || undefined,
    imageUrl: (formData.get("imageUrl") as string) || undefined,
  };

  const data = createPoetSchema.parse(raw);
  const slug = slugify(data.name);

  const existing = await db.poet.findUnique({ where: { slug } });
  const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

  await db.poet.create({
    data: {
      name: data.name,
      slug: finalSlug,
      bio: data.bio || null,
      imageUrl: data.imageUrl || null,
    },
  });

  revalidatePath("/poets");
  revalidatePath("/admin/poets");
  return { success: true };
}

export async function updatePoet(formData: FormData) {
  if (!(await checkIsAdmin())) throw new Error("Unauthorized");

  const raw = {
    id: formData.get("id") as string,
    name: (formData.get("name") as string) || undefined,
    bio: (formData.get("bio") as string) || undefined,
    imageUrl: (formData.get("imageUrl") as string) || undefined,
  };

  const data = updatePoetSchema.parse(raw);

  await db.poet.update({
    where: { id: data.id },
    data: {
      ...(data.name && { name: data.name }),
      bio: data.bio || null,
      imageUrl: data.imageUrl || null,
    },
  });

  revalidatePath("/poets");
  revalidatePath("/admin/poets");
  return { success: true };
}

export async function deletePoet(id: string) {
  if (!(await checkIsAdmin())) throw new Error("Unauthorized");

  // Check if poet has poems
  const poemCount = await db.poem.count({ where: { poetId: id } });
  if (poemCount > 0) {
    throw new Error(
      "Cannot delete a poet who has poems. Delete their poems first."
    );
  }

  await db.poet.delete({ where: { id } });

  revalidatePath("/poets");
  revalidatePath("/admin/poets");
  return { success: true };
}

