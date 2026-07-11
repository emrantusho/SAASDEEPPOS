"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@saasdeep/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@saasdeep/ui/components/card";
import { Input } from "@saasdeep/ui/components/input";
import { Label } from "@saasdeep/ui/components/label";
import { useDriveContext } from "@/providers/drive-provider";
import { useTRPC } from "@/lib/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { DEFAULT_STOREFRONT_THEME, PRODUCTS_MANIFEST_VERSION } from "@saasdeep/shared";
import type { StorefrontTheme, ProductsManifest } from "@saasdeep/shared";
import { toast } from "sonner";
import {
  CloudIcon,
  CloudOffIcon,
  PaintbrushIcon,
  CreditCardIcon,
  UploadIcon,
  CheckIcon,
  Loader2Icon,
  ImageIcon,
} from "lucide-react";

const STORAGE_KEY = "saasdeep_storefront_settings";

function loadSavedTheme(): StorefrontTheme {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_STOREFRONT_THEME, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULT_STOREFRONT_THEME };
}

const SECTIONS = [
  { id: "theme", label: "Theme", icon: PaintbrushIcon },
  { id: "payment", label: "Payment", icon: CreditCardIcon },
  { id: "publish", label: "Publish", icon: UploadIcon },
] as const;

export default function StorefrontPage() {
  const { isAuthenticated, getAuthUrl, disconnect, pushJsonFile, engine } = useDriveContext();
  const trpc = useTRPC();
  const { data: products = [] } = useQuery(trpc.products.list.queryOptions());
  const [theme, setTheme] = useState<StorefrontTheme>(loadSavedTheme);
  const [publishing, setPublishing] = useState(false);
  const [lastPublished, setLastPublished] = useState<string | null>(null);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>(["stripe", "cash"]);
  const [activeSection, setActiveSection] = useState("theme");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
  }, [theme]);

  const updateTheme = useCallback((key: keyof StorefrontTheme, value: string) => {
    setTheme((prev) => ({ ...prev, [key]: value }));
  }, []);

  const generateManifest = useCallback((): ProductsManifest => {
    return {
      version: PRODUCTS_MANIFEST_VERSION,
      updatedAt: new Date().toISOString(),
      currency: "USD",
      locale: "en",
      storeName: theme.heroTitle || "Saasdeep Softwares Store",
      theme,
      products: products.map((p: any) => ({
        id: String(p.id),
        handle: (p.name as string).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        title: p.name as string,
        description: (p.description as string) || "",
        descriptionHtml: (p.description as string) || "",
        category: (p.category as string) || "General",
        tags: [],
        images: [],
        variants: [
          {
            id: `v-${p.id}`,
            title: "Default",
            sku: `SKU-${p.id}`,
            price: (p.price as number) / 100,
            compareAtPrice: (p.price as number) / 100,
            available: (p.in_stock as number) > 0,
            image: null,
          },
        ],
        options: [],
        priceRange: {
          min: (p.price as number) / 100,
          max: (p.price as number) / 100,
          currency: "USD",
        },
        seo: { title: p.name as string, description: (p.description as string) || "" },
        available: (p.in_stock as number) > 0,
        createdAt: (p.created_at as string) || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
      collections: [],
    };
  }, [products, theme]);

  const handlePublish = useCallback(async () => {
    if (!engine) {
      toast.error("Connect Google Drive first");
      return;
    }
    setPublishing(true);
    try {
      const manifest = generateManifest();
      await pushJsonFile("products.json", manifest);
      setLastPublished(new Date().toLocaleString());
      toast.success("Storefront published to Google Drive!");
    } catch (err) {
      toast.error("Failed to publish: " + (err as Error).message);
    } finally {
      setPublishing(false);
    }
  }, [engine, generateManifest, pushJsonFile]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Storefront</h1>
          <p className="text-muted-foreground text-sm">Configure your public storefront</p>
        </div>
        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-sm text-green-600">
              <CloudIcon className="h-4 w-4" /> Drive Connected
            </span>
            <Button variant="outline" size="sm" onClick={disconnect}>Disconnect</Button>
          </div>
        ) : (
          <Button onClick={() => window.location.href = getAuthUrl()}>
            <CloudOffIcon className="h-4 w-4 mr-2" /> Connect Google Drive
          </Button>
        )}
      </div>

      <div className="flex gap-1 border-b">
        {SECTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeSection === id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {activeSection === "theme" && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Branding</CardTitle><CardDescription>Customize your storefront appearance</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Store Name (Brand)</Label>
                  <Input value={theme.heroTitle} onChange={(e) => updateTheme("heroTitle", e.target.value)} placeholder="My Store" />
                </div>
                <div className="space-y-2">
                  <Label>Hero Subtitle</Label>
                  <Input value={theme.heroSubtitle} onChange={(e) => updateTheme("heroSubtitle", e.target.value)} placeholder="Tagline for your store" />
                </div>
                <div className="space-y-2">
                  <Label>Logo URL (Google Drive image link)</Label>
                  <div className="flex gap-2">
                    <Input value={theme.logoUrl} onChange={(e) => updateTheme("logoUrl", e.target.value)} placeholder="https://drive.google.com/..." />
                    {theme.logoUrl && <ImageIcon className="h-5 w-5 mt-2 text-muted-foreground shrink-0" />}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Favicon URL</Label>
                  <Input value={theme.faviconUrl} onChange={(e) => updateTheme("faviconUrl", e.target.value)} placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <Label>Footer Text</Label>
                  <Input value={theme.footerText} onChange={(e) => updateTheme("footerText", e.target.value)} placeholder="All rights reserved." />
                </div>
                <div className="space-y-2">
                  <Label>Font Family</Label>
                  <Input value={theme.fontFamily} onChange={(e) => updateTheme("fontFamily", e.target.value)} placeholder="system-ui, sans-serif" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Colors</CardTitle><CardDescription>Customize your storefront color scheme</CardDescription></CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {([
                ["primaryColor", "Primary"],
                ["secondaryColor", "Secondary"],
                ["backgroundColor", "Background"],
                ["textColor", "Text"],
                ["accentColor", "Accent"],
              ] as const).map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <Label>{label}</Label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={theme[key as keyof StorefrontTheme] as string}
                      onChange={(e) => updateTheme(key as keyof StorefrontTheme, e.target.value)}
                      className="h-9 w-9 rounded border cursor-pointer"
                    />
                    <Input
                      value={theme[key as keyof StorefrontTheme] as string}
                      onChange={(e) => updateTheme(key as keyof StorefrontTheme, e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {activeSection === "payment" && (
        <Card>
          <CardHeader><CardTitle>Payment Methods</CardTitle><CardDescription>Configure available payment options on the storefront</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            {[
              { id: "stripe", label: "Stripe", desc: "Credit/debit card payments via Stripe" },
              { id: "cash", label: "Cash on Delivery", desc: "Customer pays on delivery" },
              { id: "transfer", label: "Bank Transfer", desc: "Direct bank transfer / PIX" },
              { id: "paypal", label: "PayPal", desc: "PayPal express checkout" },
            ].map((method) => (
              <label key={method.id} className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted transition-colors">
                <input
                  type="checkbox"
                  checked={selectedPaymentMethods.includes(method.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedPaymentMethods((prev) => [...prev, method.id]);
                    } else {
                      setSelectedPaymentMethods((prev) => prev.filter((m) => m !== method.id));
                    }
                  }}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <div>
                  <div className="font-medium text-sm">{method.label}</div>
                  <div className="text-xs text-muted-foreground">{method.desc}</div>
                </div>
              </label>
            ))}
          </CardContent>
        </Card>
      )}

      {activeSection === "publish" && (
        <Card>
          <CardHeader>
            <CardTitle>Publish Storefront</CardTitle>
            <CardDescription>
              Generate and upload the product manifest to Google Drive.
              The storefront will read this data to display your products.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <div className="text-sm font-medium">Products to publish: <span className="text-primary">{products.length}</span></div>
              <div className="text-xs text-muted-foreground mt-1">
                All products from your catalog will be included in the storefront.
              </div>
            </div>

            {lastPublished && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckIcon className="h-4 w-4" />
                Last published: {lastPublished}
              </div>
            )}

            <Button
              onClick={handlePublish}
              disabled={!isAuthenticated || publishing}
              size="lg"
              className="w-full sm:w-auto"
            >
              {publishing ? (
                <><Loader2Icon className="h-4 w-4 mr-2 animate-spin" /> Publishing...</>
              ) : (
                <><UploadIcon className="h-4 w-4 mr-2" /> Publish to Drive</>
              )}
            </Button>

            {!isAuthenticated && (
              <p className="text-xs text-muted-foreground">
                Connect Google Drive above to enable publishing.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
