"use client";

import Link from "next/link";
import { useT } from "@/lib/use-locale";

export function Footer({ storeName, footerText }: { storeName?: string; footerText?: string }) {
  const t = useT();
  const text = footerText || "All rights reserved.";

  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">{storeName || "Store"}</h3>
            <p className="text-xs text-muted-foreground">
              Open-source e-commerce powered by Saasdeep Softwares.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">{t.footer.links}</h3>
            <div className="space-y-2">
              <Link href="/search" className="block text-xs text-muted-foreground hover:text-foreground">{t.nav.products}</Link>
              <Link href="/order" className="block text-xs text-muted-foreground hover:text-foreground">{t.nav.trackOrder}</Link>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">{t.footer.contact}</h3>
            <p className="text-xs text-muted-foreground">{t.footer.contactDesc}</p>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-4 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} {text}
        </div>
        <div className="mt-2 text-center text-[10px] text-muted-foreground/60">
          Powered by Saasdeep Softwares
        </div>
      </div>
    </footer>
  );
}
