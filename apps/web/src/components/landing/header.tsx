import Link from "next/link";
import { getGoogleAuthUrl } from "@/lib/auth";

export function Header() {
  const googleAuthUrl = getGoogleAuthUrl();

  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          prevuiw
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="#features"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
          >
            Features
          </Link>
          <Link
            href="#platforms"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
          >
            Platforms
          </Link>
          <Link
            href={googleAuthUrl}
            className="rounded-md bg-foreground px-4 py-1.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Sign in
          </Link>
        </div>
      </div>
    </header>
  );
}
