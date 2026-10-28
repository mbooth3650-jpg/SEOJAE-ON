# 서재온 (BOOTIN SEOJAE ON) 디자인 시스템 명세서

> **목적**: 다른 웹/앱 프로젝트에서 동일한 감성과 완성도를 가진 '감성 에디토리얼 디지털 도서관' UI를 그대로 재현하기 위한 디자인 가이드 및 컴포넌트 스타일 명세입니다.

---

## 1. 디자인 철학 및 콘셉트 (Design Concept)

- **콘셉트**: 종이책의 아날로그적 따뜻함과 현대적인 디지털 리더의 간결함을 조화시킨 **'킨포크(Kinfolk) & 모노클(Monocle) 감성의 온라인 서재'**
- **키워드**: `정온함(Serenity)`, `온화한 미색(Warm Alabaster)`, `로즈 코럴 포인트(Warm Coral)`, `한국어 명조(Serif) & 고딕(Sans) 조화`
- **핵심 특징**:
  - 눈이 편안한 따뜻한 한지/미색 톤 바탕 (`#FAF9F6`)
  - 과도한 네온이나 채도 높은 원색을 지양하고, 감성적이고 신뢰감 있는 코럴 로즈 포인트 (`#E8636F`)
  - 제목에는 고풍스러운 세리프(명조체), 본문 및 UI 조작부에는 깔끔한 고딕(산세리프)을 배치한 타이포그래피 계층 구조

---

## 2. 컬러 팔레트 (Color Palette)

### 2.1 브랜드 & 포인트 컬러 (Accent Colors)
| 용도 | Hex Code | Tailwind / CSS 클래스 | 설명 |
| :--- | :--- | :--- | :--- |
| **Primary Accent** | `#E8636F` | `bg-[#E8636F]`, `text-[#E8636F]` | 메인 브랜드 액센트, 주요 CTA 버튼, 활성 탭 |
| **Hover Accent** | `#D94F5C` | `hover:bg-[#D94F5C]` | 주요 버튼 호버 시 살짝 짙어지는 음영 |
| **Accent Light (Tint)**| `rgba(232, 99, 111, 0.1)` | `bg-[#E8636F]/10` | 뱃지 배경, 활성 리스트 아이템 배경, 하이라이트 |
| **Sub Accent (Soft)** | `#E8A0A7` | `bg-[#E8A0A7]` | 보조 차트 막대, 비활성 데이터 시각화 |

### 2.2 배경 및 서피스 컬러 (Background & Surface)
| 용도 | Hex Code | Tailwind 클래스 | 설명 |
| :--- | :--- | :--- | :--- |
| **Canvas Body** | `#FAF9F6` | `bg-[#FAF9F6]` | 기본 전체 페이지 배경 (부드러운 한지/상아색 톤) |
| **Card Surface** | `#FFFFFF` | `bg-white` | 책 카드, 모달 윈도우, 화이트 섹션 컨테이너 |
| **Section Muted** | `#F5F5F0` | `bg-stone-50` | 검색바 배경, 통계 요약 박스, 테이블 헤더 |
| **Reader (Sepia)** | `#F4ECD8` | `bg-[#F4ECD8]` | 독서 리더 세피아(종이 질감) 모드 배경 (`text-[#433422]`) |
| **Reader (Dark)** | `#1E1E24` | `bg-[#1E1E24]` | 독서 리더 다크 모드 배경 (`text-[#E2E2E6]`) |

### 2.3 텍스트 & 보더 (Typography & Borders)
| 용도 | Hex Code | Tailwind 클래스 | 설명 |
| :--- | :--- | :--- | :--- |
| **Headings / Deep** | `#1C1917` | `text-stone-900` | 대제목, 헤더 로고, 강조 텍스트 |
| **Body / Standard** | `#44403C` | `text-stone-700` | 도서 본문, 설명문, 기본 텍스트 |
| **Muted / Subtext** | `#78716C` | `text-stone-500` | 발행일, 저자, 페이지 번호 등 보조 정보 |
| **Border Normal** | `#E7E5E4` | `border-stone-200` | 카드 외곽선, 헤더 하단 분리선, 구분선 |
| **Border Subtle** | `#F5F5F4` | `border-stone-100` | 내부 리스트 분리선, 탭 구분선 |

---

## 3. 타이포그래피 시스템 (Typography)

### 3.1 폰트 패밀리
```css
/* 기본 본문 & UI (Modern Sans-serif) */
font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Noto Sans KR', sans-serif;

/* 에디토리얼 명조체 (Serif - 도서 제목, 헤드라인, 인용구) */
.font-serif-kr {
  font-family: 'Noto Serif KR', Georgia, Cambria, 'Times New Roman', serif;
}
```

### 3.2 폰트 스케일 & 계층 가이드
1. **히어로 대형 표제 (Hero Title)**:
   - 클래스: `font-serif-kr text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 tracking-tight leading-tight`
2. **섹션 표제 (Section Headline)**:
   - 클래스: `font-serif-kr text-2xl sm:text-3xl font-bold text-stone-900`
3. **도서 카드 제목 (Book Card Title)**:
   - 클래스: `font-bold text-sm sm:text-base text-stone-900 group-hover:text-[#E8636F] transition-colors truncate`
4. **소표제 / 서브타이틀**:
   - 클래스: `text-xs font-bold text-[#E8636F] tracking-widest uppercase`
