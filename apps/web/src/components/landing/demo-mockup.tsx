export function DemoMockup() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-4">
          See it in action
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-12">
          Your team reviews directly on the live site — no screenshots, no
          guessing.
        </p>

        {/* Review page mockup */}
        <div className="rounded-xl border border-border/40 overflow-hidden">
          {/* Top bar */}
          <div className="flex items-center justify-between bg-neutral-900 border-b border-border/40 px-4 py-2.5">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-foreground">prevuiw</span>
              <span className="text-xs text-muted-foreground">/</span>
              <span className="text-sm text-muted-foreground font-mono">
                my-app
              </span>
              <span className="inline-flex items-center rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-medium text-blue-400">
                v2.1
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1.5">
                <div className="h-5 w-5 rounded-full bg-blue-500/60 border border-neutral-900" />
                <div className="h-5 w-5 rounded-full bg-green-500/60 border border-neutral-900" />
                <div className="h-5 w-5 rounded-full bg-yellow-500/60 border border-neutral-900" />
              </div>
              <span className="text-[10px] text-muted-foreground">
                3 online
              </span>
            </div>
          </div>

          {/* Main content area */}
          <div className="flex">
            {/* Fake website */}
            <div className="flex-1 bg-neutral-800/50 relative min-h-[360px]">
              {/* Fake nav */}
              <div className="flex items-center justify-between px-6 py-3 border-b border-white/5">
                <div className="h-3 w-16 rounded bg-white/10" />
                <div className="flex gap-4">
                  <div className="h-2.5 w-10 rounded bg-white/8" />
                  <div className="h-2.5 w-10 rounded bg-white/8" />
                  <div className="h-2.5 w-10 rounded bg-white/8" />
                  <div className="h-7 w-16 rounded bg-blue-500/20 flex items-center justify-center">
                    <div className="h-2 w-10 rounded bg-blue-400/40" />
                  </div>
                </div>
              </div>

              {/* Fake hero section */}
              <div className="px-8 py-10 space-y-3">
                <div className="h-5 w-48 rounded bg-white/12" />
                <div className="h-3 w-72 rounded bg-white/6" />
                <div className="h-3 w-56 rounded bg-white/6" />
                <div className="flex gap-2 mt-4">
                  <div className="h-7 w-20 rounded bg-blue-500/25" />
                  <div className="h-7 w-20 rounded border border-white/10" />
                </div>
              </div>

              {/* Fake card grid */}
              <div className="px-8 grid grid-cols-3 gap-3">
                <div className="h-24 rounded-lg border border-white/5 bg-white/3 p-3 space-y-2">
                  <div className="h-2.5 w-12 rounded bg-white/10" />
                  <div className="h-2 w-full rounded bg-white/5" />
                  <div className="h-2 w-3/4 rounded bg-white/5" />
                </div>
                <div className="h-24 rounded-lg border border-white/5 bg-white/3 p-3 space-y-2">
                  <div className="h-2.5 w-14 rounded bg-white/10" />
                  <div className="h-2 w-full rounded bg-white/5" />
                  <div className="h-2 w-2/3 rounded bg-white/5" />
                </div>
                <div className="h-24 rounded-lg border border-white/5 bg-white/3 p-3 space-y-2">
                  <div className="h-2.5 w-10 rounded bg-white/10" />
                  <div className="h-2 w-full rounded bg-white/5" />
                  <div className="h-2 w-4/5 rounded bg-white/5" />
                </div>
              </div>

              {/* Comment pins on the website */}
              {/* Pin #1 — blue, on the hero heading */}
              <div className="absolute top-[88px] left-[120px] flex items-center gap-1">
                <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center text-[9px] font-bold text-white shadow-sm shadow-blue-500/30">
                  1
                </div>
              </div>

              {/* Pin #2 — blue, on the CTA button */}
              <div className="absolute top-[168px] left-[100px] flex items-center gap-1">
                <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center text-[9px] font-bold text-white shadow-sm shadow-blue-500/30">
                  2
                </div>
              </div>

              {/* Pin #3 — green resolved, on the nav */}
              <div className="absolute top-[14px] right-[200px] flex items-center gap-1">
                <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center text-white shadow-sm shadow-green-500/30">
                  <svg
                    className="h-2.5 w-2.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>

              {/* Yellow dashed drag area with pin #3 */}
              <div className="absolute bottom-[32px] left-[56px] w-[200px] h-[68px] border-2 border-dashed border-yellow-500/60 rounded-lg flex items-start p-1">
                <div className="h-5 w-5 rounded-full bg-yellow-500 flex items-center justify-center text-[9px] font-bold text-white shadow-sm shadow-yellow-500/30">
                  3
                </div>
              </div>
            </div>

            {/* Comment sidebar */}
            <div className="w-[260px] bg-neutral-900 border-l border-border/40 flex flex-col">
              <div className="px-3 py-2.5 border-b border-border/40">
                <span className="text-xs font-medium text-muted-foreground">
                  Comments (3)
                </span>
              </div>
              <div className="flex-1 overflow-hidden">
                {/* Comment 1 */}
                <div className="px-3 py-3 border-b border-border/40">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="h-5 w-5 rounded-full bg-blue-500/40 flex items-center justify-center text-[8px] font-bold text-blue-300">
                      S
                    </div>
                    <span className="text-xs font-medium text-foreground">
                      Sarah
                    </span>
                    <span className="text-[10px] text-muted-foreground ml-auto">
                      2m ago
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    This heading needs more contrast. Hard to read on the dark
                    background.
                  </p>
                </div>
                {/* Comment 2 */}
                <div className="px-3 py-3 border-b border-border/40">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="h-5 w-5 rounded-full bg-purple-500/40 flex items-center justify-center text-[8px] font-bold text-purple-300">
                      J
                    </div>
                    <span className="text-xs font-medium text-foreground">
                      James
                    </span>
                    <span className="text-[10px] text-muted-foreground ml-auto">
                      5m ago
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Can we make the CTA button bigger? It looks lost next to the
                    secondary action.
                  </p>
                </div>
                {/* Comment 3 */}
                <div className="px-3 py-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="h-5 w-5 rounded-full bg-orange-500/40 flex items-center justify-center text-[8px] font-bold text-orange-300">
                      M
                    </div>
                    <span className="text-xs font-medium text-foreground">
                      Min
                    </span>
                    <span className="text-[10px] text-muted-foreground ml-auto">
                      8m ago
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    These cards should be the same height. The third one is
                    taller.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
