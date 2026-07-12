import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pushSubscriptions } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { endpoint, p256dh, auth, userId } = await request.json();

    if (!endpoint || !p256dh || !auth || !userId) {
      return NextResponse.json(
        { error: "endpoint, p256dh, auth, and userId are required" },
        { status: 400 }
      );
    }

    await db.insert(pushSubscriptions).values({
      user_uid: userId,
      endpoint,
      p256dh,
      auth,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Push subscribe failed:", err);
    return NextResponse.json(
      { error: "Failed to subscribe", details: (err as Error).message },
      { status: 500 }
    );
  }
}
