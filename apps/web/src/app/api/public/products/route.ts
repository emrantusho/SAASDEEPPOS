import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const featured = searchParams.get("featured");
  const category = searchParams.get("category");
  const search = searchParams.get("q");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  let conditions = and(
    eq(products.user_uid, userId),
    eq(products.active, true)
  );

  if (featured === "true") {
    conditions = and(conditions, eq(products.featured, true));
  }

  if (category) {
    conditions = and(conditions, eq(products.category, category));
  }

  let result = await db
    .select()
    .from(products)
    .where(conditions)
    .orderBy(asc(products.name));

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
    );
  }

  return NextResponse.json(result.map(p => ({
    ...p,
    images: p.images || [],
  })));
}
