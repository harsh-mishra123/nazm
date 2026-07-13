import { z } from "zod";

export const createPoemSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  content: z.string().min(1, "Poem content is required"),
  poetId: z.string().min(1, "Poet is required"),
  categoryId: z.string().optional(),
  coverUrl: z.string().url().optional().or(z.literal("")),
  published: z.boolean().default(false),
});

export const updatePoemSchema = createPoemSchema.partial().extend({
  id: z.string().min(1),
});

export type CreatePoemInput = z.infer<typeof createPoemSchema>;
export type UpdatePoemInput = z.infer<typeof updatePoemSchema>;
