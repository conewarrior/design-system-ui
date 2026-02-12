# Design Rules v1

> **단일 소스 역할**: LLM이 UI를 생성할 때 반드시 준수해야 하는 제약 규칙과 Generation Protocol을 정의한다.

이 문서는 Claude Code가 `components/` 내에서 UI를 생성할 때 참조하는 제약 규칙이다.
**규칙 위반 시 생성을 거부하고 수정을 요청해야 한다.**

## 스타일링 원칙: Tailwind First

> **⚠️ 이 원칙은 모든 스타일링 지침보다 우선한다.**

**Tailwind CSS 유틸리티 클래스를 CSS 변수보다 우선 사용한다.**

```tsx
// ❌ 금지: CSS 변수 직접 사용 (style 속성)
<div style={{ padding: 'var(--spacing-4)', color: 'var(--color-foreground)' }}>

// ❌ 금지: 하드코딩 값
<div style={{ padding: '16px', color: '#333' }}>

// ✅ 올바른 사용: Tailwind 유틸리티 클래스
<div className="p-4 text-foreground">
```

### 토큰 접근 방법

| 용도 | Tailwind 클래스 (권장) | CSS 변수 (필요시) |
|------|------------------------|-------------------|
| 배경색 | `bg-background`, `bg-muted`, `bg-primary` | `hsl(var(--background))` |
| 텍스트 | `text-foreground`, `text-muted-foreground` | `hsl(var(--foreground))` |
| 테두리 | `border-border`, `border-input` | `hsl(var(--border))` |
| 간격 | `p-4`, `m-2`, `gap-6`, `space-y-4` | Tailwind 기본 spacing |
| 둥글기 | `rounded-sm`, `rounded-md`, `rounded-lg` | `var(--radius-*)` |

### 스타일 파일 구조

```
docs/styles/globals.css
├── @import "tailwindcss"     # Tailwind v4 기본
├── :root { ... }              # shadcn CSS 변수 (Light mode)
├── .dark { ... }              # shadcn CSS 변수 (Dark mode)
└── @theme { ... }             # Tailwind 테마 확장 (--color-*, --radius-*)
```

**CSS 변수가 필요한 경우:**
- 동적 스타일 계산이 필요할 때
- Tailwind 클래스로 표현 불가능한 복잡한 값
- 외부 라이브러리와의 호환성

---

## 0. 훈련 데이터 패턴 사용 금지 (Anti-Pattern)

> **⚠️ 이 섹션은 모든 규칙보다 우선한다.**

**LLM의 훈련 데이터에서 학습한 "흔한 웹 패턴"을 그대로 사용하는 것을 금지한다.**
웹에서 자주 보이는 디자인이라도 이 디자인 시스템에서는 허용되지 않을 수 있다.

### 0.1 절대 금지 패턴 (Banned Patterns)

**아래 패턴은 훈련 데이터에서 흔히 나타나지만, 이 디자인 시스템에서는 절대 사용 금지:**

| 컴포넌트 | ❌ 금지 패턴 (흔한 웹 스타일) | 이유 |
|----------|------------------------------|------|
| Blockquote | `border-left: 4px solid` (GitHub/Medium 스타일) | 하드코딩 px, 훈련 데이터 편향 |
| Blockquote | `border-left: 3px solid var(--color-*)` | 3px는 토큰에 없음 |
| Alert | `✓`, `⚠`, `✕`, `ℹ` 텍스트 아이콘 | SVG만 허용 |
| Alert | `"` `"` 등 유니코드 따옴표 아이콘 | SVG만 허용 |
| Card | `box-shadow: 0 4px 6px rgba(...)` | Shadow 금지 |
| Button | `border-radius: 8px` 이상 | 토큰만 사용 |
| List item | `borderLeft` + `background` + `fontWeight` 동시 변경 | 단일 피드백만 |

```tsx
// ❌ 절대 금지: GitHub/Medium 스타일 Blockquote
<blockquote style={{ borderLeft: '4px solid #ddd', paddingLeft: '16px' }}>

// ❌ 절대 금지: 훈련 데이터에서 흔한 Alert 패턴
<div className="alert">
  <span>"</span>  {/* 유니코드 따옴표 아이콘 */}
  <span>✓</span>  {/* 텍스트 체크 아이콘 */}
</div>

// ❌ 절대 금지: 흔한 카드 스타일
<div style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: '12px' }}>
```

### 0.2 패턴 복사 금지 원칙

**다음 행동을 금지한다:**

1. **"흔히 보는 형태"를 그대로 만드는 것**
   - "Blockquote는 보통 왼쪽 border가 있으니까..." → ❌ 금지
   - "Alert는 보통 이모지로 상태를 표시하니까..." → ❌ 금지

