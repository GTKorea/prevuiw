"use client";
import Link from "next/link";
import { useTheme } from "@/components/providers";
import { useAuth } from "@/entities/auth";
import { Avatar, AvatarFallback, AvatarImage, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import { Sun, Moon, Monitor, Globe } from "lucide-react";
import { useI18n } from "@/i18n/context";
import type { Locale } from "@/i18n/config";
import { locales } from "@/i18n/config";

const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  ko: "한국어",
  ja: "日本語",
  zh: "中文",
  es: "Español",
  fr: "Français",
};

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useI18n();

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  return (
    <button
      onClick={cycleTheme}
      className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
      title={theme === "light" ? t("theme.light") : theme === "dark" ? t("theme.dark") : t("theme.system")}
    >
      {theme === "light" && <Sun className="h-4 w-4" />}
      {theme === "dark" && <Moon className="h-4 w-4" />}
      {(theme === "system" || !theme) && <Monitor className="h-4 w-4" />}
    </button>
  );
}

function LanguageSelector() {
  const { locale, setLocale } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex h-8 items-center gap-1.5 px-2 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors text-xs font-medium">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{LOCALE_LABELS[locale]}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => setLocale(loc)}
            className={locale === loc ? "font-medium" : "text-muted-foreground"}
          >
            {LOCALE_LABELS[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function NavBar() {
  const { user, logout } = useAuth();
  const { t } = useI18n();

  return (
    <header className="border-b border-border/40 bg-background/95 backdrop-blur">
      <div className="flex h-12 items-center px-4 gap-2">
        <Link href="/dashboard" className="text-sm font-bold mr-auto">
          prevuiw
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSelector />
          <ThemeToggle />
          {user && <NotificationBell />}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatarUrl || undefined} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="text-muted-foreground text-xs">{user.email}</DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>{t("auth.signOut")}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
