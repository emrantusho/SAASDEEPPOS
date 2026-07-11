"use client";

import { useCart } from "@/components/cart/cart-context";
import { formatPrice } from "@/lib/currency";
import { useT } from "@/lib/use-locale";

export function ProductActions({ product, currency }: { product: any; currency: string }) {
  const { addItem } = useCart();
  const t = useT();

  const inStock = (product.in_stock || 0) > 0;
  const imageUrl = product.images?.[0]?.url || null;

  return (
    <div className="space-y-6">
      <div>
        {product.category && (
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
            {product.category}
          </p>
        )}
        <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
        {product.description && (
          <p className="mt-2 text-sm text-muted-foreground">{product.description}</p>
        )}
      </div>

      <div className="text-2xl font-bold text-primary">
        {formatPrice(product.price, currency)}
      </div>

      <button
        onClick={() =>
          addItem({
            productId: product.id,
            title: product.name,
            quantity: 1,
            price: product.price,
            image: imageUrl,
          })
        }
        disabled={!inStock}
        className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {inStock ? t.store.addToCart : t.store.outOfStock}
      </button>
    </div>
  );
}
