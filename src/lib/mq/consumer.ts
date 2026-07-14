import { getChannel, getExchangeName, getUserQueueName } from "./connection";
import type { MessageEvent } from "./publisher";
import type { ConsumeMessage } from "amqplib";

/**
 * Start consuming messages for a specific user.
 * Declares a durable queue bound to the exchange with the userId routing key.
 *
 * The callback receives each message. Call ack() after successful delivery
 * to the client; call nack() on failure to requeue.
 *
 * Returns a cancel function to stop consuming.
 */
export async function consumeForUser(
  userId: string,
  onMessage: (message: MessageEvent) => void
): Promise<{ cancel: () => Promise<void> }> {
  const channel = await getChannel();
  const exchange = getExchangeName();
  const queueName = getUserQueueName(userId);

  // Declare a durable queue for this user (idempotent)
  await channel.assertQueue(queueName, {
    durable: true,
    arguments: {
      // Messages expire after 7 days if not consumed
      "x-message-ttl": 7 * 24 * 60 * 60 * 1000,
    },
  });

  // Bind queue to exchange with userId as routing key
  await channel.bindQueue(queueName, exchange, userId);

  // Prefetch 1 message at a time for fair dispatch
  await channel.prefetch(1);

  // Start consuming with manual acknowledgment
  const { consumerTag } = await channel.consume(
    queueName,
    (msg: ConsumeMessage | null) => {
      if (!msg) return;

      try {
        const parsed: MessageEvent = JSON.parse(msg.content.toString());
        onMessage(parsed);
        // Ack after successful push to client
        channel.ack(msg);
      } catch {
        // Parsing or callback failure -- nack and requeue
        channel.nack(msg, false, true);
      }
    },
    { noAck: false }
  );

  return {
    cancel: async () => {
      try {
        await channel.cancel(consumerTag);
      } catch {
        // Channel may already be closed
      }
    },
  };
}
