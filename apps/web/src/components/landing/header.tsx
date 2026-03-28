"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useI18n } from "@/i18n/context";
import type { Locale } from "@/i18n/config";

const LOCALE_LABELS: Record<Locale, string> = {
  en: "EN",
  ko: "한국어",
  ja: "日本語",
  zh: "中文",
  es: "ES",
  fr: "FR",
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3012";

export function Header() {
  const { locale, setLocale, t } = useI18n();
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          prevuiw
        </Link>
        <div className="flex items-center gap-5">
          <Link
            href="#features"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
          >
            {t("landing.features")}
          </Link>
          <Link
            href="#platforms"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
          >
            {t("landing.platforms")}
          </Link>

          {/* Language selector */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span className="text-xs">{LOCALE_LABELS[locale]}</span>
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-2">
                <div className="bg-neutral-900 border border-border/60 rounded-lg py-1 shadow-xl min-w-[100px]">
                  {(Object.entries(LOCALE_LABELS) as [Locale, string][]).map(
                    ([code, label]) => (
                      <button
                        key={code}
                        onClick={() => {
                          setLocale(code);
                          setLangOpen(false);
                        }}
                        className={`block w-full px-3 py-1.5 text-left text-xs transition-colors ${
                          locale === code
                            ? "text-foreground bg-neutral-800"
                            : "text-muted-foreground hover:text-foreground hover:bg-neutral-800/50"
                        }`}
                      >
                        {label}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          <Link
            href={`${API_URL}/auth/google`}
            className="rounded-md bg-foreground px-4 py-1.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            {t("landing.signIn")}
          </Link>
        </div>
      </div>
    </header>
  );
}
