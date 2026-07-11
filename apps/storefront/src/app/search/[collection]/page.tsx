import Link from "next/link";
import { getProducts, getStoreSettings } from "@/lib/store-api";
import { formatPrice } from "@/lib/currency";

export const revalidate = 60;

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ collection: string }>;
}) {
  const { collection } = await params;
  const category = collection.replace(/-/g, " ");

  let currency = "BDT";
  try {
    const settings = await getStoreSettings();
    currency = settings.currency || "BDT";
  } catch {}

  let products: any[] = [];
  try {
    products = await getProducts(false, category);
  } catch {}

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-foreground capitalize">{category}</h1>
        <span className="text-sm text-muted-foreground">{products.length} products</span>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/product/${product.slug || product.id}`}
            className="group rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted"
          >
            <div className="aspect-square rounded-lg bg-muted mb-3 overflow-hidden">
              {product.images?.[0]?.url ? (
                <img src={product.images[0].url} alt={product.images[0].altText || product.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground text-sm">No Image</div>
              )}
            </div>
            <h3 className="text-sm font-medium text-foreground truncate">{product.name}</h3>
            <p className="text-sm text-primary font-semibold mt-1">
              {formatPrice(product.price, currency)}
            </p>
          </Link>
        ))}
      </div>

      {products.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No products in this category.</p>
      )}
    </div>
  );
}
