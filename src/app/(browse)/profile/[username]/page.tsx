import { notFound } from "next/navigation";
import { getUserByUsername } from "@/lib/users/queries";
import { formatDate } from "@/lib/utils";
import { User } from "lucide-react";
import type { Metadata } from "next";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const user = await getUserByUsername(username);
  if (!user) return { title: "User Not Found -- nazm" };

  return {
    title: `${user.displayName || `@${user.username}`} -- nazm`,
    description: `Profile of ${user.displayName || `@${user.username}`} on nazm`,
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const user = await getUserByUsername(username);

  if (!user) notFound();

  return (
    <div className="max-w-xl mx-auto px-6 py-12 space-y-6">
      <div className="flex items-center gap-5">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt=""
            className="w-20 h-20 rounded-full object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center">
            <User size={32} className="text-muted-foreground" />
          </div>
        )}

        <div className="space-y-1">
          {user.displayName && (
            <h1
              className="text-2xl"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              {user.displayName}
            </h1>
          )}
          <p className="text-sm text-muted-foreground">@{user.username}</p>
          <p className="text-xs text-muted-foreground">
            Joined {formatDate(user.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
