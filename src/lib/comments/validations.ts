import { z } from "zod";

export const createCommentSchema = z.object({
  text: z.string().min(1, "Comment cannot be empty").max(2000),
  poemId: z.string().min(1),
  parentId: z.string().optional().nullable(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
