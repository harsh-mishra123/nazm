import { z } from "zod";

export const createPoetSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  bio: z.string().max(2000).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

export const updatePoetSchema = createPoetSchema.partial().extend({
  id: z.string().min(1),
});

export type CreatePoetInput = z.infer<typeof createPoetSchema>;
export type UpdatePoetInput = z.infer<typeof updatePoetSchema>;
