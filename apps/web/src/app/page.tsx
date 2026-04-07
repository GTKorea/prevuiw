"use client";

import { Header } from "@/components/landing/header";
import { DemoMockup } from "@/components/landing/demo-mockup";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Features } from "@/components/landing/features";
import { Platforms } from "@/components/landing/platforms";
import { CtaSection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";
import { getGoogleAuthUrl } from "@/shared/lib";
import { useI18n } from "@/i18n/context";

export default function Home() {
  const googleAuthUrl = getGoogleAuthUrl();
  const { t } = useI18n();

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative flex min-h-[85vh] flex-col items-center justify-center px-4 pt-14 overflow-hidden">
        {/* Decorative pins — visible on all screen sizes */}
        <div>
          <div className="absolute top-[12%] sm:top-[18%] left-[4%] sm:left-[8%] lg:left-[12%] scale-75 sm:scale-100">
            <div className="h-7 w-7 rounded-full bg-blue-500 flex items-center justify-center text-[11px] font-bold text-white shadow-lg shadow-blue-500/30 ring-4 ring-blue-500/10">1</div>
            <div className="mt-1.5 bg-neutral-800/90 border border-neutral-700 rounded-lg px-2.5 py-1.5 shadow-xl backdrop-blur-sm">
              <p className="text-[9px] text-neutral-300 whitespace-nowrap">Love this layout!</p>
            </div>
          </div>
          <div className="absolute top-[14%] sm:top-[22%] right-[4%] sm:right-[8%] lg:right-[12%] scale-75 sm:scale-100">
            <div className="h-7 w-7 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-500/30 ring-4 ring-green-500/10">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
          </div>
          <div className="absolute bottom-[22%] sm:bottom-[28%] right-[6%] sm:right-[10%] lg:right-[14%] scale-75 sm:scale-100">
            <svg width="16" height="20" viewBox="0 0 12 16" fill="none" className="drop-shadow-lg"><path d="M0 0L12 9.6L5.6 9.6L3.2 16L0 0Z" fill="#A855F7"/></svg>
            <span className="absolute top-5 left-4 bg-purple-500 rounded px-1.5 py-0.5 text-[8px] text-white font-medium whitespace-nowrap shadow-lg">James</span>
          </div>
          <div className="absolute bottom-[18%] sm:bottom-[25%] left-[3%] sm:left-[6%] lg:left-[10%] scale-75 sm:scale-100">
            <div className="w-[80px] sm:w-[100px] h-[40px] sm:h-[50px] border-2 border-dashed border-yellow-500/40 rounded-lg bg-yellow-500/[0.03]">
              <div className="absolute -top-2.5 -right-2.5">
                <div className="h-5 w-5 rounded-full bg-yellow-500 flex items-center justify-center text-[9px] font-bold text-white shadow-lg shadow-yellow-500/30">3</div>
              </div>
            </div>
          </div>
          <div className="absolute top-[50%] sm:top-[55%] left-[5%] sm:left-[10%] lg:left-[14%] scale-75 sm:scale-100">
            <svg width="16" height="20" viewBox="0 0 12 16" fill="none" className="drop-shadow-lg"><path d="M0 0L12 9.6L5.6 9.6L3.2 16L0 0Z" fill="#F97316"/></svg>
            <span className="absolute top-5 left-4 bg-orange-500 rounded px-1.5 py-0.5 text-[8px] text-white font-medium whitespace-nowrap shadow-lg">Min</span>
          </div>
        </div>

        <div className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-6 text-center">
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight">
            {t("landing.heroTitle")}
          </h1>
          <p className="text-muted-foreground text-base max-w-lg leading-relaxed">
            {t("landing.heroSubtitle")}
          </p>
          <a
            href={googleAuthUrl}
            className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-3.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            {t("landing.getStarted")}
          </a>
          <p className="text-xs text-muted-foreground/50">{t("landing.ctaHint")}</p>
        </div>
      </section>

      {/* Problem → Solution */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="border border-red-500/10 bg-red-500/[0.02] rounded-xl p-6">
              <p className="text-xs text-red-400/60 font-mono mb-3">{t("landing.oldWayTitle")}</p>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-muted-foreground/40 mt-0.5">{i}.</span>
                    <p className="text-sm text-muted-foreground">{t(`landing.oldWay${i}`)}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="border border-blue-500/15 bg-blue-500/[0.02] rounded-xl p-6">
              <p className="text-xs text-blue-400/60 font-mono mb-3">{t("landing.newWayTitle")}</p>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-blue-500 mt-0.5">{i}.</span>
                    <p className="text-sm text-foreground/80">{t(`landing.newWay${i}`)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <DemoMockup />
      <HowItWorks />
      <Features />
      <Platforms />
      <CtaSection />
      <Footer googleAuthUrl={googleAuthUrl} />
    </main>
  );
}
