import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const mutation = await request.json();

    const accessToken = process.env.DRIVE_ACCESS_TOKEN;
    const driveFileId = process.env.DRIVE_FILE_ID;

    if (accessToken && driveFileId) {
      const mutationsUrl = `https://www.googleapis.com/upload/drive/v3/files/${driveFileId}?uploadType=media`;
      await fetch(mutationsUrl, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mutation),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Mutation error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
