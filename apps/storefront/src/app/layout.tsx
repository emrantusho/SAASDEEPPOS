import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { CartProvider } from "@/components/cart/cart-context";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { DriveFetcher } from "@/lib/drive-fetcher";
import type { ProductsManifest } from "@saasdeep/shared";
import "./globals.css";

export const metadata: Metadata = {
  title: "Saasdeep Softwares Store",
  description: "Saasdeep Softwares - Open-source e-commerce",
  icons: { icon: "/favicon.svg" },
};

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
  let heroTitle = "Saasdeep Softwares Store";
  let heroSubtitle = "Open-source e-commerce powered by Saasdeep Softwares";
  let logoUrl = "";
  let faviconUrl = "";
  let storeName = "Saasdeep Softwares";
  let footerText = "Saasdeep Softwares. All rights reserved.";

  try {
    const fetcher = new DriveFetcher();
    const manifest: ProductsManifest | null = await fetcher.fetchManifest();
    if (manifest?.theme) {
      const t = manifest.theme;
      if (t.primaryColor) primary = t.primaryColor;
      if (t.secondaryColor) secondary = t.secondaryColor;
      if (t.backgroundColor) bg = t.backgroundColor;
      if (t.textColor) fg = t.textColor;
      if (t.accentColor) accent = t.accentColor;
      if (t.fontFamily) fontFamily = t.fontFamily;
      if (t.heroTitle) heroTitle = t.heroTitle;
      if (t.heroSubtitle) heroSubtitle = t.heroSubtitle;
      if (t.logoUrl) logoUrl = t.logoUrl;
      if (t.faviconUrl) faviconUrl = t.faviconUrl;
      if (t.footerText) footerText = t.footerText;
    }
    if (manifest?.storeName) storeName = manifest.storeName;
  } catch (err) {
    console.error("Failed to load theme:", err);
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

  const clientTheme = JSON.stringify({ logoUrl, storeName, faviconUrl, footerText });

  return (
    <html lang="en" className={GeistSans.className} style={themeVars}>
      <head>
        {faviconUrl && <link rel="icon" href={faviconUrl} />}
        <script dangerouslySetInnerHTML={{
          __html: `try{localStorage.setItem("storefront_theme",${clientTheme})}catch(e){}`
        }} />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased flex flex-col">
        <CartProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
