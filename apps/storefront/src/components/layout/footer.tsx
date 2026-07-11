"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function Footer() {
  const [footerText, setFooterText] = useState("Saasdeep Softwares. All rights reserved.");
  const [storeName, setStoreName] = useState("Saasdeep Softwares Store");

  useEffect(() => {
    const saved = localStorage.getItem("storefront_theme");
    if (saved) {
      try {
        const t = JSON.parse(saved);
        if (t.footerText) setFooterText(t.footerText);
        if (t.storeName) setStoreName(t.storeName);
      } catch {}
    }
  }, []);

  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">{storeName}</h3>
            <p className="text-xs text-muted-foreground">
              Open-source e-commerce powered by Saasdeep Softwares.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Links</h3>
            <div className="space-y-2">
              <Link href="/search" className="block text-xs text-muted-foreground hover:text-foreground">Products</Link>
              <Link href="/about" className="block text-xs text-muted-foreground hover:text-foreground">About</Link>
              <Link href="/contact" className="block text-xs text-muted-foreground hover:text-foreground">Contact</Link>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Contact</h3>
            <p className="text-xs text-muted-foreground">
              For support, contact your store administrator.
            </p>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-4 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} {footerText}
        </div>
        <div className="mt-2 text-center text-[10px] text-muted-foreground/60">
          Powered by Saasdeep Softwares
        </div>
      </div>
    </footer>
  );
}
