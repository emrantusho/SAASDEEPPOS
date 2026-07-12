import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bdDistricts } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { divisionId: string } }
) {
  const divisionId = parseInt(params.divisionId, 10);

  if (isNaN(divisionId)) {
    return NextResponse.json({ error: "Invalid division ID" }, { status: 400 });
  }

  const districts = await db
    .select()
    .from(bdDistricts)
    .where(eq(bdDistricts.division_id, divisionId))
    .orderBy(asc(bdDistricts.name));

  return NextResponse.json(districts);
}
