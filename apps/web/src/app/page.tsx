import { UrlInput } from "@/components/landing/url-input";
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
      {/* Hero */}
      <section className="flex min-h-[70vh] flex-col items-center justify-center px-4">
        <div className="flex w-full max-w-xl flex-col items-center gap-6">
          <h1 className="text-4xl font-bold tracking-tight">prevuiw</h1>
          <p className="text-muted-foreground text-sm">
            Paste your URL. Get instant team feedback.
          </p>
          <UrlInput />
          <p className="text-xs text-muted-foreground/60">
            No sign-up required for your first preview
          </p>
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
