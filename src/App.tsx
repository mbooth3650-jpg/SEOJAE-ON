import React, { useState, useEffect, useMemo } from 'react';
import {
  Book,
  Bookmark,
  Note,
  Review,
  ReadingHistory,
  SearchHistory,
  UserProfile,
  RecommendationItem
} from './types/library';
import { INITIAL_BOOKS, INITIAL_REVIEWS } from './data/sampleBooks';
import { generatePersonalizedRecommendations } from './utils/recommendation';
import { ReaderModal } from './components/ReaderModal';
import { BookDetailModal } from './components/BookDetailModal';
import { UploadPdfModal } from './components/UploadPdfModal';
import { MyLibraryDrawer } from './components/MyLibraryDrawer';

// Icons
import {
  Search,
  BookOpen,
  Bookmark as BookmarkIcon,
  Sparkles,
  Star,
  Upload,
  User,
  Heart,
  Eye,
  Filter,
  CheckCircle,
  SlidersHorizontal,
  ArrowRight,
  TrendingUp,
  FileText
} from 'lucide-react';

// Hero image asset
import heroImage from './assets/images/hero_reading_books_1791586906115.jpg';

const SAMPLE_USERS: UserProfile[] = [
  { id: 'user-default', name: '김독서', role: '인문·문학 애호가', avatarColor: 'bg-[#E8636F]' },
  { id: 'user-tech', name: '이책벌레', role: 'IT·과학 연구원', avatarColor: 'bg-emerald-600' },
  { id: 'user-economy', name: '박탐독', role: '경제·경영 기획자', avatarColor: 'bg-indigo-600' }
];

const CATEGORIES: Book['category'][] = [
  '소설/문학',
  '인문/철학',
  '과학/기술',
  '경제/경영',
  '자기계발',
  '예술/디자인'
];

