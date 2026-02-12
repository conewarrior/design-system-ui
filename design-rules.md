# Design Rules v1

> **단일 소스 역할**: LLM이 UI를 생성할 때 반드시 준수해야 하는 제약 규칙과 Generation Protocol을 정의한다.

이 문서는 Claude Code가 `src/components/` 내에서 UI를 생성할 때 참조하는 제약 규칙이다.
**규칙 위반 시 생성을 거부하고 수정을 요청해야 한다.**

---

## 1. 모호 표현 금지

다음과 같은 모호한 표현은 사용하지 않는다. 대신 구체적인 토큰이나 수치를 사용한다.

| ❌ 금지 표현 | ✅ 대체 표현 |
|-------------|-------------|
| "예쁘게" | 구체적인 토큰 조합 명시 |
| "모던하게" | `--radius-md`, `--spacing-4` 등 토큰 사용 |
| "깔끔하게" | 여백과 정렬 토큰 명시 |
| "적당히" | 정확한 토큰 값 사용 |
| "보기 좋게" | 구체적인 레이아웃 규칙 적용 |
| "자연스럽게" | 명시적인 트랜지션/애니메이션 값 |

**원칙**: 모든 시각적 속성은 `tokens.css`의 변수로 표현 가능해야 한다.

---

## 2. 필수 제약 (Constraints)

### 2.1 Border Radius

```css
/* 기본값: --radius-md (4px) */
border-radius: var(--radius-md);
```

| 용도 | 토큰 | 값 |
|------|------|-----|
| 미세 라운드 (태그, 뱃지) | `--radius-sm` | 2px |
| **기본값** (버튼, 인풋) | `--radius-md` | 4px |
| 카드, 모달 | `--radius-lg` | 6px |
| 큰 카드, 다이얼로그 | `--radius-xl` | 8px |
| 대형 컨테이너 | `--radius-2xl` | 12px |
| 원형 (아바타, 토글) | `--radius-full` | 9999px |

**디자인 근거:**
- 6px 이하의 subtle radius가 더 세련되고 professional한 인상
- 8px 이상은 "친근한/playful" 느낌으로 범용성 낮음
- Apple HIG, Linear, Vercel 등 모던 시스템은 4-6px 기본값 사용
- 과도한 radius는 요소를 뭉툭하게 보이게 하여 시각적 긴장감 저하

**금지**: 임의의 px 값 (`border-radius: 5px`) 사용 불가

### 2.2 간격 (Spacing)

모든 간격은 8px 단위 토큰만 사용한다.

```css
/* ✅ 올바른 사용 */
padding: var(--spacing-4);      /* 32px */
margin: var(--spacing-2);       /* 16px */
gap: var(--spacing-3);          /* 24px */

/* ❌ 금지 */
padding: 30px;                  /* 임의의 값 */
margin: 1.5rem;                 /* rem 단위 */
gap: 10px;                      /* 8px 단위 아님 */
```

**토큰 예시**:
- `--spacing-1`: 8px (인라인 요소 간격)
- `--spacing-2`: 16px (컴포넌트 내부 패딩)
- `--spacing-3`: 24px (카드 패딩)
- `--spacing-4`: 32px (섹션 간격)

### 2.3 색상 (Colors)

`tokens.css` 외부의 색상 도입 금지.

```css
/* ✅ 올바른 사용 */
color: var(--color-foreground);
background: var(--color-background);
border-color: var(--color-border);

/* ❌ 금지 */
color: #333;                    /* 하드코딩 */
background: rgb(255, 255, 255); /* rgb 직접 사용 */
border-color: gray;             /* 키워드 사용 */
```

**의미 기반 토큰 우선 사용**:
- `--color-foreground`: 기본 텍스트
- `--color-muted`: 보조 텍스트
- `--color-background`: 기본 배경
- `--color-primary`: 주요 액션
- `--color-destructive`: 위험/삭제 액션

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

