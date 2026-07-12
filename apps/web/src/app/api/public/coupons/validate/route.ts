import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { coupons } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const userId = searchParams.get("userId");
  const totalParam = searchParams.get("total");

  if (!code || !userId) {
    return NextResponse.json({ error: "code and userId are required" }, { status: 400 });
  }

  const total = totalParam ? parseInt(totalParam, 10) : 0;

  const coupon = await db.query.coupons.findFirst({
    where: and(
      eq(coupons.code, code),
      eq(coupons.user_uid, userId),
      eq(coupons.active, true)
    ),
  });

  if (!coupon) {
    return NextResponse.json({ valid: false, discount: 0 });
  }

  if (coupon.expires_at && new Date() > coupon.expires_at) {
    return NextResponse.json({ valid: false, discount: 0, reason: "expired" });
  }

  if (coupon.max_uses && coupon.used_count !== null && coupon.used_count >= coupon.max_uses) {
    return NextResponse.json({ valid: false, discount: 0, reason: "max_uses_reached" });
  }

  if (coupon.min_amount && total < coupon.min_amount) {
    return NextResponse.json({ valid: false, discount: 0, reason: "min_amount_not_met" });
  }

  let discount = coupon.value;
  if (coupon.type === "percentage") {
    discount = Math.round(total * (coupon.value / 100));
  }

  return NextResponse.json({
    valid: true,
    discount,
    type: coupon.type,
    value: coupon.value,
  });
}
