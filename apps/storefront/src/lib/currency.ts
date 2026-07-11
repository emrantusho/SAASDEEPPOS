const CURRENCY_CONFIG: Record<string, { symbol: string; locale: string; decimal: number }> = {
  BDT: { symbol: "৳", locale: "bn-BD", decimal: 2 },
  USD: { symbol: "$", locale: "en-US", decimal: 2 },
  EUR: { symbol: "€", locale: "de-DE", decimal: 2 },
  GBP: { symbol: "£", locale: "en-GB", decimal: 2 },
};

export function formatPrice(cents: number, currency = "BDT"): string {
  const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.BDT;
  const amount = cents / 100;
  try {
    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency,
      minimumFractionDigits: config.decimal,
      maximumFractionDigits: config.decimal,
    }).format(amount);
  } catch {
    return `${config.symbol}${amount.toFixed(config.decimal)}`;
  }
}

export function formatPriceSimple(cents: number, currency = "BDT"): string {
  const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.BDT;
  return `${config.symbol}${(cents / 100).toFixed(config.decimal)}`;
}
