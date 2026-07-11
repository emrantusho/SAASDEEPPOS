"use client";

import { useState, useEffect, useCallback, use } from "react";
import { Button } from "@saasdeep/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@saasdeep/ui/components/card";
import { Input } from "@saasdeep/ui/components/input";
import { Label } from "@saasdeep/ui/components/label";
import { useDriveContext } from "@/providers/drive-provider";
import { useTRPC } from "@/lib/trpc/client";
import { useQuery, useMutation } from "@tanstack/react-query";
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
  StoreIcon,
  GlobeIcon,
  BanknoteIcon,
} from "lucide-react";

const PAYMENT_OPTIONS = [
  { id: "cash", label: "Cash on Delivery" },
  { id: "bkash", label: "bKash" },
  { id: "nagad", label: "Nagad" },
  { id: "card", label: "Credit/Debit Card" },
  { id: "stripe", label: "Stripe (International)" },
  { id: "paypal", label: "PayPal (International)" },
];

const SECTIONS = [
  { id: "theme", label: "Theme", icon: PaintbrushIcon },
  { id: "payment", label: "Payment", icon: CreditCardIcon },
  { id: "general", label: "General", icon: GlobeIcon },
  { id: "publish", label: "Publish", icon: UploadIcon },
] as const;

export default function StorefrontPage() {
  const { isAuthenticated, getAuthUrl, disconnect, pushJsonFile, engine } = useDriveContext();
  const trpc = useTRPC();
  const { data: products = [] } = useQuery(trpc.products.list.queryOptions());
  const { data: dbSettings, refetch: refetchSettings } = useQuery(
    trpc.storeSettings.get.queryOptions()
  );

  const upsertSettings = useMutation(trpc.storeSettings.upsert.mutationOptions({
    onSuccess: () => {
      toast.success("Settings saved!");
      refetchSettings();
    },
    onError: (err) => toast.error("Failed to save: " + err.message),
  }));

  const defaultTheme = { ...DEFAULT_STOREFRONT_THEME };

  const [theme, setTheme] = useState<StorefrontTheme>(defaultTheme);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>(["cash", "bkash", "nagad"]);
  const [currency, setCurrency] = useState("BDT");
  const [locale, setLocale] = useState("bn");
  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [footerText, setFooterText] = useState("");
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [freeDeliveryMin, setFreeDeliveryMin] = useState(0);
  const [activeSection, setActiveSection] = useState("theme");
  const [publishing, setPublishing] = useState(false);
  const [lastPublished, setLastPublished] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (dbSettings) {
      setTheme((prev) => ({
        ...prev,
        heroTitle: dbSettings.store_name || prev.heroTitle,
        heroSubtitle: dbSettings.store_description || prev.heroSubtitle,
        logoUrl: dbSettings.logo_url || prev.logoUrl,
        faviconUrl: dbSettings.favicon_url || prev.faviconUrl,
        footerText: dbSettings.footer_text || prev.footerText,
        primaryColor: dbSettings.primary_color || prev.primaryColor,
        secondaryColor: dbSettings.secondary_color || prev.secondaryColor,
        backgroundColor: dbSettings.background_color || prev.backgroundColor,
        textColor: dbSettings.text_color || prev.textColor,
        accentColor: dbSettings.accent_color || prev.accentColor,
        fontFamily: dbSettings.font_family || prev.fontFamily,
      }));
      setStoreName(dbSettings.store_name || "");
      setStoreDescription(dbSettings.store_description || "");
      setFooterText(dbSettings.footer_text || "");
      setCurrency(dbSettings.currency || "BDT");
      setLocale(dbSettings.locale || "bn");
      setSelectedPaymentMethods(dbSettings.payment_methods || ["cash", "bkash", "nagad"]);
      setDeliveryFee(dbSettings.delivery_fee || 0);
      setFreeDeliveryMin(dbSettings.free_delivery_min || 0);
    }
  }, [dbSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await upsertSettings.mutateAsync({
        store_name: storeName || theme.heroTitle,
        store_description: storeDescription || theme.heroSubtitle,
        logo_url: theme.logoUrl,
        favicon_url: theme.faviconUrl,
        footer_text: footerText || theme.footerText,
        primary_color: theme.primaryColor,
        secondary_color: theme.secondaryColor,
        background_color: theme.backgroundColor,
        text_color: theme.textColor,
        accent_color: theme.accentColor,
        font_family: theme.fontFamily,
        currency,
        locale,
        payment_methods: selectedPaymentMethods,
        delivery_fee: deliveryFee,
        free_delivery_min: freeDeliveryMin,
      });
    } finally {
      setSaving(false);
    }
  };

  const generateManifest = useCallback((): ProductsManifest => {
    return {
      version: PRODUCTS_MANIFEST_VERSION,
      updatedAt: new Date().toISOString(),
      currency,
      locale,
      storeName: storeName || theme.heroTitle || "Store",
      theme,
      products: products.map((p: any) => ({
        id: String(p.id),
        handle: p.slug || p.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        title: p.name,
        description: p.description || "",
        descriptionHtml: p.description || "",
        category: p.category || "General",
        tags: [],
        images: p.images || [],
        variants: [{
          id: `v-${p.id}`,
          title: "Default",
          sku: `SKU-${p.id}`,
          price: (p.price || 0) / 100,
          compareAtPrice: (p.price || 0) / 100,
          available: (p.in_stock || 0) > 0,
          image: p.images?.[0]?.url || null,
        }],
        options: [],
        priceRange: {
          min: (p.price || 0) / 100,
          max: (p.price || 0) / 100,
          currency,
        },
        seo: { title: p.name, description: p.description || "" },
        available: (p.in_stock || 0) > 0,
        createdAt: p.created_at || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
      collections: [],
    };
  }, [products, theme, currency, locale, storeName]);

  const handlePublish = useCallback(async () => {
    setPublishing(true);
    try {
      await handleSave();
      if (engine) {
        const manifest = generateManifest();
        await pushJsonFile("products.json", manifest);
      }
      setLastPublished(new Date().toLocaleString());
      toast.success("Storefront published successfully!");
    } catch (err) {
      toast.error("Failed to publish: " + (err as Error).message);
    } finally {
      setPublishing(false);
    }
  }, [engine, generateManifest, pushJsonFile, handleSave]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Storefront</h1>
          <p className="text-muted-foreground text-sm">Configure your public storefront</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <><Loader2Icon className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : "Save Settings"}
          </Button>
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-sm text-green-600">
                <CloudIcon className="h-4 w-4" /> Drive
              </span>
              <Button variant="outline" size="sm" onClick={disconnect}>Disconnect</Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => window.location.href = getAuthUrl()}>
              <CloudOffIcon className="h-4 w-4 mr-2" /> Connect Drive
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-1 border-b overflow-x-auto">
        {SECTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
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
                  <Label>Store Name</Label>
                  <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="My Store" />
                </div>
                <div className="space-y-2">
                  <Label>Description / Tagline</Label>
                  <Input value={storeDescription} onChange={(e) => setStoreDescription(e.target.value)} placeholder="Tagline for your store" />
                </div>
                <div className="space-y-2">
                  <Label>Logo URL (Google Drive image link)</Label>
                  <Input value={theme.logoUrl} onChange={(e) => setTheme((p) => ({ ...p, logoUrl: e.target.value }))} placeholder="https://drive.google.com/..." />
                </div>
                <div className="space-y-2">
                  <Label>Favicon URL</Label>
                  <Input value={theme.faviconUrl} onChange={(e) => setTheme((p) => ({ ...p, faviconUrl: e.target.value }))} placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <Label>Footer Text</Label>
                  <Input value={footerText} onChange={(e) => setFooterText(e.target.value)} placeholder="All rights reserved." />
                </div>
                <div className="space-y-2">
                  <Label>Font Family</Label>
                  <Input value={theme.fontFamily} onChange={(e) => setTheme((p) => ({ ...p, fontFamily: e.target.value }))} placeholder="system-ui, sans-serif" />
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
                      value={(theme as any)[key] || "#000000"}
                      onChange={(e) => setTheme((p) => ({ ...p, [key]: e.target.value }))}
                      className="h-9 w-9 rounded border cursor-pointer"
                    />
                    <Input
                      value={(theme as any)[key] || ""}
                      onChange={(e) => setTheme((p) => ({ ...p, [key]: e.target.value }))}
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
            {PAYMENT_OPTIONS.map((method) => (
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
                </div>
              </label>
            ))}
          </CardContent>
        </Card>
      )}

      {activeSection === "general" && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Store Settings</CardTitle><CardDescription>Configure currency, locale, and delivery</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="BDT">BDT (Taka)</option>
                    <option value="USD">USD (US Dollar)</option>
                    <option value="EUR">EUR (Euro)</option>
                    <option value="GBP">GBP (British Pound)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Locale / Language</Label>
                  <select
                    value={locale}
                    onChange={(e) => setLocale(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="bn">বাংলা (Bengali)</option>
                    <option value="en">English</option>
                    <option value="pt-BR">Português (Brasil)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Delivery Fee (in cents)</Label>
                  <Input
                    type="number"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground">0 = free delivery. Enter amount in cents (e.g., 5000 = 50.00 {currency})</p>
                </div>
                <div className="space-y-2">
                  <Label>Free Delivery Minimum (cents)</Label>
                  <Input
                    type="number"
                    value={freeDeliveryMin}
                    onChange={(e) => setFreeDeliveryMin(parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground">Order total (in cents) to qualify for free delivery. 0 = disabled.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeSection === "publish" && (
        <Card>
          <CardHeader>
            <CardTitle>Publish Storefront</CardTitle>
            <CardDescription>
              Save settings to database and optionally push manifest to Google Drive for legacy support.
              The storefront reads data directly from the POS database.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <div className="text-sm font-medium">Products to publish: <span className="text-primary">{products.length}</span></div>
              <div className="text-xs text-muted-foreground mt-1">
                All active products from your catalog will be available in the storefront.
                Images must be hosted on Google Drive and linked in product settings.
              </div>
            </div>

            {lastPublished && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckIcon className="h-4 w-4" />
                Last published: {lastPublished}
              </div>
            )}

            <Button onClick={handlePublish} disabled={publishing} size="lg" className="w-full sm:w-auto">
              {publishing ? (
                <><Loader2Icon className="h-4 w-4 mr-2 animate-spin" /> Publishing...</>
              ) : (
                <><UploadIcon className="h-4 w-4 mr-2" /> Publish Storefront</>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
