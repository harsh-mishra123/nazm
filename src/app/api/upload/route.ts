import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { checkIsAdmin } from "@/lib/auth";
import { getUploadUrl, generateKey } from "@/lib/storage/s3";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!(await checkIsAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { filename, contentType, folder } = body;

    if (!filename || !contentType || !folder) {
      return NextResponse.json(
        { error: "filename, contentType, and folder are required" },
        { status: 400 }
      );
    }

    const allowedFolders = ["covers", "videos", "poets"];
    if (!allowedFolders.includes(folder)) {
      return NextResponse.json(
        { error: "Invalid folder" },
        { status: 400 }
      );
    }

    const key = generateKey(folder, filename, userId ?? undefined);
    const uploadUrl = await getUploadUrl(key, contentType);

    return NextResponse.json({ uploadUrl, key });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
