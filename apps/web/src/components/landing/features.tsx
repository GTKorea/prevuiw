export function Features() {
  return (
    <section id="features" className="py-24 scroll-mt-14">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-16">
          Built for visual feedback
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Card 1: Click or drag to comment */}
          <div className="border border-border/40 rounded-lg overflow-hidden">
            <div className="h-52 bg-[#111113] relative">
              {/* Realistic mini website */}
              <div className="absolute inset-0">
                {/* Nav */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06]">
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded bg-violet-500/30" />
                    <span className="text-[8px] text-white/50 font-medium">Acme</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[7px] text-white/25">Home</span>
                    <span className="text-[7px] text-white/25">About</span>
                    <div className="h-4 px-1.5 rounded bg-white/10 flex items-center">
                      <span className="text-[6px] text-white/40">Sign up</span>
                    </div>
                  </div>
                </div>
                {/* Hero area */}
                <div className="px-4 pt-4 pb-2">
                  <p className="text-[11px] font-semibold text-white/60 mb-1">Build better products</p>
                  <p className="text-[7px] text-white/25 mb-2 leading-relaxed">The platform for modern teams to ship faster.</p>
                  <div className="flex gap-1.5">
                    <div className="h-5 px-2 rounded bg-white flex items-center">
                      <span className="text-[7px] font-semibold text-black">Get started</span>
                    </div>
                    <div className="h-5 px-2 rounded border border-white/15 flex items-center">
                      <span className="text-[7px] text-white/40">Demo</span>
                    </div>
                  </div>
                </div>
                {/* Cards row */}
                <div className="px-4 pt-2 grid grid-cols-3 gap-1.5">
                  <div className="rounded border border-white/[0.06] bg-white/[0.02] p-2">
                    <div className="h-2.5 w-2.5 rounded bg-blue-500/20 mb-1.5" />
                    <div className="h-1.5 w-10 bg-white/10 rounded mb-1" />
                    <div className="h-1 w-full bg-white/5 rounded" />
                  </div>
                  <div className="rounded border border-white/[0.06] bg-white/[0.02] p-2">
                    <div className="h-2.5 w-2.5 rounded bg-green-500/20 mb-1.5" />
                    <div className="h-1.5 w-8 bg-white/10 rounded mb-1" />
                    <div className="h-1 w-full bg-white/5 rounded" />
                  </div>
                  <div className="rounded border border-white/[0.06] bg-white/[0.02] p-2">
                    <div className="h-2.5 w-2.5 rounded bg-purple-500/20 mb-1.5" />
                    <div className="h-1.5 w-12 bg-white/10 rounded mb-1" />
                    <div className="h-1 w-full bg-white/5 rounded" />
                  </div>
                </div>
              </div>

              {/* Pin 1 with comment bubble */}
              <div className="absolute top-[38px] left-[100px]">
                <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center text-[9px] font-bold text-white shadow-lg shadow-blue-500/40 ring-2 ring-blue-500/20">
                  1
                </div>
                <div className="absolute top-6 left-0 bg-neutral-800 border border-neutral-600 rounded-md px-2.5 py-1.5 shadow-xl z-10">
                  <div className="flex items-center gap-1 mb-0.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-blue-500/40" />
                    <span className="text-[7px] font-medium text-foreground/80">Sarah</span>
                  </div>
                  <p className="text-[7px] text-neutral-400">Heading needs more contrast</p>
                </div>
              </div>

              {/* Pin 2 */}
              <div className="absolute top-[72px] right-[60px]">
                <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center text-[9px] font-bold text-white shadow-lg shadow-blue-500/40 ring-2 ring-blue-500/20">
                  2
                </div>
              </div>

              {/* Green resolved pin */}
              <div className="absolute bottom-[50px] left-[30px]">
                <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-500/40 ring-2 ring-green-500/20">
                  <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              {/* Yellow drag area on cards */}
              <div className="absolute bottom-[8px] right-[16px] w-[100px] h-[44px] border-2 border-dashed border-yellow-500/50 rounded bg-yellow-500/[0.04]">
                <div className="absolute -top-2.5 -right-2.5">
                  <div className="h-5 w-5 rounded-full bg-yellow-500 flex items-center justify-center text-[9px] font-bold text-white shadow-lg shadow-yellow-500/40 ring-2 ring-yellow-500/20">
                    3
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-1">
                Click or drag to comment
              </h3>
              <p className="text-sm text-muted-foreground">
                Point comments pin to exact pixels, or drag to highlight an
                entire area. No more &quot;the thing on the left.&quot;
              </p>
            </div>
          </div>

          {/* Card 2: Version control */}
          <div className="border border-border/40 rounded-lg overflow-hidden">
            <div className="h-48 bg-neutral-900 p-4 flex flex-col gap-2">
              {/* Version rows mimicking real UI */}
              <div className="flex items-center rounded-md border border-blue-500/30 bg-blue-500/5 px-3 py-2.5 gap-3">
                <span className="inline-flex items-center rounded bg-blue-500/20 px-2 py-0.5 text-[9px] font-semibold text-blue-400">
                  LIVE
                </span>
                <div className="flex-1">
                  <p className="text-[11px] font-medium text-foreground/90">v2.1 — Header redesign</p>
                  <p className="text-[9px] text-muted-foreground">Mar 28 · my-app-abc123.vercel.app</p>
                </div>
                <span className="text-[9px] text-muted-foreground">💬 12</span>
              </div>
              <div className="flex items-center rounded-md border border-border/40 px-3 py-2.5 gap-3">
                <span className="inline-flex items-center rounded bg-neutral-800 px-2 py-0.5 text-[9px] font-medium text-muted-foreground">
                  v2.0
                </span>
                <div className="flex-1">
                  <p className="text-[11px] font-medium text-foreground/70">v2.0 — Dark mode</p>
                  <p className="text-[9px] text-muted-foreground">Mar 25 · my-app-def456.vercel.app</p>
                </div>
                <span className="text-[9px] text-muted-foreground">💬 8</span>
              </div>
              <div className="flex items-center rounded-md border border-border/40 px-3 py-2.5 gap-3 opacity-60">
                <span className="inline-flex items-center rounded bg-neutral-800 px-2 py-0.5 text-[9px] font-medium text-muted-foreground">
                  v1.0
                </span>
                <div className="flex-1">
                  <p className="text-[11px] font-medium text-foreground/50">v1.0 — Initial launch</p>
                  <p className="text-[9px] text-muted-foreground">Mar 20 · 📸 screenshots only</p>
                </div>
                <span className="text-[9px] text-muted-foreground">💬 3</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-1">Version control</h3>
              <p className="text-sm text-muted-foreground">
                Track every deployment. Compare versions side by side. Comments
                stay attached to their version.
              </p>
            </div>
          </div>

          {/* Card 3: Real-time collaboration */}
          <div className="border border-border/40 rounded-lg overflow-hidden">
            <div className="h-52 bg-[#111113] relative">
              {/* Fake review page background */}
              <div className="absolute inset-0">
                {/* Toolbar */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-bold text-white/60">prevuiw</span>
                    <span className="text-[7px] text-white/30">my-app</span>
                    <span className="text-[6px] bg-blue-500/15 text-blue-400 rounded px-1 py-0.5">v2.1</span>
                  </div>
                  <span className="text-[7px] text-white/30">💬 12</span>
                </div>
                {/* Fake page content */}
                <div className="p-3 space-y-2">
                  <div className="h-2 w-16 bg-white/8 rounded" />
                  <div className="h-1.5 w-full bg-white/4 rounded" />
                  <div className="h-1.5 w-3/4 bg-white/4 rounded" />
                  <div className="h-8 w-14 bg-white/6 rounded mt-1" />
                  <div className="grid grid-cols-2 gap-1.5 mt-2">
                    <div className="h-10 rounded border border-white/[0.04] bg-white/[0.02]" />
                    <div className="h-10 rounded border border-white/[0.04] bg-white/[0.02]" />
                  </div>
                </div>
              </div>

              {/* Cursor 1 — with live comment appearing */}
              <div className="absolute top-[46px] left-[60px]">
                <svg width="14" height="18" viewBox="0 0 12 16" fill="none" className="drop-shadow-lg">
                  <path d="M0 0L12 9.6L5.6 9.6L3.2 16L0 0Z" fill="#3B82F6"/>
                </svg>
                <span className="absolute top-4 left-3.5 bg-blue-500 rounded px-1.5 py-0.5 text-[7px] text-white font-medium whitespace-nowrap shadow-lg">Sarah</span>
                {/* Live typing bubble */}
                <div className="absolute top-10 left-2 bg-neutral-800 border border-neutral-600 rounded-md px-2 py-1 shadow-xl">
                  <p className="text-[7px] text-neutral-300">This heading is too sm<span className="text-white/40">|</span></p>
                </div>
              </div>

              {/* Cursor 2 */}
              <div className="absolute top-[90px] left-[200px]">
                <svg width="14" height="18" viewBox="0 0 12 16" fill="none" className="drop-shadow-lg">
                  <path d="M0 0L12 9.6L5.6 9.6L3.2 16L0 0Z" fill="#A855F7"/>
                </svg>
                <span className="absolute top-4 left-3.5 bg-purple-500 rounded px-1.5 py-0.5 text-[7px] text-white font-medium whitespace-nowrap shadow-lg">James</span>
              </div>

              {/* Cursor 3 */}
              <div className="absolute top-[130px] right-[40px]">
                <svg width="14" height="18" viewBox="0 0 12 16" fill="none" className="drop-shadow-lg">
                  <path d="M0 0L12 9.6L5.6 9.6L3.2 16L0 0Z" fill="#F97316"/>
                </svg>
                <span className="absolute top-4 left-3.5 bg-orange-500 rounded px-1.5 py-0.5 text-[7px] text-white font-medium whitespace-nowrap shadow-lg">Min</span>
              </div>

              {/* A comment pin that just appeared (blue glow) */}
              <div className="absolute top-[70px] right-[100px]">
                <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center text-[8px] font-bold text-white shadow-lg shadow-blue-500/50 ring-4 ring-blue-500/10">
                  4
                </div>
              </div>

              {/* Online indicator */}
              <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-neutral-900/80 backdrop-blur-sm rounded-full px-2 py-1 border border-white/[0.06]">
                <div className="flex -space-x-1.5">
                  <div className="h-4 w-4 rounded-full bg-blue-500 border border-neutral-900 flex items-center justify-center text-[6px] font-bold text-white">S</div>
                  <div className="h-4 w-4 rounded-full bg-purple-500 border border-neutral-900 flex items-center justify-center text-[6px] font-bold text-white">J</div>
                  <div className="h-4 w-4 rounded-full bg-orange-500 border border-neutral-900 flex items-center justify-center text-[6px] font-bold text-white">M</div>
                </div>
                <span className="text-[8px] text-green-400 font-medium">3 online</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-1">
                Real-time collaboration
              </h3>
              <p className="text-sm text-muted-foreground">
                See who&apos;s viewing. Comments appear instantly for everyone.
                No refresh needed.
              </p>
            </div>
          </div>

          {/* Card 4: No sign-up required */}
          <div className="border border-border/40 rounded-lg overflow-hidden">
            <div className="h-48 bg-neutral-900 flex items-center justify-center p-4">
              {/* Guest flow mockup */}
              <div className="w-full max-w-[220px] bg-neutral-800 border border-neutral-700 rounded-lg p-4 shadow-xl">
                <p className="text-[10px] font-semibold text-foreground/90 mb-1">Enter your name</p>
                <p className="text-[8px] text-muted-foreground mb-3">Choose a display name to leave comments</p>
                <div className="h-7 rounded-md border border-neutral-600 bg-neutral-900 px-2 flex items-center mb-2">
                  <span className="text-[9px] text-foreground/70">Designer Kim</span>
                  <span className="ml-auto text-[9px] text-muted-foreground/40">|</span>
                </div>
                <div className="h-7 rounded-md bg-foreground flex items-center justify-center">
                  <span className="text-[9px] font-semibold text-background">Continue</span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-1">
                No sign-up required
              </h3>
              <p className="text-sm text-muted-foreground">
                Reviewers just enter their name and start commenting. Zero
                friction for your team.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
