"use client";

import { PoemShareCard } from "./poem-share-card";
import { User } from "lucide-react";

interface MessageData {
  id: string;
  type: string;
  body: string | null;
  senderId: string;
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
  createdAt: string | Date;
}

interface ChatMessageProps {
  message: MessageData;
  isOwn: boolean;
}

export function ChatMessage({ message, isOwn }: ChatMessageProps) {
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`flex gap-2.5 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      {!isOwn && (
        <div className="flex-shrink-0 mt-1">
          {message.sender.avatarUrl ? (
            <img
              src={message.sender.avatarUrl}
              alt=""
              className="w-7 h-7 rounded-full object-cover"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-muted/50 flex items-center justify-center">
              <User size={12} className="text-muted-foreground" />
            </div>
          )}
        </div>
      )}

      {/* Message bubble */}
      <div
        className={`max-w-[75%] space-y-1 ${isOwn ? "items-end" : "items-start"}`}
      >
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isOwn
              ? "bg-foreground/10 text-foreground rounded-br-md"
              : "bg-muted/30 border border-border/30 text-foreground rounded-bl-md"
          }`}
        >
          {message.type === "POEM_SHARE" && message.poem && (
            <div className="mb-2">
              <PoemShareCard poem={message.poem} />
            </div>
          )}
          {message.body && (
            <p className="whitespace-pre-wrap">{message.body}</p>
          )}
        </div>
        <p
          className={`text-[10px] text-muted-foreground px-1 ${
            isOwn ? "text-right" : "text-left"
          }`}
        >
          {time}
        </p>
      </div>
    </div>
  );
}
