import Link from "next/link";
import { UrlInput } from "@/components/landing/url-input";
import { getGoogleAuthUrl } from "@/lib/auth";

export default function Home() {
  const googleAuthUrl = getGoogleAuthUrl();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-4xl font-bold tracking-tight">prevuiw</h1>
        <p className="text-muted-foreground text-sm">
          Paste your URL. Get instant team feedback.
        </p>
        <UrlInput />
        <p className="text-xs text-muted-foreground/60">
          No sign-up required for your first preview
        </p>
      </div>

      <footer className="absolute bottom-8 flex gap-6 text-xs text-muted-foreground/50">
        <Link href={googleAuthUrl} className="hover:text-foreground transition-colors">
          Sign in
        </Link>
        <span>Docs</span>
        <span>GitHub</span>
      </footer>
    </main>
  );
}
