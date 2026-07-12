import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pushSubscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

export async function POST(request: Request) {
  try {
    const { userId, title, body, url } = await request.json();

    if (!userId || !title || !body) {
      return NextResponse.json(
        { error: "userId, title, and body are required" },
        { status: 400 }
      );
    }

    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      return NextResponse.json(
        { error: "VAPID keys not configured" },
        { status: 500 }
      );
    }

    const subscriptions = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.user_uid, userId));

    if (subscriptions.length === 0) {
      return NextResponse.json({ success: true, sent: 0 });
    }

    const webpush = await import("web-push");

    webpush.setVapidDetails(
      "mailto:admin@saasdeep.com",
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY
    );

    let sent = 0;
    const invalid: number[] = [];

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify({ title, body, url: url || "/" })
        );
        sent++;
      } catch (err: any) {
        if (
          err.statusCode === 410 ||
          err.statusCode === 404 ||
          err.statusCode === 403
        ) {
          invalid.push(sub.id);
        }
      }
    }

    if (invalid.length > 0) {
      await db
        .delete(pushSubscriptions)
        .where(
          eq(pushSubscriptions.id, invalid[0])
        );
    }

    return NextResponse.json({ success: true, sent, removed: invalid.length });
  } catch (err) {
    console.error("Push send failed:", err);
    return NextResponse.json(
      { error: "Failed to send push notification", details: (err as Error).message },
      { status: 500 }
    );
  }
}
