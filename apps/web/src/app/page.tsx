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
      <section className="flex min-h-[85vh] flex-col items-center justify-center px-4 pt-14">
        <div className="flex w-full max-w-2xl flex-col items-center gap-6 text-center">
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
      <section className="py-16 px-4 border-t border-border/40">
        <div className="mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* The old way */}
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
            {/* The prevuiw way */}
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
