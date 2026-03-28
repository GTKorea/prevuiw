export function Features() {
  return (
    <section className="py-24 border-t border-border/40">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-16">
          Built for visual feedback
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Card 1: Click or drag to comment */}
          <div className="border border-border/40 rounded-lg p-6">
            <div className="h-32 bg-neutral-900 border border-border/40 rounded-lg mb-4 relative overflow-hidden">
              {/* Mini rectangle with pins and drag area */}
              <div className="absolute inset-4">
                {/* Blue pins */}
                <div className="absolute top-3 left-6">
                  <div className="h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center text-[7px] font-bold text-white">
                    1
                  </div>
                </div>
                <div className="absolute top-8 right-10">
                  <div className="h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center text-[7px] font-bold text-white">
                    2
                  </div>
                </div>
                {/* Yellow dashed selection area */}
                <div className="absolute bottom-1 left-10 w-24 h-10 border-2 border-dashed border-yellow-500/60 rounded" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-1">
              Click or drag to comment
            </h3>
            <p className="text-sm text-muted-foreground">
              Point comments pin to exact pixels, or drag to highlight an
              entire area. No more &quot;the thing on the left.&quot;
            </p>
          </div>

          {/* Card 2: Version control */}
          <div className="border border-border/40 rounded-lg p-6">
            <div className="h-32 bg-neutral-900 border border-border/40 rounded-lg mb-4 flex flex-col justify-center px-4 gap-2">
              {/* Version rows */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-foreground/80">
                  v2.1
                </span>
                <span className="inline-flex items-center rounded-full bg-blue-500/20 px-1.5 py-0.5 text-[8px] font-medium text-blue-400">
                  LIVE
                </span>
              </div>
              <div className="flex items-center gap-2 opacity-50">
                <span className="text-[10px] font-mono text-foreground/80">
                  v2.0
                </span>
              </div>
              <div className="flex items-center gap-2 opacity-30">
                <span className="text-[10px] font-mono text-foreground/80">
                  v1.0
                </span>
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-1">Version control</h3>
            <p className="text-sm text-muted-foreground">
              Track every deployment. Compare versions side by side. Comments
              stay attached to their version.
            </p>
          </div>

          {/* Card 3: Real-time collaboration */}
          <div className="border border-border/40 rounded-lg p-6">
            <div className="h-32 bg-neutral-900 border border-border/40 rounded-lg mb-4 flex items-center justify-center">
              {/* Overlapping avatars + badge */}
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <div className="h-7 w-7 rounded-full bg-blue-500/50 border-2 border-neutral-900 flex items-center justify-center text-[9px] font-bold text-blue-200">
                    S
                  </div>
                  <div className="h-7 w-7 rounded-full bg-purple-500/50 border-2 border-neutral-900 flex items-center justify-center text-[9px] font-bold text-purple-200">
                    J
                  </div>
                  <div className="h-7 w-7 rounded-full bg-orange-500/50 border-2 border-neutral-900 flex items-center justify-center text-[9px] font-bold text-orange-200">
                    M
                  </div>
                </div>
                <span className="inline-flex items-center rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-medium text-green-400">
                  3 online
                </span>
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-1">
              Real-time collaboration
            </h3>
            <p className="text-sm text-muted-foreground">
              See who&apos;s viewing. Comments appear instantly for everyone.
              No refresh needed.
            </p>
          </div>

          {/* Card 4: No sign-up required */}
          <div className="border border-border/40 rounded-lg p-6">
            <div className="h-32 bg-neutral-900 border border-border/40 rounded-lg mb-4 flex items-center justify-center px-6">
              {/* Mini sign-up form */}
              <div className="w-full max-w-[180px] space-y-2">
                <div className="h-7 rounded border border-neutral-700 bg-neutral-800 px-2 flex items-center">
                  <span className="text-[9px] text-muted-foreground/50">
                    Your name
                  </span>
                </div>
                <div className="h-7 rounded bg-white flex items-center justify-center">
                  <span className="text-[9px] font-semibold text-black">
                    Continue
                  </span>
                </div>
              </div>
            </div>
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
    </section>
  );
}
