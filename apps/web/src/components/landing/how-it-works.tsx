export function HowItWorks() {
  return (
    <section className="py-24 border-t border-border/40">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-16">
          How it works
        </h2>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Step 1 */}
          <div>
            <div className="h-32 bg-neutral-900 border border-border/40 rounded-lg mb-4 flex items-center justify-center px-4">
              {/* Mini URL input mockup */}
              <div className="flex w-full items-center gap-1.5">
                <div className="flex-1 h-7 rounded border border-neutral-700 bg-neutral-800 px-2 flex items-center">
                  <span className="text-[9px] text-muted-foreground/60 font-mono truncate">
                    https://my-app.vercel.app
                  </span>
                </div>
                <div className="h-7 px-2.5 rounded bg-white flex items-center">
                  <span className="text-[9px] font-semibold text-black">
                    Preview
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm text-blue-500 font-mono mb-1">01</p>
            <h3 className="text-lg font-semibold mb-1">Paste your URL</h3>
            <p className="text-sm text-muted-foreground">
              Drop any deployment URL. Vercel previews, Netlify deploys,
              localhost tunnels -- anything with a URL.
            </p>
          </div>

          {/* Step 2 */}
          <div>
            <div className="h-32 bg-neutral-900 border border-border/40 rounded-lg mb-4 flex items-center justify-center px-4">
              {/* Mini share link mockup */}
              <div className="w-full space-y-2">
                <div className="text-[9px] text-muted-foreground mb-1">
                  Share this link
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 h-7 rounded border border-neutral-700 bg-neutral-800 px-2 flex items-center">
                    <span className="text-[9px] text-foreground/80 font-mono truncate">
                      prevuiw.dev/p/my-app
                    </span>
                  </div>
                  <div className="h-7 w-7 rounded border border-neutral-700 bg-neutral-800 flex items-center justify-center">
                    <svg
                      className="h-3 w-3 text-muted-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm text-blue-500 font-mono mb-1">02</p>
            <h3 className="text-lg font-semibold mb-1">Share the link</h3>
            <p className="text-sm text-muted-foreground">
              Send the review link to your team. They can jump in instantly --
              no account needed.
            </p>
          </div>

          {/* Step 3 */}
          <div>
            <div className="h-32 bg-neutral-900 border border-border/40 rounded-lg mb-4 flex items-center justify-center px-4">
              {/* Mini comment feedback mockup */}
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Mini pin */}
                <div className="absolute top-6 left-6">
                  <div className="h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center text-[7px] font-bold text-white">
                    1
                  </div>
                </div>
                <div className="absolute top-10 right-8">
                  <div className="h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center text-[7px] font-bold text-white">
                    2
                  </div>
                </div>
                {/* Speech bubble */}
                <div className="bg-neutral-800 border border-neutral-700 rounded-lg px-2.5 py-1.5 mt-4">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <div className="h-3 w-3 rounded-full bg-blue-500/40" />
                    <span className="text-[8px] font-medium text-foreground">
                      Sarah
                    </span>
                  </div>
                  <p className="text-[8px] text-muted-foreground">
                    Make this button bigger
                  </p>
                </div>
              </div>
            </div>
            <p className="text-sm text-blue-500 font-mono mb-1">03</p>
            <h3 className="text-lg font-semibold mb-1">Get feedback</h3>
            <p className="text-sm text-muted-foreground">
              Your team clicks anywhere on the live page to leave comments.
              Pinned to exact coordinates.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
