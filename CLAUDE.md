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
- 배포: `v*` 태그 푸시 시 GitHub Actions가 npm publish 실행.

## Architecture

- **`index.ts`** — 모든 컴포넌트의 단일 진입점. 여기서 re-export.
- **`components/*.tsx`** — 개별 shadcn/ui 컴포넌트 (flat 구조, 디렉토리 없이 파일 단위)
- **`components/_excluded/`** — 빌드 제외 컴포넌트 (tsconfig exclude)
- **`lib/utils.ts`** — `cn()` 유틸리티 (clsx + tailwind-merge)
- **`hooks/`** — 공유 React hooks
- **`design-rules.md`** — UI 생성 제약 규칙 (npm 패키지에 포함되어 소비자 프로젝트에서 참조)

## Registry & Publishing

- Private Verdaccio: `https://verdaccio.gpters.org/`
- `.npmrc`에 `@gpters-internal` 스코프를 Verdaccio로 라우팅
- `publishConfig.registry`도 Verdaccio로 설정됨
- **주의**: `package-lock.json`의 name이 `package.json`과 불일치할 수 있음 (과거 `@design-geniefy/ui` → `@gpters-internal/ui` 변경 이력)

## Consumer Integration

소비자 프로젝트에서 tokens.css를 로드할 때 **반드시 HTML `<link>` 태그 사용**:
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/conewarrior/design-system/tokens.css" />
```
CSS `@import url()`은 Tailwind v4가 번들링을 시도하여 빌드가 멈추므로 사용 금지.

## Design Rules

`design-rules.md`는 UI 생성 시 반드시 준수해야 하는 규칙 문서:
- **Tailwind First**: CSS 변수보다 Tailwind 유틸리티 클래스 우선
- **Anti-Pattern 금지**: LLM 훈련 데이터의 흔한 웹 패턴 그대로 사용 금지
- 규칙 위반 시 생성을 거부하고 수정 요청

## New Component Checklist

1. `components/` 아래에 `.tsx` 파일 생성 (flat 구조)
2. `index.ts`에 `export * from './components/<name>'` 추가
3. `npm run build`로 컴파일 확인
