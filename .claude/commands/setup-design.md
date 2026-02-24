# /setup-design v1.4

프로젝트에 @gpters-internal/ui 디자인 시스템을 자동 설정합니다.

**한 번 실행으로 완료되는 항목:**
- npm 패키지 설치
- CLAUDE.md에 디자인 규칙 추가
- UI 생성 시 규칙 자동 적용 (Hook) - node_modules에서 직접 참조
- 컴포넌트 작성 시 design-rules 위반 자동 검증

---

## 실행 단계

### Step 1: 프로젝트 확인

**package.json이 있으면:**
→ Step 2로 진행

**package.json이 없으면:**
→ `npm init -y`로 자동 생성 후 Step 2로 진행

### Step 2: npm 패키지 설치

**패키지 설치:**
```bash
npm install @gpters-internal/ui
```

### Step 3: 토큰 및 팔레트 로드

프로젝트의 메인 CSS 파일 (globals.css 등)에 추가:

```css
@import '@gpters-internal/ui/tokens.css';
```

**AskUserQuestion으로 컬러 팔레트 선택:**
```
질문: "어떤 컬러를 메인으로 쓸 건가요?"
- **GPTers Orange** (#EF6020) — 따뜻한 오렌지
- **Blue** (#2563EB) — 클래식 블루
- **Violet** (#7C3AED) — 보라/퍼플
- **Emerald** (#059669) — 그린/에메랄드
- **Slate** (#475569) — 뉴트럴 슬레이트
```

선택에 따라 팔레트 import 추가:
```css
@import '@gpters-internal/ui/tokens.css';
@import '@gpters-internal/ui/palettes/gpters.css';  /* 선택된 팔레트 */
```

> 팔레트는 tokens.css의 primary/secondary 색상을 오버라이드합니다.
> tokens.css 다음에 import해야 정상 적용됩니다.

### Step 4: Tailwind v4 + PostCSS + @theme 설정

> shadcn/ui 컴포넌트를 사용하려면 Tailwind CSS v4가 필수입니다.
> tokens.css의 값을 @theme으로 매핑하여 shadcn 컴포넌트가 디자인 토큰을 사용하도록 합니다.

1. **패키지 설치:**
```bash
npm install tailwindcss@latest @tailwindcss/postcss@latest
```

2. **postcss.config.mjs 생성:**
```javascript
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

3. **globals.css (또는 메인 CSS 파일)에 Tailwind 추가:**

tokens.css `<link>` 로드 후, globals.css에 추가:
```css
/* Tailwind CSS v4 */
@import "tailwindcss";

/* Tailwind Theme - tokens.css 변수를 Tailwind 테마에 매핑 */
@theme {
  /* Colors - shadcn compatible */
  --color-background: var(--color-background);
  --color-foreground: var(--color-foreground);
  --color-primary: var(--color-primary);
  --color-primary-foreground: var(--color-primary-foreground);
  --color-secondary: var(--color-secondary);
  --color-secondary-foreground: var(--color-secondary-foreground);
  --color-muted: var(--color-muted);
  --color-muted-foreground: var(--color-muted-foreground);
  --color-accent: var(--color-accent);
  --color-accent-foreground: var(--color-accent-foreground);
  --color-destructive: var(--color-destructive);
  --color-destructive-foreground: var(--color-destructive-foreground);
  --color-border: var(--color-border);
  --color-input: var(--color-input);
  --color-ring: var(--color-ring);

  /* Radius */
  --radius-sm: var(--radius-sm);
  --radius-md: var(--radius-md);
  --radius-lg: var(--radius-lg);
  --radius-xl: var(--radius-xl);
  --radius-2xl: var(--radius-2xl);
  --radius-full: var(--radius-full);

  /* Font Family */
  --font-sans: var(--font-family-sans);
  --font-mono: var(--font-family-mono);
}
```

> Tailwind v4는 CSS-first 설정 방식을 사용합니다.
> `tailwind.config.js` 대신 `@theme` 블록에서 테마를 정의합니다.

### Step 5: CLAUDE.md 설정
기존 CLAUDE.md를 읽고, 없으면 새로 생성합니다.
다음 내용을 CLAUDE.md에 추가합니다:

```markdown
## 디자인 시스템

이 프로젝트는 @gpters-internal/ui 디자인 시스템을 사용합니다.

### 토큰
- CDN: https://cdn.jsdelivr.net/gh/conewarrior/design-system/tokens.css
- 모든 색상, 간격, radius는 tokens.css의 CSS 변수 사용 필수

