import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { customers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, otp, user_uid } = body;

    if (!phone || !otp || !user_uid) {
      return NextResponse.json({ error: "phone, otp, and user_uid are required" }, { status: 400 });
    }

    const customer = await db.query.customers.findFirst({
      where: and(eq(customers.phone, phone), eq(customers.user_uid, user_uid)),
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    if (customer.otp !== otp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    if (customer.otp_expires_at && new Date() > customer.otp_expires_at) {
      return NextResponse.json({ error: "OTP expired" }, { status: 400 });
    }

    const token = crypto.randomUUID();

    await db
      .update(customers)
      .set({ otp: null, otp_expires_at: null })
      .where(eq(customers.id, customer.id));

    return NextResponse.json({
      success: true,
      customer,
      token,
    });
  } catch (err) {
    console.error("Customer login failed:", err);
    return NextResponse.json(
      { error: "Failed to verify OTP", details: (err as Error).message },
      { status: 500 }
    );
  }
}
