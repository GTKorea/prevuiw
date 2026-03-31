# prevuiw

URL을 입력하면 웹사이트를 iframe으로 로드하고, UI의 특정 지점에 코멘트를 남겨 팀원과 리뷰할 수 있는 도구.

## Features

- 웹사이트를 iframe으로 실시간 미리보기
- UI 특정 지점에 핀 코멘트 / 영역 드래그 코멘트
- 스크롤 추적 — 코멘트가 실제 콘텐츠 위치에 고정
- 페이지 이동 추적 — 페이지별 코멘트 분리
- 실시간 협업 (Socket.IO)
- 게스트 코멘트 (로그인 없이 참여)
- iframe 차단 사이트 프록시 지원

## Project Structure

```
apps/
  api/        NestJS API 서버
  web/        Next.js 프론트엔드
packages/
  sdk/        @prevuiw/sdk — 스크롤/URL 추적 SDK
```

## Getting Started

```bash
# 의존성 설치
pnpm install

# 환경변수 설정
cp apps/api/.env.example apps/api/.env
# .env 파일에 DATABASE_URL, JWT_SECRET 등 설정

# DB 마이그레이션
pnpm --filter api exec prisma migrate dev

# 개발 서버 실행
pnpm --filter api dev     # API → http://localhost:3012
pnpm --filter web dev     # Web → http://localhost:3020
```

## SDK 설치

리뷰 대상 사이트에 SDK를 설치하면 스크롤 추적 및 페이지 이동 추적이 활성화됩니다.

### Option 1: npm

```bash
npm install @prevuiw/sdk
```

```tsx
// app/layout.tsx (Next.js 예시)
'use client';
import '@prevuiw/sdk';
```

> **Note**: Next.js App Router에서는 클라이언트 컴포넌트에서 import해야 합니다.
>
> ```tsx
> // app/prevuiw-sdk.tsx
> 'use client';
> import '@prevuiw/sdk';
> export default function PrevuiwSDK() { return null; }
>
> // app/layout.tsx
> import PrevuiwSDK from './prevuiw-sdk';
> // <body> 안에 <PrevuiwSDK /> 추가
> ```

### Option 2: Inline script

버전 생성 시 다이얼로그에서 인라인 `<script>` 태그를 복사하여 사이트의 `<head>`에 추가.

### 동작 방식

- SDK는 iframe 안에서만 동작 (`window !== window.top` 체크)
- prevuiw가 아닌 사이트에서는 활성화되지 않음 (ping/pong 핸드셰이크)
- `postMessage`로 스크롤 위치, 페이지 URL을 prevuiw에 전달

## Tech Stack

| Layer | Stack |
|-------|-------|
| Backend | NestJS, Prisma, PostgreSQL, Socket.IO |
| Frontend | Next.js (App Router), Zustand, TanStack Query, Tailwind CSS |
| SDK | TypeScript, tsup |
