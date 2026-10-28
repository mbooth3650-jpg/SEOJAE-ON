import React, { useState, useMemo } from 'react';
import { Book, Bookmark, Note, Review, ReadingHistory, UserProfile } from '../types/library';
import {
  X,
  Bookmark as BookmarkIcon,
  FileText,
  Clock,
  BookOpen,
  MessageSquare,
  User,
  ArrowRight,
  Trash2,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Award
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';

interface MyLibraryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  availableUsers: UserProfile[];
  onSwitchUser: (user: UserProfile) => void;
  books: Book[];
  bookmarks: Bookmark[];
  notes: Note[];
  reviews: Review[];
  readingHistory: ReadingHistory[];
  onOpenReader: (book: Book, initialPage?: number) => void;
  onOpenBookDetail: (book: Book) => void;
  onDeleteBookmark: (bookId: string, pageNumber: number) => void;
  onDeleteNote: (noteId: string) => void;
}

type TabType = 'stats' | 'history' | 'bookmarks' | 'notes' | 'reviews';

export const MyLibraryDrawer: React.FC<MyLibraryDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  availableUsers,
  onSwitchUser,
  books,
  bookmarks,
  notes,
  reviews,
  readingHistory,
  onOpenReader,
  onOpenBookDetail,
  onDeleteBookmark,
  onDeleteNote
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('stats');
  const [isSwitchingUser, setIsSwitchingUser] = useState<boolean>(false);
  const [statsMetric, setStatsMetric] = useState<'books' | 'pages'>('books');

  if (!isOpen) return null;

  // Filter items for current user
  const userBookmarks = bookmarks.filter(b => b.userId === currentUser.id);
  const userNotes = notes.filter(n => n.userId === currentUser.id);
  const userReviews = reviews.filter(r => r.userId === currentUser.id);
  const userHistory = readingHistory.filter(h => h.userId === currentUser.id);

  const getBookById = (id: string) => books.find(b => b.id === id);

  // Calculate past 6 months reading statistics
  const monthlyStats = useMemo(() => {
    // Base monthly profile activity for demonstration per user
    const profileBaseData: Record<string, number[]> = {
      'user-default': [4, 5, 4, 6, 7, 8],
      'user-tech': [3, 5, 7, 8, 10, 12],
      'user-economy': [2, 4, 5, 5, 8, 9]
    };

    const base = profileBaseData[currentUser.id] || [3, 4, 5, 6, 7, 8];
    const now = new Date();
    const result: { month: string; booksCount: number; pagesCount: number; isCurrentMonth: boolean }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = `${d.getMonth() + 1}월`;
      const baseBooks = base[5 - i] || 4;

      // In the current month (i === 0), incorporate real-time reading history count
      const currentMonthAddition = (i === 0) ? userHistory.length : 0;
      const totalBooks = baseBooks + currentMonthAddition;
      
      // Calculate realistic pages
      const totalPages = totalBooks * 28 + (i === 0 ? userHistory.reduce((acc, h) => acc + (h.lastPage || 1), 0) : 0);

      result.push({
        month: monthLabel,
        booksCount: totalBooks,
        pagesCount: totalPages,
        isCurrentMonth: i === 0
      });
    }

    return result;
  }, [currentUser.id, userHistory]);

  // Overall metric aggregations
  const totalBooks6Months = useMemo(() => monthlyStats.reduce((sum, item) => sum + item.booksCount, 0), [monthlyStats]);
  const totalPages6Months = useMemo(() => monthlyStats.reduce((sum, item) => sum + item.pagesCount, 0), [monthlyStats]);
  const avgMonthlyBooks = useMemo(() => (totalBooks6Months / 6).toFixed(1), [totalBooks6Months]);
  
  // Month-over-month change
  const currentMonthData = monthlyStats[5];
  const prevMonthData = monthlyStats[4];
  const diffBooks = currentMonthData.booksCount - prevMonthData.booksCount;
  const growthRate = prevMonthData.booksCount > 0
    ? Math.round((diffBooks / prevMonthData.booksCount) * 100)
    : 0;

  // Best month
  const peakMonth = useMemo(() => {
    return [...monthlyStats].sort((a, b) => b.booksCount - a.booksCount)[0];
  }, [monthlyStats]);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md sm:max-w-lg bg-white dark:bg-zinc-900 h-full shadow-2xl flex flex-col border-l border-stone-200 dark:border-zinc-800 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-stone-50/70 dark:bg-zinc-850/70">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full ${currentUser.avatarColor} text-white flex items-center justify-center font-bold text-sm shadow-xs`}>
              {currentUser.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-stone-900 dark:text-zinc-100 text-sm">
                  {currentUser.name} 님의 서재
                </h3>
                <button
                  onClick={() => setIsSwitchingUser(!isSwitchingUser)}
                  className="text-[11px] text-[#E8636F] hover:underline"
                >
                  [사용자 전환]
                </button>
              </div>
              <p className="text-xs text-stone-500">{currentUser.role}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Switcher Dropdown */}
        {isSwitchingUser && (
          <div className="p-3 bg-stone-100 dark:bg-zinc-800 border-b border-stone-200 dark:border-zinc-700 text-xs space-y-1">
            <p className="font-semibold text-stone-600 dark:text-zinc-300 px-2 pb-1">
              열람할 사용자 프로필 선택:
            </p>
            {availableUsers.map(u => (
              <button
                key={u.id}
                onClick={() => {
                  onSwitchUser(u);
                  setIsSwitchingUser(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                  u.id === currentUser.id
                    ? 'bg-white dark:bg-zinc-900 font-bold text-[#E8636F] shadow-xs'
                    : 'hover:bg-white/60 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-300'
                }`}
              >
                <span>{u.name} ({u.role})</span>
                {u.id === currentUser.id && <span className="text-[10px]">현재</span>}
              </button>
            ))}
          </div>
        )}

        {/* Quick Stats Strip */}
        <div className="grid grid-cols-4 border-b border-stone-100 dark:border-zinc-800 text-center py-3 bg-white dark:bg-zinc-900 text-xs">
          <div>
            <div className="font-bold text-stone-900 dark:text-zinc-100 font-mono text-sm">
              {userHistory.length}
            </div>
            <span className="text-stone-400 text-[11px]">열람 도서</span>
          </div>
          <div>
            <div className="font-bold text-[#E8636F] font-mono text-sm">
              {userBookmarks.length}
            </div>
            <span className="text-stone-400 text-[11px]">책갈피</span>
          </div>
          <div>
            <div className="font-bold text-amber-500 font-mono text-sm">
              {userNotes.length}
            </div>
            <span className="text-stone-400 text-[11px]">작성 메모</span>
          </div>
          <div>
            <div className="font-bold text-stone-900 dark:text-zinc-100 font-mono text-sm">
              {userReviews.length}
            </div>
            <span className="text-stone-400 text-[11px]">남긴 서평</span>
          </div>
        </div>

        {/* Tabs Bar with 독서 통계 */}
        <div className="flex border-b border-stone-100 dark:border-zinc-800 text-xs font-medium overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 min-w-[76px] py-3 text-center transition-colors border-b-2 flex items-center justify-center gap-1 shrink-0 ${
              activeTab === 'stats'
                ? 'border-[#E8636F] text-[#E8636F] font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <BarChart3 size={14} />
            <span>독서 통계</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 min-w-[76px] py-3 text-center transition-colors border-b-2 flex items-center justify-center gap-1 shrink-0 ${
              activeTab === 'history'
                ? 'border-[#E8636F] text-[#E8636F] font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Clock size={14} />
            <span>열람 기록</span>
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`flex-1 min-w-[72px] py-3 text-center transition-colors border-b-2 flex items-center justify-center gap-1 shrink-0 ${
              activeTab === 'bookmarks'
                ? 'border-[#E8636F] text-[#E8636F] font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <BookmarkIcon size={14} />
            <span>책갈피 ({userBookmarks.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 min-w-[68px] py-3 text-center transition-colors border-b-2 flex items-center justify-center gap-1 shrink-0 ${
              activeTab === 'notes'
                ? 'border-[#E8636F] text-[#E8636F] font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <FileText size={14} />
            <span>메모 ({userNotes.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 min-w-[68px] py-3 text-center transition-colors border-b-2 flex items-center justify-center gap-1 shrink-0 ${
              activeTab === 'reviews'
                ? 'border-[#E8636F] text-[#E8636F] font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <MessageSquare size={14} />
            <span>서평 ({userReviews.length})</span>
          </button>
        </div>

        {/* Drawer Body Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* 0. Stats Tab (Recharts Monthly Reading Volume) */}
          {activeTab === 'stats' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Header & Metric Toggle */}
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h4 className="font-semibold text-xs text-stone-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <BarChart3 size={15} className="text-[#E8636F]" />
                    <span>최근 6개월 독서량 변화</span>
                  </h4>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    월별 완독 및 열람 추이 (recharts 막대 그래프)
                  </p>
                </div>

                {/* Metric Selector Buttons */}
                <div className="flex items-center p-0.5 bg-stone-100 dark:bg-zinc-800 rounded-lg text-[11px]">
                  <button
                    onClick={() => setStatsMetric('books')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      statsMetric === 'books'
                        ? 'bg-white dark:bg-zinc-900 text-[#E8636F] shadow-2xs font-semibold'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    권수 (권)
                  </button>
                  <button
                    onClick={() => setStatsMetric('pages')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      statsMetric === 'pages'
                        ? 'bg-white dark:bg-zinc-900 text-[#E8636F] shadow-2xs font-semibold'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    페이지 (쪽)
                  </button>
                </div>
              </div>

              {/* Summary KPIs Strip */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 bg-stone-50 dark:bg-zinc-850 rounded-xl border border-stone-200/60 dark:border-zinc-800">
                  <span className="text-[10px] text-stone-400 block">6개월 총 독서량</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-bold text-stone-900 dark:text-zinc-100 text-lg font-mono">
                      {statsMetric === 'books' ? totalBooks6Months : totalPages6Months}
                    </span>
                    <span className="text-[11px] text-stone-500">
                      {statsMetric === 'books' ? '권' : '쪽'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-stone-50 dark:bg-zinc-850 rounded-xl border border-stone-200/60 dark:border-zinc-800">
                  <span className="text-[10px] text-stone-400 block">월평균 독서량</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-bold text-stone-900 dark:text-zinc-100 text-lg font-mono">
                      {statsMetric === 'books' ? avgMonthlyBooks : Math.round(totalPages6Months / 6)}
                    </span>
                    <span className="text-[11px] text-stone-500">
                      {statsMetric === 'books' ? '권/월' : '쪽/월'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-stone-50 dark:bg-zinc-850 rounded-xl border border-stone-200/60 dark:border-zinc-800">
                  <span className="text-[10px] text-stone-400 block">전월 대비 증감</span>
                  <div className="flex items-center gap-1 mt-1">
                    {diffBooks >= 0 ? (
                      <TrendingUp size={15} className="text-emerald-500 shrink-0" />
                    ) : (
                      <TrendingDown size={15} className="text-rose-500 shrink-0" />
                    )}
                    <span className={`font-bold text-sm font-mono ${diffBooks >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {diffBooks >= 0 ? `+${diffBooks}` : diffBooks}
                      {statsMetric === 'books' ? '권' : '쪽'}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      ({growthRate >= 0 ? `+${growthRate}` : growthRate}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Recharts Bar Chart Container */}
              <div className="p-4 bg-white dark:bg-zinc-850 rounded-xl border border-stone-200 dark:border-zinc-800 shadow-2xs">
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={monthlyStats}
                      margin={{ top: 15, right: 10, left: -22, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ECEAE5" opacity={0.7} />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={{ stroke: '#E5E2DC' }}
                        tick={{ fontSize: 11, fill: '#6B665F' }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 10, fill: '#8C857B' }}
                        allowDecimals={false}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(232, 99, 111, 0.08)' }}
                        formatter={(val: any) => [
                          `${val}${statsMetric === 'books' ? '권' : '쪽'}`,
                          statsMetric === 'books' ? '열람 권수' : '열람 페이지'
                        ]}
                        labelFormatter={(label) => `${label} 독서 통계`}
                        contentStyle={{
                          backgroundColor: '#262626',
                          borderColor: '#404040',
                          borderRadius: '8px',
                          color: '#FFFFFF',
                          fontSize: '11px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        itemStyle={{ color: '#FCA5A5' }}
                      />
                      <Bar
                        dataKey={statsMetric === 'books' ? 'booksCount' : 'pagesCount'}
                        radius={[6, 6, 0, 0]}
                        animationDuration={600}
                      >
                        {monthlyStats.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.isCurrentMonth ? '#E8636F' : '#E8A0A7'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-zinc-700/60 text-[11px] text-stone-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded bg-[#E8A0A7]" />
                      <span>이전 월</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded bg-[#E8636F]" />
                      <span>현재 월 (진행중)</span>
                    </span>
                  </div>
                  <span className="font-medium text-stone-600 dark:text-zinc-300">
                    최다 독서: {peakMonth.month} ({peakMonth.booksCount}권)
                  </span>
                </div>
              </div>

              {/* Monthly Breakdown List with Visual Progress */}
              <div className="p-3.5 bg-stone-50/70 dark:bg-zinc-850/70 rounded-xl border border-stone-200/60 dark:border-zinc-800 space-y-2">
                <span className="text-xs font-semibold text-stone-700 dark:text-zinc-300 block">
                  월별 상세 독서 기록 내역
                </span>
                <div className="space-y-2 pt-1">
                  {monthlyStats.map((item, idx) => {
                    const maxVal = Math.max(...monthlyStats.map(m => statsMetric === 'books' ? m.booksCount : m.pagesCount));
                    const val = statsMetric === 'books' ? item.booksCount : item.pagesCount;
                    const percent = maxVal > 0 ? (val / maxVal) * 100 : 0;

                    return (
                      <div key={idx} className="flex items-center gap-3 text-xs">
                        <span className="w-10 text-stone-600 dark:text-zinc-400 font-medium font-mono text-[11px]">
                          {item.month}
                        </span>
                        <div className="flex-1 h-2 bg-stone-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              item.isCurrentMonth ? 'bg-[#E8636F]' : 'bg-[#E8A0A7]'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="w-20 text-right font-mono font-semibold text-stone-800 dark:text-zinc-200 text-[11px]">
                          {item.booksCount}권 <span className="font-normal text-stone-400">({item.pagesCount}p)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 1. History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-2.5">
              {userHistory.length === 0 ? (
                <div className="text-center py-16 text-xs text-stone-400">
                  아직 열람한 책이 없습니다.<br />원하는 책을 클릭하여 PDF 열람을 시작해 보세요.
                </div>
              ) : (
                userHistory.map(item => {
                  const book = getBookById(item.bookId);
                  if (!book) return null;
                  return (
                    <div
                      key={item.bookId}
                      className="p-3 rounded-xl border border-stone-100 dark:border-zinc-800 bg-stone-50/70 dark:bg-zinc-850/70 flex gap-3 items-center hover:border-stone-300 transition-colors"
                    >
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-12 h-16 object-cover rounded shadow-xs shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-[#E8636F] font-semibold">{book.category}</span>
                        <h4 className="font-semibold text-xs text-stone-900 dark:text-zinc-100 truncate">
                          {book.title}
                        </h4>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          마지막 열람: {item.lastPage}쪽 / 총 {book.totalPages}쪽
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          onClose();
                          onOpenReader(book, item.lastPage);
                        }}
                        className="p-2 text-xs font-medium text-[#E8636F] hover:bg-[#E8636F]/10 rounded-lg shrink-0 flex items-center gap-1"
                        title="이어보기"
                      >
                        <span>이어보기</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* 2. Bookmarks Tab */}
          {activeTab === 'bookmarks' && (
            <div className="space-y-2.5">
              {userBookmarks.length === 0 ? (
                <div className="text-center py-16 text-xs text-stone-400">
                  저장된 책갈피가 없습니다.<br />열람 중 원하는 페이지에서 책갈피를 추가해보세요.
                </div>
              ) : (
                userBookmarks.map(bm => {
                  const book = getBookById(bm.bookId);
                  if (!book) return null;
                  return (
                    <div
                      key={bm.id}
                      className="p-3 rounded-xl border border-stone-100 dark:border-zinc-800 bg-stone-50/70 dark:bg-zinc-850/70 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <BookmarkIcon size={16} className="text-[#E8636F] fill-[#E8636F] shrink-0" />
                        <div className="min-w-0">
                          <p className="font-semibold text-stone-900 dark:text-zinc-100 truncate">
                            {book.title}
                          </p>
                          <span className="text-stone-400 text-[11px]">
                            {bm.pageNumber}쪽 책갈피 · {bm.createdAt}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            onClose();
                            onOpenReader(book, bm.pageNumber);
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold text-stone-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md hover:bg-stone-50"
                        >
                          이동
                        </button>
                        <button
                          onClick={() => onDeleteBookmark(bm.bookId, bm.pageNumber)}
                          className="p-1 text-stone-400 hover:text-red-500 rounded"
                          title="삭제"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* 3. Notes Tab */}
          {activeTab === 'notes' && (
            <div className="space-y-2.5">
              {userNotes.length === 0 ? (
                <div className="text-center py-16 text-xs text-stone-400">
                  작성한 메모가 없습니다.<br />독서 중 인상 깊은 문장에 메모를 남겨보세요.
                </div>
              ) : (
                userNotes.map(nt => {
                  const book = getBookById(nt.bookId);
                  if (!book) return null;
                  return (
                    <div
                      key={nt.id}
                      className="p-3.5 rounded-xl border border-stone-100 dark:border-zinc-800 bg-stone-50/70 dark:bg-zinc-850/70 space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between text-stone-400 text-[11px]">
                        <span className="font-semibold text-[#E8636F] truncate max-w-[200px]">
                          {book.title} ({nt.pageNumber}쪽)
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              onClose();
                              onOpenReader(book, nt.pageNumber);
                            }}
                            className="text-stone-500 hover:underline"
                          >
                            페이지 이동
                          </button>
                          <button
                            onClick={() => onDeleteNote(nt.id)}
                            className="p-1 text-stone-400 hover:text-red-500"
                            title="삭제"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                      <p className="text-stone-800 dark:text-zinc-200 leading-relaxed font-serif-kr">
                        {nt.content}
                      </p>
                      <div className="text-[10px] text-stone-400">{nt.createdAt}</div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* 4. Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="space-y-2.5">
              {userReviews.length === 0 ? (
                <div className="text-center py-16 text-xs text-stone-400">
                  작성한 서평이 없습니다.<br />책 상세 페이지에서 평점과 서평을 남겨보세요.
                </div>
              ) : (
                userReviews.map(rev => {
                  const book = getBookById(rev.bookId);
                  if (!book) return null;
                  return (
                    <div
                      key={rev.id}
                      className="p-3.5 rounded-xl border border-stone-100 dark:border-zinc-800 bg-stone-50/70 dark:bg-zinc-850/70 space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <h5
                          onClick={() => {
                            onClose();
                            onOpenBookDetail(book);
                          }}
                          className="font-semibold text-stone-900 dark:text-zinc-100 hover:text-[#E8636F] cursor-pointer truncate max-w-[220px]"
                        >
                          {book.title}
                        </h5>
                        <span className="font-mono font-bold text-amber-500">
                          ★ {rev.rating}점
                        </span>
                      </div>
                      <p className="text-stone-700 dark:text-zinc-300 leading-relaxed font-serif-kr">
                        {rev.comment}
                      </p>
                      <span className="text-[10px] text-stone-400">{rev.createdAt}</span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
