"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { sendMessageSchema, sendPoemShareSchema } from "./validations";
import { findOrCreateDirectConversation } from "./queries";
import { publishMessageEvent } from "@/lib/mq/publisher";
import { ensureUserExists } from "@/lib/users/queries";

/**
 * Send a message to another user.
 * Writes to Postgres first (source of truth), then publishes to RabbitMQ.
 */
export async function sendMessage(input: {
  recipientId: string;
  body?: string;
  type?: "TEXT" | "POEM_SHARE";
  poemId?: string;
}) {
  const { userId } = await auth();
  if (!userId) {
    return { success: false as const, error: "You must be signed in" };
  }

  if (userId === input.recipientId) {
    return { success: false as const, error: "You cannot message yourself" };
  }

  const parsed = sendMessageSchema.safeParse(input);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return {
      success: false as const,
      error: firstIssue?.message ?? "Invalid message",
    };
  }

  const { recipientId, body, type, poemId } = parsed.data;

  // Ensure both users exist in our DB
  await ensureUserExists(userId);
  await ensureUserExists(recipientId);

  // Find or create the 1:1 conversation
  const conversation = await findOrCreateDirectConversation(
    userId,
    recipientId
  );

  // Insert message into Postgres (source of truth)
  const message = await db.message.create({
    data: {
      conversationId: conversation.id,
      senderId: userId,
      recipientId,
      type: type ?? "TEXT",
      body: body ?? null,
      poemId: poemId ?? null,
    },
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
      poem: {
        select: {
          id: true,
          title: true,
          slug: true,
          content: true,
          poet: { select: { name: true } },
        },
      },
    },
  });

  // Update conversation timestamp
  await db.conversation.update({
    where: { id: conversation.id },
    data: { updatedAt: new Date() },
  });

  // Publish to RabbitMQ for real-time delivery (best-effort)
  try {
    await publishMessageEvent(recipientId, {
      id: message.id,
      conversationId: conversation.id,
      senderId: userId,
      recipientId,
      type: message.type,
      body: message.body,
      poemId: message.poemId,
      sender: message.sender,
      poem: message.poem,
      createdAt: message.createdAt.toISOString(),
    });
  } catch {
    // RabbitMQ failure is not fatal -- message is already in Postgres.
    // The recipient will see it when they load /chat.
    console.error("Failed to publish message event to RabbitMQ");
  }

  return { success: true as const, message };
}

/**
 * Share a poem with another user via chat.
 * Convenience wrapper around sendMessage with type POEM_SHARE.
 */
export async function sendPoemShare(input: {
  recipientId: string;
  poemId: string;
  message?: string;
}) {
  const parsed = sendPoemShareSchema.safeParse(input);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return {
      success: false as const,
      error: firstIssue?.message ?? "Invalid input",
    };
  }

  return sendMessage({
    recipientId: parsed.data.recipientId,
    type: "POEM_SHARE",
    poemId: parsed.data.poemId,
    body: parsed.data.message ?? undefined,
  });
}
