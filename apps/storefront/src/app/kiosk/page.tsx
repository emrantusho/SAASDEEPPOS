"use client";

import { useState, useEffect, useCallback } from "react";
import { useCart } from "@/components/cart/cart-context";
import { formatPrice } from "@/lib/currency";
import { toast } from "sonner";
import { ShoppingCart, Scan, Mic, X, Minus, Plus, Trash2 } from "lucide-react";
import { VoiceSearch } from "@/components/ui/voice-search";
import { BarcodeScanner } from "@/components/ui/barcode-scanner";
import { useRouter } from "next/navigation";

const POS_API = process.env.NEXT_PUBLIC_POS_API_URL || "https://saasdeep-pos.vercel.app";
const USER_ID = process.env.NEXT_PUBLIC_POS_USER_ID || "";

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  in_stock: number;
  category: string | null;
  images: Array<{ url: string; altText?: string }>;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function KioskPage() {
  const { cart, itemCount, total, addItem, removeItem, updateQuantity } = useCart();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currency, setCurrency] = useState("BDT");
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [prods, cats] = await Promise.all([
          fetch(`${POS_API}/api/public/products?userId=${USER_ID}`).then((r) => r.json()),
          fetch(`${POS_API}/api/public/categories?userId=${USER_ID}`).then((r) => r.json()),
        ]);
        setProducts(prods);
        setCategories(cats);
      } catch {}
    }
    load();
  }, []);

  const filtered = selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : products;

  const handleScan = useCallback((barcode: string) => {
    const found = products.find(
      (p) => String(p.id) === barcode || p.slug === barcode || p.name.toLowerCase().includes(barcode.toLowerCase())
    );
    if (found) {
      const imageUrl = found.images?.[0]?.url || null;
      addItem({
        productId: found.id,
        title: found.name,
        quantity: 1,
        price: found.price,
        image: imageUrl,
      });
      toast.success(`${found.name} added`);
    } else {
      toast.error("Product not found");
    }
  }, [products, addItem]);

  const handleVoiceResult = useCallback((query: string) => {
    const found = products.find(
      (p) => p.name.toLowerCase().includes(query.toLowerCase())
    );
    if (found) {
      const imageUrl = found.images?.[0]?.url || null;
      addItem({
        productId: found.id,
        title: found.name,
        quantity: 1,
        price: found.price,
        image: imageUrl,
      });
      toast.success(`${found.name} added`);
    } else {
      toast.error("Product not found");
    }
  }, [products, addItem]);

  const handleCheckout = () => {
    router.push("/cart");
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <h1 className="text-2xl font-bold text-foreground">Self Service Kiosk</h1>
        <div className="flex items-center gap-3">
          <BarcodeScanner onScan={handleScan} />
          <VoiceSearch onResult={handleVoiceResult} />
          <button
            onClick={() => setCartOpen(!cartOpen)}
            className="relative p-3 rounded-xl bg-primary text-primary-foreground"
          >
            <ShoppingCart className="h-6 w-6" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Categories sidebar */}
        <aside className="w-48 border-r border-border bg-card overflow-y-auto p-3 space-y-1">
          <button
            onClick={() => setSelectedCategory("")}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              !selectedCategory
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-muted"
            }`}
          >
            All Items
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                selectedCategory === cat.name
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </aside>

        {/* Products grid */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((product) => (
              <button
                key={product.id}
                onClick={() => {
                  const imageUrl = product.images?.[0]?.url || null;
                  addItem({
                    productId: product.id,
                    title: product.name,
                    quantity: 1,
                    price: product.price,
                    image: imageUrl,
                  });
                  toast.success(`${product.name} added`);
                }}
                className="group rounded-2xl border border-border bg-card p-5 transition-colors hover:bg-muted text-left"
                disabled={product.in_stock <= 0}
              >
                <div className="aspect-square rounded-xl bg-muted mb-3 overflow-hidden">
                  {product.images?.[0]?.url ? (
                    <img
                      src={product.images[0].url}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground text-xl">No Image</div>
                  )}
                </div>
                <h3 className="text-base font-medium text-foreground truncate">{product.name}</h3>
                <p className="text-lg font-bold text-primary mt-1">
                  {formatPrice(product.price, currency)}
                </p>
                {product.in_stock <= 0 && (
                  <span className="text-xs text-destructive font-medium">Out of Stock</span>
                )}
              </button>
            ))}
          </div>
        </main>

        {/* Cart sidebar */}
        {cartOpen && (
          <aside className="w-80 border-l border-border bg-card flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">Cart ({itemCount})</h2>
              <button onClick={() => setCartOpen(false)} className="p-1 rounded-md hover:bg-muted text-muted-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-3 rounded-xl border border-border bg-background p-3">
                  {item.image && (
                    <div className="w-14 h-14 rounded-lg bg-muted overflow-hidden shrink-0">
                      <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-foreground truncate">{item.title}</h3>
                    <p className="text-sm font-bold text-primary">{formatPrice(item.price, currency)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 rounded-md hover:bg-muted text-muted-foreground"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 rounded-md hover:bg-muted text-muted-foreground"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1 rounded-md hover:bg-muted text-muted-foreground self-start"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {cart.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-8">Cart is empty</p>
              )}
            </div>

            <div className="border-t border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-foreground">Total</span>
                <span className="text-xl font-bold text-primary">{formatPrice(total, currency)}</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="w-full rounded-xl bg-primary py-4 text-base font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50 text-center block"
              >
                Checkout
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
