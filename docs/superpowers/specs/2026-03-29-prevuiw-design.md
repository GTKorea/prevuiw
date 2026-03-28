# prevuiw — Visual Review Platform Design Spec

## Overview

URL을 입력하면 팀원들이 즉시 접속해서 피그마처럼 코멘트를 남길 수 있는 UI 리뷰 플랫폼.
Vercel Preview + Figma Comments를 결합한 서비스.

---

## Tech Stack

### Frontend
- **Next.js 16** — App Router
- **Tailwind CSS** — Styling
- **Shadcn UI** — Component library
- **TanStack Query** — Server state management
- **Zustand** — Client state management
- **next-intl** — i18n (EN, KO, JA, ZH, ES, FR)
- **next-themes** — Dark/Light mode

### Backend
- **Nest.js** — API server (port 3012)
- **PostgreSQL 16** — Database
- **Prisma** — ORM
- **Passport** — OAuth (Google, GitHub)
- **WebSocket (Socket.IO)** — Realtime comment sync
- **Playwright** — Screenshot capture (4 viewports)

### Infrastructure (krow-infra 확장)
- **EC2** — 기존 인스턴스에 prevuiw-api 서비스 추가
- **Docker Compose** — prevuiw-api 컨테이너 추가
- **Caddy** — `api.prevuiw.com` 리버스 프록시 추가
- **PostgreSQL** — 기존 인스턴스에 `prevuiw` DB 추가
- **Supabase Storage** — 스크린샷 이미지 저장
- **Vercel** — 프론트엔드 배포
- **GitHub Actions** — CI/CD (GHCR → EC2 자동 배포)

---

## Data Model (Prisma)

### User
| Field | Type | Note |
|---|---|---|
| id | UUID | PK |
| email | String | unique |
| name | String | |
| avatarUrl | String? | |
| provider | Enum | GOOGLE, GITHUB |
| providerId | String | OAuth provider ID |
| createdAt | DateTime | |

### Project
| Field | Type | Note |
|---|---|---|
| id | UUID | PK |
| name | String | |
| slug | String | unique, 공유 URL용 |
| ownerId | UUID | FK → User |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### Version
| Field | Type | Note |
|---|---|---|
| id | UUID | PK |
| projectId | UUID | FK → Project |
| versionName | String | 예: "v2.1" |
| url | String | 원본 사이트 URL |
| memo | String? | 버전 메모 |
| urlType | Enum | IMMUTABLE, MUTABLE |
| isActive | Boolean | 현재 활성 버전 |
| createdAt | DateTime | |

### Comment
| Field | Type | Note |
|---|---|---|
| id | UUID | PK |
| versionId | UUID | FK → Version |
| authorId | UUID? | FK → User, nullable (게스트) |
| guestName | String? | 비회원 닉네임 |
| content | String | 코멘트 내용 |
| posX | Float | 클릭 위치 X (% 단위) |
| posY | Float | 클릭 위치 Y (% 단위) |
| selectionArea | Json? | 드래그 영역 {x, y, width, height} (% 단위) |
| parentId | UUID? | FK → Comment, 자기참조 (스레드) |
| isResolved | Boolean | default false |
| createdAt | DateTime | |

### Reaction
| Field | Type | Note |
|---|---|---|
| id | UUID | PK |
| commentId | UUID | FK → Comment |
| userId | UUID | FK → User |
| emoji | String | 이모지 |

### Screenshot
| Field | Type | Note |
|---|---|---|
| id | UUID | PK |
| versionId | UUID | FK → Version |
| viewport | Enum | MOBILE_375, TABLET_768, LAPTOP_1440, DESKTOP_1920 |
| imageUrl | String | Supabase Storage URL |
| capturedAt | DateTime | |

### Notification
| Field | Type | Note |
|---|---|---|
| id | UUID | PK |
| userId | UUID | FK → User |
| commentId | UUID | FK → Comment |
| type | Enum | MENTION, REPLY, RESOLVE |
| isRead | Boolean | default false |
| createdAt | DateTime | |

---

## Screens & UX Flow

### 1. Landing Page
- 구글 스타일 미니멀 홈 — 중앙에 URL 입력 필드 + "Preview →" 버튼
- 비회원도 즉시 첫 프리뷰 생성 가능 (1개 제한)
- 하단: Sign in, Docs, GitHub 링크
- 디자인 톤: Vercel 스타일 다크 테마 기본

### 2. Review Page (핵심 화면)
- **상단 바**: 프로젝트명, 현재 버전, 코멘트 수, 온라인 유저 수, Share 버튼
- **메인 영역**: iframe으로 원본 사이트 렌더링
  - 클릭 → 해당 위치에 코멘트 핀 생성
  - 드래그 → 영역 선택 후 코멘트 생성
  - 핀 색상: 파란색(열림), 초록색(해결됨), 노란색(드래그 영역)
- **사이드바**: 코멘트 목록
  - 필터: All / Open / Resolved
  - 각 코멘트: 작성자, 시간, 내용, Reply/Resolve/리액션
  - 스레드 답글 지원
  - 멘션(@) 지원
- **비회원 접속 시**: 닉네임 입력 모달 → 코멘트 작성 가능
- **스크린샷 모드** (mutable URL 이전 버전): iframe 대신 캡쳐된 스크린샷 뷰어, 뷰포트 전환 가능

### 3. Dashboard
- 로그인 유저의 프로젝트 카드 목록
- 각 카드: 프로젝트명, URL, 최신 버전, 코멘트 수
- "+ New Project" 버튼
- 상단 네비: 로고, 알림 벨 (인앱 알림), 프로필

