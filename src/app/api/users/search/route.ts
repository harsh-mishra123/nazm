import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { searchUsersByPrefix } from "@/lib/users/queries";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const query = req.nextUrl.searchParams.get("q")?.trim();
  if (!query || query.length < 1) {
    return NextResponse.json({ users: [] });
  }

  const users = await searchUsersByPrefix(query, userId, 20);
  return NextResponse.json({ users });
}
