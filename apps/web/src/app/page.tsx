import { UrlInput } from "@/components/landing/url-input";
import { Header } from "@/components/landing/header";
import { DemoMockup } from "@/components/landing/demo-mockup";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Features } from "@/components/landing/features";
import { Platforms } from "@/components/landing/platforms";
import { CtaSection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";
import { getGoogleAuthUrl } from "@/lib/auth";

export default function Home() {
  const googleAuthUrl = getGoogleAuthUrl();

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative flex min-h-[85vh] flex-col items-center justify-center px-4 pt-14 overflow-hidden">
        {/* Decorative comment pins scattered around the hero */}
        {/* Pin — top left */}
        <div className="absolute top-[18%] left-[8%] hidden md:block">
          <div className="h-7 w-7 rounded-full bg-blue-500 flex items-center justify-center text-[11px] font-bold text-white shadow-lg shadow-blue-500/30 ring-4 ring-blue-500/10">
            1
          </div>
          <div className="mt-1.5 bg-neutral-800/90 border border-neutral-700 rounded-lg px-3 py-1.5 shadow-xl backdrop-blur-sm">
            <p className="text-[9px] text-neutral-300 whitespace-nowrap">Love this layout!</p>
          </div>
        </div>

        {/* Resolved pin — top right */}
        <div className="absolute top-[22%] right-[10%] hidden md:block">
          <div className="h-7 w-7 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-500/30 ring-4 ring-green-500/10">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Drag area — bottom left */}
        <div className="absolute bottom-[20%] left-[6%] hidden lg:block">
          <div className="w-[120px] h-[60px] border-2 border-dashed border-yellow-500/40 rounded-lg bg-yellow-500/[0.03]">
            <div className="absolute -top-2.5 -right-2.5">
              <div className="h-5 w-5 rounded-full bg-yellow-500 flex items-center justify-center text-[9px] font-bold text-white shadow-lg shadow-yellow-500/30">
                3
              </div>
            </div>
          </div>
        </div>

        {/* Pin with cursor — bottom right */}
        <div className="absolute bottom-[25%] right-[7%] hidden md:block">
          <div className="h-7 w-7 rounded-full bg-blue-500 flex items-center justify-center text-[11px] font-bold text-white shadow-lg shadow-blue-500/30 ring-4 ring-blue-500/10">
            2
          </div>
          <div className="absolute -top-3 -left-4">
            <svg width="16" height="20" viewBox="0 0 12 16" fill="none" className="drop-shadow-lg">
              <path d="M0 0L12 9.6L5.6 9.6L3.2 16L0 0Z" fill="#A855F7"/>
            </svg>
            <span className="absolute top-4 left-4 bg-purple-500 rounded px-1.5 py-0.5 text-[8px] text-white font-medium whitespace-nowrap shadow-lg">James</span>
          </div>
        </div>

        {/* Another cursor — mid left */}
        <div className="absolute top-[55%] left-[14%] hidden lg:block">
          <svg width="16" height="20" viewBox="0 0 12 16" fill="none" className="drop-shadow-lg">
            <path d="M0 0L12 9.6L5.6 9.6L3.2 16L0 0Z" fill="#F97316"/>
          </svg>
          <span className="absolute top-4 left-4 bg-orange-500 rounded px-1.5 py-0.5 text-[8px] text-white font-medium whitespace-nowrap shadow-lg">Min</span>
        </div>

        {/* Main content */}
        <div className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-6 text-center">
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight">
            Review any website,<br />together.
          </h1>
          <p className="text-muted-foreground text-base max-w-lg leading-relaxed">
            Your team reviews Figma designs with pinned comments.
            Do the same for live websites. Paste a URL, share the link,
            get visual feedback in seconds.
          </p>
          <UrlInput />
          <p className="text-xs text-muted-foreground/50">
            No sign-up required for your first preview
          </p>
        </div>
      </section>

      {/* Problem → Solution bridge */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="border border-red-500/10 bg-red-500/[0.02] rounded-xl p-6">
              <p className="text-xs text-red-400/60 font-mono mb-3">The old way</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-muted-foreground/40 mt-0.5">1.</span>
                  <p className="text-sm text-muted-foreground">Take a screenshot</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-muted-foreground/40 mt-0.5">2.</span>
                  <p className="text-sm text-muted-foreground">Draw arrows in a markup tool</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-muted-foreground/40 mt-0.5">3.</span>
                  <p className="text-sm text-muted-foreground">Post in Slack with a paragraph of context</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-muted-foreground/40 mt-0.5">4.</span>
                  <p className="text-sm text-muted-foreground">Feedback gets buried in threads</p>
                </div>
              </div>
            </div>
            <div className="border border-blue-500/15 bg-blue-500/[0.02] rounded-xl p-6">
              <p className="text-xs text-blue-400/60 font-mono mb-3">With prevuiw</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-blue-500 mt-0.5">1.</span>
                  <p className="text-sm text-foreground/80">Paste a URL</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-500 mt-0.5">2.</span>
                  <p className="text-sm text-foreground/80">Click directly on the live site to comment</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-500 mt-0.5">3.</span>
                  <p className="text-sm text-foreground/80">Everyone sees feedback in context, in real time</p>
                </div>
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
