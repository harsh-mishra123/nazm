import { auth } from "@clerk/nextjs/server";
import { consumeForUser } from "@/lib/mq/consumer";
import type { MessageEvent } from "@/lib/mq/publisher";

export const dynamic = "force-dynamic";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Send an initial heartbeat to confirm the connection is live
      controller.enqueue(encoder.encode(": connected\n\n"));

      let consumer: { cancel: () => Promise<void> } | null = null;
      let closed = false;

      // Set up a periodic heartbeat to keep the connection alive
      const heartbeat = setInterval(() => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch {
          // Stream was closed
          closed = true;
          clearInterval(heartbeat);
        }
      }, 30000);

      try {
        consumer = await consumeForUser(userId, (message: MessageEvent) => {
          if (closed) return;
          try {
            const data = JSON.stringify(message);
            controller.enqueue(
              encoder.encode(`event: message\ndata: ${data}\n\n`)
            );
          } catch {
            closed = true;
          }
        });
      } catch (err) {
        // RabbitMQ connection failed -- send error event and close
        if (!closed) {
          try {
            controller.enqueue(
              encoder.encode(
                `event: error\ndata: ${JSON.stringify({ error: "Failed to connect to message queue" })}\n\n`
              )
            );
            controller.close();
          } catch {
            // Already closed
          }
        }
        clearInterval(heartbeat);
        return;
      }

      // Handle stream cancellation (client disconnect)
      const checkClosed = setInterval(async () => {
        if (closed) {
          clearInterval(checkClosed);
          clearInterval(heartbeat);
          if (consumer) {
            await consumer.cancel();
          }
        }
      }, 5000);
    },

    cancel() {
      // This is called when the client disconnects
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
