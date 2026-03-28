"use client";

import { useI18n } from "@/i18n/context";

export function HowItWorks() {
  const { t } = useI18n();

  return (
    <section className="py-24">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-4">
          {t("landing.howItWorksTitle")}
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-16 max-w-lg mx-auto">
          {t("landing.howItWorksSubtitle")}
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Step 1 */}
          <div className="border border-border/40 rounded-xl overflow-hidden">
            <div className="h-36 bg-neutral-900/50 p-5 flex items-center justify-center">
              {/* Simple input + button outline */}
              <div className="flex items-center gap-1.5 w-full">
                <div className="flex-1 h-7 rounded border border-white/[0.08] px-2 flex items-center">
                  <span className="text-[8px] text-white/25 font-mono">https://my-app.vercel.app</span>
                </div>
                <div className="h-7 px-3 rounded bg-white/10 flex items-center">
                  <span className="text-[8px] text-white/50">Preview</span>
                </div>
              </div>
            </div>
            <div className="p-5">
              <p className="text-xs text-blue-500/70 font-mono mb-2">01</p>
              <h3 className="text-base font-semibold mb-1.5">{t("landing.step1Title")}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("landing.step1Desc")}
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="border border-border/40 rounded-xl overflow-hidden">
            <div className="h-36 bg-neutral-900/50 p-5 flex items-center justify-center">
              {/* Simple link + copy outline */}
              <div className="w-full space-y-2">
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 h-7 rounded border border-white/[0.08] px-2 flex items-center">
                    <span className="text-[8px] text-white/40 font-mono">prevuiw.com/p/my-app</span>
                  </div>
                  <div className="h-7 w-7 rounded border border-white/[0.08] flex items-center justify-center">
                    <svg className="h-3 w-3 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-5">
              <p className="text-xs text-blue-500/70 font-mono mb-2">02</p>
              <h3 className="text-base font-semibold mb-1.5">{t("landing.step2Title")}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("landing.step2Desc")}
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="border border-border/40 rounded-xl overflow-hidden">
            <div className="h-36 bg-neutral-900/50 p-5 relative">
              {/* Simple wireframe with one pin */}
              <div className="space-y-1.5 opacity-40">
                <div className="h-2 w-14 bg-white/10 rounded" />
                <div className="h-1.5 w-full bg-white/5 rounded" />
                <div className="h-1.5 w-2/3 bg-white/5 rounded" />
              </div>
              {/* Single clean pin */}
              <div className="absolute top-8 right-12">
                <div className="h-5 w-5 rounded-full bg-blue-500/70 flex items-center justify-center text-[9px] font-bold text-white/90">
                  1
                </div>
              </div>
            </div>
            <div className="p-5">
              <p className="text-xs text-blue-500/70 font-mono mb-2">03</p>
              <h3 className="text-base font-semibold mb-1.5">{t("landing.step3Title")}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("landing.step3Desc")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
