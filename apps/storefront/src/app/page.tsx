import Link from "next/link";
import { getProducts, getStoreSettings } from "@/lib/store-api";
import { formatPrice } from "@/lib/currency";

export const revalidate = 60;

export default async function HomePage() {
  let storeName = "Store";
  let storeDesc = "";
  let currency = "BDT";

  try {
    const settings = await getStoreSettings();
    storeName = settings.store_name || "Store";
    storeDesc = settings.store_description || "";
    currency = settings.currency || "BDT";
  } catch {}

  let featured: any[] = [];
  try {
    featured = await getProducts(true);
  } catch {}

  return (
    <div>
      <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-20">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            {storeName}
          </h1>
          {storeDesc && (
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              {storeDesc}
            </p>
          )}
          <Link
            href="/search"
            className="mt-8 inline-flex items-center rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
          >
            Browse Products
          </Link>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16">
          <h2 className="text-2xl font-bold text-foreground mb-8">Featured Products</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.slug || product.id}`}
                className="group rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted"
              >
                <div className="aspect-square rounded-lg bg-muted mb-3 overflow-hidden">
                  {product.images?.[0]?.url ? (
                    <img
                      src={product.images[0].url}
                      alt={product.images[0].altText || product.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                    />
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
        </section>
      )}

      {featured.length === 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 text-center">
          <p className="text-muted-foreground">No products available yet. Check back soon!</p>
        </section>
      )}
    </div>
  );
}
