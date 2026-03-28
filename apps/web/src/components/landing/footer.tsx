import Link from "next/link";

export function Footer({ googleAuthUrl }: { googleAuthUrl: string }) {
  return (
    <footer className="border-t border-border/40 py-8">
      <div className="mx-auto max-w-5xl px-4 flex items-center justify-between">
        <span className="text-xs text-muted-foreground/50">
          &copy; 2026 prevuiw
        </span>
        <div className="flex gap-6 text-xs text-muted-foreground/50">
          <Link
            href={googleAuthUrl}
            className="hover:text-foreground transition-colors"
          >
            Sign in
          </Link>
          <span className="hover:text-foreground transition-colors cursor-pointer">
            Docs
          </span>
          <span className="hover:text-foreground transition-colors cursor-pointer">
            GitHub
          </span>
        </div>
      </div>
    </footer>
  );
}
