# CLAUDE.md

## Project Overview

prevuiw는 웹사이트 리뷰 도구로, URL을 입력하면 iframe으로 사이트를 로드하고 특정 UI 지점에 코멘트를 남길 수 있다.

## Architecture

```
prevuiw/
  apps/
    api/          — NestJS 백엔드 (PostgreSQL + Prisma)
    web/          — Next.js 프론트엔드
  packages/
    sdk/          — @prevuiw/sdk (스크롤/URL 추적 SDK)
```

## Key Concepts

### iframe 모드 (MUTABLE vs IMMUTABLE)

| | MUTABLE | IMMUTABLE |
|---|---|---|
| 대상 | iframe 허용 사이트 | iframe 차단 사이트 (Vercel, Netlify 등) |
| 로드 방식 | 직접 iframe | 프록시 (`/proxy?url=`) |
| 사이트 기능 | 정상 동작 | 정적 페이지만 정상, JS API 호출 깨짐 |
| 스크롤 추적 | SDK 설치 필요 | 프록시가 자동 주입 |

- URL 패턴으로 자동 감지 (`apps/api/src/version/version.service.ts`의 `IMMUTABLE_PATTERNS`)
- 프록시는 `X-Frame-Options`, `CSP` 헤더를 제거하고 스크롤/URL 추적 스크립트를 주입

### SDK (`packages/sdk`)

사이트에 설치하면 iframe 내에서 부모(prevuiw)에게 `postMessage`로 스크롤/URL 정보 전달.

- **핸드셰이크**: `prevuiw:ping` → `prevuiw:pong` 확인 후에만 활성화 (prevuiw 외부에서는 동작 안 함)
- **메시지 타입**: `prevuiw:scroll` (scrollX/Y, scrollWidth/Height, clientWidth/Height), `prevuiw:url` (location.href)
- **성능**: `requestAnimationFrame`으로 throttle

### 코멘트 좌표 시스템

- SDK/프록시가 있는 경우: **문서 절대 좌표(%)** — 스크롤해도 원래 콘텐츠 위치에 고정
- SDK 없는 MUTABLE: **뷰포트 기준 좌표(%)** — 화면에 고정 (레거시)
- 좌표 변환은 `comment-overlay.tsx`에서 처리
- 스크롤 시 핀 위치 업데이트는 React 리렌더 없이 DOM 직접 조작 (성능 최적화)

### 주요 postMessage 흐름

```
iframe(SDK/프록시) → parent(prevuiw)
  prevuiw:ping    → prevuiw:pong (핸드셰이크)
  prevuiw:scroll  → overlay가 직접 수신, DOM 조작으로 핀 위치 업데이트
  prevuiw:url     → page.tsx가 수신, zustand store 업데이트 → 페이지별 코멘트 필터링
```

## Tech Stack

- **Backend**: NestJS, Prisma, PostgreSQL, Socket.IO
- **Frontend**: Next.js (App Router), Zustand, TanStack Query, Tailwind CSS, shadcn/ui
- **SDK**: TypeScript, tsup (CJS/ESM 빌드)

## Development

```bash
# 의존성 설치
pnpm install

# 개발 서버
pnpm --filter api dev     # API: localhost:3012
pnpm --filter web dev     # Web: localhost:3020

# SDK 빌드
pnpm --filter @prevuiw/sdk build
```

## Commit Convention

- 접두사(feat:, fix:, chore: 등)는 영어로, 본문은 한글로 작성

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
