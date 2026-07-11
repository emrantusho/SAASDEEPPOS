import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const slug = id;
  const numericId = parseInt(id, 10);

  let product;
  if (!isNaN(numericId)) {
    product = await db.query.products.findFirst({
      where: and(
        eq(products.id, numericId),
        eq(products.user_uid, userId),
        eq(products.active, true)
      ),
    });
  }

  if (!product) {
    product = await db.query.products.findFirst({
      where: and(
        eq(products.slug, slug),
        eq(products.user_uid, userId),
        eq(products.active, true)
      ),
    });
  }

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ ...product, images: product.images || [] });
}
