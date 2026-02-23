# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

`@gpters-internal/ui` — shadcn/ui 기반 디자인 시스템 컴포넌트 라이브러리. Tailwind CSS v4 + Radix UI 위에 구축되며, 소비자 프로젝트에서 `import { Button } from '@gpters-internal/ui'` 형태로 사용한다.

## Commands

```bash
npm run build          # TypeScript 컴파일 (tsc → dist/)
npm publish            # Verdaccio에 배포 (prepublishOnly로 build 자동 실행)
```

- 테스트/린트 스크립트 없음. 빌드(`tsc`)가 유일한 검증 수단.
- 배포: `v*` 태그 푸시 시 GitHub Actions(`publish.yml`)가 npm publish 실행.
- 버전 올리기: `npm version patch|minor|major` → 자동으로 git tag 생성.

## Architecture

- **`index.ts`** — 모든 컴포넌트의 단일 진입점. 여기서 re-export.
- **`components/*.tsx`** — 개별 shadcn/ui 컴포넌트 (flat 구조, 디렉토리 없이 파일 단위)
- **`components/_excluded/`** — 빌드 제외 컴포넌트 (tsconfig exclude). 현재: resizable.
- **`lib/utils.ts`** — `cn()` 유틸리티 (clsx + tailwind-merge)
- **`hooks/`** — 공유 React hooks (`use-mobile.ts`)
- **`tokens.css`** — 디자인 토큰 정의 (색상, 간격 4px 단위, radius, font, shadow, z-index, motion)
- **`palettes/`** — 서비스별 컬러 팔레트 (gpters, blue, violet, emerald, slate). tokens.css의 primary/secondary를 오버라이드.
- **`design-rules.md`** — UI 생성 제약 규칙 (npm 패키지에 포함되어 소비자 프로젝트에서 참조)

### npm 패키지에 포함되는 소비자용 도구

`package.json`의 `files` 필드 기준:
- `.claude/skills/design-rules.md` — Hook으로 자동 주입되는 규칙 문서
- `.claude/scripts/lint-design-rules.sh` — 컴포넌트 작성 시 자동 위반 탐지 (6개 규칙)
- `scripts/report-adoption.js` — postinstall로 실행되는 opt-in 채택 보고

### peerDependencies

`react >= 18`, `tailwindcss ^4.2.0`, `lucide-react >= 0.400.0` — 소비자 프로젝트에서 직접 설치해야 한다.

## Registry & Publishing

- Private Verdaccio: `https://verdaccio.gpters.org/`
- `.npmrc`에 `@gpters-internal` 스코프를 Verdaccio로 라우팅
- `publishConfig.registry`도 Verdaccio로 설정됨
- **주의**: `package-lock.json`의 name이 `package.json`과 불일치할 수 있음 (과거 `@design-geniefy/ui` → `@gpters-internal/ui` 변경 이력)

## Consumer Integration

소비자 프로젝트는 `/setup-design` 커맨드(`.claude/commands/setup-design.md`)로 자동 설정된다. 8단계로 npm 패키지, tokens.css + 팔레트, Tailwind v4 @theme, CLAUDE.md, Hook + lint 스크립트를 설치한다.

tokens.css 로드 방식:
- **npm 프로젝트**: `@import '@gpters-internal/ui/tokens.css';`
- **HTML만**: `<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/conewarrior/design-system/tokens.css" />`
- **주의**: CSS `@import url()`은 Tailwind v4가 번들링을 시도하여 빌드가 멈추므로 사용 금지.

## Design Rules

`design-rules.md`는 UI 생성 시 반드시 준수해야 하는 규칙 문서:
- **Tailwind First**: CSS 변수보다 Tailwind 유틸리티 클래스 우선
- **Anti-Pattern 금지**: LLM 훈련 데이터의 흔한 웹 패턴 그대로 사용 금지
- 규칙 위반 시 생성을 거부하고 수정 요청

`lint-design-rules.sh`가 자동 검증하는 6개 규칙:
1. 텍스트 아이콘/이모지 사용 금지 → SVG(lucide-react) 사용
2. 하드코딩 색상 금지 → `var(--color-*)` 토큰 사용
3. 하드코딩 간격 금지 → `var(--spacing-*)` 토큰 사용
4. border-left/right px 금지 (Anti-Pattern)
5. 불필요한 shadow 금지 (Modal/Dropdown/Toast/Popover/Tooltip 제외)
6. page.tsx에서 로컬 컴포넌트 정의 금지

## New Component Checklist

1. `components/` 아래에 `.tsx` 파일 생성 (flat 구조)
2. `index.ts`에 `export * from './components/<name>'` 추가
3. `npm run build`로 컴파일 확인
