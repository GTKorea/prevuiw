"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { locales, defaultLocale, type Locale } from "./config";

type Messages = Record<string, Record<string, string>>;

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

async function loadMessages(locale: Locale): Promise<Messages> {
  switch (locale) {
    case "ko":
      return (await import("./messages/ko.json")).default as Messages;
    case "ja":
      return (await import("./messages/ja.json")).default as Messages;
    case "zh":
      return (await import("./messages/zh.json")).default as Messages;
    case "es":
      return (await import("./messages/es.json")).default as Messages;
    case "fr":
      return (await import("./messages/fr.json")).default as Messages;
    default:
      return (await import("./messages/en.json")).default as Messages;
  }
}

function detectLocale(): Locale {
  if (typeof window === "undefined") return defaultLocale;
  const stored = localStorage.getItem("prevuiw-locale");
  if (stored && locales.includes(stored as Locale)) return stored as Locale;
  const browserLang = navigator.language.split("-")[0] as Locale;
  if (locales.includes(browserLang)) return browserLang;
  return defaultLocale;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [messages, setMessages] = useState<Messages>({});

  useEffect(() => {
    const detected = detectLocale();
    setLocaleState(detected);
  }, []);

  useEffect(() => {
    loadMessages(locale).then(setMessages);
  }, [locale]);

  function setLocale(newLocale: Locale) {
    localStorage.setItem("prevuiw-locale", newLocale);
    setLocaleState(newLocale);
  }

  function t(key: string): string {
    const [namespace, field] = key.split(".");
    return messages[namespace]?.[field] ?? key;
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
