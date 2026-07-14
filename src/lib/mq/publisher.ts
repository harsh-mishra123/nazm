import { getChannel, getExchangeName } from "./connection";

export interface MessageEvent {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  type: string;
  body: string | null;
  poemId: string | null;
  sender: {
    id: string;
    username: string | null;
    displayName: string | null;
    avatarUrl: string | null;
  };
  poem: {
    id: string;
    title: string;
    slug: string;
    content: string;
    poet: { name: string };
  } | null;
  createdAt: string;
}

/**
 * Publish a message event to RabbitMQ.
 * Routes to the recipient's queue via direct exchange.
 * Message is persistent (deliveryMode: 2) so it survives broker restarts.
 */
export async function publishMessageEvent(
  recipientId: string,
  message: MessageEvent
): Promise<void> {
  const channel = await getChannel();
  const exchange = getExchangeName();

  channel.publish(
    exchange,
    recipientId, // routing key = recipientId
    Buffer.from(JSON.stringify(message)),
    {
      persistent: true, // deliveryMode: 2
      contentType: "application/json",
    }
  );
}
