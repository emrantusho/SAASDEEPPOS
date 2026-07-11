import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { storeSettings } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const settings = await db.query.storeSettings.findFirst({
    where: (s, { eq }) => eq(s.user_uid, userId),
  });

  if (!settings) {
    return NextResponse.json({
      store_name: "Store",
      store_description: "",
      logo_url: "",
      favicon_url: "",
      footer_text: "All rights reserved.",
      primary_color: "#18181b",
      secondary_color: "#f4f4f5",
      background_color: "#ffffff",
      text_color: "#09090b",
      accent_color: "#3b82f6",
      font_family: "system-ui, sans-serif",
      currency: "BDT",
      locale: "bn",
      payment_methods: ["cash", "bkash", "nagad"],
      delivery_fee: 0,
      free_delivery_min: 0,
    });
  }

  return NextResponse.json(settings);
}
