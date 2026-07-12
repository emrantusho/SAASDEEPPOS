import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tables } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const result = await db
    .select()
    .from(tables)
    .where(eq(tables.user_uid, userId));

  return NextResponse.json(result);
}
