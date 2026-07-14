import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getMessages, markConversationAsRead } from "@/lib/chat/queries";
import { ConversationView } from "./conversation-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  return { title: "Chat -- nazm" };
}

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { conversationId } = await params;

  // Verify the user is a participant in this conversation
  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  });

  if (!conversation) notFound();

  const isParticipant = conversation.participants.some(
    (p) => p.userId === userId
  );
  if (!isParticipant) notFound();

  // Mark messages as read
  await markConversationAsRead(conversationId, userId);

  // Get initial messages
  const { messages, nextCursor } = await getMessages(conversationId);

  // Get the other participant
  const otherParticipant = conversation.participants
    .filter((p) => p.userId !== userId)
    .map((p) => p.user)[0];

  return (
    <ConversationView
      conversationId={conversationId}
      currentUserId={userId}
      otherUser={otherParticipant ?? null}
      initialMessages={messages.map((m) => ({
        id: m.id,
        type: m.type,
        body: m.body,
        poemId: m.poemId,
        senderId: m.senderId,
        recipientId: m.recipientId ?? "",
        conversationId: m.conversationId,
        sender: m.sender,
        poem: m.poem,
        createdAt: m.createdAt.toISOString(),
        deliveredAt: null,
        readAt: null,
      }))}
      initialCursor={nextCursor ?? null}
    />
  );
}
