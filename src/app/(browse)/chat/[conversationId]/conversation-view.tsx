"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Loader2, User, Wifi, WifiOff } from "lucide-react";
import { ChatMessage } from "@/components/chat-message";
import { useChatStream } from "@/lib/chat/use-chat-stream";
import { sendMessage } from "@/lib/chat/actions";

interface MessageData {
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
  deliveredAt: string | null;
  readAt: string | null;
}

interface ConversationViewProps {
  conversationId: string;
  currentUserId: string;
  otherUser: {
    id: string;
    username: string | null;
    displayName: string | null;
    avatarUrl: string | null;
  } | null;
  initialMessages: MessageData[];
  initialCursor: string | null;
}

export function ConversationView({
  conversationId,
  currentUserId,
  otherUser,
  initialMessages,
  initialCursor,
}: ConversationViewProps) {
  const [allMessages, setAllMessages] = useState<MessageData[]>(initialMessages);
  const [messageText, setMessageText] = useState("");
  const [isPending, startTransition] = useTransition();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // SSE stream for real-time messages
  const { messages: streamMessages, isConnected } = useChatStream({
    conversationId,
  });

  // Merge stream messages into allMessages
  useEffect(() => {
    if (streamMessages.length === 0) return;

    setAllMessages((prev) => {
      const ids = new Set(prev.map((m) => m.id));
      const newMessages = streamMessages.filter((m) => !ids.has(m.id));
      if (newMessages.length === 0) return prev;

      return [
        ...prev,
        ...newMessages.map((m) => ({
          ...m,
          deliveredAt: null,
          readAt: null,
          recipientId: m.recipientId,
        })),
      ];
    });
  }, [streamMessages]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = () => {
    const text = messageText.trim();
    if (!text || !otherUser) return;

    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticMessage: MessageData = {
      id: optimisticId,
      conversationId,
      senderId: currentUserId,
      recipientId: otherUser.id,
      type: "TEXT",
      body: text,
      poemId: null,
      sender: {
        id: currentUserId,
        username: null,
        displayName: null,
        avatarUrl: null,
      },
      poem: null,
      createdAt: new Date().toISOString(),
      deliveredAt: null,
      readAt: null,
    };

    setAllMessages((prev) => [...prev, optimisticMessage]);
    setMessageText("");

    startTransition(async () => {
      const result = await sendMessage({
        recipientId: otherUser.id,
        body: text,
        type: "TEXT",
      });

      if (result.success && result.message) {
        // Replace optimistic message with real one
        setAllMessages((prev) =>
          prev.map((m) =>
            m.id === optimisticId
              ? {
                  ...m,
                  id: result.message.id,
                  createdAt: result.message.createdAt.toISOString(),
                }
              : m
          )
        );
      } else {
        // Remove failed optimistic message
        setAllMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const displayName =
    otherUser?.displayName || (otherUser?.username ? `@${otherUser.username}` : "User");

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border/40">
        <Link
          href="/chat"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>

        {otherUser?.avatarUrl ? (
          <img
            src={otherUser.avatarUrl}
            alt=""
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
            <User size={14} className="text-muted-foreground" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground truncate">{displayName}</p>
          {otherUser?.username && otherUser.displayName && (
            <p className="text-xs text-muted-foreground">
              @{otherUser.username}
            </p>
          )}
        </div>

        <div className="flex-shrink-0">
          {isConnected ? (
            <Wifi size={14} className="text-green-500" />
          ) : (
            <WifiOff size={14} className="text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-3"
      >
        {allMessages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground text-center">
              No messages yet. Say hello!
            </p>
          </div>
        )}

        {allMessages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            isOwn={message.senderId === currentUserId}
          />
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-border/40">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 rounded-xl bg-muted/30 border border-border/50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 resize-none transition-colors"
            style={{
              minHeight: "40px",
              maxHeight: "120px",
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
            }}
          />
          <button
            onClick={handleSend}
            disabled={!messageText.trim() || isPending}
            className="liquid-glass rounded-xl p-2.5 text-foreground transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex-shrink-0"
          >
            {isPending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5 px-1">
          Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
