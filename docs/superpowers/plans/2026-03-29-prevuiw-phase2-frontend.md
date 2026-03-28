# prevuiw Phase 2: Frontend — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Build the complete Next.js 16 frontend with Landing, Auth, Dashboard, Version History, and Review Page (iframe + comment overlay).

**Architecture:** Next.js App Router with `apps/web/`. TanStack Query for server state, Zustand for client state, next-intl for i18n, next-themes for dark/light mode. Shadcn UI + Tailwind for components.

**Tech Stack:** Next.js 16, Tailwind CSS, Shadcn UI, TanStack Query, Zustand, next-intl, next-themes, socket.io-client

---

## File Structure

```
apps/web/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout (providers, theme, i18n)
│   │   ├── page.tsx                # Landing page
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── page.tsx        # OAuth callback handler
│   │   ├── dashboard/
│   │   │   ├── layout.tsx          # Dashboard layout (nav)
│   │   │   └── page.tsx            # Project list
│   │   ├── p/[slug]/
│   │   │   ├── page.tsx            # Version history
│   │   │   └── [versionId]/
│   │   │       └── page.tsx        # Review page
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                     # Shadcn UI components
│   │   ├── landing/
│   │   │   └── url-input.tsx       # URL input component
│   │   ├── dashboard/
│   │   │   ├── project-card.tsx
│   │   │   ├── create-project-dialog.tsx
│   │   │   └── nav-bar.tsx
│   │   ├── version/
│   │   │   ├── version-list.tsx
│   │   │   └── create-version-dialog.tsx
│   │   ├── review/
│   │   │   ├── review-toolbar.tsx
│   │   │   ├── iframe-container.tsx
│   │   │   ├── comment-overlay.tsx
│   │   │   ├── comment-pin.tsx
│   │   │   ├── comment-sidebar.tsx
│   │   │   ├── comment-thread.tsx
│   │   │   ├── comment-input.tsx
│   │   │   ├── guest-name-dialog.tsx
│   │   │   └── screenshot-viewer.tsx
│   │   ├── notification/
│   │   │   └── notification-bell.tsx
│   │   └── providers.tsx           # All providers wrapper
│   ├── lib/
│   │   ├── api.ts                  # API client (fetch wrapper)
│   │   ├── auth.ts                 # Auth utilities
│   │   ├── socket.ts               # Socket.IO client
│   │   └── utils.ts                # cn() helper
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   ├── use-projects.ts
│   │   ├── use-versions.ts
│   │   ├── use-comments.ts
│   │   └── use-notifications.ts
│   ├── stores/
│   │   ├── auth-store.ts
│   │   └── comment-store.ts        # Active comment, mode (click/drag)
│   └── i18n/
│       ├── config.ts
│       └── messages/
│           ├── en.json
│           ├── ko.json
│           ├── ja.json
│           ├── zh.json
│           ├── es.json
│           └── fr.json
├── public/
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
├── package.json
├── components.json                 # Shadcn config
└── .env.example
```

---

### Task 1: Next.js Scaffolding + Shadcn UI + Providers

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/next.config.ts`
- Create: `apps/web/tailwind.config.ts`
- Create: `apps/web/postcss.config.js`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/components.json`
- Create: `apps/web/.env.example`
- Create: `apps/web/src/app/globals.css`
- Create: `apps/web/src/app/layout.tsx`
- Create: `apps/web/src/app/page.tsx` (placeholder)
- Create: `apps/web/src/lib/utils.ts`
- Create: `apps/web/src/components/providers.tsx`
- Modify: root `package.json` (add dev:web script)

Setup: `pnpm install`, init shadcn, add button+input+dialog+card+badge+avatar+dropdown-menu+tooltip components.

---

### Task 2: API Client + Auth Store + Auth Hooks

**Files:**
- Create: `apps/web/src/lib/api.ts` — fetch wrapper with token injection
- Create: `apps/web/src/lib/auth.ts` — token storage (localStorage)
- Create: `apps/web/src/stores/auth-store.ts` — Zustand store (user, token, login/logout)
- Create: `apps/web/src/hooks/use-auth.ts` — TanStack Query hook for /auth/me
- Create: `apps/web/src/app/auth/callback/page.tsx` — extract token from URL, store, redirect to dashboard

---

### Task 3: Landing Page

**Files:**
- Create: `apps/web/src/components/landing/url-input.tsx`
- Modify: `apps/web/src/app/page.tsx`

Google-style minimal design: centered logo + URL input + "Preview →" button. Dark background (#0a0a0a). "No sign-up required for your first preview" subtitle. Bottom links: Sign in, Docs, GitHub.

---

### Task 4: Dashboard (Nav + Project List + Create)

**Files:**
- Create: `apps/web/src/components/dashboard/nav-bar.tsx`
- Create: `apps/web/src/components/dashboard/project-card.tsx`
- Create: `apps/web/src/components/dashboard/create-project-dialog.tsx`
- Create: `apps/web/src/hooks/use-projects.ts`
- Create: `apps/web/src/app/dashboard/layout.tsx`
- Create: `apps/web/src/app/dashboard/page.tsx`

---

### Task 5: Version History Page

**Files:**
- Create: `apps/web/src/components/version/version-list.tsx`
- Create: `apps/web/src/components/version/create-version-dialog.tsx`
- Create: `apps/web/src/hooks/use-versions.ts`
- Create: `apps/web/src/app/p/[slug]/page.tsx`

---

### Task 6: Review Page — iframe + Comment Overlay

**Files:**
- Create: `apps/web/src/lib/socket.ts`
- Create: `apps/web/src/stores/comment-store.ts`
- Create: `apps/web/src/hooks/use-comments.ts`
- Create: `apps/web/src/components/review/review-toolbar.tsx`
- Create: `apps/web/src/components/review/iframe-container.tsx`
- Create: `apps/web/src/components/review/comment-overlay.tsx`
- Create: `apps/web/src/components/review/comment-pin.tsx`
- Create: `apps/web/src/components/review/comment-sidebar.tsx`
- Create: `apps/web/src/components/review/comment-thread.tsx`
- Create: `apps/web/src/components/review/comment-input.tsx`
- Create: `apps/web/src/components/review/guest-name-dialog.tsx`
- Create: `apps/web/src/components/review/screenshot-viewer.tsx`
- Create: `apps/web/src/app/p/[slug]/[versionId]/page.tsx`

Core feature: iframe with transparent overlay for click/drag comments. Sidebar with thread view. WebSocket realtime updates.

---

### Task 7: Notification Bell

**Files:**
- Create: `apps/web/src/hooks/use-notifications.ts`
- Create: `apps/web/src/components/notification/notification-bell.tsx`
- Modify: `apps/web/src/components/dashboard/nav-bar.tsx` (add bell)

---

### Task 8: i18n + Theme Setup

**Files:**
- Create: `apps/web/src/i18n/config.ts`
- Create: `apps/web/src/i18n/messages/en.json`
- Create: `apps/web/src/i18n/messages/ko.json`
- Create: `apps/web/src/i18n/messages/ja.json`
- Create: `apps/web/src/i18n/messages/zh.json`
- Create: `apps/web/src/i18n/messages/es.json`
- Create: `apps/web/src/i18n/messages/fr.json`
- Modify: layout.tsx, providers.tsx (integrate next-intl + next-themes)

---
