import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bdDivisions } from "@/lib/db/schema";
import { asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const divisions = await db
    .select()
    .from(bdDivisions)
    .orderBy(asc(bdDivisions.name));

  return NextResponse.json(divisions);
}
