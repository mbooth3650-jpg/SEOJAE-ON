# 서재온 (BOOTIN SEOJAE ON) 디자인 시스템 가이드

다른 프로젝트에서 동일한 에디토리얼 감성의 디지털 서재 디자인을 그대로 적용할 수 있도록 정리된 명세서입니다.

---

## 1. 디자인 키포인트
- **미색 캔버스**: 눈이 편안한 한지·상아색 배경 (`#FAF9F6`)
- **로즈 코럴 포인트**: 따뜻하고 지적인 느낌의 시그니처 컬러 (`#E8636F`)
- **명조 & 고딕 조화**: 제목은 에디토리얼 명조(`Noto Serif KR`), UI 조작부는 깔끔한 산세리프(`Pretendard`)

---

## 2. 색상표 (Color Tokens)

| 토큰명 | Hex Code | 용도 및 설명 |
| :--- | :--- | :--- |
| **Primary Accent** | `#E8636F` | 메인 CTA 버튼, 활성 탭, 주요 아이콘 |
| **Primary Hover** | `#D94F5C` | 버튼 마우스 호버 시 |
| **Accent Tint** | `rgba(232, 99, 111, 0.1)` | 뱃지 배경, 활성 아이템 강조 음영 |
| **Canvas Background** | `#FAF9F6` | 웹사이트 기본 전체 배경색 |
| **Card Surface** | `#FFFFFF` | 도서 카드, 모달 팝업, 패널 표면 |
| **Muted Surface** | `#F5F5F0` | 검색 입력창, 보조 컨테이너 배경 |
| **Heading Text** | `#1C1917` (stone-900) | 메인 제목, 강조 텍스트 |
| **Body Text** | `#44403C` (stone-700) | 도서 본문, 설명문 |
| **Border Line** | `#E7E5E4` (stone-200) | 카드 및 구분선 테두리 |

---

## 3. 대표 컴포넌트 HTML/Tailwind 스니펫

### 3.1 메인 솔리드 코럴 버튼
```html
<button class="px-5 py-2.5 bg-[#E8636F] hover:bg-[#D94F5C] text-white text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl shadow-2xs hover:shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-98">
  열람하기
</button>
```

### 3.2 아웃라인 보조 버튼
```html
<button class="px-4 py-2 bg-white hover:bg-stone-50 text-stone-700 text-xs sm:text-sm font-medium border border-stone-200 rounded-lg shadow-2xs transition-colors">
  상세보기
</button>
```

### 3.3 3:4 도서 카드 그리드 구조
```html
<div class="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between">
  <!-- 3:4 비율 표지 -->
  <div class="relative aspect-[3/4] bg-stone-100 overflow-hidden">
    <img src="..." class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
    <span class="absolute top-3 left-3 px-2 py-0.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium rounded">카테고리</span>
  </div>
  <!-- 메타 정보 -->
  <div class="p-4 space-y-1">
    <h3 class="font-bold text-sm text-stone-900 group-hover:text-[#E8636F] transition-colors truncate">책 제목</h3>
    <p class="text-xs text-stone-500 truncate">저자 · 출판사</p>
  </div>
</div>
```

### 3.4 리더 뷰 책갈피 리본
```html
<div class="absolute top-0 right-8 z-10 flex flex-col items-center">
  <div class="w-7 h-10 bg-[#E8636F] rounded-t-xs shadow-md"></div>
  <div class="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[10px] border-t-[#E8636F]"></div>
</div>
```

---

## 4. Recharts 차트 테마 가이드
- 당월(현재) 데이터 막대: `#E8636F`
- 이전 월 데이터 막대: `#E8A0A7` (은은한 톤)
- 모서리 곡률: `radius={[4, 4, 0, 0]}`
