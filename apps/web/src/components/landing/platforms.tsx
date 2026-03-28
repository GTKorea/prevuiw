"use client";

import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n/context";

const platforms = [
  { name: "Vercel", desc: "Deploy previews" },
  { name: "Netlify", desc: "Branch deploys" },
  { name: "Cloudflare Pages", desc: "Preview URLs" },
  { name: "AWS Amplify", desc: "PR previews" },
  { name: "Render", desc: "Pull request previews" },
];

export function Platforms() {
  const { t } = useI18n();

  return (
    <section id="platforms" className="py-24 scroll-mt-14">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-4">
          {t("landing.platformsTitle")}
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-12 max-w-lg mx-auto">
          {t("landing.platformsSubtitle")}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {platforms.map((platform) => (
            <div
              key={platform.name}
              className="border border-border/40 rounded-lg p-4 text-center hover:border-border/80 transition-colors"
            >
              <p className="text-sm font-medium text-foreground mb-1">{platform.name}</p>
              <p className="text-[11px] text-muted-foreground">{platform.desc}</p>
            </div>
          ))}
        </div>

        <div className="border border-border/40 rounded-lg p-5 flex items-center gap-4 max-w-2xl mx-auto">
          <div className="flex-shrink-0">
            <Badge variant="secondary" className="text-xs">+ Any URL</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("landing.platformsAnyUrl")}
          </p>
        </div>
      </div>
    </section>
  );
}
