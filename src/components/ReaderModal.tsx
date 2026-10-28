import React, { useState, useEffect, useRef } from 'react';
import { Book, Bookmark, Note } from '../types/library';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Bookmark as BookmarkIcon,
  FileText,
  List,
  Grid,
  Sun,
  Moon,
  Coffee,
  Type,
  Maximize2,
  Minimize2,
  Columns,
  Square,
  Plus,
  Trash2,
  Edit2,
  Check,
  ExternalLink
} from 'lucide-react';

interface ReaderModalProps {
  book: Book;
  userId: string;
  userName?: string;
  bookmarks: Bookmark[];
  notes: Note[];
  initialPage?: number;
  onClose: () => void;
  onToggleBookmark: (bookId: string, pageNumber: number, label?: string) => void;
  onSaveNote: (bookId: string, pageNumber: number, content: string, noteId?: string) => void;
  onDeleteNote: (noteId: string) => void;
  onPageChange: (bookId: string, pageNumber: number, totalPages: number) => void;
}

type ReaderTheme = 'light' | 'sepia' | 'dark';
type ViewMode = 'single' | 'double';
type SidebarTab = 'toc' | 'bookmarks' | 'notes' | 'thumbs';

export const ReaderModal: React.FC<ReaderModalProps> = ({
  book,
  userId,
  userName = '독서자',
  bookmarks,
  notes,
  initialPage = 1,
  onClose,
  onToggleBookmark,
  onSaveNote,
  onDeleteNote,
  onPageChange
}) => {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [theme, setTheme] = useState<ReaderTheme>('light');
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [viewMode, setViewMode] = useState<ViewMode>('single');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<SidebarTab>('toc');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [viewOriginalPdf, setViewOriginalPdf] = useState<boolean>(false);

  // Note editor states
  const [isWritingNote, setIsWritingNote] = useState<boolean>(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState<string>('');

  const containerRef = useRef<HTMLDivElement>(null);

  // Notify parent of reading history
  useEffect(() => {
    onPageChange(book.id, currentPage, book.totalPages);
  }, [currentPage, book.id, book.totalPages]);

  // Current page bookmark status
  const currentBookmark = bookmarks.find(
    b => b.userId === userId && b.bookId === book.id && b.pageNumber === currentPage
  );
  const isCurrentBookmarked = Boolean(currentBookmark);

  // Notes on the current page
  const currentPageNotes = notes.filter(
    n => n.userId === userId && n.bookId === book.id && n.pageNumber === currentPage
  );

  // All bookmarks for this book
  const bookBookmarks = bookmarks
    .filter(b => b.userId === userId && b.bookId === book.id)
    .sort((a, b) => a.pageNumber - b.pageNumber);

  // All notes for this book
  const bookNotes = notes
    .filter(n => n.userId === userId && n.bookId === book.id)
    .sort((a, b) => a.pageNumber - b.pageNumber);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isWritingNote) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        goNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        goPrevPage();
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, viewMode, book.totalPages, isWritingNote, isFullscreen]);

  const goNextPage = () => {
    const step = viewMode === 'double' ? 2 : 1;
    setCurrentPage(prev => Math.min(book.totalPages, prev + step));
  };

  const goPrevPage = () => {
    const step = viewMode === 'double' ? 2 : 1;
    setCurrentPage(prev => Math.max(1, prev - step));
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), book.totalPages));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleStartAddNote = () => {
    setEditingNoteId(null);
    setNoteContent('');
    setIsWritingNote(true);
  };

  const handleStartEditNote = (note: Note) => {
    setEditingNoteId(note.id);
    setNoteContent(note.content);
    setIsWritingNote(true);
  };

  const handleSaveNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    onSaveNote(book.id, currentPage, noteContent.trim(), editingNoteId || undefined);
    setIsWritingNote(false);
    setEditingNoteId(null);
    setNoteContent('');
  };

  // Find page data
  const getPageData = (pageNo: number) => {
    return book.pages.find(p => p.pageNumber === pageNo) || {
      pageNumber: pageNo,
      chapterTitle: `제 ${pageNo} 페이지`,
      content: ['이 페이지는 열람 중인 본문 내용입니다.']
    };
  };

  const leftPageData = getPageData(currentPage);
  const rightPageData = viewMode === 'double' && currentPage < book.totalPages ? getPageData(currentPage + 1) : null;

  // Theme styling
  const themeStyles = {
    light: {
      bg: 'bg-[#F9F8F6]',
      pageBg: 'bg-[#FFFFFF]',
      text: 'text-[#2C2A29]',
      mutedText: 'text-[#7A7571]',
      border: 'border-[#EAE7E1]',
      barBg: 'bg-[#FFFFFF]/95',
      activeAccent: 'text-[#E8636F]'
    },
    sepia: {
      bg: 'bg-[#F4ECD8]',
      pageBg: 'bg-[#FDF6E2]',
      text: 'text-[#3E3426]',
      mutedText: 'text-[#82745C]',
      border: 'border-[#E2D6BC]',
      barBg: 'bg-[#EDE3C8]/95',
      activeAccent: 'text-[#C9552C]'
    },
    dark: {
      bg: 'bg-[#18181A]',
      pageBg: 'bg-[#222226]',
      text: 'text-[#E3E3E8]',
      mutedText: 'text-[#92929D]',
      border: 'border-[#323238]',
      barBg: 'bg-[#1F1F23]/95',
      activeAccent: 'text-[#F87171]'
    }
  }[theme];

  const fontSizeClass = {
    sm: 'text-sm leading-relaxed',
    md: 'text-base leading-loose',
    lg: 'text-lg leading-loose',
    xl: 'text-xl leading-loose'
  }[fontSize];

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 flex flex-col ${themeStyles.bg} transition-colors duration-200 select-none overflow-hidden`}
    >
      {/* Top Navigation Bar */}
      <header
        className={`h-14 px-4 flex items-center justify-between border-b ${themeStyles.border} ${themeStyles.barBg} backdrop-blur-md shrink-0`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${
              isSidebarOpen ? themeStyles.activeAccent : themeStyles.mutedText
            }`}
            title="목차 및 서재 도구"
          >
            <List size={20} />
          </button>
          <div className="min-w-0">
            <h2 className={`text-sm font-semibold truncate ${themeStyles.text}`}>
              {book.title}
            </h2>
            <div className="flex items-center gap-2 text-xs truncate">
              <span className={themeStyles.mutedText}>{book.author} · {currentPage} / {book.totalPages} 쪽</span>
              <span className="hidden lg:inline text-[11px] px-1.5 py-0.2 bg-[#E8636F]/10 text-[#E8636F] font-semibold rounded">
                독서자: {userName}
              </span>
            </div>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-1.5 md:gap-3">
          {/* Bookmark Button */}
          <button
            onClick={() => onToggleBookmark(book.id, currentPage)}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              isCurrentBookmarked
                ? 'bg-[#E8636F] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
            title={isCurrentBookmarked ? '책갈피 삭제' : '현재 페이지 책갈피 추가'}
          >
            <BookmarkIcon size={15} className={isCurrentBookmarked ? 'fill-white' : ''} />
            <span className="hidden sm:inline">
              {isCurrentBookmarked ? '책갈피 등록됨' : '책갈피 추가'}
            </span>
          </button>

          {/* Note Button */}
          <button
            onClick={handleStartAddNote}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title="이 페이지에 메모 작성"
          >
            <FileText size={15} />
            <span className="hidden sm:inline">메모 작성</span>
            {currentPageNotes.length > 0 && (
              <span className="w-4 h-4 text-[10px] bg-[#E8636F] text-white rounded-full inline-flex items-center justify-center font-bold">
                {currentPageNotes.length}
              </span>
            )}
          </button>

          {/* PDF Url Mode Switch if PDF uploaded */}
          {book.pdfUrl && (
            <button
              onClick={() => setViewOriginalPdf(!viewOriginalPdf)}
              className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md bg-stone-200/80 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300"
              title="원문 PDF 임베드 뷰어로 전환"
            >
              <ExternalLink size={13} />
              <span>{viewOriginalPdf ? '텍스트 뷰어' : '원본 PDF 뷰'}</span>
            </button>
          )}

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1 hidden sm:block" />

          {/* Single / Double view mode (desktop) */}
          <button
            onClick={() => setViewMode(viewMode === 'single' ? 'double' : 'single')}
            className={`hidden md:flex p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 ${themeStyles.mutedText}`}
            title={viewMode === 'single' ? '양면 보기로 전환' : '단면 보기로 전환'}
          >
            {viewMode === 'single' ? <Columns size={18} /> : <Square size={18} />}
          </button>

          {/* Font Size Selector */}
          <div className="relative group hidden sm:block">
            <button
              className={`p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 ${themeStyles.mutedText}`}
              title="글꼴 크기 조절"
            >
              <Type size={18} />
            </button>
            <div className="absolute right-0 top-full mt-1 hidden group-hover:flex items-center gap-1 p-1 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-slate-200 dark:border-zinc-700 z-50">
              {(['sm', 'md', 'lg', 'xl'] as const).map(size => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`px-2 py-1 text-xs rounded font-medium ${
                    fontSize === size
                      ? 'bg-[#E8636F] text-white'
                      : 'text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700'
                  }`}
                >
                  {size === 'sm' ? '작게' : size === 'md' ? '보통' : size === 'lg' ? '크게' : '특대'}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Selector */}
          <div className="flex items-center bg-black/5 dark:bg-white/5 p-1 rounded-lg">
            <button
              onClick={() => setTheme('light')}
              className={`p-1.5 rounded ${theme === 'light' ? 'bg-white shadow-xs text-amber-500' : 'text-slate-400'}`}
              title="라이트 모드"
            >
              <Sun size={15} />
            </button>
            <button
              onClick={() => setTheme('sepia')}
              className={`p-1.5 rounded ${theme === 'sepia' ? 'bg-[#FDF6E2] shadow-xs text-amber-700' : 'text-slate-400'}`}
              title="세피아 모드"
            >
              <Coffee size={15} />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-1.5 rounded ${theme === 'dark' ? 'bg-zinc-900 shadow-xs text-slate-200' : 'text-slate-400'}`}
              title="다크 모드"
            >
              <Moon size={15} />
            </button>
          </div>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className={`hidden sm:flex p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 ${themeStyles.mutedText}`}
            title="전체화면 토글"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-600 transition-colors"
            title="도서관으로 돌아가기"
          >
            <X size={20} />
          </button>
        </div>
      </header>

      {/* Main Reader Canvas */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Drawer (Table of Contents, Bookmarks, Notes, Thumbs) */}
        {isSidebarOpen && (
          <aside
            className={`w-72 md:w-80 border-r ${themeStyles.border} ${themeStyles.barBg} flex flex-col shrink-0 z-30 transition-all shadow-md`}
          >
            {/* Sidebar Tab Header */}
            <div className="grid grid-cols-4 p-1.5 border-b border-black/5 dark:border-white/5 text-xs font-medium">
              <button
                onClick={() => setActiveTab('toc')}
                className={`py-1.5 text-center rounded transition-colors ${
                  activeTab === 'toc' ? 'bg-[#E8636F] text-white font-semibold' : themeStyles.mutedText
                }`}
              >
                목차
              </button>
              <button
                onClick={() => setActiveTab('bookmarks')}
                className={`py-1.5 text-center rounded transition-colors ${
                  activeTab === 'bookmarks' ? 'bg-[#E8636F] text-white font-semibold' : themeStyles.mutedText
                }`}
              >
                책갈피 ({bookBookmarks.length})
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`py-1.5 text-center rounded transition-colors ${
                  activeTab === 'notes' ? 'bg-[#E8636F] text-white font-semibold' : themeStyles.mutedText
                }`}
              >
                메모 ({bookNotes.length})
              </button>
              <button
                onClick={() => setActiveTab('thumbs')}
                className={`py-1.5 text-center rounded transition-colors ${
                  activeTab === 'thumbs' ? 'bg-[#E8636F] text-white font-semibold' : themeStyles.mutedText
                }`}
              >
                썸네일
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {activeTab === 'toc' && (
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold px-2 py-1 text-slate-400">목차 목록</h4>
                  {book.tableOfContents.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => goToPage(item.page)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        currentPage === item.page
                          ? 'bg-[#E8636F]/10 text-[#E8636F] font-semibold'
                          : 'hover:bg-black/5 dark:hover:bg-white/5 ' + themeStyles.text
                      }`}
                    >
                      <span className="truncate pr-2">{item.title}</span>
                      <span className="text-[11px] opacity-60 tabular-nums shrink-0">{item.page}p</span>
                    </button>
                  ))}
                </div>
              )}

              {activeTab === 'bookmarks' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-2">
                    <h4 className="text-xs font-semibold text-slate-400">저장된 책갈피</h4>
                    <span className="text-[11px] text-slate-400">{bookBookmarks.length}개</span>
                  </div>
                  {bookBookmarks.length === 0 ? (
                    <div className="text-center py-10 px-4 text-xs text-slate-400">
                      저장된 책갈피가 없습니다.<br />상단의 '책갈피 추가'를 눌러 페이지를 저장하세요.
                    </div>
                  ) : (
                    bookBookmarks.map(bm => (
                      <div
                        key={bm.id}
                        className={`p-2.5 rounded-lg border border-black/5 dark:border-white/5 text-xs flex items-center justify-between hover:border-[#E8636F]/50 transition-colors ${
                          currentPage === bm.pageNumber ? 'bg-[#E8636F]/10' : ''
                        }`}
                      >
                        <button
                          onClick={() => goToPage(bm.pageNumber)}
                          className="flex-1 text-left flex items-center gap-2"
                        >
                          <BookmarkIcon size={14} className="text-[#E8636F] fill-[#E8636F] shrink-0" />
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-zinc-200">
                              {bm.pageNumber} 쪽
                            </span>
                            <p className="text-[11px] text-slate-400 truncate max-w-[140px]">
                              {getPageData(bm.pageNumber).chapterTitle || '페이지 책갈피'}
                            </p>
                          </div>
                        </button>
                        <button
                          onClick={() => onToggleBookmark(book.id, bm.pageNumber)}
                          className="p-1 text-slate-400 hover:text-red-500 rounded"
                          title="책갈피 삭제"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-2">
                    <h4 className="text-xs font-semibold text-slate-400">내 독서 메모</h4>
                    <button
                      onClick={handleStartAddNote}
                      className="text-xs text-[#E8636F] hover:underline flex items-center gap-0.5"
                    >
                      <Plus size={12} /> 추가
                    </button>
                  </div>
                  {bookNotes.length === 0 ? (
                    <div className="text-center py-10 px-4 text-xs text-slate-400">
                      작성된 메모가 없습니다.<br />중요한 구절이나 생각을 기록해 보세요.
                    </div>
                  ) : (
                    bookNotes.map(nt => (
                      <div
                        key={nt.id}
                        className="p-2.5 rounded-lg border border-black/5 dark:border-white/5 bg-black/2 dark:bg-white/2 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-slate-400 text-[11px]">
                          <button
                            onClick={() => goToPage(nt.pageNumber)}
                            className="font-semibold text-[#E8636F] hover:underline"
                          >
                            {nt.pageNumber} 쪽 메모
                          </button>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                goToPage(nt.pageNumber);
                                handleStartEditNote(nt);
                              }}
                              className="p-1 hover:text-slate-600 dark:hover:text-zinc-200"
                              title="수정"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={() => onDeleteNote(nt.id)}
                              className="p-1 hover:text-red-500"
                              title="삭제"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                        <p className={`whitespace-pre-wrap leading-relaxed ${themeStyles.text}`}>
                          {nt.content}
                        </p>
                        <div className="text-[10px] text-slate-400">
                          {nt.updatedAt ? `${nt.updatedAt} (수정됨)` : nt.createdAt}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'thumbs' && (
                <div className="grid grid-cols-2 gap-2">
                  {book.pages.map(p => (
                    <button
                      key={p.pageNumber}
                      onClick={() => goToPage(p.pageNumber)}
                      className={`p-2 rounded border text-center transition-all ${
                        currentPage === p.pageNumber
                          ? 'border-[#E8636F] bg-[#E8636F]/10 ring-1 ring-[#E8636F]'
                          : 'border-black/10 dark:border-white/10 hover:border-black/30'
                      }`}
                    >
                      <div className="h-16 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex flex-col justify-center items-center p-1 rounded">
                        <span className="text-[10px] font-semibold text-slate-400">p.{p.pageNumber}</span>
                        <span className="text-[9px] text-slate-500 truncate w-full px-1">
                          {p.chapterTitle || `${p.pageNumber}쪽`}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Central Book Reader Viewport */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {viewOriginalPdf && book.pdfUrl ? (
            <div className="flex-1 w-full h-full bg-stone-900">
              <iframe
                src={book.pdfUrl}
                title={book.title}
                className="w-full h-full border-0"
              />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto flex items-center justify-center p-3 sm:p-6 md:p-10">
              <div
                className={`w-full max-w-5xl transition-all ${
                  viewMode === 'double' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'max-w-2xl'
                }`}
              >
                {/* Left Page (or Single Page) */}
                <div
                  className={`p-6 sm:p-10 rounded-xl shadow-lg border ${themeStyles.border} ${themeStyles.pageBg} min-h-[560px] flex flex-col justify-between relative`}
                >
                  {/* Real Bookmark Ribbon on Page */}
                  <button
                    onClick={() => onToggleBookmark(book.id, currentPage)}
                    className={`absolute -top-1.5 right-6 w-6.5 transition-all duration-200 z-10 flex flex-col items-center cursor-pointer ${
                      isCurrentBookmarked ? 'h-12 opacity-100 shadow-md' : 'h-6 opacity-35 hover:opacity-80'
                    }`}
                    title={isCurrentBookmarked ? '이 페이지 책갈피 해제' : '이 페이지에 책갈피 꽂기'}
                  >
                    <div className={`w-full flex-1 ${isCurrentBookmarked ? 'bg-[#E8636F]' : 'bg-slate-400 dark:bg-zinc-500'} rounded-t-xs`} />
                    <div
                      className="w-0 h-0 border-x-[13px] border-x-transparent border-t-[8px]"
                      style={{ borderTopColor: isCurrentBookmarked ? '#E8636F' : '#64748b' }}
                    />
                  </button>

                  {/* Top Header of Page */}
                  <div className="flex items-center justify-between border-b pb-3 mb-6 border-black/5 dark:border-white/5 text-xs text-slate-400 pr-10">
                    <span className="font-serif-kr font-medium truncate max-w-[200px]">
                      {leftPageData.chapterTitle || book.title}
                    </span>
                    <span className="tabular-nums font-mono">{leftPageData.pageNumber} 쪽</span>
                  </div>

                  {/* Body Text Content */}
                  <div className="flex-1 space-y-5">
                    {leftPageData.subtitle && (
                      <h3 className="font-serif-kr text-lg sm:text-xl font-bold tracking-tight text-[#E8636F]">
                        {leftPageData.subtitle}
                      </h3>
                    )}

                    {leftPageData.quote && (
                      <div className="p-4 my-3 bg-black/3 dark:bg-white/3 rounded-lg border-l-2 border-[#E8636F] italic text-sm text-slate-600 dark:text-zinc-300 font-serif-kr">
                        "{leftPageData.quote}"
                      </div>
                    )}

                    <div className={`space-y-4 font-serif-kr ${fontSizeClass} ${themeStyles.text}`}>
                      {leftPageData.content.map((paragraph, pIdx) => (
                        <p key={pIdx} className="indent-4 text-justify">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Page Note Cards & Quick Add */}
                  <div className="mt-8 pt-4 border-t border-black/5 dark:border-white/5 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-stone-700 dark:text-zinc-300 flex items-center gap-1.5">
                        <FileText size={14} className="text-[#E8636F]" />
                        <span>{currentPage}쪽 독서 메모 ({currentPageNotes.length})</span>
                      </span>
                      <button
                        onClick={handleStartAddNote}
                        className="text-xs font-semibold text-[#E8636F] hover:underline flex items-center gap-1"
                      >
                        <Plus size={13} />
                        <span>새 메모 남기기</span>
                      </button>
                    </div>

                    {currentPageNotes.length > 0 && (
                      <div className="space-y-2">
                        {currentPageNotes.map(nt => (
                          <div
                            key={nt.id}
                            className="p-3 bg-amber-50/60 dark:bg-zinc-800/80 border border-amber-200/50 dark:border-zinc-700 rounded-lg text-xs space-y-1.5 shadow-2xs"
                          >
                            <div className="flex items-center justify-between text-[11px] text-stone-400">
                              <span className="font-medium text-stone-600 dark:text-zinc-300">
                                {userName} 님의 기록 · {nt.updatedAt ? `${nt.updatedAt} (수정)` : nt.createdAt}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleStartEditNote(nt)}
                                  className="p-1 hover:text-stone-800 dark:hover:text-zinc-100"
                                  title="메모 수정"
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button
                                  onClick={() => onDeleteNote(nt.id)}
                                  className="p-1 hover:text-red-500"
                                  title="메모 삭제"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                            <p className="text-stone-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed font-serif-kr">
                              {nt.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Page (Double View Mode) */}
                {viewMode === 'double' && rightPageData && (
                  <div
                    className={`hidden md:flex p-6 sm:p-10 rounded-xl shadow-lg border ${themeStyles.border} ${themeStyles.pageBg} min-h-[560px] flex-col justify-between relative`}
                  >
                    <div className="flex items-center justify-between border-b pb-3 mb-6 border-black/5 dark:border-white/5 text-xs text-slate-400">
                      <span className="font-serif-kr font-medium truncate max-w-[200px]">
                        {rightPageData.chapterTitle || book.title}
                      </span>
                      <span className="tabular-nums font-mono">{rightPageData.pageNumber} 쪽</span>
                    </div>

                    <div className="flex-1 space-y-5">
                      {rightPageData.subtitle && (
                        <h3 className="font-serif-kr text-lg sm:text-xl font-bold tracking-tight text-[#E8636F]">
                          {rightPageData.subtitle}
                        </h3>
                      )}

                      {rightPageData.quote && (
                        <div className="p-4 my-3 bg-black/3 dark:bg-white/3 rounded-lg border-l-2 border-[#E8636F] italic text-sm text-slate-600 dark:text-zinc-300 font-serif-kr">
                          "{rightPageData.quote}"
                        </div>
                      )}

                      <div className={`space-y-4 font-serif-kr ${fontSizeClass} ${themeStyles.text}`}>
                        {rightPageData.content.map((paragraph, pIdx) => (
                          <p key={pIdx} className="indent-4 text-justify">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 text-right text-xs text-slate-400">
                      {rightPageData.pageNumber} / {book.totalPages}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Floating Navigation Buttons on Left & Right */}
          <button
            onClick={goPrevPage}
            disabled={currentPage <= 1}
            className={`absolute left-2 top-1/2 -translate-y-1/2 p-2.5 sm:p-3.5 rounded-full shadow-lg ${
              currentPage <= 1
                ? 'opacity-30 cursor-not-allowed bg-black/10'
                : 'bg-white/90 dark:bg-zinc-800/90 hover:scale-105 active:scale-95 text-slate-800 dark:text-zinc-100 hover:bg-white'
            } transition-all z-20 backdrop-blur-xs`}
            title="이전 페이지 (← 키)"
          >
            <ChevronLeft size={22} />
          </button>

          <button
            onClick={goNextPage}
            disabled={currentPage >= book.totalPages}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2.5 sm:p-3.5 rounded-full shadow-lg ${
              currentPage >= book.totalPages
                ? 'opacity-30 cursor-not-allowed bg-black/10'
                : 'bg-white/90 dark:bg-zinc-800/90 hover:scale-105 active:scale-95 text-slate-800 dark:text-zinc-100 hover:bg-white'
            } transition-all z-20 backdrop-blur-xs`}
            title="다음 페이지 (→ 키)"
          >
            <ChevronRight size={22} />
          </button>
        </div>
      </div>

      {/* Note Writing Floating Modal */}
      {isWritingNote && (
        <div className="fixed inset-0 z-60 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveNoteSubmit}
            className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-slate-200 dark:border-zinc-800 p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-slate-800 dark:text-zinc-100 font-semibold text-sm">
                <FileText size={16} className="text-[#E8636F]" />
                <span>{currentPage}쪽 독서 메모 {editingNoteId ? '수정' : '작성'}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsWritingNote(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <X size={16} />
              </button>
            </div>

            <textarea
              autoFocus
              rows={4}
              value={noteContent}
              onChange={e => setNoteContent(e.target.value)}
              placeholder="이 페이지를 읽고 느낀 점, 기억하고 싶은 구절이나 아이디어를 기록하세요..."
              className="w-full p-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#E8636F] resize-none text-slate-900 dark:text-zinc-100"
            />

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsWritingNote(false)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-md"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#E8636F] hover:bg-[#D94F5C] rounded-md flex items-center gap-1 shadow-xs"
              >
                <Check size={14} />
                <span>저장하기</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bottom Progress & Slider Bar */}
      <footer
        className={`h-12 px-6 flex items-center justify-between border-t ${themeStyles.border} ${themeStyles.barBg} shrink-0 text-xs`}
      >
        <div className="flex items-center gap-3">
          <span className="font-mono tabular-nums font-semibold text-slate-600 dark:text-zinc-300">
            {currentPage} / {book.totalPages}
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            ({Math.round((currentPage / book.totalPages) * 100)}% 열람)
          </span>
        </div>

        {/* Page Slider */}
        <div className="flex-1 max-w-md mx-4">
          <input
            type="range"
            min={1}
            max={book.totalPages}
            value={currentPage}
            onChange={e => goToPage(Number(e.target.value))}
            className="w-full accent-[#E8636F] cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => goToPage(1)}
            disabled={currentPage <= 1}
            className="px-2 py-1 text-[11px] rounded hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 disabled:opacity-40"
          >
            처음으로
          </button>
          <button
            onClick={() => goToPage(book.totalPages)}
            disabled={currentPage >= book.totalPages}
            className="px-2 py-1 text-[11px] rounded hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 disabled:opacity-40"
          >
            끝으로
          </button>
        </div>
      </footer>
    </div>
  );
};
