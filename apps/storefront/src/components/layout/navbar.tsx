"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/components/cart/cart-context";
import { useT } from "@/lib/use-locale";

export function Navbar({ logoUrl, storeName }: { logoUrl?: string; storeName?: string }) {
  const router = useRouter();
  const { itemCount } = useCart();
  const t = useT();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          {logoUrl ? (
            <img src={logoUrl} alt={storeName || "Store"} className="h-8 w-auto" />
          ) : (
            <span className="text-lg font-bold text-foreground">{storeName || "Store"}</span>
          )}
        </Link>

        <nav className="hidden md:flex items-center gap-4">
          <Link href="/search" className="text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
            {t.nav.products}
          </Link>

          <Link href="/order" className="text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
            {t.nav.trackOrder}
          </Link>

          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.store.searchProducts}
              className="w-48 rounded-lg border border-input bg-background px-3 py-1.5 pl-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          </form>

          <Link href="/cart" className="relative text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {itemCount}
              </span>
            )}
          </Link>
        </nav>

        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-muted-foreground">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="space-y-1 px-4 py-3">
            <form onSubmit={handleSearch} className="relative mb-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.store.searchProducts}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 pl-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </form>
            <Link href="/search" className="block py-2 text-sm text-muted-foreground hover:text-foreground">{t.nav.products}</Link>
            <Link href="/order" className="block py-2 text-sm text-muted-foreground hover:text-foreground">{t.nav.trackOrder}</Link>
            <Link href="/cart" className="block py-2 text-sm text-muted-foreground hover:text-foreground">{t.nav.cart} ({itemCount})</Link>
          </div>
        </div>
      )}
    </header>
  );
}
