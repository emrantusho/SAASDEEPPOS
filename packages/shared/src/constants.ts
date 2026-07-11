export const SYNC_INTERVAL_MS = 5 * 60 * 1000;
export const POLLING_INTERVAL_MS = 30 * 1000;
export const MUTATIONS_FOLDER = "mutations";
export const PRODUCTS_FILE = "products.json";
export const PROMOS_FILE = "promos.json";
export const PAYMENT_SETTINGS_FILE = "payment-settings.json";
export const DB_STATE_FILE = "pos-database-state";
export const APP_DATA_FOLDER = "saasdeep-pos";
export const DB_FILE_EXTENSION = ".bin";
export const MAX_IMAGE_WIDTH = 1200;
export const IMAGE_QUALITY = 0.8;
export const PRODUCTS_MANIFEST_VERSION = "1.0";
export const CURRENCY_STORAGE_KEY = "saasdeep_currency";
export const LOCALE_STORAGE_KEY = "saasdeep_locale";

export const DEFAULT_CURRENCY = "USD";
export const DEFAULT_LOCALE = "en";
export const SUPPORTED_LOCALES = ["en", "pt-BR", "es", "fr", "de", "bn", "ja", "zh"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "BRL", "BDT", "JPY", "CNY"] as const;
export const DEFAULT_STOREFRONT_THEME: import("./types/store").StorefrontTheme = {
  logoUrl: "",
  faviconUrl: "",
  primaryColor: "#18181b",
  secondaryColor: "#f4f4f5",
  backgroundColor: "#ffffff",
  textColor: "#09090b",
  accentColor: "#3b82f6",
  fontFamily: "system-ui, sans-serif",
  heroTitle: "Saasdeep Softwares Store",
  heroSubtitle: "Open-source e-commerce powered by Saasdeep Softwares",
  footerText: "Saasdeep Softwares. All rights reserved.",
};
