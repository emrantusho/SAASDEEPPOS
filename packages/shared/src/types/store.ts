import type { ProductImage, ProductOption } from "./product";

export interface StoreSettings {
  storeName: string;
  currency: string;
  locale: string;
  timezone: string;
  taxRate: number;
  receiptFooter: string;
}

export interface StorefrontTheme {
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
  heroTitle: string;
  heroSubtitle: string;
  footerText: string;
}

export interface ProductsManifest {
  version: string;
  updatedAt: string;
  currency: string;
  locale: string;
  products: ManifestProduct[];
  collections: ManifestCollection[];
  theme?: StorefrontTheme;
  storeName?: string;
}

export interface ManifestProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  category: string;
  tags: string[];
  images: ProductImage[];
  variants: ManifestVariant[];
  options: ProductOption[];
  priceRange: PriceRange;
  seo: SEO;
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ManifestVariant {
  id: string;
  title: string;
  sku: string;
  price: number;
  compareAtPrice: number;
  available: boolean;
  image: string | null;
}

export interface PriceRange {
  min: number;
  max: number;
  currency: string;
}

export interface SEO {
  title: string;
  description: string;
}

export interface ManifestCollection {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: ProductImage | null;
  seo: SEO;
  products: string[];
  createdAt: string;
  updatedAt: string;
}
