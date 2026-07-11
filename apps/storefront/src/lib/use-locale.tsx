"use client";

import { createContext, useContext, type ReactNode } from "react";
import { bn } from "./messages/bn";
import { en } from "./messages/en";

const messages: Record<string, typeof bn> = { bn, en };

interface LocaleContextValue {
  t: typeof bn;
  locale: string;
}

const LocaleContext = createContext<LocaleContextValue>({
  t: bn,
  locale: "bn",
});

export function LocaleProvider({
  children,
  locale = "bn",
}: {
  children: ReactNode;
  locale?: string;
}) {
  const t = messages[locale] || bn;
  const ctxValue = { t, locale };
  return (
    <LocaleContext.Provider value={ctxValue}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useT() {
  return useContext(LocaleContext).t;
}

export function useLocale() {
  return useContext(LocaleContext).locale;
}