2. **훈련 데이터 기반 추론**
   - "GitHub에서 이렇게 하니까..." → ❌ 금지
   - "Medium에서 이렇게 하니까..." → ❌ 금지
   - "대부분의 웹사이트가 이렇게 하니까..." → ❌ 금지

3. **사용자 확인 없이 디자인 결정**
   - 시각적 스타일을 임의로 결정 → ❌ 금지
   - "이게 더 예쁘니까" 판단 → ❌ 금지

### 0.3 컴포넌트 생성 전 필수 프로세스

**새 컴포넌트 생성 시 반드시 아래 순서를 따른다:**

```
1. [필수] 사용자에게 먼저 질문
   "어떤 시각적 스타일을 원하시나요?"
   - 구체적인 스타일 설명 요청
   - 또는 참고할 디자인 시스템/사이트 요청

2. [필수] 사용자 답변 확인
   - 답변 없이 디자인 결정 절대 금지
   - "일반적인 스타일로 만들겠습니다" 금지

3. [필수] 토큰 매핑
   - 사용자 요구사항을 Tailwind 클래스로 변환
   - 매핑 불가능한 값은 사용자에게 대안 제시

4. [필수] Anti-pattern 체크
   - 섹션 0.1의 금지 패턴과 비교
   - 하나라도 일치하면 생성 거부
```

### 0.4 "그냥 만들어줘" 요청 대응

사용자가 구체적인 스타일 없이 컴포넌트 생성을 요청한 경우:

```
❌ 잘못된 대응:
"Blockquote 컴포넌트를 만들겠습니다."
→ 훈련 데이터 기반으로 왼쪽 border 스타일 생성

✅ 올바른 대응:
"Blockquote 컴포넌트를 만들기 전에 스타일을 확인하고 싶습니다.

1. 배경색만 다른 단순한 박스 스타일?
2. 왼쪽에 아이콘이 있는 스타일?
3. 테두리가 있는 스타일?
4. 기타 (설명해주세요)

어떤 스타일을 원하시나요?"
```

---

## 1. 모호 표현 금지

다음과 같은 모호한 표현은 사용하지 않는다. 대신 구체적인 토큰이나 수치를 사용한다.

| ❌ 금지 표현 | ✅ 대체 표현 |
|-------------|-------------|
| "예쁘게" | 구체적인 토큰 조합 명시 |
| "모던하게" | `rounded-md`, `p-4` 등 Tailwind 클래스 사용 |
| "깔끔하게" | 여백과 정렬 토큰 명시 |
| "적당히" | 정확한 토큰 값 사용 |
| "보기 좋게" | 구체적인 레이아웃 규칙 적용 |
| "자연스럽게" | 명시적인 트랜지션/애니메이션 값 |

**원칙**: 모든 시각적 속성은 Tailwind 클래스 또는 `globals.css`의 테마 변수로 표현 가능해야 한다.

---

## 2. 필수 제약 (Constraints)

### 2.1 Border Radius

```tsx
// ✅ Tailwind 클래스 사용 (권장)
<div className="rounded-md">  {/* 4px */}

// CSS 변수 사용 (필요시)
border-radius: var(--radius-md);
```

| 용도 | Tailwind 클래스 | CSS 변수 | 값 |
|------|-----------------|----------|-----|
| 미세 라운드 (태그, 뱃지) | `rounded-sm` | `--radius-sm` | 2px |
| **기본값** (버튼, 인풋) | `rounded-md` | `--radius-md` | 4px |
| 카드, 모달 | `rounded-lg` | `--radius-lg` | 6px |
| 큰 카드, 다이얼로그 | `rounded-xl` | `--radius-xl` | 8px |
| 대형 컨테이너 | `rounded-2xl` | `--radius-2xl` | 12px |
| 원형 (아바타, 토글) | `rounded-full` | `--radius-full` | 9999px |

**디자인 근거:**
- 6px 이하의 subtle radius가 더 세련되고 professional한 인상
- 8px 이상은 "친근한/playful" 느낌으로 범용성 낮음
- Apple HIG, Linear, Vercel 등 모던 시스템은 4-6px 기본값 사용
- 과도한 radius는 요소를 뭉툭하게 보이게 하여 시각적 긴장감 저하

**금지**: 임의의 px 값 (`border-radius: 5px`) 사용 불가

### 2.2 간격 (Spacing)

모든 간격은 Tailwind의 4px 기반 스케일을 사용한다.

```tsx
// ✅ 올바른 사용: Tailwind 클래스
<div className="p-4">      {/* 16px */}
<div className="m-2">      {/* 8px */}
<div className="gap-6">    {/* 24px */}
<div className="space-y-4"> {/* 자식 요소 간격 16px */}

// ❌ 금지
<div style={{ padding: '30px' }}>     {/* 임의의 값 */}
<div style={{ margin: '1.5rem' }}>    {/* rem 직접 사용 */}
<div style={{ gap: '10px' }}>         {/* 4px 단위 아님 */}
```

