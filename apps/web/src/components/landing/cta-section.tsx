"use client";

import { UrlInput } from "@/components/landing/url-input";
import { useI18n } from "@/i18n/context";

export function CtaSection() {
  const { t } = useI18n();

  return (
    <section className="py-32">
      <div className="mx-auto max-w-2xl px-4 flex flex-col items-center gap-6 text-center">
        <h2 className="text-4xl font-bold tracking-tight">
          {t("landing.ctaTitle")}
        </h2>
        <p className="text-muted-foreground text-sm max-w-md">
          {t("landing.ctaSubtitle")}
        </p>
        <div className="w-full max-w-xl">
          <UrlInput />
        </div>
        <p className="text-xs text-muted-foreground/50">
          {t("landing.ctaHint")}
        </p>
      </div>
    </section>
  );
}
