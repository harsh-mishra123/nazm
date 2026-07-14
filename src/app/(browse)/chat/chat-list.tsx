"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, MessageSquare, Plus } from "lucide-react";
import { UserSearch } from "@/components/user-search";
import { truncate } from "@/lib/utils";

interface ConversationData {
  id: string;
  updatedAt: Date;
  lastMessage: {
    body: string | null;
    type: string;
    createdAt: Date;
    poem: { id: string; title: string } | null;
  } | null;
  unreadCount: number;
  otherParticipants: Array<{
    id: string;
    username: string | null;
    displayName: string | null;
    avatarUrl: string | null;
  }>;
}

interface ChatListProps {
  conversations: ConversationData[];
  currentUserId: string;
}

export function ChatList({ conversations, currentUserId }: ChatListProps) {
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(false);

  const handleUserSelect = async (user: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  }) => {
    // Check if we already have a conversation with this user
    const existing = conversations.find((c) =>
      c.otherParticipants.some((p) => p.id === user.id)
    );
    if (existing) {
      router.push(`/chat/${existing.id}`);
    } else {
      // Navigate to a new conversation route
      router.push(`/chat/new?userId=${user.id}`);
    }
    setShowSearch(false);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const d = new Date(date);
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) {
      return d.toLocaleDateString([], { weekday: "short" });
    }
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const getPreview = (msg: ConversationData["lastMessage"]) => {
    if (!msg) return "No messages yet";
    if (msg.type === "POEM_SHARE" && msg.poem) {
      return `Shared: ${msg.poem.title}`;
    }
    return msg.body ? truncate(msg.body, 60) : "";
  };

  return (
    <div className="space-y-4">
      {/* New conversation button + search */}
      <div className="space-y-3">
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="liquid-glass rounded-xl px-4 py-2.5 text-sm text-foreground transition-transform hover:scale-[1.01] flex items-center gap-2"
        >
          <Plus size={16} />
          New conversation
        </button>

        {showSearch && (
          <UserSearch
            onSelect={handleUserSelect}
            placeholder="Search users to start a chat..."
          />
        )}
      </div>

      {/* Conversation list */}
      {conversations.length === 0 && !showSearch && (
        <div className="text-center py-16 space-y-3">
          <MessageSquare
            size={40}
            className="mx-auto text-muted-foreground/50"
          />
          <p className="text-sm text-muted-foreground">
            No conversations yet. Start one by searching for a user.
          </p>
        </div>
      )}

      <div className="space-y-1">
        {conversations.map((conv) => {
          const other = conv.otherParticipants[0];
          if (!other) return null;

          return (
            <Link
              key={conv.id}
              href={`/chat/${conv.id}`}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/20 transition-colors"
            >
              {/* Avatar */}
              {other.avatarUrl ? (
                <img
                  src={other.avatarUrl}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center flex-shrink-0">
                  <User size={16} className="text-muted-foreground" />
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-foreground truncate">
                    {other.displayName || `@${other.username}` || "User"}
                  </p>
                  {conv.lastMessage && (
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">
                      {formatTime(conv.lastMessage.createdAt)}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground truncate">
                    {getPreview(conv.lastMessage)}
                  </p>
                  {conv.unreadCount > 0 && (
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-foreground text-background text-[10px] flex items-center justify-center">
                      {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
