import { db } from "@/lib/db";

/**
 * Find an existing 1:1 conversation between two users,
 * or return null if none exists.
 */
export async function findDirectConversation(
  userIdA: string,
  userIdB: string
) {
  // Find conversations where both users are participants and
  // the conversation has exactly 2 participants (1:1 DM).
  const conversations = await db.conversation.findMany({
    where: {
      participants: {
        some: { userId: userIdA },
      },
    },
    include: {
      participants: {
        select: { userId: true },
      },
    },
  });

  return (
    conversations.find((c) => {
      const ids = c.participants.map((p) => p.userId);
      return ids.length === 2 && ids.includes(userIdA) && ids.includes(userIdB);
    }) ?? null
  );
}

/**
 * Create a new 1:1 conversation between two users.
 */
export async function createDirectConversation(
  userIdA: string,
  userIdB: string
) {
  return db.conversation.create({
    data: {
      participants: {
        create: [{ userId: userIdA }, { userId: userIdB }],
      },
    },
    include: {
      participants: {
        select: { userId: true },
      },
    },
  });
}

/**
 * Find or create a 1:1 conversation between two users.
 */
export async function findOrCreateDirectConversation(
  userIdA: string,
  userIdB: string
) {
  const existing = await findDirectConversation(userIdA, userIdB);
  if (existing) return existing;
  return createDirectConversation(userIdA, userIdB);
}

/**
 * Get all conversations for a user, with the last message
 * and unread count.
 */
export async function getConversations(userId: string) {
  const conversations = await db.conversation.findMany({
    where: {
      participants: {
        some: { userId },
      },
    },
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
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          poem: {
            select: { id: true, title: true },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Augment each conversation with unread count
  const withUnread = await Promise.all(
    conversations.map(async (conv) => {
      const unreadCount = await db.message.count({
        where: {
          conversationId: conv.id,
          recipientId: userId,
          readAt: null,
        },
      });

      // Get the "other" participant(s) for display
      const otherParticipants = conv.participants.filter(
        (p) => p.userId !== userId
      );

      return {
        id: conv.id,
        updatedAt: conv.updatedAt,
        lastMessage: conv.messages[0] ?? null,
        unreadCount,
        otherParticipants: otherParticipants.map((p) => p.user),
      };
    })
  );

  return withUnread;
}

/**
 * Get paginated messages for a conversation.
 * Returns messages in ascending order (oldest first).
 */
export async function getMessages(
  conversationId: string,
  cursor?: string,
  limit: number = 50
) {
  const messages = await db.message.findMany({
    where: { conversationId },
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
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = messages.length > limit;
  const items = hasMore ? messages.slice(0, limit) : messages;

  return {
    messages: items.reverse(),
    nextCursor: hasMore ? items[0]?.id : undefined,
  };
}

/**
 * Get total unread message count for a user.
 */
export async function getUnreadCount(userId: string): Promise<number> {
  return db.message.count({
    where: {
      recipientId: userId,
      readAt: null,
    },
  });
}

/**
 * Mark all messages in a conversation as read for a given user.
 */
export async function markConversationAsRead(
  conversationId: string,
  userId: string
) {
  await db.message.updateMany({
    where: {
      conversationId,
      recipientId: userId,
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  });
}
