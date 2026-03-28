import { Badge } from "@/components/ui/badge";

const platforms = [
  "Vercel",
  "Netlify",
  "Cloudflare Pages",
  "AWS Amplify",
  "Render",
];

export function Platforms() {
  return (
    <section className="py-24 border-t border-border/40">
      <div className="mx-auto max-w-5xl px-4 text-center">
        <h2 className="text-3xl font-bold tracking-tight mb-8">
          Works with your deployment platform
        </h2>

        <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
          {platforms.map((platform) => (
            <Badge
              key={platform}
              variant="secondary"
              className="text-sm px-3 py-1"
            >
              {platform}
            </Badge>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">
          Immutable deployment URLs keep your review links working forever
        </p>
      </div>
    </section>
  );
}
