import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { customers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, user_uid } = body;

    if (!phone || !user_uid) {
      return NextResponse.json({ error: "phone and user_uid are required" }, { status: 400 });
    }

    const existing = await db.query.customers.findFirst({
      where: and(eq(customers.phone, phone), eq(customers.user_uid, user_uid)),
    });

    if (existing) {
      const otp = generateOtp();
      await db
        .update(customers)
        .set({
          otp,
          otp_expires_at: new Date(Date.now() + 10 * 60 * 1000),
        })
        .where(eq(customers.id, existing.id));

      return NextResponse.json({
        exists: true,
        customer: existing,
        otp,
      });
    }

    if (!name) {
      return NextResponse.json({ error: "name is required for new customer" }, { status: 400 });
    }

    const otp = generateOtp();

    const [customer] = await db
      .insert(customers)
      .values({
        name,
        phone,
        user_uid,
        email: `${phone}@placeholder.com`,
        otp,
        otp_expires_at: new Date(Date.now() + 10 * 60 * 1000),
        status: "active",
      })
      .returning();

    return NextResponse.json({
      exists: false,
      customer,
      otp,
    });
  } catch (err) {
    console.error("Customer registration failed:", err);
    return NextResponse.json(
      { error: "Failed to register customer", details: (err as Error).message },
      { status: 500 }
    );
  }
}
