import type { Viewport } from "@/shared/types";

export const queryKeys = {
  auth: {
    me: () => ["auth", "me"] as const,
  },
  projects: {
    all: () => ["projects"] as const,
    detail: (slug: string) => ["projects", slug] as const,
  },
  comments: {
    all: (versionId: string) => ["comments", versionId] as const,
    byViewport: (versionId: string, viewport: Viewport) =>
      ["comments", versionId, viewport] as const,
  },
  notifications: {
    all: () => ["notifications"] as const,
    unread: () => ["notifications", "unread"] as const,
  },
} as const;
