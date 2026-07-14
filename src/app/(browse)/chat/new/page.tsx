import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserById } from "@/lib/users/queries";
import { findOrCreateDirectConversation } from "@/lib/chat/queries";

export const metadata = {
  title: "New Chat -- nazm",
};

export default async function NewChatPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string }>;
}) {
  const { userId: currentUserId } = await auth();
  if (!currentUserId) redirect("/sign-in");

  const params = await searchParams;
  const targetUserId = params.userId;
  if (!targetUserId) redirect("/chat");

  // Verify the target user exists
  const targetUser = await getUserById(targetUserId);
  if (!targetUser) redirect("/chat");

  // Cannot chat with yourself
  if (targetUserId === currentUserId) redirect("/chat");

  // Find or create the conversation
  const conversation = await findOrCreateDirectConversation(
    currentUserId,
    targetUserId
  );

  // Redirect to the conversation page
  redirect(`/chat/${conversation.id}`);
}
