import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { checkUsernameAvailable } from "@/lib/users/queries";
import { usernameSchema } from "@/lib/users/validations";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const username = req.nextUrl.searchParams.get("username");
  if (!username) {
    return NextResponse.json(
      { error: "Missing username parameter" },
      { status: 400 }
    );
  }

  const parsed = usernameSchema.safeParse(username);
  if (!parsed.success) {
    return NextResponse.json({ available: false, error: "Invalid format" });
  }

  const available = await checkUsernameAvailable(parsed.data);
  return NextResponse.json({ available });
}
