import { z } from "zod/v4";

export const sendMessageSchema = z.object({
  recipientId: z.string().min(1, "Recipient is required"),
  body: z.string().min(1, "Message cannot be empty").max(2000, "Message is too long").optional(),
  type: z.enum(["TEXT", "POEM_SHARE"]).default("TEXT"),
  poemId: z.string().optional(),
}).refine(
  (data) => {
    if (data.type === "TEXT" && !data.body) return false;
    if (data.type === "POEM_SHARE" && !data.poemId) return false;
    return true;
  },
  {
    message: "Text messages require a body; poem shares require a poemId",
  }
);

export const sendPoemShareSchema = z.object({
  recipientId: z.string().min(1, "Recipient is required"),
  poemId: z.string().min(1, "Poem is required"),
  message: z.string().max(500, "Message is too long").optional(),
});