### 2.14 컴포넌트 최소 DOM (Minimal DOM Structure)

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

### Step 2: 토큰/컴포넌트 선택 (Selection)

tokens.css와 @design-geniefy/ui에서 사용할 요소를 선택한다.

```
체크리스트:
- [ ] 사용할 색상 토큰 목록 (최대 3개)
- [ ] 사용할 간격 토큰 목록
- [ ] 사용할 radius 토큰
- [ ] @design-geniefy/ui 컴포넌트 중 재사용 가능한 것
```

**토큰 선택 예시**:
```css
/* 카드 컴포넌트 */
--color-background      /* 배경 */
--color-foreground      /* 제목 텍스트 */
--color-muted           /* 설명 텍스트 */
--spacing-4             /* 내부 패딩 (16px) */
--spacing-2             /* 요소 간 간격 (8px) */
--radius-lg             /* 모서리 (6px) */
```

### Step 3: 검증 (Validation)

생성된 코드가 제약을 준수하는지 검증한다.

```
검증 체크리스트:
- [ ] 하드코딩된 색상 없음 (#fff, rgb 등)
- [ ] 하드코딩된 간격 없음 (px, rem 직접 사용)
- [ ] radius는 토큰 사용
- [ ] 컴포넌트 수 ≤ 7
- [ ] 배경/강조 색상 수 ≤ 3
- [ ] 모호한 주석 없음 ("예쁘게" 등)
- [ ] 불필요한 wrapper div 없음
- [ ] 인터랙션 효과 중첩 없음 (배경색 변경만 사용)
- [ ] 이모지/텍스트 아이콘 없음 (SVG만 사용)
- [ ] shadow 없음 (dropdown/modal/toast 제외)
- [ ] Button/Tag/Menu 등 nowrap 적용됨
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

## 4. 토큰 참조 예시

### 예시 1: 기본 버튼

```css
.button {
  /* 간격 */
  padding: var(--spacing-1-5) var(--spacing-3);  /* 6px 12px */

  /* 색상 */
  background: var(--color-primary);
  color: var(--color-primary-foreground);

  /* 형태 */
  border-radius: var(--radius-md);  /* 4px */

  /* 타이포그래피 */
  font-size: var(--font-size-sm);   /* 14px */
  font-weight: var(--font-weight-medium);
}

.button:hover {
  background: var(--primary-600);  /* 한 단계 어두운 톤 */
}
```

### 예시 2: 카드 컴포넌트

```css
.card {
  /* 간격 */
  padding: var(--spacing-3);        /* 12px */

  /* 색상 */
  background: var(--color-background);
  border: 1px solid var(--color-border);

  /* 형태 */
  border-radius: var(--radius-lg);  /* 6px */
}

.card-title {
  color: var(--color-foreground);
  font-size: var(--font-size-lg);   /* 18px */
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-1);  /* 8px */
}

.card-description {
  color: var(--color-muted);
  font-size: var(--font-size-sm);   /* 14px */
}
```

### 예시 3: 입력 필드

```css
.input {
  /* 간격 */
  padding: var(--spacing-1-5) var(--spacing-2);  /* 6px 8px */

  /* 색상 */
  background: var(--color-background);
  color: var(--color-foreground);
  border: 1px solid var(--color-input);

  /* 형태 */
  border-radius: var(--radius-md);  /* 4px */

  /* 타이포그래피 */
  font-size: var(--font-size-base); /* 16px */
}

.input:focus {
  border-color: var(--color-ring);
  outline: 2px solid var(--color-ring);
  outline-offset: 2px;
}

.input::placeholder {
  color: var(--color-muted);
}
```

---

## 5. 토큰 보호 규칙 (Token Safety)

CDN으로 즉시 반영되는 tokens.css의 Breaking Change를 방지하기 위한 규칙.

### 5.1 토큰 삭제 금지

**기존 토큰명을 삭제하거나 변경하면 Breaking Change 발생**

```css
/* ❌ 금지: 기존 토큰 삭제 */
/* --color-primary 삭제 시 모든 프로젝트 스타일 깨짐 */

