import { DriveFetcher } from "@/lib/drive-fetcher";
import Link from "next/link";
import type { ProductsManifest } from "@saasdeep/shared";

export const revalidate = 60;

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ collection: string }>;
}) {
  const { collection } = await params;
  const fetcher = new DriveFetcher();
  const manifest: ProductsManifest | null = await fetcher.fetchManifest();
  const products = manifest?.products ?? [];

  const category = collection.replace(/-/g, " ");
  const filtered = products.filter(
    (p) => p.category.toLowerCase() === category.toLowerCase()
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-foreground capitalize">{category}</h1>
        <span className="text-sm text-muted-foreground">{filtered.length} products</span>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((product) => (
          <Link
            key={product.id}
            href={`/product/${product.handle}`}
            className="group rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted"
          >
            <div className="aspect-square rounded-lg bg-muted mb-3 overflow-hidden">
              {product.images?.[0]?.url ? (
                <img src={product.images[0].url} alt={product.images[0].altText || product.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground text-sm">No Image</div>
              )}
            </div>
            <h3 className="text-sm font-medium text-foreground truncate">{product.title}</h3>
            <p className="text-sm text-primary font-semibold mt-1">
              {new Intl.NumberFormat("en-US", { style: "currency", currency: product.priceRange.currency }).format(product.priceRange.min)}
            </p>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No products in this category.</p>
      )}
    </div>
  );
}
