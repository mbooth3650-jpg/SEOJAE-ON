import { Book, ReadingHistory, SearchHistory, RecommendationItem } from '../types/library';

/**
 * 사용자의 열람 기록 및 검색 패턴을 분석하여 개인 맞춤형 책 추천 목록을 생성합니다.
 */
export function generatePersonalizedRecommendations(
  books: Book[],
  readingHistory: ReadingHistory[],
  searchHistory: SearchHistory[]
): RecommendationItem[] {
  // 1. 카테고리별 열람 빈도 계산
  const categoryCountMap: Record<string, number> = {};
  readingHistory.forEach(record => {
    categoryCountMap[record.category] = (categoryCountMap[record.category] || 0) + (record.readCount || 1);
  });

  const sortedCategories = Object.entries(categoryCountMap).sort((a, b) => b[1] - a[1]);
  const topCategory = sortedCategories[0]?.[0];
  const secondCategory = sortedCategories[1]?.[0];

  // 2. 최근/자주 검색한 키워드 추출 (최근 15개 기준 빈도 분석)
  const keywordCountMap: Record<string, number> = {};
  searchHistory.slice(-15).forEach(item => {
    const trimmed = item.keyword.trim().toLowerCase();
    if (trimmed.length >= 2) {
      keywordCountMap[trimmed] = (keywordCountMap[trimmed] || 0) + 1;
    }
  });
  const frequentKeywords = Object.entries(keywordCountMap)
    .sort((a, b) => b[1] - a[1])
    .map(([kw]) => kw);

  // 3. 도서별 추천 점수 및 추천 이유 산출
  const scoredItems: RecommendationItem[] = books.map(book => {
    let score = 0;
    const reasons: string[] = [];

    // (A) 카테고리 열람 기반 점수
    if (topCategory && book.category === topCategory) {
      const reads = categoryCountMap[topCategory];
      score += 35;
      reasons.push(`최근 가장 많이 열람한 '${topCategory}'(총 ${reads}회) 분야 맞춤`);
    } else if (secondCategory && book.category === secondCategory) {
      score += 20;
      reasons.push(`자주 찾아보신 '${secondCategory}' 분야 관심 도서`);
    }

    // (B) 검색 키워드 매칭 점수
    let matchedKeyword: string | null = null;
    for (const kw of frequentKeywords) {
      const inTitle = book.title.toLowerCase().includes(kw);
      const inDesc = book.description.toLowerCase().includes(kw);
      const inAuthor = book.author.toLowerCase().includes(kw);
      const inTags = book.tags.some(t => t.toLowerCase().includes(kw));

      if (inTitle || inDesc || inAuthor || inTags) {
        score += 25;
        matchedKeyword = kw;
        break;
      }
    }

    if (matchedKeyword) {
      reasons.push(`검색하신 관심 키워드 '${matchedKeyword}' 연관 도서`);
    }

    // (C) 기본 평점 및 인기도 가중치
    score += (book.rating || 4.5) * 4;
    score += Math.min(10, (book.viewsCount || 0) / 150);

    // 기본 이유 폴백 (기록이 아직 적을 때)
    if (reasons.length === 0) {
      if (book.rating >= 4.8) {
        reasons.push(`평점 ${book.rating}점 독자 만족도 최우수 도서`);
      } else {
        reasons.push(`${book.category} 분야 사서 엄선 추천작`);
      }
    }

    return {
      book,
      score,
      reason: reasons[0] // 가장 강력한 이유 표시
    };
  });

  // 점수 높은 순으로 정렬하여 상위 목록 반환
  return scoredItems.sort((a, b) => b.score - a.score);
}