/* ❌ 금지: 기존 토큰명 변경 */
/* --color-primary → --color-brand 변경 불가 */

/* ✅ 허용: 새 토큰 추가 */
--color-brand: #327039;  /* 새 토큰 추가는 안전 */

/* ✅ 허용: 기존 토큰 값 변경 */
--color-primary: #327039;  /* 값 변경은 의도적 디자인 변경 */
```

### 5.2 토큰 변경 시 검증 체크리스트

```
토큰 변경 전 확인:
- [ ] 삭제하려는 토큰을 사용 중인 프로젝트가 없는가?
- [ ] 토큰명 변경 시 모든 프로젝트에서 동시 업데이트 가능한가?
- [ ] 대체 토큰이 있다면 마이그레이션 가이드를 작성했는가?
- [ ] CODEOWNERS 리뷰를 받았는가?
```

### 5.3 Safety Guard 체계

| 보호 장치 | 파일 | 역할 |
|----------|------|------|
| CODEOWNERS | `.github/CODEOWNERS` | tokens.css 변경 시 관리자 리뷰 필수 |
| CI Check | `.github/workflows/token-change-check.yml` | PR에서 토큰 삭제 감지 및 경고 |
| Generation Protocol | Step 3 검증 | 토큰 미사용 코드 생성 차단 |

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

### 6.3 중복 컴포넌트 재사용 (DRY)

**전역으로 설정되거나 프로젝트 내에서 중복되는 컴포넌트는 반드시 재사용한다.**

```tsx
// ❌ 금지: 동일한 컴포넌트를 페이지마다 중복 생성
// app/page1.tsx
const PageHeader = ({ title }) => <h1 className="text-4xl font-bold">{title}</h1>;

// app/page2.tsx
const PageHeader = ({ title }) => <h1 className="text-4xl font-bold">{title}</h1>;

// ✅ 올바른 사용: 공통 컴포넌트로 추출
// components/page-header.tsx
export const PageHeader = ({ title }) => (
  <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
);

// app/page1.tsx, app/page2.tsx
import { PageHeader } from '@/components/page-header';
```

**재사용 대상:**
| 대상 | 위치 | 예시 |
|------|------|------|
| 레이아웃 컴포넌트 | `components/layout/` | Header, Sidebar, Footer |
| UI 공통 컴포넌트 | `components/ui/` | PageHeader, SectionTitle, EmptyState |
| 반복되는 카드/아이템 | `components/` | UserCard, ProjectCard, StatCard |

**재사용 판단 기준:**
1. **2회 이상 사용**: 동일한 구조가 2개 이상 페이지/컴포넌트에서 반복되면 즉시 추출
2. **스타일 동일**: className, style 속성이 완전히 같으면 컴포넌트로 분리
3. **전역 레이아웃**: Header, Sidebar 등 모든 페이지에서 사용되는 요소

**원칙:**
- 중복 코드는 유지보수 비용을 증가시킴
- 공통 컴포넌트 수정 시 모든 사용처에 일관되게 반영됨
- Don't Repeat Yourself (DRY) 원칙 준수

---

## 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|-----------|
| 2026-01-19 | v0.1 | 초기 스캐폴딩 (구조만) |
| 2026-01-19 | v1.0 | 모호 표현 금지, 필수 제약 5가지, Generation Protocol 4단계, 토큰 예시 추가 |
| 2026-01-22 | v1.1 | Token Safety 섹션 추가 (CODEOWNERS, CI Check, 토큰 보호 규칙) |
| 2026-01-27 | v1.2 | radius 축소, 컨테이너 중첩 금지, 인터랙션 효과 금지, 이모지/텍스트 아이콘 금지, shadow 제한, nowrap 필수, Header>Sidebar 위계, 반응형 필수, 배경 단일 레이어, 최소 DOM 구조 |
