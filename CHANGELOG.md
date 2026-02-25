# Changelog

All notable changes to `@gpters-internal/ui` will be documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.0.23] - 2026-02-25

### Added
- load-design-rules.sh: UserPromptSubmit hook 조건부 실행 스크립트 (UI 키워드 감지 시에만 로드)

### Changed
- setup-design v1.5: UserPromptSubmit hook을 조건부 실행으로 변경 (매 메시지 ~10,000자 컨텍스트 절약)
- setup-design: Dependabot + auto-merge 복원 (조직 전체 npm 자동 업데이트 핵심 메커니즘)

### Removed
- setup-design에서 제거: HTML-only 옵션 (npm 필수)
- setup-design에서 제거: Tailwind 설치 여부 질문 (필수로 변경)

## [0.0.22] - 2026-02-24

### Changed
- design-rules.md v1.4: Border Radius 섹션 제거 (제약 완화)
- lint-design-rules.sh: ESLint 규칙 흡수 (page.tsx 로컬 컴포넌트 검사 추가)
- setup-design 간소화: 9단계 13개 파일 → 8단계 5개 파일

### Removed
- setup-design에서 제거: auto-contribute.sh, verify-design-setup.sh, design-system-state.json
- setup-design에서 제거: eslint.config.mjs + npm devDeps 3개 (`eslint`, `@eslint/js`, `typescript-eslint`)
- setup-design에서 제거: dependabot.yml, auto-merge.yml (→ 0.0.23에서 복원)
- design-rules.md: Section 2.1 Border Radius (과도한 제약)

## [0.0.21] - 2025-02-22

### Added
- 컬러 팔레트 파일 5종 (gpters, blue, violet, emerald, slate)
- setup-design 팔레트 선택 가이드

## [0.0.20] - 2025-02-21

### Added
- 서비스별 컬러 팔레트 구조 (`palettes/`)

## [0.0.19] - 2025-02-20

### Added
- tokens.css를 npm 패키지에 포함

### Changed
- publish workflow를 Verdaccio 레지스트리로 변경

## [0.0.18] - 2025-02-19

### Changed
- .claude/commands를 npm files에서 제거
- CLAUDE.md 추가
- tokens.css 로딩 방식 변경: JS import → HTML `<link>` 태그

### Fixed
- lucide-react를 devDependencies에서 peerDependencies로 이동

## [0.0.17] - 2025-02-18

### Changed
- design-rules v1.3: Tailwind First 원칙 추가
- hooks/ 디렉토리를 npm 패키지에 포함
- Verdaccio 레지스트리로 전환

### Added
- GitHub Actions: publish, contrib-auto-merge, token-change-check 워크플로우

## [0.0.1] - 2025-02-17

### Added
- 초기 npm 패키지 저장소 생성
- shadcn/ui 기반 컴포넌트 라이브러리
