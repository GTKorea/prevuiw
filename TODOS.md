# TODOS

## Phase 2

### npm 패키지 배포 파이프라인
- **What:** @prevuiw/sdk를 npm에 배포하고 CDN (unpkg/jsdelivr)에서 접근 가능하게 함
- **Why:** SDK를 사용하려면 npm install이나 CDN script 태그로 가져올 수 있어야 함
- **How:** GitHub Actions 워크플로우 추가. version 태그 push 시 자동 npm publish
- **Depends on:** Phase 1 SDK 확장 완료
- **Added:** 2026-03-31 by /plan-eng-review

### iframe 모드 실시간 커서
- **What:** 기존 iframe 모드에도 실시간 커서 오버레이 추가
- **Why:** SDK 미설치 사이트에서도 실시간 협업 경험 제공
- **How:** iframe 위에 오버레이 레이어, cross-origin 좌표 변환
- **Depends on:** Phase 1 커서 시스템 완료
- **Added:** 2026-03-31 by /plan-eng-review