**Tailwind 간격 스케일**:
| 클래스 | 값 | 용도 |
|--------|-----|------|
| `p-1`, `m-1`, `gap-1` | 4px | 미세 간격 |
| `p-2`, `m-2`, `gap-2` | 8px | 인라인 요소 간격 |
| `p-4`, `m-4`, `gap-4` | 16px | 컴포넌트 내부 패딩 |
| `p-6`, `m-6`, `gap-6` | 24px | 카드 패딩 |
| `p-8`, `m-8`, `gap-8` | 32px | 섹션 간격 |
| `p-12`, `m-12`, `gap-12` | 48px | 대형 섹션 간격 |

### 2.3 색상 (Colors)

`globals.css` 외부의 색상 도입 금지.

```tsx
// ✅ 올바른 사용: Tailwind 클래스 (권장)
<p className="text-foreground">기본 텍스트</p>
<p className="text-muted-foreground">보조 텍스트</p>
<div className="bg-background">기본 배경</div>
<div className="bg-primary text-primary-foreground">주요 액션</div>
<div className="border-border">테두리</div>

// CSS 변수 사용 (필요시)
color: hsl(var(--foreground));
background: hsl(var(--background));
border-color: hsl(var(--border));

// ❌ 금지
<div style={{ color: '#333' }}>          {/* 하드코딩 */}
<div style={{ background: 'white' }}>    {/* 키워드 */}
<div className="bg-[#f5f5f5]">           {/* arbitrary value */}
```

**의미 기반 색상 클래스**:
| Tailwind 클래스 | 용도 |
|-----------------|------|
| `text-foreground` | 기본 텍스트 |
| `text-muted-foreground` | 보조 텍스트 |
| `bg-background` | 기본 배경 |
| `bg-muted` | 보조 배경 |
| `bg-primary`, `text-primary-foreground` | 주요 액션 |
| `bg-destructive`, `text-destructive-foreground` | 위험/삭제 액션 |
| `border-border` | 기본 테두리 |
| `border-input` | 입력 필드 테두리 |

### 2.4 화면당 컴포넌트 수

