import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getConversations } from "@/lib/chat/queries";
import { ChatList } from "./chat-list";

export const metadata = {
  title: "Chat -- nazm",
};

export default async function ChatPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const conversations = await getConversations(userId);

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
      <h1
        className="text-3xl"
        style={{ fontFamily: "'Instrument Serif', serif" }}
      >
        Messages
      </h1>

      <ChatList
        conversations={conversations}
        currentUserId={userId}
      />
    </div>
  );
}
