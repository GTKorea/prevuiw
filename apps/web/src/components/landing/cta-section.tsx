import { UrlInput } from "@/components/landing/url-input";

export function CtaSection() {
  return (
    <section className="py-32 border-t border-border/40">
      <div className="mx-auto max-w-2xl px-4 flex flex-col items-center gap-6 text-center">
        <h2 className="text-4xl font-bold tracking-tight">
          Start reviewing in seconds
        </h2>
        <p className="text-muted-foreground text-sm max-w-md">
          No credit card. No setup. Paste a URL and your team can start
          leaving feedback immediately.
        </p>
        <div className="w-full max-w-xl">
          <UrlInput />
        </div>
        <p className="text-xs text-muted-foreground/50">
          Free for your first project
        </p>
      </div>
    </section>
  );
}
