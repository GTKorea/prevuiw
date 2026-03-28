import { UrlInput } from "@/components/landing/url-input";

export function CtaSection() {
  return (
    <section className="py-24 border-t border-border/40">
      <div className="mx-auto max-w-xl px-4 flex flex-col items-center gap-6">
        <h2 className="text-3xl font-bold tracking-tight text-center">
          Start reviewing in seconds
        </h2>
        <UrlInput />
        <p className="text-xs text-muted-foreground/60">
          Free for your first project. No credit card required.
        </p>
      </div>
    </section>
  );
}