export default function App() {
  // Current user state
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('seojae_user');
    return saved ? JSON.parse(saved) : SAMPLE_USERS[0];
  });

  // Books collection
  const [books, setBooks] = useState<Book[]>(() => {
    const saved = localStorage.getItem('seojae_books');
    return saved ? JSON.parse(saved) : INITIAL_BOOKS;
  });

  // Bookmarks (per user)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    const saved = localStorage.getItem('seojae_bookmarks');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'bm-init-1',
            userId: 'user-default',
            bookId: 'book-1',
            pageNumber: 3,
            createdAt: '2026-03-25'
          },
          {
            id: 'bm-init-2',
            userId: 'user-default',
            bookId: 'book-2',
            pageNumber: 1,
            createdAt: '2026-03-26'
          }
        ];
  });

  // Notes (per user)
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('seojae_notes');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'note-init-1',
            userId: 'user-default',
            bookId: 'book-1',
            pageNumber: 3,
            content: '가문비나무 숲의 균형감각. 타인과 나 사이의 건강한 거리두기가 주는 평온함.',
            createdAt: '2026-03-25 15:30',
            updatedAt: ''
          }
        ];
  });

  // Reviews
  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('seojae_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  // Reading history (per user)
  const [readingHistory, setReadingHistory] = useState<ReadingHistory[]>(() => {
    const saved = localStorage.getItem('seojae_history');
    return saved
      ? JSON.parse(saved)
      : [
          {
            userId: 'user-default',
            bookId: 'book-1',
            category: '소설/문학',
            lastPage: 3,
            totalPages: 16,
            viewedAt: '2026-03-25',
            readCount: 3
          },
          {
            userId: 'user-default',
            bookId: 'book-2',
            category: '인문/철학',
            lastPage: 1,
            totalPages: 12,
            viewedAt: '2026-03-26',
            readCount: 2
          }
        ];
  });

  // Search keywords history
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>(() => {
    const saved = localStorage.getItem('seojae_searches');
    return saved
      ? JSON.parse(saved)
      : [
          { keyword: '자연', searchedAt: '2026-03-25' },
          { keyword: '철학', searchedAt: '2026-03-26' }
        ];
  });

  // Library favorites (bookId set)
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('seojae_favorites');
    return saved ? JSON.parse(saved) : ['book-1'];
  });

  // Search & Filter state
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'latest'>('popular');

  // Modals & Drawers state
  const [readingBook, setReadingBook] = useState<Book | null>(null);
  const [readingInitialPage, setReadingInitialPage] = useState<number>(1);
  const [detailBook, setDetailBook] = useState<Book | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isLibraryDrawerOpen, setIsLibraryDrawerOpen] = useState<boolean>(false);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('seojae_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('seojae_books', JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem('seojae_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('seojae_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('seojae_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('seojae_history', JSON.stringify(readingHistory));
  }, [readingHistory]);

  useEffect(() => {
    localStorage.setItem('seojae_searches', JSON.stringify(searchHistory));
  }, [searchHistory]);

  useEffect(() => {
    localStorage.setItem('seojae_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Compute Personalized Recommendations
  const personalizedRecommendations = useMemo(() => {
    const userHistory = readingHistory.filter(h => h.userId === currentUser.id);
    return generatePersonalizedRecommendations(books, userHistory, searchHistory);
  }, [books, readingHistory, searchHistory, currentUser.id]);

  // Search Execution
  const handleExecuteSearch = (keyword: string) => {
    const trimmed = keyword.trim();
    if (trimmed) {
      setSearchHistory(prev => [...prev.slice(-20), { keyword: trimmed, searchedAt: new Date().toISOString() }]);
    }
  };

  // Filtered & Sorted books
  const filteredBooks = useMemo(() => {
    let result = [...books];

    // Category filter
    if (selectedCategory !== '전체') {
      result = result.filter(b => b.category === selectedCategory);
    }

    // Keyword search
    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      result = result.filter(
        b =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          b.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortBy === 'popular') {
      result.sort((a, b) => b.viewsCount - a.viewsCount);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'latest') {
      result.sort((a, b) => b.publicationYear - a.publicationYear);
    }

    return result;
  }, [books, selectedCategory, searchKeyword, sortBy]);

  // Open Reader Handler
  const handleOpenReader = (book: Book, initialPage = 1) => {
    setReadingInitialPage(initialPage);
    setReadingBook(book);

    // Record reading history
    setReadingHistory(prev => {
      const existingIdx = prev.findIndex(h => h.userId === currentUser.id && h.bookId === book.id);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = {
          ...copy[existingIdx],
          lastPage: initialPage,
          readCount: (copy[existingIdx].readCount || 1) + 1,
          viewedAt: new Date().toISOString().split('T')[0]
        };
        return copy;
      } else {
        return [
          ...prev,
          {
            userId: currentUser.id,
            bookId: book.id,
            category: book.category,
            lastPage: initialPage,
            totalPages: book.totalPages,
            viewedAt: new Date().toISOString().split('T')[0],
            readCount: 1
          }
        ];
      }
    });

    // Increment book views count
    setBooks(prev =>
      prev.map(b => (b.id === book.id ? { ...b, viewsCount: b.viewsCount + 1 } : b))
    );
  };

  // Page change within Reader
  const handleReaderPageChange = (bookId: string, pageNumber: number, totalPages: number) => {
    setReadingHistory(prev => {
      const idx = prev.findIndex(h => h.userId === currentUser.id && h.bookId === bookId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = {
          ...copy[idx],
          lastPage: pageNumber,
          totalPages
        };
        return copy;
      }
      return prev;
    });
  };

  // Toggle Bookmark
  const handleToggleBookmark = (bookId: string, pageNumber: number, label?: string) => {
    setBookmarks(prev => {
      const existing = prev.find(
        b => b.userId === currentUser.id && b.bookId === bookId && b.pageNumber === pageNumber
      );
      if (existing) {
        return prev.filter(b => b.id !== existing.id);
      } else {
        const newBm: Bookmark = {
          id: `bm-${Date.now()}`,
          userId: currentUser.id,
          bookId,
          pageNumber,
          createdAt: new Date().toISOString().split('T')[0],
          label
        };
        return [...prev, newBm];
      }
    });
  };

  const handleDeleteBookmark = (bookId: string, pageNumber: number) => {
    setBookmarks(prev =>
      prev.filter(b => !(b.userId === currentUser.id && b.bookId === bookId && b.pageNumber === pageNumber))
    );
  };

  // Save or update Note
  const handleSaveNote = (bookId: string, pageNumber: number, content: string, noteId?: string) => {
    const timeStr = new Date().toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    if (noteId) {
      setNotes(prev =>
        prev.map(n => (n.id === noteId ? { ...n, content, updatedAt: timeStr } : n))
      );
    } else {
      const newNote: Note = {
        id: `note-${Date.now()}`,
        userId: currentUser.id,
        bookId,
        pageNumber,
        content,
        createdAt: timeStr,
        updatedAt: ''
      };
      setNotes(prev => [...prev, newNote]);
    }
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(n => n.id !== noteId));
  };

  // Toggle Library Favorite
  const handleToggleLibraryBookmark = (bookId: string) => {
    setFavorites(prev =>
      prev.includes(bookId) ? prev.filter(id => id !== bookId) : [...prev, bookId]
    );
  };

  // Review actions
  const handleAddReview = (bookId: string, rating: number, comment: string) => {
    const timeStr = new Date().toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      bookId,
      rating,
      comment,
      createdAt: timeStr
    };

    setReviews(prev => [newRev, ...prev]);

    // Recalculate book rating average
    setBooks(prev =>
      prev.map(b => {
        if (b.id === bookId) {
          const allBookRevs = [newRev, ...reviews.filter(r => r.bookId === bookId)];
          const avg = Number((allBookRevs.reduce((acc, r) => acc + r.rating, 0) / allBookRevs.length).toFixed(1));
          return {
            ...b,
            rating: avg,
            reviewCount: allBookRevs.length
          };
        }
        return b;
      })
    );
  };

  const handleUpdateReview = (reviewId: string, rating: number, comment: string) => {
    const timeStr = new Date().toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    setReviews(prev =>
      prev.map(r => (r.id === reviewId ? { ...r, rating, comment, updatedAt: timeStr } : r))
    );
  };

  const handleDeleteReview = (reviewId: string) => {
    setReviews(prev => prev.filter(r => r.id !== reviewId));
  };

  // Custom uploaded book handler
  const handleAddCustomBook = (newBook: Book) => {
    setBooks(prev => [newBook, ...prev]);
    // Immediately open reader for the uploaded book
    handleOpenReader(newBook, 1);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#222222] flex flex-col font-sans">
      {/* Top Bar Contract (Zone 1: Brand wordmark | Zone 2: 4-5 single-line nav links | Zone 3: 1 action) */}
      <header className="sticky top-0 z-40 bg-[#FAF9F6]/90 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Title */}
          <div className="flex items-center gap-2 shrink-0">
            <a href="/" className="flex items-center gap-2 group">
              <span className="font-serif-kr text-xl sm:text-2xl font-bold tracking-tight text-stone-900 group-hover:text-[#E8636F] transition-colors">
                BOOTIN 서재온
              </span>
            </a>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
            <a href="#recommendations" className="hover:text-[#E8636F] transition-colors whitespace-nowrap shrink-0">
              맞춤 추천
            </a>
            <a href="#catalog" className="hover:text-[#E8636F] transition-colors whitespace-nowrap shrink-0">
              도서 탐색
            </a>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="hover:text-[#E8636F] transition-colors whitespace-nowrap shrink-0"
            >
              PDF 도서 등록
            </button>
            <button
              onClick={() => setIsLibraryDrawerOpen(true)}
              className="hover:text-[#E8636F] transition-colors whitespace-nowrap shrink-0"
            >
              내 서재 ({bookmarks.filter(b => b.userId === currentUser.id).length}개 책갈피)
            </button>
          </nav>

          {/* Zone 3: Primary Action / User Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Profile Button */}
            <button
              onClick={() => setIsLibraryDrawerOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-stone-800 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg shadow-2xs transition-colors whitespace-nowrap shrink-0"
              title="내 서재 및 사용자 프로필 관리"
            >
              <div className={`w-5 h-5 rounded-full ${currentUser.avatarColor} text-white flex items-center justify-center text-[10px]`}>
                {currentUser.name[0]}
              </div>
              <span className="hidden sm:inline">{currentUser.name} 님의 서재</span>
            </button>

            {/* Upload PDF */}
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#E8636F] hover:bg-[#D94F5C] rounded-lg shadow-2xs transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <Upload size={14} />
              <span className="hidden sm:inline">PDF 추가</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1">
        {/* Hero Section (Matching Uploaded Image Reference Aesthetic) */}
        <section className="relative overflow-hidden bg-white border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Headline & Action */}
              <div className="lg:col-span-6 space-y-6">
                <span className="text-xs font-bold text-[#E8636F] tracking-widest uppercase">
                  디지털 서재 & 스마트 도서관 플랫폼
                </span>
                <h1 className="font-serif-kr text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 tracking-tight leading-tight">
                  지식과 사유가 머무는<br />
                  열린 온라인 PDF 서재
                </h1>
                <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-serif-kr">
                  엄선된 인문, 문학, 첨단 과학, 경제 경영 PDF 책자들을 언제 어디서나 열람하세요.
                  원하는 페이지에 책갈피와 메모를 남기고, 독서 취향 분석을 통한 맞춤형 추천을 받아보실 수 있습니다.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href="#recommendations"
                    className="px-6 py-3 bg-[#E8636F] hover:bg-[#D94F5C] text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <span>맞춤 추천 도서 보기</span>
                    <ArrowRight size={16} />
                  </a>
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="px-5 py-3 border border-stone-300 hover:border-stone-400 bg-stone-50 hover:bg-stone-100 text-stone-700 text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
                  >
                    <Upload size={16} className="text-[#E8636F]" />
                    <span>내 PDF 책 등록하기</span>
                  </button>
                </div>

                {/* Proof markers strip */}
                <div className="pt-4 flex items-center gap-6 text-xs text-stone-500">
                  <div>
                    <span className="font-bold text-stone-900 font-mono text-base mr-1">
                      {books.length}
                    </span>
                    <span>권의 PDF 소장</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#E8636F] font-mono text-base mr-1">
                      100%
                    </span>
                    <span>무료 열람</span>
                  </div>
                  <div>
                    <span className="font-bold text-stone-900 font-mono text-base mr-1">
                      4.9★
                    </span>
                    <span>독자 평점 만족도</span>
                  </div>
                </div>
              </div>

              {/* Right Hero Image Card */}
              <div className="lg:col-span-6 flex justify-center lg:justify-end">
                <div className="w-full max-w-lg aspect-16/10 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/10 relative">
                  <img
                    src={heroImage}
                    alt="열린 책과 고요한 도서관"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                    <span className="text-xs uppercase tracking-wider text-rose-200 font-medium">
                      오늘의 추천 서가
                    </span>
                    <h3 className="font-serif-kr text-lg font-bold">
                      고요의 물결 & 조용한 대지
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3-Feature Value Strip (Matching Reference Image) */}
        <section className="bg-white border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
              <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-stone-50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-[#E8636F]/10 text-[#E8636F] flex items-center justify-center shrink-0">
                  <BookOpen size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-stone-900">쾌적한 온라인 PDF 열람</h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    양면 보기, 세피아·다크 테마, 글꼴 크기 조절을 지원하는 스마트 뷰어
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-stone-50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                  <BookmarkIcon size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-stone-900">페이지별 책갈피 & 메모</h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    원하는 페이지에 책갈피를 꽂고 사유의 메모를 사용자별로 안전하게 보관
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-stone-50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-stone-900">열람·검색 기반 개인화 추천</h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    자주 읽은 카테고리와 검색 키워드를 심층 분석한 한국어 맞춤 도서 제안
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search & Category Filter Strip (Matching Reference Image) */}
        <section className="bg-[#FAF9F6] py-8 border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-stone-200 flex flex-col md:flex-row gap-4 items-center">
              {/* Category Select */}
              <div className="w-full md:w-56 shrink-0">
                <label className="text-[11px] font-semibold text-stone-500 block mb-1">
                  카테고리 분류
                </label>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-[#E8636F]"
                >
                  <option value="전체">카테고리 전체 (All)</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Select */}
              <div className="w-full md:w-44 shrink-0">
                <label className="text-[11px] font-semibold text-stone-500 block mb-1">
                  정렬 기준
                </label>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-[#E8636F]"
                >
                  <option value="popular">인기순 (열람수 많은 순)</option>
                  <option value="rating">평점순 (별점 높은 순)</option>
                  <option value="latest">최신 출간순</option>
                </select>
              </div>

              {/* Search Keyword Input */}
              <div className="w-full flex-1">
                <label className="text-[11px] font-semibold text-stone-500 block mb-1">
                  도서명, 저자, 키워드 검색
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchKeyword}
                      onChange={e => setSearchKeyword(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleExecuteSearch(searchKeyword);
                      }}
                      placeholder="도서명, 저자, 태그 검색 (예: 고요, 인공지능, 경제)..."
                      className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-800 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-[#E8636F]"
                    />
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                    />
                  </div>
                  <button
                    onClick={() => handleExecuteSearch(searchKeyword)}
                    className="px-5 py-2.5 bg-[#E8636F] hover:bg-[#D94F5C] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors shrink-0 flex items-center gap-1.5"
                  >
                    <Search size={14} />
                    <span>도서 검색</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Popular search tag chips */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 pt-1">
              <span className="font-semibold text-stone-600">추천 검색어:</span>
              {['고요', '자연', '인공지능', '철학', '도시', '몰입', '디자인', '경제'].map(tag => (
                <button
                  key={tag}
                  onClick={() => {
                    setSearchKeyword(tag);
                    handleExecuteSearch(tag);
                  }}
                  className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md transition-colors"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Section 1: Personalized Recommendations (Core Requirement) */}
        <section id="recommendations" className="py-12 bg-white border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-4 border-stone-100">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#E8636F]">
                  <Sparkles size={16} />
                  <span>개인화 추천 알고리즘 가동 중</span>
                </div>
                <h2 className="font-serif-kr text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
                  {currentUser.name} 님을 위한 맞춤 추천 도서
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  회원님의 최근 열람 기록 및 검색 패턴을 분석하여 엄선한 도서 목록입니다.
                </p>
              </div>

              {/* User Switcher Quick Bar */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-stone-500">독서자 전환:</span>
                {SAMPLE_USERS.map(u => (
                  <button
                    key={u.id}
                    onClick={() => setCurrentUser(u)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                      currentUser.id === u.id
                        ? 'bg-[#E8636F] text-white shadow-xs font-semibold'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${currentUser.id === u.id ? 'bg-white' : u.avatarColor}`} />
                    <span>{u.name}</span>
                    <span className="text-[10px] opacity-80">({u.role.split(' ')[0]})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Algorithm Analysis Insight Box */}
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#E8636F]/10 text-[#E8636F] flex items-center justify-center shrink-0">
                  <TrendingUp size={16} />
                </div>
                <div>
                  <span className="font-semibold text-stone-800 block">열람 패턴 분석</span>
                  <p className="text-stone-500 text-[11px] mt-0.5">
                    가장 많이 열람한 카테고리: <strong className="text-stone-800 font-semibold">{readingHistory.find(h => h.userId === currentUser.id)?.category || '소설/문학'}</strong> (가중치 +35점)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Search size={16} />
                </div>
                <div>
                  <span className="font-semibold text-stone-800 block">검색 키워드 분석</span>
                  <p className="text-stone-500 text-[11px] mt-0.5">
                    최근 검색 관심사: {searchHistory.slice(-3).map(s => `#${s.keyword}`).join(' ')} (가중치 +25점)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Star size={16} />
                </div>
                <div>
                  <span className="font-semibold text-stone-800 block">독자 만족도 반영</span>
                  <p className="text-stone-500 text-[11px] mt-0.5">
                    평점 4.8점 이상 우수 도서 및 실제 독자 서평 가중치 자동 결합
                  </p>
                </div>
              </div>
            </div>

            {/* Recommendations Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {personalizedRecommendations.slice(0, 4).map((rec, index) => {
                const book = rec.book;
                const isFav = favorites.includes(book.id);

                return (
                  <div
                    key={book.id}
                    className="group bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Reason Header */}
                      <div className="px-3 py-2 bg-stone-50 border-b border-stone-100 flex items-center gap-1.5 text-[11px] text-[#E8636F] font-semibold">
                        <Sparkles size={13} className="shrink-0" />
                        <span className="truncate">{rec.reason}</span>
                      </div>

                      {/* Book Cover Container (3:4 ratio) */}
                      <div className="relative aspect-3/4 bg-stone-100 overflow-hidden">
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <button
                          onClick={() => handleToggleLibraryBookmark(book.id)}
                          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-xs transition-colors ${
                            isFav
                              ? 'bg-white text-[#E8636F] shadow-sm'
                              : 'bg-black/30 text-white hover:bg-black/50'
                          }`}
                          title={isFav ? '내 서재 보관 취소' : '내 서재에 담기'}
                        >
                          <Heart size={16} className={isFav ? 'fill-[#E8636F]' : ''} />
                        </button>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-2">
                        <span className="text-[11px] font-semibold text-stone-400">
                          {book.category}
                        </span>
                        <h3 className="font-serif-kr text-base font-bold text-stone-900 group-hover:text-[#E8636F] transition-colors line-clamp-1">
                          {book.title}
                        </h3>
                        <p className="text-xs text-stone-500 truncate">
                          {book.author}
                        </p>

                        <div className="flex items-center justify-between text-xs pt-1">
                          <div className="flex items-center text-amber-400">
                            <Star size={13} className="fill-amber-400" />
                            <span className="font-bold text-stone-800 ml-1">
                              {book.rating}
                            </span>
                            <span className="text-stone-400 text-[11px] ml-1">
                              ({book.reviewCount})
                            </span>
                          </div>
                          <span className="text-stone-400 text-[11px] font-mono">
                            총 {book.totalPages}쪽
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setDetailBook(book)}
                        className="py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
                      >
                        상세보기
                      </button>
                      <button
                        onClick={() => handleOpenReader(book)}
                        className="py-2 text-xs font-semibold text-white bg-[#E8636F] hover:bg-[#D94F5C] rounded-lg shadow-2xs transition-colors flex items-center justify-center gap-1"
                      >
                        <BookOpen size={13} />
                        <span>PDF 열람</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 2: Popular Book Catalog Grid (Matching Reference Design) */}
        <section id="catalog" className="py-14 bg-[#FAF9F6]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-[#E8636F] uppercase tracking-widest">
                온라인 서재 컬렉션
              </span>
              <h2 className="font-serif-kr text-3xl font-bold text-stone-900">
                인기 도서 둘러보기 (Popular Book)
              </h2>
              <div className="w-12 h-0.5 bg-[#E8636F] mx-auto mt-2" />
            </div>

            {/* Books Grid */}
            {filteredBooks.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-400 space-y-3">
                <Search size={36} className="mx-auto text-stone-300" />
                <p className="text-sm">검색 조건에 맞는 도서가 없습니다.</p>
                <button
                  onClick={() => {
                    setSelectedCategory('전체');
                    setSearchKeyword('');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#E8636F] rounded-lg"
                >
                  필터 초기화
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
                {filteredBooks.map(book => {
                  const isFav = favorites.includes(book.id);

                  return (
                    <div
                      key={book.id}
                      className="group bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        {/* Cover Image Container */}
                        <div className="relative aspect-3/4 bg-stone-100 overflow-hidden">
                          <img
                            src={book.coverImage}
                            alt={book.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <button
                            onClick={() => handleToggleLibraryBookmark(book.id)}
                            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-xs transition-colors ${
                              isFav
                                ? 'bg-white text-[#E8636F] shadow-sm'
                                : 'bg-black/30 text-white hover:bg-black/50'
                            }`}
                            title={isFav ? '내 서재 보관 취소' : '내 서재에 담기'}
                          >
                            <Heart size={16} className={isFav ? 'fill-[#E8636F]' : ''} />
                          </button>
                          {book.isCustomUpload && (
                            <span className="absolute bottom-2 left-2 bg-stone-900/80 text-white text-[10px] px-2 py-0.5 rounded font-medium">
                              사용자 등록
                            </span>
                          )}
                        </div>

                        {/* Card Info */}
                        <div className="p-5 text-center space-y-1.5">
                          <span className="text-[11px] text-stone-400 font-medium">
                            {book.category}
                          </span>
                          <h3 className="font-serif-kr text-base font-bold text-stone-900 group-hover:text-[#E8636F] transition-colors line-clamp-1">
                            {book.title}
                          </h3>
                          <p className="text-xs text-stone-500 truncate">
                            {book.author}
                          </p>

                          {/* Star Rating */}
                          <div className="flex items-center justify-center gap-1 text-amber-400 pt-1">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star
                                key={s}
                                size={13}
                                className={
                                  s <= Math.round(book.rating)
                                    ? 'fill-amber-400'
                                    : 'text-stone-200'
                                }
                              />
                            ))}
                            <span className="text-xs font-bold text-stone-700 ml-1">
                              {book.rating}
                            </span>
                          </div>

                          <div className="text-[11px] text-stone-400 pt-1">
                            조회수 {book.viewsCount}회 · 서평 {book.reviewCount}편
                          </div>
                        </div>
                      </div>

                      {/* Card Button */}
                      <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setDetailBook(book)}
                          className="py-2.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
                        >
                          상세보기
                        </button>
                        <button
                          onClick={() => handleOpenReader(book)}
                          className="py-2.5 text-xs font-semibold text-white bg-[#E8636F] hover:bg-[#D94F5C] rounded-lg shadow-2xs transition-colors flex items-center justify-center gap-1"
                        >
                          <BookOpen size={14} />
                          <span>PDF 열람</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-10 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif-kr text-base font-bold text-stone-900">BOOTIN 서재온</span>
            <span>·</span>
            <span>한국인 독자를 위한 스마트 온라인 PDF 도서관</span>
          </div>
          <div className="flex items-center gap-6">
            <span>열람 기록 및 검색 패턴 기반 AI 추천</span>
            <span>·</span>
            <span>페이지별 책갈피 & 독서 메모</span>
            <span>·</span>
            <span>독자 서평 및 평점 시스템</span>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      {/* 1. PDF Reader Modal */}
      {readingBook && (
        <ReaderModal
          book={readingBook}
          userId={currentUser.id}
          userName={currentUser.name}
          bookmarks={bookmarks}
          notes={notes}
          initialPage={readingInitialPage}
          onClose={() => setReadingBook(null)}
          onToggleBookmark={handleToggleBookmark}
          onSaveNote={handleSaveNote}
          onDeleteNote={handleDeleteNote}
          onPageChange={handleReaderPageChange}
        />
      )}

      {/* 2. Book Detail Modal */}
      {detailBook && (
        <BookDetailModal
          book={detailBook}
          userId={currentUser.id}
          userName={currentUser.name}
          reviews={reviews}
          isBookmarkedInLibrary={favorites.includes(detailBook.id)}
          onClose={() => setDetailBook(null)}
          onOpenReader={book => {
            setDetailBook(null);
            handleOpenReader(book);
          }}
          onToggleLibraryBookmark={handleToggleLibraryBookmark}
          onAddReview={handleAddReview}
          onUpdateReview={handleUpdateReview}
          onDeleteReview={handleDeleteReview}
        />
      )}

      {/* 3. Upload PDF Modal */}
      {isUploadModalOpen && (
        <UploadPdfModal
          onClose={() => setIsUploadModalOpen(false)}
          onAddCustomBook={handleAddCustomBook}
        />
      )}

      {/* 4. My Library Drawer */}
      <MyLibraryDrawer
        isOpen={isLibraryDrawerOpen}
        onClose={() => setIsLibraryDrawerOpen(false)}
        currentUser={currentUser}
        availableUsers={SAMPLE_USERS}
        onSwitchUser={setCurrentUser}
        books={books}
        bookmarks={bookmarks}
        notes={notes}
        reviews={reviews}
        readingHistory={readingHistory}
        onOpenReader={(book, initialPage) => {
          setIsLibraryDrawerOpen(false);
          handleOpenReader(book, initialPage);
        }}
        onOpenBookDetail={book => {
          setIsLibraryDrawerOpen(false);
          setDetailBook(book);
        }}
        onDeleteBookmark={handleDeleteBookmark}
        onDeleteNote={handleDeleteNote}
      />
    </div>
  );
}
