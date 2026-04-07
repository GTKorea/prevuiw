"use client";

import { useI18n } from "@/i18n/context";
import { getGoogleAuthUrl } from "@/shared/lib";

export function CtaSection() {
  const { t } = useI18n();
  const googleAuthUrl = getGoogleAuthUrl();

  return (
    <section className="py-32">
      <div className="mx-auto max-w-2xl px-4 flex flex-col items-center gap-6 text-center">
        <h2 className="text-4xl font-bold tracking-tight">
          {t("landing.ctaTitle")}
        </h2>
        <p className="text-muted-foreground text-sm max-w-md">
          {t("landing.ctaSubtitle")}
        </p>
        <a
          href={googleAuthUrl}
          className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-3.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          {t("landing.getStarted")}
        </a>
        <p className="text-xs text-muted-foreground/50">
          {t("landing.ctaHint")}
        </p>
      </div>
    </section>
  );
}
