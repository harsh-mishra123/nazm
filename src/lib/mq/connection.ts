import amqplib from "amqplib";
import type { ChannelModel, Channel } from "amqplib";

const EXCHANGE_NAME = "nazm.messages";
const EXCHANGE_TYPE = "direct";

let connection: ChannelModel | null = null;
let channel: Channel | null = null;
let connecting: Promise<Channel> | null = null;

/**
 * Get a RabbitMQ channel, creating one if needed.
 * Uses a singleton pattern to reuse connections.
 */
export async function getChannel(): Promise<Channel> {
  if (channel) return channel;
  if (connecting) return connecting;

  connecting = connect();
  try {
    const ch = await connecting;
    return ch;
  } finally {
    connecting = null;
  }
}

async function connect(): Promise<Channel> {
  const url = process.env.RABBITMQ_URL;
  if (!url) {
    throw new Error("RABBITMQ_URL environment variable is not set");
  }

  connection = await amqplib.connect(url);
  channel = await connection.createChannel();

  // Declare the exchange (idempotent)
  await channel.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE, {
    durable: true,
  });

  // Handle connection errors
  connection.on("error", (err: Error) => {
    console.error("RabbitMQ connection error:", err.message);
    channel = null;
    connection = null;
  });

  connection.on("close", () => {
    channel = null;
    connection = null;
  });

  return channel;
}

/**
 * Get the exchange name for message routing.
 */
export function getExchangeName(): string {
  return EXCHANGE_NAME;
}

/**
 * Get the queue name for a specific user.
 */
export function getUserQueueName(userId: string): string {
  return `user.${userId}.messages`;
}

/**
 * Close the RabbitMQ connection.
 * Call this during graceful shutdown.
 */
export async function closeConnection(): Promise<void> {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
  } catch {
    // Ignore errors during shutdown
  } finally {
    channel = null;
    connection = null;
  }
}
