"use client";

import { useCart } from "@/components/cart/cart-context";
import { toast } from "sonner";
import type { ManifestProduct } from "@saasdeep/shared";

export function ProductDescription({ product }: { product: ManifestProduct }) {
  const { addItem } = useCart();

  const defaultVariant = product.variants?.[0];
  const price = defaultVariant?.price ?? product.priceRange.min;
  const inStock = defaultVariant?.available ?? product.available;
  const imageUrl = defaultVariant?.image || product.images?.[0]?.url || null;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      variantId: defaultVariant?.id,
      title: product.title,
      quantity: 1,
      price,
      image: imageUrl,
    });
    toast.success("Added to cart");
  };

  return (
    <div className="space-y-6">
      <div>
        {product.category && (
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
            {product.category}
          </p>
        )}
        <h1 className="text-3xl font-bold text-foreground">{product.title}</h1>
        {product.seo?.description && (
          <p className="mt-2 text-sm text-muted-foreground">{product.seo.description}</p>
        )}
      </div>

      <div className="text-2xl font-bold text-primary">
        {new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: product.priceRange.currency,
        }).format(price)}
      </div>

      {product.options?.length > 0 && (
        <div className="space-y-2">
          {product.options.map((option) => (
            <div key={option.name}>
              <p className="text-sm font-medium text-foreground mb-1">{option.name}</p>
              <div className="flex gap-2 flex-wrap">
                {option.values.map((value) => (
                  <button
                    key={value}
                    className="px-3 py-1 rounded-md border border-border text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleAddToCart}
        disabled={!inStock}
        className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {inStock ? "Add to Cart" : "Out of Stock"}
      </button>

      {product.descriptionHtml && (
        <div className="prose prose-sm max-w-none text-muted-foreground">
          <div dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
        </div>
      )}
    </div>
  );
}
