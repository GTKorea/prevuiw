"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/context";

export function Footer({ googleAuthUrl }: { googleAuthUrl: string }) {
  const { t } = useI18n();

  return (
    <footer className="border-t border-border/40 py-8">
      <div className="mx-auto max-w-5xl px-4 flex items-center justify-between">
        <span className="text-xs text-muted-foreground/50">
          {t("landing.copyright")}
        </span>
        <div className="flex gap-6 text-xs text-muted-foreground/50">
          <Link
            href={googleAuthUrl}
            className="hover:text-foreground transition-colors"
          >
            {t("landing.signIn")}
          </Link>
          <span className="hover:text-foreground transition-colors cursor-pointer">
            {t("landing.docs")}
          </span>
          <span className="hover:text-foreground transition-colors cursor-pointer">
            GitHub
          </span>
        </div>
      </div>
    </footer>
  );
}