5. **본문 (Body)**:
   - 클래스: `text-sm sm:text-base text-stone-600 leading-relaxed font-serif-kr`

---

## 4. UI 컴포넌트 스타일 가이드 (Component Tokens)

### 4.1 기본 버튼 (Buttons)

#### ① 주요 액션 버튼 (Primary Solid Coral)
```html
<button class="px-5 py-2.5 bg-[#E8636F] hover:bg-[#D94F5C] text-white text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl shadow-2xs hover:shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-98">
  <svg ...></svg>
  <span>열람하기</span>
</button>
```

#### ② 보조/취소 버튼 (Secondary Outline/Ghost)
```html
<button class="px-4 py-2 bg-white hover:bg-stone-50 text-stone-700 text-xs sm:text-sm font-medium border border-stone-200 rounded-lg shadow-2xs transition-colors">
  상세보기
</button>
```

#### ③ 카테고리 필터 칩 (Filter Tabs)
```html
<!-- 활성 칩 -->
<button class="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#E8636F] text-white shadow-xs transition-all">
  전체
</button>

<!-- 비활성 칩 -->
<button class="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 transition-all">
  소설/문학
</button>
```

---

### 4.2 도서 카드 (Book Card - 3:4 Aspect Ratio)

```html
<div class="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between">
  <!-- 상단 표지 영역 (3:4 비율) -->
  <div class="relative aspect-[3/4] bg-stone-100 overflow-hidden cursor-pointer">
    <img 
      src="book-cover.jpg" 
      alt="도서 표지" 
      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
    />
    <!-- 카테고리 뱃지 -->
    <span class="absolute top-3 left-3 px-2 py-0.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium rounded">
      인문/철학
    </span>
  </div>

  <!-- 하단 도서 정보 -->
  <div class="p-4 space-y-2">
    <h3 class="font-bold text-sm text-stone-900 group-hover:text-[#E8636F] transition-colors truncate">
      도서 제목
    </h3>
    <p class="text-xs text-stone-500 truncate">저자명 · 출판사</p>
    
    <!-- 평점 & 뷰 수 -->
    <div class="flex items-center justify-between text-xs pt-1 border-t border-stone-100 text-stone-400">
      <span class="flex items-center gap-1 text-amber-500 font-bold">★ 4.8</span>
      <span>열람 1,240회</span>
    </div>
  </div>

  <!-- 하단 액션 버튼 -->
  <div class="p-4 pt-0 grid grid-cols-2 gap-2">
    <button class="py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg">상세보기</button>
    <button class="py-2 text-xs font-semibold text-white bg-[#E8636F] hover:bg-[#D94F5C] rounded-lg">열람</button>
  </div>
</div>
```

---

### 4.3 리더 뷰 책갈피 리본 (Bookmark Ribbon)
도서 우측 상단 모서리에 실제 책갈피 끈처럼 걸쳐지는 시각 요소:
```html
<div class="absolute top-0 right-8 z-10 flex flex-col items-center">
  <!-- 리본 본체 -->
  <div class="w-7 h-10 bg-[#E8636F] rounded-t-xs shadow-md"></div>
  <!-- 역삼각형 커팅 (Tail) -->
  <div class="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[10px] border-t-[#E8636F]"></div>
</div>
```

---

### 4.4 데이터 시각화 차트 가이드 (Recharts Palette)
독서 통계 및 평점 분포 차트 제작 시 권장 색상:

- **현재 월 / 강조 막대**: `#E8636F` (Primary Coral)
- **이전 월 / 일반 막대**: `#E8A0A7` (Soft Rose Tint)
- **호버 막대**: `#D94F5C`
- **배경 눈금선 (Grid)**: `#F0EFEA`
- **축 라벨 폰트**: `text-[11px] fill-stone-400`
- **모서리 둥글기 (Radius)**: 상단 둥글림 `[4, 4, 0, 0]`

```tsx
<Bar dataKey="readCount" radius={[4, 4, 0, 0]}>
  {data.map((entry, index) => (
    <Cell key={`cell-${index}`} fill={entry.isCurrent ? '#E8636F' : '#E8A0A7'} />
  ))}
</Bar>
```

---

## 5. 레이아웃 & 스페이싱 규칙 (Layout & Grid)

- **컨테이너 최대 너비**: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` (1280px)
- **상단 고정 헤더**: `h-16 sticky top-0 z-40 bg-[#FAF9F6]/90 backdrop-blur-md border-b border-stone-200`
- **섹션 상하 패딩**: `py-10 md:py-16`
- **그리드 구조**:
  - 도서 그리드: 모바일 2열 (`grid-cols-2`), 태블릿 3열 (`md:grid-cols-3`), 데스크톱 4열 (`lg:grid-cols-4`), 대화면 5열 (`xl:grid-cols-5`)
  - 간격: `gap-4 sm:gap-6`

---

## 6. CSS 스니펫 (원클릭 복사용 Tailwind/CSS)

```css
@import "tailwindcss";

@layer base {
  body {
    background-color: #FAF9F6;
    color: #222222;
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Noto Sans KR', sans-serif;
    -webkit-font-smoothing: antialiased;
  }
}

/* 감성 명조체 유틸리티 */
.font-serif-kr {
  font-family: 'Noto Serif KR', Georgia, Cambria, 'Times New Roman', serif;
}

/* 부드럽고 얇은 스크롤바 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(150, 150, 150, 0.25);
  border-radius: 9999px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(150, 150, 150, 0.45);
}
```
