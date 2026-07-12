import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bdUpazilas } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { divisionId: string; districtId: string } }
) {
  const districtId = parseInt(params.districtId, 10);

  if (isNaN(districtId)) {
    return NextResponse.json({ error: "Invalid district ID" }, { status: 400 });
  }

  const upazilas = await db
    .select()
    .from(bdUpazilas)
    .where(eq(bdUpazilas.district_id, districtId))
    .orderBy(asc(bdUpazilas.name));

  return NextResponse.json(upazilas);
}