**최대 7개** (± 2 Miller's Law)

```
✅ 좋은 예: 헤더 + 히어로 + 카드 3개 + CTA + 푸터 = 7개
❌ 나쁜 예: 10개 이상의 독립 섹션
```

7개 초과 시:
1. 그룹화하여 상위 컴포넌트로 묶기
2. 탭/아코디언으로 숨기기
3. 별도 페이지로 분리

### 2.5 화면당 색상 수

**최대 3개** (텍스트 색상 제외)

```
✅ 좋은 예: primary(오렌지) + secondary(회색) + accent(흰색 배경)
❌ 나쁜 예: 빨강 + 파랑 + 초록 + 보라 + 노랑
```

**텍스트 색상은 예외**:
- `--color-foreground` (기본)
- `--color-muted` (보조)
- `--color-primary` (링크/강조)

### 2.6 컨테이너 중첩 금지 (Flat Structure)

**불필요한 wrapper/container 중첩은 금지한다.**

```tsx
// ❌ 금지: 과도한 중첩
<div className="section">
  <div className="section-inner">
    <div className="table-container">
      <div className="table-wrapper">
        <Table />
      </div>
    </div>
  </div>
</div>

// ✅ 올바른 사용: 플랫 구조
<section>
  <Table />
</section>
```

**왜 중첩이 문제인가:**
- 시각적 구분은 **spacing만으로 충분**. 박스로 감쌀 필요 없음
- 중첩 컨테이너는 DOM 복잡도 증가, 성능 저하
- 스타일 오버라이드가 어려워지고 CSS 특이성 지옥 발생
- 사용자는 여백만으로도 영역을 충분히 인지함 (Gestalt 근접성 원리)

**허용되는 wrapper:**
| 허용 | 용도 |
|------|------|
| 레이아웃 컨테이너 | `flex`/`grid` 정렬이 필요한 경우 |
| 시맨틱 태그 | `<section>`, `<article>`, `<main>` 등 |
| 스크롤 영역 | `overflow` 처리가 필요한 경우 |

**금지되는 wrapper:**
| 금지 | 이유 |
|------|------|
| 스타일 목적의 중첩 div | spacing으로 해결 |
| "혹시 몰라서" 추가한 wrapper | 필요할 때 추가 |
| 각 아이템을 개별 카드로 감싸기 | 리스트로 처리 |

```tsx
// ❌ 테이블 3개를 각각 카드로 감싸기
<Card><Table data={a} /></Card>
<Card><Table data={b} /></Card>
<Card><Table data={c} /></Card>

// ✅ 간격으로 구분
<div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
  <Table data={a} />
  <Table data={b} />
  <Table data={c} />
</div>
```

### 2.7 과도한 인터랙션 효과 금지 (Minimal Feedback)

**상태 변화는 단일 시각적 피드백으로 충분하다.**

```tsx
// ❌ 금지: 효과 중첩
<li style={{
  borderLeft: isSelected ? '3px solid var(--color-primary)' : 'none',
  background: isSelected ? 'var(--color-primary-bg)' : 'transparent',
  fontWeight: isSelected ? 600 : 400,
  transform: isHovered ? 'translateX(4px)' : 'none',
  boxShadow: isHovered ? 'var(--shadow-sm)' : 'none',
}}>

// ✅ 올바른 사용: 단일 피드백
<li style={{
  background: isSelected ? 'var(--color-primary-bg)' : 'transparent',
}}>
```

**금지되는 장식 요소:**
| 요소 | 문제 |
|------|------|
| 왼쪽/오른쪽 indicator 라인 | 색상 변경만으로 충분 |
| hover 시 translateX 이동 | 불필요한 움직임 |
| selected + hover 효과 중첩 | 시각적 과부하 |
| 상태별 font-weight 변경 | 레이아웃 시프트 발생 |
| hover 시 shadow 추가 | 과도한 강조 |

**허용되는 피드백 (택 1):**
- `background-color` 변경
- `color` 변경
- `opacity` 변경
- `border-color` 변경 (기존 border가 있는 경우만)

**디자인 근거:**
- 사용자는 **하나의 시각적 변화**만으로도 상태를 인지함
- 효과 중첩은 "싸구려" 느낌을 줌
- font-weight 변경은 텍스트 너비가 바뀌어 레이아웃이 흔들림
- Linear, Notion, Figma 등 모던 앱은 배경색 변경만 사용

### 2.8 이모지 및 텍스트 아이콘 금지 (SVG Icons Only)

**아이콘은 반드시 SVG를 사용한다. 이모지와 텍스트 문자 사용 금지.**

```tsx
// ❌ 금지: 이모지
<span>✅ 완료</span>
<span>❌ 실패</span>
<span>⚠️ 경고</span>
<button>🔍 검색</button>

// ❌ 금지: 텍스트 문자를 아이콘으로 사용
<button>×</button>           // 닫기
<button>+</button>           // 추가
<button>-</button>           // 삭제/축소
<span>▼</span>              // 드롭다운 화살표
<span>›</span>              // 쉐브론
<span>←</span>              // 뒤로가기

// ✅ 올바른 사용: SVG 아이콘
<button><CloseIcon /></button>
<button><PlusIcon /></button>
<button><MinusIcon /></button>
<span><ChevronDownIcon /></span>
<span><ChevronRightIcon /></span>
<span><ArrowLeftIcon /></span>
```

**금지되는 문자:**
| 문자 | 용도 | 대체 |
|------|------|------|
| `×`, `✕`, `✖` | 닫기 버튼 | `<CloseIcon />` |
| `+` | 추가 버튼 | `<PlusIcon />` |
| `▼`, `▾`, `⌄` | 드롭다운 | `<ChevronDownIcon />` |
| `›`, `>`, `❯` | 다음/펼치기 | `<ChevronRightIcon />` |
| `←`, `→` | 네비게이션 | `<ArrowIcon />` |
| `✓`, `✔`, `✅` | 체크/완료 | `<CheckIcon />` |
| `⚠`, `⚠️` | 경고 | `<AlertIcon />` |

**이유:**
- 텍스트 문자는 폰트에 따라 렌더링이 다름
- 이모지는 OS/브라우저별로 다르게 보임
- SVG는 **픽셀 퍼펙트**하고 일관됨
- 크기/색상 조절이 자유로움

**아이콘 라이브러리 권장:**
- Lucide React (`lucide-react`)
- Heroicons (`@heroicons/react`)
- Radix Icons (`@radix-ui/react-icons`)

### 2.9 Shadow 사용 제한 (Flat Design)

**Shadow는 기본적으로 사용하지 않는다. Border로 대체한다.**

```tsx
// ❌ 금지: 무분별한 shadow
<Card style={{ boxShadow: 'var(--shadow-md)' }}>
<Button style={{ boxShadow: 'var(--shadow-sm)' }}>
<div style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>

// ✅ 올바른 사용: border로 구분
<Card style={{ border: '1px solid var(--color-border)' }}>
<Button>  {/* shadow 없음 */}
<div>     {/* shadow 없음 */}
```

**Shadow 허용 케이스 (예외):**
| 허용 | 이유 |
|------|------|
| Dropdown/Popover | 부모 요소 위에 떠있음을 표현 |
| Modal | 배경과의 분리 필요 |
| Toast/Notification | 화면 위에 오버레이 |

**금지 케이스:**
| 금지 | 대체 방법 |
|------|-----------|
| Card | `border: 1px solid var(--color-border)` |
| Button | shadow 없음, hover 시 background 변경 |
| Input | `border: 1px solid var(--color-border)` |
| 일반 컨테이너 | spacing으로 구분 |

**디자인 근거:**
- Shadow 남용 시 모든 요소가 "부유"하는 느낌
- 실제로 떠있는 요소(dropdown, modal)만 shadow 사용해야 계층 구조가 명확
- Border + spacing으로 충분히 구분 가능
- Linear, Notion, GitHub 등 모던 앱은 shadow 최소화

### 2.10 줄바꿈 금지 요소 (No Text Wrap)

**특정 요소는 반드시 한 줄을 유지한다. 줄바꿈 금지.**

```tsx
// ❌ 금지: 줄바꿈 허용
<Button>저장하기</Button>           // 폭 좁으면 2줄
<Tag>In Progress</Tag>             // "In" / "Progress"
<MenuItem>사용자 설정</MenuItem>    // 메뉴가 세로로 늘어남

// ✅ 올바른 사용: nowrap 필수
<Button style={{ whiteSpace: 'nowrap' }}>저장하기</Button>
<Tag style={{ whiteSpace: 'nowrap' }}>In Progress</Tag>
<MenuItem style={{ whiteSpace: 'nowrap' }}>사용자 설정</MenuItem>
```

**줄바꿈 금지 요소:**
| 요소 | 이유 |
|------|------|
| Button | 버튼 높이 일정해야 함 |
| Tag/Badge | 한 줄 라벨 |
| 메뉴 아이템 | 수평 정렬 유지 |
| 테이블 헤더 | 컬럼 너비 예측 |
| 테이블 셀 (날짜, 숫자, ID) | 데이터 무결성 |
| Breadcrumb | 네비게이션 경로 |
| Tab | 탭 높이 일정 |

**줄바꿈 허용 요소:**
| 요소 | 이유 |
|------|------|
| 본문 텍스트 | 가독성 |
| 카드 설명 | 내용 유동적 |
| 모달 본문 | 긴 텍스트 |

**구현 방법:**
```css
/* 컴포넌트 기본 스타일에 포함 */
.button, .tag, .menu-item, .tab {
  white-space: nowrap;
}

/* 테이블 셀 (데이터 타입별) */
td.date, td.number, td.id, td.status {
  white-space: nowrap;
}
```

**반응형 대응:**
- 줄바꿈 대신 `text-overflow: ellipsis` 사용
- 또는 컨테이너에 `overflow-x: auto` (가로 스크롤)

### 2.11 레이아웃 위계: Header > Sidebar (Layout Hierarchy)

**상단바(Header)가 항상 최상위. 사이드바는 그 아래 위계.**

```
❌ 금지: 사이드바가 전체 높이
┌────────┬─────────────────┐
│        │    Header       │
│Sidebar ├─────────────────┤
│        │    Content      │
└────────┴─────────────────┘

✅ 올바른 구조: Header가 전체 너비
┌──────────────────────────┐
│         Header           │
├────────┬─────────────────┤
│Sidebar │    Content      │
└────────┴─────────────────┘
```

**코드 구조:**
```tsx
// ❌ 금지
<div style={{ display: 'flex' }}>
  <Sidebar />
  <div>
    <Header />
    <Content />
  </div>
</div>

// ✅ 올바른 사용
<div style={{ display: 'flex', flexDirection: 'column' }}>
  <Header />
  <div style={{ display: 'flex' }}>
    <Sidebar />
    <Content />
  </div>
</div>
```

**이유:**
- Header는 전역 네비게이션 (로고, 검색, 사용자 메뉴)
- Sidebar는 현재 섹션의 로컬 네비게이션
- 위계가 Header > Sidebar > Content 순서
- 모든 메이저 앱 (GitHub, Notion, Linear, Figma)이 이 구조 사용

**예외:** 없음. 이 규칙은 거의 절대적.

### 2.12 반응형 필수 (Responsive by Default)

**모든 웹 UI는 기본적으로 반응형으로 구현한다.**

```tsx
// ❌ 금지: 고정 너비
<div style={{ width: '1200px' }}>
<Card style={{ width: '400px' }}>

// ✅ 올바른 사용: 유동적 너비
<div style={{ width: '100%', maxWidth: '1200px' }}>
<Card style={{ width: '100%', maxWidth: '400px' }}>

// ✅ 그리드 사용
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: 'var(--spacing-4)'
}}>
```

**필수 원칙:**
| 원칙 | 설명 |
|------|------|
| 유동적 너비 | `width: 100%` + `max-width` 조합 |
| Flexbox/Grid | 고정 레이아웃 대신 유연한 레이아웃 |
| 상대 단위 | 고정 px 대신 %, vw, vh, rem 사용 |
| 미디어 쿼리 | 브레이크포인트별 레이아웃 조정 |

**브레이크포인트:**
| 이름 | 값 | 용도 |
|------|-----|------|
| sm | 640px | 모바일 |
| md | 768px | 태블릿 |
| lg | 1024px | 데스크톱 |
| xl | 1280px | 와이드 |

**반응형 패턴:**
```css
/* 모바일 우선 */
.container {
  padding: var(--spacing-4);
}

@media (min-width: 768px) {
  .container {
    padding: var(--spacing-6);
  }
}
```

**고정 너비 허용 케이스:**
- 아이콘 (`width: 20px`)
- 아바타 (`width: 40px`)
- 사이드바 (`width: 240px` 또는 `min-width`)

### 2.13 배경색 단일 레이어 (Single Background Layer)

**배경색은 `<html>` 또는 `<body>`에서 한 번만 지정. 레이어 중첩 금지.**

```tsx
// ❌ 금지: 배경 레이어 중첩
<html style={{ background: '#fff' }}>
  <body style={{ background: '#fff' }}>
    <div className="app" style={{ background: '#f5f5f5' }}>
      <main style={{ background: '#fff' }}>

// ✅ 올바른 사용: 단일 배경
<html style={{ background: 'var(--color-bg-default)' }}>
  <body>  {/* 배경 없음, html에서 상속 */}
    <main>  {/* 배경 없음 */}
```

**이유:**
- iOS/macOS overscroll bounce 시 `<html>` 배경색이 노출됨
- 레이어 중첩 시 bounce 영역 색상 불일치 발생
- 배경색 관리가 복잡해지고 다크모드 전환 시 문제

**배경색 허용 케이스:**
| 허용 | 용도 |
|------|------|
| `<html>` 또는 `<body>` | 페이지 기본 배경 (단 하나만) |
| Card/Modal | 콘텐츠 영역 구분 |
| Sidebar | 네비게이션 영역 |
| 상태 표시 | hover, selected 배경 |

**금지:**
- wrapper div에 배경색
- 중첩된 컨테이너에 배경색
- "그냥 있으면 좋을 것 같아서" 추가한 배경

### 2.14 유틸리티 클래스 vs 컴포넌트 구분 (Utility vs Component)

**globals.css에는 텍스트 유틸리티만 정의. 구조적 요소는 React 컴포넌트로.**

```tsx
// ✅ globals.css에 정의 가능: 텍스트 스타일 조합
.text-page-title {
  font-size: var(--text-page-title);
  font-weight: var(--font-bold);
  letter-spacing: var(--tracking-tight);
}

// ❌ globals.css에 정의 금지: 구조적 요소 (border, bg, padding, radius)
.card-base {
  border: 1px solid hsl(var(--border));
  background: hsl(var(--card));
  padding: 1rem;
  border-radius: var(--radius-lg);
}
```

**구분 기준:**

| 유형 | 정의 가능 속성 | 위치 |
|------|---------------|------|
| **유틸리티 클래스** | font-size, font-weight, letter-spacing, line-height, color | globals.css |
| **컴포넌트** | border, background, padding, border-radius, shadow | React 컴포넌트 (shadcn) |

**판단 기준:**
- "박스"를 만드는가? → **컴포넌트** (shadcn Card, Badge 등 사용)
- 텍스트 스타일만 조합하는가? → **유틸리티 클래스** (globals.css에 정의 가능)

**예시:**

| 요소 | 판정 | 사용 방법 |
|------|------|-----------|
| 페이지 제목 스타일 | 유틸리티 | `.text-page-title` 또는 Tailwind 클래스 조합 |
| 카드 컨테이너 | 컴포넌트 | `<Card>` from shadcn |
| 인라인 태그/뱃지 | 컴포넌트 | `<Badge>` from shadcn |
| 섹션 제목 스타일 | 유틸리티 | `.text-section-title` 또는 Tailwind 클래스 조합 |

### 2.15 컴포넌트 최소 DOM (Minimal DOM Structure)

**컴포넌트는 최소한의 DOM 요소로 구성한다.**

```tsx
// ❌ 금지: 과도한 div
const Button = ({ children }) => (
  <div className="button-wrapper">
    <div className="button-container">
      <button className="button-inner">
        <span className="button-text">{children}</span>
      </button>
    </div>
  </div>
);

// ✅ 올바른 사용: 최소 DOM
const Button = ({ children }) => (
  <button>{children}</button>
);

// ❌ 금지: 불필요한 wrapper
const Card = ({ title, children }) => (
  <div className="card-outer">
    <div className="card-inner">
      <div className="card-header">
        <div className="card-title-wrapper">
          <h3>{title}</h3>
        </div>
      </div>
      <div className="card-body">
        <div className="card-content">{children}</div>
      </div>
    </div>
  </div>
);

// ✅ 올바른 사용
const Card = ({ title, children }) => (
  <article>
    <h3>{title}</h3>
    {children}
  </article>
);
```

**원칙:**
- 1 기능 = 1 요소 (wrapper 금지)
- 시맨틱 태그 우선 (`<article>`, `<section>`, `<nav>`)
- className을 위한 div 금지
- 스타일링은 직접 요소에

**허용되는 추가 요소:**
| 허용 | 용도 |
|------|------|
| flex/grid 컨테이너 | 레이아웃 정렬 필요 시 |
| 접근성 요소 | `<label>`, landmark 등 |
| 이벤트 바운더리 | 클릭 영역 확장 필요 시 |

---

## 3. Generation Protocol

UI 생성 시 반드시 다음 4단계를 순서대로 수행한다.

### Step 1: 목적 파악 (Purpose)

생성 요청의 목적을 명확히 한다.

```
질문:
- 이 UI의 주요 사용자 액션은 무엇인가?
- 어떤 정보를 전달해야 하는가?
- 기존 컴포넌트로 해결 가능한가?
```

### Step 2: Tailwind/컴포넌트 선택 (Selection)

Tailwind 클래스와 @design-geniefy/ui에서 사용할 요소를 선택한다.

```
체크리스트:
- [ ] 사용할 색상 클래스 목록 (최대 3개)
- [ ] 사용할 간격 클래스 목록
- [ ] 사용할 radius 클래스
- [ ] @design-geniefy/ui 컴포넌트 중 재사용 가능한 것
```

**Tailwind 클래스 선택 예시**:
```tsx
/* 카드 컴포넌트 */
bg-background        /* 배경 */
text-foreground      /* 제목 텍스트 */
text-muted-foreground /* 설명 텍스트 */
p-4                  /* 내부 패딩 (16px) */
space-y-2            /* 요소 간 간격 (8px) */
rounded-lg           /* 모서리 (6px) */
```

### Step 3: 검증 (Validation)

생성된 코드가 제약을 준수하는지 검증한다.

```
검증 체크리스트:
- [ ] Tailwind 클래스 사용 (style 속성 최소화)
- [ ] 하드코딩된 색상 없음 (#fff, rgb, bg-[#xxx] 등)
- [ ] 하드코딩된 간격 없음 (px, rem, p-[20px] 등)
- [ ] radius는 Tailwind 클래스 (rounded-*) 사용
- [ ] 컴포넌트 수 ≤ 7
- [ ] 배경/강조 색상 수 ≤ 3
- [ ] 모호한 주석 없음 ("예쁘게" 등)
- [ ] 불필요한 wrapper div 없음
- [ ] 인터랙션 효과 중첩 없음 (배경색 변경만 사용)
- [ ] 이모지/텍스트 아이콘 없음 (SVG만 사용)
- [ ] shadow 없음 (dropdown/modal/toast 제외)
- [ ] Button/Tag/Menu 등 whitespace-nowrap 적용됨
- [ ] 레이아웃: Header가 Sidebar 위에 있음
- [ ] 반응형: 고정 width 없음 (아이콘/아바타/사이드바 제외)
- [ ] 배경색: html/body에서 단일 지정 (레이어 중첩 없음)
- [ ] 컴포넌트: 최소 DOM 구조 (불필요한 wrapper 없음)
```

### Step 4: 위반 시 거부 (Rejection)

검증 실패 시 생성을 거부하고 수정한다.

```
거부 응답 형식:

❌ 제약 위반 발견

위반 항목:
1. [C-2.3] 하드코딩 색상: `color: #333` → `var(--color-foreground)` 사용
2. [C-2.2] 임의 간격: `padding: 30px` → `var(--spacing-4)` 사용

수정 후 다시 검증합니다.
```

---

## 4. Tailwind 사용 예시

### 예시 1: 기본 버튼

```tsx
// ✅ Tailwind 클래스 사용 (권장)
<button className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90">
  버튼
</button>

// shadcn Button 컴포넌트 사용 시
import { Button } from '@design-geniefy/ui';
<Button variant="default">버튼</Button>
```

### 예시 2: 카드 컴포넌트

```tsx
// ✅ Tailwind 클래스 사용 (권장)
<article className="p-6 bg-background border border-border rounded-lg">
  <h3 className="text-foreground text-lg font-semibold mb-2">제목</h3>
  <p className="text-muted-foreground text-sm">설명 텍스트</p>
</article>

// shadcn Card 컴포넌트 사용 시
import { Card, CardHeader, CardTitle, CardDescription } from '@design-geniefy/ui';
<Card>
  <CardHeader>
    <CardTitle>제목</CardTitle>
    <CardDescription>설명 텍스트</CardDescription>
  </CardHeader>
</Card>
```

### 예시 3: 입력 필드

```tsx
// ✅ Tailwind 클래스 사용 (권장)
<input
  className="px-2 py-1.5 bg-background text-foreground border border-input rounded-md text-base placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
  placeholder="입력하세요"
/>

// shadcn Input 컴포넌트 사용 시
import { Input } from '@design-geniefy/ui';
<Input placeholder="입력하세요" />
```

---

## 5. 테마 보호 규칙 (Theme Safety)

`globals.css`의 테마 변수 Breaking Change를 방지하기 위한 규칙.

### 5.1 테마 변수 삭제 금지

**기존 CSS 변수명을 삭제하거나 변경하면 Breaking Change 발생**

```css
/* ❌ 금지: 기존 변수 삭제 */
/* --primary 삭제 시 모든 프로젝트 스타일 깨짐 */

/* ❌ 금지: 기존 변수명 변경 */
/* --primary → --brand 변경 불가 */

/* ✅ 허용: 새 변수 추가 */
--brand: 140 50% 40%;  /* 새 변수 추가는 안전 */

/* ✅ 허용: 기존 변수 값 변경 */
--primary: 140 50% 40%;  /* 값 변경은 의도적 디자인 변경 */
```

### 5.2 테마 변경 시 검증 체크리스트

```
테마 변경 전 확인:
- [ ] 삭제하려는 변수를 사용 중인 프로젝트가 없는가?
- [ ] 변수명 변경 시 모든 프로젝트에서 동시 업데이트 가능한가?
- [ ] 대체 변수가 있다면 마이그레이션 가이드를 작성했는가?
- [ ] CODEOWNERS 리뷰를 받았는가?
```

### 5.3 Safety Guard 체계

| 보호 장치 | 파일 | 역할 |
|----------|------|------|
| CODEOWNERS | `.github/CODEOWNERS` | globals.css 변경 시 관리자 리뷰 필수 |
| CI Check | `.github/workflows/theme-change-check.yml` | PR에서 테마 변수 삭제 감지 및 경고 |
| Generation Protocol | Step 3 검증 | 테마 미사용 코드 생성 차단 |

---

## 6. 컴포넌트 사용 규칙

### 6.1 @design-geniefy/ui 우선 사용

동일 기능의 컴포넌트가 `@design-geniefy/ui`에 있으면 반드시 사용한다.

```tsx
// ✅ 올바른 사용
import { Button, Card, Input } from '@design-geniefy/ui';

// ❌ 금지: 동일 기능 컴포넌트 중복 생성
const MyButton = () => <button className="...">...</button>;
```

### 6.2 커스텀 컴포넌트 생성 시

@design-geniefy/ui에 없는 컴포넌트만 생성하며, 토큰 규칙을 준수한다.

```tsx
// 커스텀 컴포넌트 예시
const StatCard = ({ label, value }) => (
  <div style={{
    padding: 'var(--spacing-3)',
    background: 'var(--color-secondary)',
    borderRadius: 'var(--radius-lg)',
  }}>
    <span style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-sm)' }}>
      {label}
    </span>
    <span style={{ color: 'var(--color-foreground)', fontSize: 'var(--font-size-2xl)' }}>
      {value}
    </span>
  </div>
);
```

---

## 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|-----------|
| 2026-01-19 | v0.1 | 초기 스캐폴딩 (구조만) |
| 2026-01-19 | v1.0 | 모호 표현 금지, 필수 제약 5가지, Generation Protocol 4단계, 토큰 예시 추가 |
| 2026-01-22 | v1.1 | Token Safety 섹션 추가 (CODEOWNERS, CI Check, 토큰 보호 규칙) |
| 2026-01-27 | v1.2 | radius 축소, 컨테이너 중첩 금지, 인터랙션 효과 금지, 이모지/텍스트 아이콘 금지, shadow 제한, nowrap 필수, Header>Sidebar 위계, 반응형 필수, 배경 단일 레이어, 최소 DOM 구조 |
| 2026-01-30 | v1.3 | **Tailwind First 원칙 추가**: tokens.css → globals.css + Tailwind v4 @theme 구조로 전환. CSS 변수 대신 Tailwind 유틸리티 클래스 우선 사용. 모든 예시 코드 Tailwind 클래스로 업데이트. 경로 수정 (src/components/ → components/) |
