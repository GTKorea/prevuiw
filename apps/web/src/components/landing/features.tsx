export function Features() {
  return (
    <section id="features" className="py-24 border-t border-border/40 scroll-mt-14">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-16">
          Built for visual feedback
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Card 1: Click or drag to comment */}
          <div className="border border-border/40 rounded-lg overflow-hidden">
            <div className="h-48 bg-neutral-900 relative">
              {/* Fake website content */}
              <div className="absolute inset-0 p-4">
                <div className="h-3 w-20 bg-neutral-700 rounded mb-4" />
                <div className="flex gap-3 mb-4">
                  <div className="h-2 w-12 bg-neutral-800 rounded" />
                  <div className="h-2 w-10 bg-neutral-800 rounded" />
                  <div className="h-2 w-14 bg-neutral-800 rounded" />
                </div>
                <div className="h-16 w-full bg-neutral-800/50 rounded-md mb-3" />
                <div className="flex gap-2">
                  <div className="h-10 flex-1 bg-neutral-800/30 rounded" />
                  <div className="h-10 flex-1 bg-neutral-800/30 rounded" />
                  <div className="h-10 flex-1 bg-neutral-800/30 rounded" />
                </div>
              </div>

              {/* Blue pin 1 with comment bubble */}
              <div className="absolute top-6 left-24">
                <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center text-[9px] font-bold text-white shadow-lg shadow-blue-500/30">
                  1
                </div>
                <div className="absolute top-6 left-0 bg-neutral-800 border border-neutral-700 rounded-md px-2 py-1 whitespace-nowrap shadow-xl">
                  <p className="text-[8px] text-neutral-300">Hero text needs more contrast</p>
                </div>
              </div>

              {/* Blue pin 2 */}
              <div className="absolute top-16 right-12">
                <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center text-[9px] font-bold text-white shadow-lg shadow-blue-500/30">
                  2
                </div>
              </div>

              {/* Green resolved pin */}
              <div className="absolute bottom-12 left-16">
                <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center text-[9px] font-bold text-white shadow-lg shadow-green-500/30">
                  ✓
                </div>
              </div>

              {/* Yellow dashed selection area */}
              <div className="absolute bottom-4 right-6 w-28 h-14 border-2 border-dashed border-yellow-500/60 rounded bg-yellow-500/5">
                <div className="absolute -top-2.5 -right-2.5">
                  <div className="h-5 w-5 rounded-full bg-yellow-500 flex items-center justify-center text-[9px] font-bold text-white shadow-lg shadow-yellow-500/30">
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
            <div className="h-48 bg-neutral-900 relative p-4">
              {/* Fake review toolbar */}
              <div className="flex items-center justify-between border-b border-border/40 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-foreground/80">prevuiw</span>
                  <span className="text-[9px] text-muted-foreground">my-app</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-muted-foreground">💬 12</span>
                </div>
              </div>

              {/* Cursors moving around */}
              <div className="relative h-24">
                {/* Cursor 1 */}
                <div className="absolute top-2 left-8">
                  <svg width="12" height="16" viewBox="0 0 12 16" fill="none" className="drop-shadow-lg">
                    <path d="M0 0L12 9.6L5.6 9.6L3.2 16L0 0Z" fill="#3B82F6"/>
                  </svg>
                  <span className="absolute top-3.5 left-3 bg-blue-500 rounded px-1 py-0.5 text-[7px] text-white font-medium whitespace-nowrap">Sarah</span>
                </div>
                {/* Cursor 2 */}
                <div className="absolute top-10 left-32">
                  <svg width="12" height="16" viewBox="0 0 12 16" fill="none" className="drop-shadow-lg">
                    <path d="M0 0L12 9.6L5.6 9.6L3.2 16L0 0Z" fill="#A855F7"/>
                  </svg>
                  <span className="absolute top-3.5 left-3 bg-purple-500 rounded px-1 py-0.5 text-[7px] text-white font-medium whitespace-nowrap">James</span>
                </div>
                {/* Cursor 3 - typing indicator */}
                <div className="absolute top-16 right-16">
                  <svg width="12" height="16" viewBox="0 0 12 16" fill="none" className="drop-shadow-lg">
                    <path d="M0 0L12 9.6L5.6 9.6L3.2 16L0 0Z" fill="#F97316"/>
                  </svg>
                  <span className="absolute top-3.5 left-3 bg-orange-500 rounded px-1 py-0.5 text-[7px] text-white font-medium whitespace-nowrap">Min</span>
                </div>
              </div>

              {/* Online indicator */}
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  <div className="h-5 w-5 rounded-full bg-blue-500 border-2 border-neutral-900 flex items-center justify-center text-[7px] font-bold text-white">S</div>
                  <div className="h-5 w-5 rounded-full bg-purple-500 border-2 border-neutral-900 flex items-center justify-center text-[7px] font-bold text-white">J</div>
                  <div className="h-5 w-5 rounded-full bg-orange-500 border-2 border-neutral-900 flex items-center justify-center text-[7px] font-bold text-white">M</div>
                </div>
                <span className="inline-flex items-center rounded-full bg-green-500/15 px-2 py-0.5 text-[9px] font-medium text-green-400">
                  3 online
                </span>
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
