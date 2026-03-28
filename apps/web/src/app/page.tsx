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
      <section className="py-20 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-lg text-muted-foreground leading-relaxed">
            Screenshots in Slack. &quot;Check the button on the left.&quot;
            Feedback lost in threads.
          </p>
          <p className="text-lg text-foreground font-medium mt-4">
            There&apos;s a better way.
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
