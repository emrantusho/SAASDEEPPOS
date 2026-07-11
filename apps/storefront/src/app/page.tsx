import { DriveFetcher } from "@/lib/drive-fetcher";
import Link from "next/link";
import type { ProductsManifest } from "@saasdeep/shared";

export const revalidate = 60;

export default async function HomePage() {
  const fetcher = new DriveFetcher();
  const manifest: ProductsManifest | null = await fetcher.fetchManifest();
  const featured = manifest?.products?.slice(0, 8) ?? [];

  const heroTitle = manifest?.theme?.heroTitle || "Saasdeep Softwares Store";
  const heroSubtitle = manifest?.theme?.heroSubtitle || "Open-source e-commerce powered by Saasdeep Softwares";

  return (
    <div>
      <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-20">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            {heroTitle}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            {heroSubtitle}
          </p>
          <Link
            href="/search"
            className="mt-8 inline-flex items-center rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
          >
            Browse Products
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-2xl font-bold text-foreground mb-8">Featured Products</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {featured.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.handle}`}
              className="group rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted"
            >
              <div className="aspect-square rounded-lg bg-muted mb-3 overflow-hidden">
                {product.images?.[0]?.url ? (
                  <img
                    src={product.images[0].url}
                    alt={product.images[0].altText || product.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                  />
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
        {featured.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No products available yet. Check back soon!</p>
        )}
      </section>
    </div>
  );
}
