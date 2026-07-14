import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface ClerkUserEvent {
  data: {
    id: string;
    email_addresses: Array<{
      email_address: string;
    }>;
    first_name: string | null;
    last_name: string | null;
    image_url: string | null;
    username: string | null;
  };
  type: string;
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "CLERK_WEBHOOK_SECRET not configured" },
      { status: 500 }
    );
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 }
    );
  }

  const body = await req.text();

  const wh = new Webhook(webhookSecret);
  let event: ClerkUserEvent;

  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkUserEvent;
  } catch {
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  const { type, data } = event;

  if (type === "user.created" || type === "user.updated") {
    const email = data.email_addresses[0]?.email_address ?? null;
    const displayName = [data.first_name, data.last_name]
      .filter(Boolean)
      .join(" ") || null;

    await db.user.upsert({
      where: { id: data.id },
      create: {
        id: data.id,
        email,
        displayName,
        avatarUrl: data.image_url,
      },
      update: {
        email,
        displayName,
        avatarUrl: data.image_url,
      },
    });
  }

  if (type === "user.deleted") {
    // Delete user and cascade all related data
    await db.user.delete({
      where: { id: data.id },
    }).catch(() => {
      // User may not exist in our DB yet -- ignore
    });
  }

  return NextResponse.json({ received: true });
}
