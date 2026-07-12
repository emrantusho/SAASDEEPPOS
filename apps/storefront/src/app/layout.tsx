import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { CartProvider } from "@/components/cart/cart-context";
import { CustomerAuthProvider } from "@/components/auth/auth-context";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { LocaleProvider } from "@/lib/use-locale";
import { getStoreSettings } from "@/lib/store-api";
import { Toaster } from "sonner";
import "./globals.css";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await getStoreSettings();
    return {
      title: settings.store_name || "Store",
      description: settings.store_description || "Online store",
      icons: settings.favicon_url ? { icon: settings.favicon_url } : undefined,
      manifest: "/manifest.json",
    };
  } catch {
    return {
      title: "Store",
      description: "Online store",
      manifest: "/manifest.json",
    };
  }
}

function getContrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#09090b" : "#fafafa";
}

function adjust(hex: string, amount: number): string {
  const r = Math.max(0, Math.min(255, parseInt(hex.slice(1, 3), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.slice(3, 5), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.slice(5, 7), 16) + amount));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let primary = "#18181b";
  let secondary = "#f4f4f5";
  let bg = "#ffffff";
  let fg = "#09090b";
  let accent = "#3b82f6";
  let fontFamily = "system-ui, sans-serif";
  let logoUrl = "";
  let storeName = "Store";
  let footerText = "All rights reserved.";
  let locale = "bn";
  let currency = "BDT";

  try {
    const settings = await getStoreSettings();
    if (settings.primary_color) primary = settings.primary_color;
    if (settings.secondary_color) secondary = settings.secondary_color;
    if (settings.background_color) bg = settings.background_color;
    if (settings.text_color) fg = settings.text_color;
    if (settings.accent_color) accent = settings.accent_color;
    if (settings.font_family) fontFamily = settings.font_family;
    if (settings.logo_url) logoUrl = settings.logo_url;
    if (settings.store_name) storeName = settings.store_name;
    if (settings.footer_text) footerText = settings.footer_text;
    if (settings.locale) locale = settings.locale;
    if (settings.currency) currency = settings.currency;
  } catch (err) {
    console.error("Failed to load store settings:", err);
  }

  const themeVars = {
    "--theme-bg": bg,
    "--theme-fg": fg,
    "--theme-primary": primary,
    "--theme-primary-fg": getContrastColor(primary),
    "--theme-secondary": secondary,
    "--theme-secondary-fg": getContrastColor(secondary),
    "--theme-card": adjust(bg, -3),
    "--theme-card-fg": fg,
    "--theme-muted": adjust(bg, -5),
    "--theme-muted-fg": adjust(fg, 40),
    "--theme-border": adjust(bg, -15),
    fontFamily,
  } as React.CSSProperties;

  return (
    <html lang={locale} className={GeistSans.className} style={themeVars}>
      <body className="min-h-screen bg-background text-foreground antialiased flex flex-col">
        <LocaleProvider locale={locale}>
          <CustomerAuthProvider>
            <CartProvider currency={currency}>
              <Navbar logoUrl={logoUrl} storeName={storeName} />
              <main className="flex-1">{children}</main>
              <Footer storeName={storeName} footerText={footerText} />
              <Toaster position="top-right" richColors />
            </CartProvider>
          </CustomerAuthProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
