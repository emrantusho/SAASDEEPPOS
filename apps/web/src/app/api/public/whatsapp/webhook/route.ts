import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const WEBHOOK_TOKEN = process.env.WHATSAPP_WEBHOOK_TOKEN || "saasdeep_webhook_2024";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const challenge = searchParams.get("hub.challenge");
  const token = searchParams.get("hub.verify_token");

  if (mode === "subscribe" && token === WEBHOOK_TOKEN && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const entry = body?.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];

    if (message) {
      const from = message.from;
      const text = message.text?.body || "";
      const msgId = message.id;

      console.log(`WhatsApp message from ${from}: ${text} (id: ${msgId})`);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("WhatsApp webhook error:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
