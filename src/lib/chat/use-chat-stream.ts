"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface MessageEventData {
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

interface UseChatStreamOptions {
  /** Filter messages to a specific conversation */
  conversationId?: string;
  /** Called when a new message arrives */
  onMessage?: (message: MessageEventData) => void;
}

/**
 * React hook for consuming the SSE chat stream.
 * Auto-reconnects with exponential backoff on disconnect.
 */
export function useChatStream(options: UseChatStreamOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<MessageEventData[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const connect = () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const es = new EventSource("/api/chat/stream");
      eventSourceRef.current = es;

      es.onopen = () => {
        setIsConnected(true);
        retryCountRef.current = 0;
      };

      es.addEventListener("message", (event) => {
        try {
          const data: MessageEventData = JSON.parse(event.data);

          if (
            optionsRef.current.conversationId &&
            data.conversationId !== optionsRef.current.conversationId
          ) {
            optionsRef.current.onMessage?.(data);
            return;
          }

          setMessages((prev) => {
            if (prev.some((m) => m.id === data.id)) return prev;
            return [...prev, data];
          });

          optionsRef.current.onMessage?.(data);
        } catch {
          // Ignore malformed messages
        }
      });

      es.onerror = () => {
        setIsConnected(false);
        es.close();

        const delay = Math.min(
          1000 * Math.pow(2, retryCountRef.current),
          30000
        );
        retryCountRef.current += 1;

        retryTimer = setTimeout(() => {
          connect();
        }, delay);
      };
    };

    connect();

    return () => {
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isConnected,
    clearMessages,
  };
}
