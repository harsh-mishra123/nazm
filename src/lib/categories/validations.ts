import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
});

export const updateCategorySchema = createCategorySchema.partial().extend({
  id: z.string().min(1),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