### 4. Version History (프로젝트 상세)
- 버전 리스트 (최신순)
- 각 버전: 버전명, 메모, 날짜, URL 타입(immutable/mutable), 코멘트 수
- 현재 활성 버전 "LIVE" 뱃지
- mutable URL의 이전 버전은 "📸 screenshots only" 표시
- 새 버전 추가 버튼

---

## Core Features

### URL 임베딩
- iframe으로 원본 사이트 렌더링
- 완벽 대응 플랫폼 (immutable URL): Vercel, Netlify, Cloudflare Pages, AWS Amplify, Render
- mutable URL 감지 시 안내 메시지 표시
- URL 입력 시 플랫폼 자동 감지 → immutable URL이면 "영구 보존" 뱃지

### 버전 관리
- 하나의 프로젝트 안에 여러 URL(버전)이 쌓이는 구조
- immutable URL: iframe 라이브 모드 영구 유지
- mutable URL: 새 버전 등록 시 이전 버전 자동 스크린샷 캡쳐 (4 viewports)
- 이전 버전은 스크린샷 뷰어 모드로 전환 (코멘트 보존)

### 스크린샷 캡쳐
- Playwright로 서버사이드 캡쳐
- 4개 뷰포트: Mobile(375px), Tablet(768px), Laptop(1440px), Desktop(1920px)
- Supabase Storage에 저장
- 비용 제로 (자체 서버 실행)

### 코멘트 시스템
- **클릭 코멘트**: posX, posY (% 단위) — 반응형에서도 위치 유지
- **드래그 코멘트**: selectionArea JSON {x, y, width, height} (% 단위)
- **스레드(답글)**: parentId 자기참조
- **Resolve**: 코멘트 해결 처리
- **리액션**: 이모지 리액션
- **멘션(@)**: 특정 유저 태그
- **실시간 동기화**: WebSocket으로 코멘트 즉시 반영 (커서 공유 제외)
- 버전별 독립 코멘트

### 인증
- Google OAuth + GitHub OAuth (소셜 로그인만)
- 비회원: 1개 프로젝트 생성 가능 (localStorage 기반 식별)
- 비회원 코멘트: 닉네임 설정 후 코멘트 가능
- 회원: 무제한 프로젝트

### 알림
- 인앱 알림만 (알림 벨 아이콘 + 목록)
- 트리거: 멘션, 내 코멘트에 답글, 내 코멘트 resolve

### 접근 제어
- 링크 공유만으로 접근 — 별도 팀/멤버 관리 없음
- 링크를 가진 누구나 코멘트 가능

### i18n
- 6개 언어: English(기본), 한국어, 日本語, 中文(简体), Español, Français
- next-intl 사용, 브라우저 언어 자동 감지

### 테마
- Light / Dark 모드
- next-themes 사용, 시스템 설정 자동 감지
- 기본값: Dark (Vercel 스타일)

---

## Infrastructure Changes (krow-infra)

### docker-compose.yml 추가
```yaml
prevuiw-api:
  image: ghcr.io/gtkorea/prevuiw-api:latest
  restart: unless-stopped
  depends_on:
    postgres:
      condition: service_healthy
  environment:
    DATABASE_URL: postgresql://krow:${DB_PASSWORD}@postgres:5432/prevuiw?schema=public
    JWT_SECRET: ${PREVUIW_JWT_SECRET}
    FRONTEND_URL: ${PREVUIW_FRONTEND_URL:-https://prevuiw.com}
    SUPABASE_URL: ${PREVUIW_SUPABASE_URL}
    SUPABASE_SERVICE_KEY: ${PREVUIW_SUPABASE_SERVICE_KEY}
    API_PORT: "3012"
  networks:
    - internal
    - web
```

### Caddyfile 추가
```
api.prevuiw.com {
  reverse_proxy prevuiw-api:3012
}
```

### postgres/init/01-create-databases.sql 추가
```sql
CREATE DATABASE prevuiw;
```

---

## Design Tone & Manner
- Vercel 스타일: 다크 배경(#0a0a0a), 미니멀, 깔끔한 타이포그래피
- 코멘트 UX: Figma + Vercel Preview 참고
- 핀 색상 체계: 파란색(Open), 초록색(Resolved), 노란색(영역 선택)

---

## Development Workflow — gstack Skills

| Phase | Skill | Purpose |
|---|---|---|
| Design | `/design-consultation` | 디자인 시스템 수립 |
| Design | `/design-shotgun` | 주요 화면 디자인 변형 비교 |
| Development | `/plan-eng-review` | 구현 계획 아키텍처 리뷰 |
| Development | `/investigate` | 버그 디버깅 |
| Testing | `/qa` | QA 테스트 + 버그 수정 |
| Testing | `/benchmark` | 성능 회귀 감지 |
| Review | `/review` | PR 코드 리뷰 |
| Review | `/design-review` | 시각적 QA |
| Deploy | `/ship` | PR 생성 + 릴리즈 |
| Deploy | `/canary` | 배포 후 모니터링 |
| Security | `/cso` | 보안 감사 |

---

## Verification

1. **로컬 개발 환경**: `pnpm dev`로 Next.js + Nest.js 동시 실행, 로컬 PostgreSQL
2. **기능 테스트**: URL 입력 → 프리뷰 생성 → 코멘트 작성 → 실시간 동기화 확인
3. **스크린샷 테스트**: mutable URL 버전 등록 → 4개 뷰포트 캡쳐 확인
4. **인증 테스트**: Google/GitHub 로그인, 비회원 코멘트
5. **E2E**: `/qa` 스킬로 전체 플로우 QA
6. **성능**: `/benchmark`로 Core Web Vitals 체크
7. **보안**: `/cso`로 시크릿, 의존성, OWASP Top 10 감사
