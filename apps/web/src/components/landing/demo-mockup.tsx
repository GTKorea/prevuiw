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
        <div className="rounded-xl border border-border/40 overflow-hidden shadow-2xl shadow-black/20">
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
            {/* Fake website — realistic SaaS landing page */}
            <div className="flex-1 bg-[#111113] relative min-h-[400px]">
              {/* Nav */}
              <div className="flex items-center justify-between px-6 py-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded bg-violet-500/30" />
                  <span className="text-[11px] font-semibold text-white/60">Acme Inc</span>
                </div>
                <div className="flex items-center gap-5">
                  <span className="text-[10px] text-white/30">Products</span>
                  <span className="text-[10px] text-white/30">Pricing</span>
                  <span className="text-[10px] text-white/30">Docs</span>
                  <div className="h-5 px-2.5 rounded bg-white/10 flex items-center">
                    <span className="text-[9px] text-white/50">Sign up</span>
                  </div>
                </div>
              </div>

              {/* Hero */}
              <div className="px-8 pt-10 pb-6">
                <div className="inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-0.5 mb-4">
                  <span className="text-[9px] text-white/40">New: AI-powered analytics</span>
                </div>
                <h2 className="text-[18px] font-bold text-white/80 leading-snug mb-2">
                  Ship faster with<br />better insights
                </h2>
                <p className="text-[11px] text-white/30 leading-relaxed mb-4 max-w-[280px]">
                  The all-in-one platform that helps your team build, deploy, and scale modern applications.
                </p>
                <div className="flex gap-2">
                  <div className="h-7 px-3 rounded-md bg-white flex items-center">
                    <span className="text-[10px] font-semibold text-black">Get started</span>
                  </div>
                  <div className="h-7 px-3 rounded-md border border-white/15 flex items-center">
                    <span className="text-[10px] text-white/50">View demo</span>
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="px-8 py-4 border-t border-white/[0.04] flex gap-8">
                <div>
                  <p className="text-[14px] font-bold text-white/70">10k+</p>
                  <p className="text-[9px] text-white/25">Companies</p>
                </div>
                <div>
                  <p className="text-[14px] font-bold text-white/70">99.9%</p>
                  <p className="text-[9px] text-white/25">Uptime</p>
                </div>
                <div>
                  <p className="text-[14px] font-bold text-white/70">150ms</p>
                  <p className="text-[9px] text-white/25">Avg latency</p>
                </div>
              </div>

              {/* Feature cards */}
              <div className="px-8 py-4 grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                  <div className="h-4 w-4 rounded bg-blue-500/20 mb-2 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-sm bg-blue-400/50" />
                  </div>
                  <p className="text-[10px] font-medium text-white/60 mb-1">Analytics</p>
                  <p className="text-[8px] text-white/25 leading-relaxed">Track every metric that matters to your team.</p>
                </div>
                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                  <div className="h-4 w-4 rounded bg-green-500/20 mb-2 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-sm bg-green-400/50" />
                  </div>
                  <p className="text-[10px] font-medium text-white/60 mb-1">Monitoring</p>
                  <p className="text-[8px] text-white/25 leading-relaxed">Real-time alerts when things go wrong.</p>
                </div>
                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                  <div className="h-4 w-4 rounded bg-purple-500/20 mb-2 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-sm bg-purple-400/50" />
                  </div>
                  <p className="text-[10px] font-medium text-white/60 mb-1">Deploy</p>
                  <p className="text-[8px] text-white/25 leading-relaxed">Push to production with zero downtime.</p>
                </div>
              </div>

              {/* Comment pins */}
              {/* Pin 1 — on the hero heading */}
              <div className="absolute top-[100px] left-[180px]">
                <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-blue-500/40 ring-2 ring-blue-500/20">
                  1
                </div>
              </div>

              {/* Pin 2 — on the CTA button */}
              <div className="absolute top-[195px] left-[115px]">
                <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-blue-500/40 ring-2 ring-blue-500/20">
                  2
                </div>
              </div>

              {/* Pin 3 resolved — on nav */}
              <div className="absolute top-[12px] right-[180px]">
                <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-500/40 ring-2 ring-green-500/20">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              {/* Yellow dashed drag area on feature cards */}
              <div className="absolute bottom-[16px] left-[48px] w-[180px] h-[75px] border-2 border-dashed border-yellow-500/50 rounded-lg bg-yellow-500/[0.03]">
                <div className="absolute -top-3 -right-3">
                  <div className="h-6 w-6 rounded-full bg-yellow-500 flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-yellow-500/40 ring-2 ring-yellow-500/20">
                    3
                  </div>
                </div>
              </div>
            </div>

            {/* Comment sidebar */}
            <div className="w-[280px] bg-neutral-900 border-l border-border/40 flex flex-col">
              <div className="px-3 py-2.5 border-b border-border/40 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Comments (3)
                </span>
                <div className="flex gap-1.5">
                  <span className="text-[10px] text-foreground/60 bg-neutral-800 px-1.5 py-0.5 rounded">All</span>
                  <span className="text-[10px] text-muted-foreground/40 px-1.5 py-0.5 rounded">Open</span>
                  <span className="text-[10px] text-muted-foreground/40 px-1.5 py-0.5 rounded">Resolved</span>
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                {/* Comment 1 */}
                <div className="px-3 py-3 border-b border-border/40">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="h-6 w-6 rounded-full bg-blue-500/30 flex items-center justify-center text-[9px] font-bold text-blue-300">
                      S
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-medium text-foreground">Sarah</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">2m ago</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed ml-8">
                    This heading needs more contrast. Hard to read on the dark
                    background.
                  </p>
                  <div className="flex items-center gap-3 ml-8 mt-2">
                    <span className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground cursor-pointer">Reply</span>
                    <span className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground cursor-pointer">Resolve</span>
                    <span className="text-[10px] text-muted-foreground/50">👍 2</span>
                  </div>
                </div>
                {/* Comment 2 */}
                <div className="px-3 py-3 border-b border-border/40">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="h-6 w-6 rounded-full bg-purple-500/30 flex items-center justify-center text-[9px] font-bold text-purple-300">
                      J
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-medium text-foreground">James</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">5m ago</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed ml-8">
                    Can we make the CTA button bigger? It looks lost next to the
                    secondary action.
                  </p>
                </div>
                {/* Comment 3 — resolved */}
                <div className="px-3 py-3 opacity-50">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="h-6 w-6 rounded-full bg-orange-500/30 flex items-center justify-center text-[9px] font-bold text-orange-300">
                      M
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-medium text-foreground">Min</span>
                      <span className="ml-2 text-[9px] text-green-400">Resolved</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">8m ago</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed ml-8 line-through">
                    Nav links should have more spacing between them.
                  </p>
                </div>
              </div>
              {/* Comment input */}
              <div className="border-t border-border/40 p-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-8 rounded-md border border-neutral-700 bg-neutral-800 px-2.5 flex items-center">
                    <span className="text-[10px] text-muted-foreground/40">Click on the page to comment...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
