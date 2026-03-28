"use client";

import { useI18n } from "@/i18n/context";

export function Features() {
  const { t } = useI18n();

  return (
    <section id="features" className="py-24 scroll-mt-14">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-16">
          {t("landing.featuresTitle")}
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Card 1: Click or drag to comment */}
          <div className="border border-border/40 rounded-lg overflow-hidden">
            <div className="h-44 bg-neutral-900/50 relative p-5">
              {/* Simple wireframe page */}
              <div className="space-y-2">
                <div className="h-2.5 w-16 bg-white/8 rounded" />
                <div className="h-1.5 w-full bg-white/4 rounded" />
                <div className="h-1.5 w-3/4 bg-white/4 rounded" />
                <div className="flex gap-2 mt-3">
                  <div className="h-5 w-14 bg-white/8 rounded" />
                  <div className="h-5 w-14 bg-white/4 rounded" />
                </div>
              </div>

              {/* Minimal pins — just the colored dots, no bubbles or names */}
              <div className="absolute top-6 right-20">
                <div className="h-5 w-5 rounded-full bg-blue-500/80 flex items-center justify-center text-[9px] font-bold text-white">1</div>
              </div>
              <div className="absolute top-[60px] right-10">
                <div className="h-5 w-5 rounded-full bg-blue-500/80 flex items-center justify-center text-[9px] font-bold text-white">2</div>
              </div>

              {/* Simple dashed area */}
              <div className="absolute bottom-5 left-5 w-24 h-10 border border-dashed border-yellow-500/40 rounded" />
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-1">
                {t("landing.feature1Title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("landing.feature1Desc")}
              </p>
            </div>
          </div>

          {/* Card 2: Version control */}
          <div className="border border-border/40 rounded-lg overflow-hidden">
            <div className="h-44 bg-neutral-900/50 p-5 flex flex-col gap-2">
              {/* Simplified version rows — structure only */}
              <div className="flex items-center rounded-md border border-white/[0.08] bg-white/[0.02] px-3 py-2 gap-3">
                <span className="text-[9px] font-mono text-white/50">v2.1</span>
                <span className="text-[8px] bg-blue-500/15 text-blue-400/80 rounded px-1.5 py-0.5">LIVE</span>
                <div className="flex-1" />
                <div className="h-1.5 w-8 bg-white/6 rounded" />
              </div>
              <div className="flex items-center rounded-md border border-white/[0.05] px-3 py-2 gap-3 opacity-70">
                <span className="text-[9px] font-mono text-white/40">v2.0</span>
                <div className="flex-1" />
                <div className="h-1.5 w-6 bg-white/4 rounded" />
              </div>
              <div className="flex items-center rounded-md border border-white/[0.05] px-3 py-2 gap-3 opacity-40">
                <span className="text-[9px] font-mono text-white/30">v1.0</span>
                <div className="flex-1" />
                <div className="h-1.5 w-4 bg-white/3 rounded" />
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-1">{t("landing.feature2Title")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("landing.feature2Desc")}
              </p>
            </div>
          </div>

          {/* Card 3: Real-time collaboration */}
          <div className="border border-border/40 rounded-lg overflow-hidden">
            <div className="h-44 bg-neutral-900/50 relative p-5">
              {/* Simple wireframe background */}
              <div className="space-y-2 opacity-30">
                <div className="h-2 w-20 bg-white/10 rounded" />
                <div className="h-1.5 w-full bg-white/5 rounded" />
                <div className="h-1.5 w-2/3 bg-white/5 rounded" />
              </div>

              {/* Just cursors with name tags — clean and simple */}
              <div className="absolute top-10 left-12">
                <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
                  <path d="M0 0L12 9.6L5.6 9.6L3.2 16L0 0Z" fill="#3B82F6" fillOpacity="0.7"/>
                </svg>
                <span className="absolute top-4 left-3 text-[7px] text-blue-400/70">Sarah</span>
              </div>
              <div className="absolute top-20 left-40">
                <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
                  <path d="M0 0L12 9.6L5.6 9.6L3.2 16L0 0Z" fill="#A855F7" fillOpacity="0.7"/>
                </svg>
                <span className="absolute top-4 left-3 text-[7px] text-purple-400/70">James</span>
              </div>
              <div className="absolute bottom-14 right-16">
                <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
                  <path d="M0 0L12 9.6L5.6 9.6L3.2 16L0 0Z" fill="#F97316" fillOpacity="0.7"/>
                </svg>
                <span className="absolute top-4 left-3 text-[7px] text-orange-400/70">Min</span>
              </div>

              {/* Simple online count */}
              <div className="absolute bottom-4 left-5">
                <span className="text-[9px] text-green-400/50">3 online</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-1">
                {t("landing.feature3Title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("landing.feature3Desc")}
              </p>
            </div>
          </div>

          {/* Card 4: No sign-up required */}
          <div className="border border-border/40 rounded-lg overflow-hidden">
            <div className="h-44 bg-neutral-900/50 flex items-center justify-center p-5">
              {/* Simple modal outline */}
              <div className="w-full max-w-[200px] border border-white/[0.08] rounded-lg p-4">
                <p className="text-[9px] text-white/50 mb-3">Enter your name</p>
                <div className="h-6 rounded border border-white/[0.08] bg-white/[0.02] px-2 flex items-center mb-2">
                  <span className="text-[8px] text-white/30">Designer Kim</span>
                </div>
                <div className="h-6 rounded bg-white/10 flex items-center justify-center">
                  <span className="text-[8px] text-white/50">Continue</span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-1">
                {t("landing.feature4Title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("landing.feature4Desc")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
