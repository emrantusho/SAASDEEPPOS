import { getProduct, getStoreSettings } from "@/lib/store-api";
import { formatPrice } from "@/lib/currency";
import { ProductGallery } from "@/components/product/gallery";
import { ProductActions } from "./actions";
import { notFound } from "next/navigation";

export const revalidate = 60;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;

  let currency = "BDT";
  try {
    const settings = await getStoreSettings();
    currency = settings.currency || "BDT";
  } catch {}

  let product: any;
  try {
    product = await getProduct(handle);
  } catch {
    notFound();
  }

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <ProductGallery images={product.images || []} title={product.name} />
        <ProductActions product={product} currency={currency} />
      </div>
    </div>
  );
}
