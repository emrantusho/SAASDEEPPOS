import { DriveFetcher } from "@/lib/drive-fetcher";
import { ProductDescription } from "@/components/product/product-description";
import { ProductGallery } from "@/components/product/gallery";
import type { ProductsManifest } from "@saasdeep/shared";
import { notFound } from "next/navigation";

export const revalidate = 60;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const fetcher = new DriveFetcher();
  const manifest: ProductsManifest | null = await fetcher.fetchManifest();
  const product = manifest?.products?.find((p) => p.handle === handle);

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <ProductGallery images={product.images} title={product.title} />
        <ProductDescription product={product} />
      </div>
    </div>
  );
}