### 규칙 (자동 적용)
UI 생성 시 design-rules skill이 node_modules에서 자동 로드됩니다:
- 하드코딩 색상 금지 (#fff, rgb 등) → var(--color-*) 사용
- 8px 단위 간격만 사용 → var(--spacing-*) 사용
- radius는 토큰만 사용 → var(--radius-*) 사용
- 화면당 컴포넌트 최대 7개
- 배경/강조 색상 최대 3개

> design-rules.md는 npm 업데이트 시 자동으로 최신 버전이 적용됩니다.

### 컴포넌트 생성 규칙 (필수)

**기존 컴포넌트 코드를 참고하지 마라. 기존 코드가 틀렸을 수 있다.**

컴포넌트 생성 시 반드시 다음 순서를 따른다:

1. **design-rules.md를 유일한 소스로 사용**
   - `node_modules/@gpters-internal/ui/.claude/skills/design-rules.md` 규칙 확인
   - 기존 컴포넌트 패턴 복사 금지

2. **생성 전 체크리스트**
   - [ ] 토큰만 사용 (하드코딩 색상/간격 금지)
   - [ ] SVG 아이콘만 사용 (이모지/텍스트 문자 금지)
   - [ ] Shadow 사용 금지 (Modal/Dropdown/Toast 제외)
   - [ ] 적절한 radius 토큰 사용

3. **생성 후 자가 검증**
   - 작성한 코드가 design-rules 위반하는지 점검
   - lint-design-rules.sh 자동 실행됨

4. **기존 컴포넌트 위반 발견 시**
   - 별도로 사용자에게 보고
   - 새 컴포넌트는 규칙대로 작성
```

### Step 6: Hook 설정
`.claude/settings.local.json` 파일을 생성/수정하여 다음 hook을 등록합니다:

> **중요**: PostToolUse hook은 환경변수가 아닌 **stdin으로 JSON**을 받습니다.
> `jq`를 사용하여 `tool_input.file_path`를 파싱해야 합니다.

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [{"type": "command", "command": "cat node_modules/@gpters-internal/ui/.claude/skills/design-rules.md"}]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {"type": "command", "command": "file_path=$(jq -r '.tool_input.file_path // empty') && if [[ \"$file_path\" == *\"components/\"* ]]; then \"$CLAUDE_PROJECT_DIR\"/.claude/scripts/lint-design-rules.sh \"$file_path\"; fi", "statusMessage": "Design Rules 검증 중..."}
        ]
      }
    ]
  }
}
```

**Hook 설명:**
- `UserPromptSubmit`: 모든 프롬프트 제출 시 **node_modules에서** design-rules.md 로딩 (npm 업데이트 시 자동 반영)
- `PostToolUse`: Write|Edit 도구 사용 시:
  - **stdin에서 JSON 파싱**: `jq -r '.tool_input.file_path'`로 파일 경로 추출
  - **design-rules 위반 자동 검증** (lint-design-rules.sh)

**필수 의존성:**
- `jq`: JSON 파싱 도구 (macOS: `brew install jq`, Ubuntu: `apt install jq`)

### Step 7: Design Rules 검증 스크립트 생성
`.claude/scripts/lint-design-rules.sh` 파일을 생성합니다:

```bash
mkdir -p .claude/scripts
```

```bash
#!/bin/bash
# design-rules.md 위반 탐지 스크립트
# Usage: ./lint-design-rules.sh [file_path]

FILE_PATH="$1"
VIOLATIONS=0

# 색상 출력
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 파일이 components/ 내부인지 확인
if [[ ! "$FILE_PATH" == *"components/"* ]]; then
  exit 0
fi

echo "🔍 Design Rules 검증: $FILE_PATH"
echo "---"

# 1. 텍스트 아이콘/이모지 탐지 (규칙 2.7)
# 유니코드 심볼 (curly quotes "" 포함)
TEXT_ICONS=$(grep -E '[""]|[✓✔✅⚠️❌✕✖×▼▾⌄›❯←→ℹ🔍📋📌📝💡⬆⬇⬅➡◀▶●○■□★☆♥♦]' "$FILE_PATH" 2>/dev/null || true)
if [ -n "$TEXT_ICONS" ]; then
  echo -e "${RED}❌ [2.7 위반] 텍스트 아이콘/이모지 사용 금지${NC}"
  echo "$TEXT_ICONS"
  echo "   → SVG 아이콘으로 교체 필요 (lucide-react 권장)"
  echo ""
  VIOLATIONS=$((VIOLATIONS + 1))
fi

# 2. 하드코딩 색상 탐지 (규칙 2.2)
HARDCODED_COLORS=$(grep -E "(#[0-9a-fA-F]{3,8}|rgb\(|rgba\(|hsl\()" "$FILE_PATH" 2>/dev/null | grep -v "var(--" || true)
if [ -n "$HARDCODED_COLORS" ]; then
  echo -e "${RED}❌ [2.2 위반] 하드코딩 색상 사용 금지${NC}"
  echo "$HARDCODED_COLORS"
  echo "   → var(--color-*) 토큰으로 교체 필요"
  echo ""
  VIOLATIONS=$((VIOLATIONS + 1))
fi

# 3. 하드코딩 간격 탐지 (규칙 2.1)
HARDCODED_SPACING=$(grep -oE "(padding|margin|gap|top|right|bottom|left):\s*[0-9]+px" "$FILE_PATH" 2>/dev/null || true)
if [ -n "$HARDCODED_SPACING" ]; then
  echo -e "${YELLOW}⚠️ [2.1 주의] 하드코딩 간격 발견${NC}"
  echo "$HARDCODED_SPACING"
  echo "   → var(--spacing-*) 토큰 사용 권장"
  echo ""
fi

# 4. Anti-Pattern: border-left/right px 탐지 (규칙 0.1)
BORDER_PX=$(grep -E "border-(left|right):\s*[0-9]+px" "$FILE_PATH" 2>/dev/null || true)
if [ -n "$BORDER_PX" ]; then
  echo -e "${RED}❌ [0.1 위반] border-left/right px 금지${NC}"
  echo "$BORDER_PX"
  echo "   → border 토큰 사용 필요"
  echo ""
  VIOLATIONS=$((VIOLATIONS + 1))
fi

# 5. 불필요한 shadow 탐지 (규칙 2.8)
COMPONENT_NAME=$(basename "$(dirname "$FILE_PATH")")
if [[ ! "$COMPONENT_NAME" =~ ^(Modal|Dropdown|Toast|Popover|Tooltip)$ ]]; then
  SHADOW_USAGE=$(grep -E "box-shadow|boxShadow" "$FILE_PATH" 2>/dev/null || true)
  if [ -n "$SHADOW_USAGE" ]; then
    echo -e "${RED}❌ [2.8 위반] Shadow 사용 금지 (해당 컴포넌트)${NC}"
    echo "$SHADOW_USAGE"
    echo "   → border로 대체하거나 제거 필요"
    echo ""
    VIOLATIONS=$((VIOLATIONS + 1))
  fi
fi

# 6. page.tsx에서 로컬 컴포넌트 정의 탐지
if [[ "$FILE_PATH" == *"page.tsx"* ]]; then
  LOCAL_COMPONENTS=$(grep -E "^(export )?(const|function) [A-Z]" "$FILE_PATH" \
    | grep -v "Page" | grep -v "export default" || true)
  if [ -n "$LOCAL_COMPONENTS" ]; then
    echo -e "${RED}❌ page.tsx에서 컴포넌트 직접 정의 금지${NC}"
    echo "$LOCAL_COMPONENTS"
    echo "   → @components/ 또는 @gpters-internal/ui에서 import하세요"
    echo ""
    VIOLATIONS=$((VIOLATIONS + 1))
  fi
fi

# 결과 출력
echo "---"
if [ $VIOLATIONS -eq 0 ]; then
  echo -e "✅ Design Rules 검증 통과"
else
  echo -e "${RED}❌ $VIOLATIONS개 위반 발견 - 수정 필요${NC}"
fi

exit $VIOLATIONS
```

**스크립트 생성 후 실행 권한 부여:**
```bash
chmod +x .claude/scripts/lint-design-rules.sh
```

### Step 8: 완료 메시지

```
✅ @gpters-internal/ui 디자인 시스템 설정 완료!

설치된 항목:
- npm 패키지: @gpters-internal/ui
- CLAUDE.md: 디자인 규칙 + 컴포넌트 생성 규칙
- Hook: UI 생성 시 node_modules에서 design-rules.md 자동 로드
- Hook: 컴포넌트 작성 시 design-rules 위반 자동 검증 (lint-design-rules.sh)

자동 검증:
- 텍스트 아이콘/이모지 사용 → ❌ 위반 탐지
- 하드코딩 색상 (#fff, rgb) → ❌ 위반 탐지
- 하드코딩 간격 (px) → ⚠️ 주의 탐지
- 불필요한 shadow 사용 → ❌ 위반 탐지
- page.tsx 내 컴포넌트 정의 → ❌ 위반 탐지

토큰 참조:
- CDN: https://cdn.jsdelivr.net/gh/conewarrior/design-system/tokens.css
```

## 에러 처리

| 상황 | 처리 |
|------|------|
| package.json 없음 | `npm init -y`로 자동 생성 |
| npm install 실패 | 에러 출력, 나머지 단계 계속 진행 |
| globals.css 없음 | 새로 생성 |
| .claude 폴더 없음 | 폴더 생성 후 파일 생성 |
