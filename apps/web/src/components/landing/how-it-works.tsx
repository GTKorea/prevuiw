export function HowItWorks() {
  return (
    <section className="py-24 border-t border-border/40">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-4">
          How it works
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-16 max-w-lg mx-auto">
          Three steps. No setup. No installs. Just paste and go.
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Step 1 */}
          <div className="border border-border/40 rounded-xl overflow-hidden">
            <div className="h-44 bg-neutral-900 relative p-5">
              {/* Browser chrome */}
              <div className="bg-neutral-800 rounded-lg border border-neutral-700 overflow-hidden h-full">
                <div className="flex items-center gap-1.5 px-3 py-2 border-b border-neutral-700">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-neutral-600" />
                    <div className="w-2 h-2 rounded-full bg-neutral-600" />
                    <div className="w-2 h-2 rounded-full bg-neutral-600" />
                  </div>
                  <div className="flex-1 bg-neutral-700 rounded h-4 mx-2 flex items-center px-2">
                    <span className="text-[8px] text-neutral-400 font-mono">prevuiw.com</span>
                  </div>
                </div>
                <div className="p-3 flex flex-col items-center gap-2">
                  <div className="text-[10px] font-bold text-foreground/80">prevuiw</div>
                  <div className="flex items-center gap-1 w-full">
                    <div className="flex-1 h-5 rounded border border-neutral-600 bg-neutral-700 px-1.5 flex items-center">
                      <span className="text-[7px] text-neutral-400 font-mono">https://my-app.vercel.app</span>
                    </div>
                    <div className="h-5 px-2 rounded bg-white flex items-center">
                      <span className="text-[7px] font-bold text-black">Preview →</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-5">
              <p className="text-xs text-blue-500 font-mono mb-2">01</p>
              <h3 className="text-base font-semibold mb-1.5">Paste your URL</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Drop any deployment URL. Vercel previews, Netlify deploys, localhost tunnels.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="border border-border/40 rounded-xl overflow-hidden">
            <div className="h-44 bg-neutral-900 relative p-5">
              {/* Share UI */}
              <div className="bg-neutral-800 rounded-lg border border-neutral-700 p-4 h-full flex flex-col justify-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-[9px] text-green-400 font-medium">Review link created</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 h-7 rounded border border-neutral-600 bg-neutral-900 px-2 flex items-center">
                    <span className="text-[9px] text-foreground/80 font-mono">prevuiw.com/p/my-app-f3a2c1</span>
                  </div>
                  <div className="h-7 w-7 rounded border border-neutral-600 bg-neutral-700 flex items-center justify-center">
                    <svg className="h-3 w-3 text-foreground/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 h-6 rounded bg-neutral-700 flex items-center justify-center gap-1">
                    <span className="text-[8px] text-muted-foreground">Slack</span>
                  </div>
                  <div className="flex-1 h-6 rounded bg-neutral-700 flex items-center justify-center gap-1">
                    <span className="text-[8px] text-muted-foreground">Email</span>
                  </div>
                  <div className="flex-1 h-6 rounded bg-neutral-700 flex items-center justify-center gap-1">
                    <span className="text-[8px] text-muted-foreground">Copy</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-5">
              <p className="text-xs text-blue-500 font-mono mb-2">02</p>
              <h3 className="text-base font-semibold mb-1.5">Share the link</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Send the review link to your team. They can jump in instantly, no account needed.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="border border-border/40 rounded-xl overflow-hidden">
            <div className="h-44 bg-neutral-900 relative p-5">
              {/* Comment interaction mockup */}
              <div className="bg-neutral-800 rounded-lg border border-neutral-700 h-full relative overflow-hidden">
                {/* Fake page content */}
                <div className="p-3 space-y-1.5">
                  <div className="h-2 w-20 bg-neutral-600 rounded" />
                  <div className="h-1.5 w-full bg-neutral-700 rounded" />
                  <div className="h-1.5 w-3/4 bg-neutral-700 rounded" />
                  <div className="h-8 w-16 bg-neutral-700 rounded mt-2" />
                </div>

                {/* Pin with expanded comment */}
                <div className="absolute top-3 right-3">
                  <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center text-[9px] font-bold text-white shadow-lg shadow-blue-500/40">
                    1
                  </div>
                  <div className="absolute top-6 right-0 bg-neutral-900 border border-neutral-600 rounded-lg p-2.5 w-[140px] shadow-xl">
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="h-3.5 w-3.5 rounded-full bg-blue-500/40 flex items-center justify-center text-[6px] font-bold text-blue-300">S</div>
                      <span className="text-[8px] font-medium text-foreground/90">Sarah</span>
                      <span className="text-[7px] text-muted-foreground ml-auto">now</span>
                    </div>
                    <p className="text-[8px] text-muted-foreground leading-relaxed">Make this button bigger and add more padding</p>
                    <div className="flex gap-2 mt-1.5 text-[7px] text-muted-foreground/60">
                      <span>Reply</span>
                      <span>Resolve</span>
                      <span>👍</span>
                    </div>
                  </div>
                </div>

                {/* Second pin */}
                <div className="absolute bottom-4 left-4">
                  <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-500/40">
                    <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-5">
              <p className="text-xs text-blue-500 font-mono mb-2">03</p>
              <h3 className="text-base font-semibold mb-1.5">Get feedback</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your team clicks anywhere on the live page to leave pinned comments. Resolve when done.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
