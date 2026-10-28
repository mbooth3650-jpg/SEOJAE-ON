import React, { useState } from 'react';
import { Book, Review } from '../types/library';
import {
  X,
  Star,
  BookOpen,
  Calendar,
  Building,
  Bookmark as BookmarkIcon,
  MessageSquare,
  Edit2,
  Trash2,
  Check,
  Share2,
  Eye
} from 'lucide-react';

interface BookDetailModalProps {
  book: Book;
  userId: string;
  userName: string;
  reviews: Review[];
  isBookmarkedInLibrary: boolean;
  onClose: () => void;
  onOpenReader: (book: Book) => void;
  onToggleLibraryBookmark: (bookId: string) => void;
  onAddReview: (bookId: string, rating: number, comment: string) => void;
  onUpdateReview: (reviewId: string, rating: number, comment: string) => void;
  onDeleteReview: (reviewId: string) => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  userId,
  userName,
  reviews,
  isBookmarkedInLibrary,
  onClose,
  onOpenReader,
  onToggleLibraryBookmark,
  onAddReview,
  onUpdateReview,
  onDeleteReview
}) => {
  // New review state
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');
  const [hoverRating, setHoverRating] = useState<number>(0);

  // Edit review state
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState<number>(5);
  const [editComment, setEditComment] = useState<string>('');

  // Reviews for this specific book
  const bookReviews = reviews.filter(r => r.bookId === book.id);
  const averageRating = bookReviews.length > 0
    ? Number((bookReviews.reduce((acc, curr) => acc + curr.rating, 0) / bookReviews.length).toFixed(1))
    : book.rating;

  // Star breakdown
  const ratingCounts = [5, 4, 3, 2, 1].map(star => {
    const count = bookReviews.filter(r => Math.round(r.rating) === star).length;
    const percentage = bookReviews.length > 0 ? (count / bookReviews.length) * 100 : 0;
    return { star, count, percentage };
  });

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onAddReview(book.id, newRating, newComment.trim());
    setNewComment('');
    setNewRating(5);
  };

  const handleStartEdit = (review: Review) => {
    setEditingReviewId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editComment.trim() || !editingReviewId) return;
    onUpdateReview(editingReviewId, editRating, editComment.trim());
    setEditingReviewId(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden border border-stone-200 dark:border-zinc-800 my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-100 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-stone-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span>{book.category}</span>
            <span>·</span>
            <span>{book.publisher}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          {/* Top Hero Section: Book Cover + Meta */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
            {/* Book Cover */}
            <div className="md:col-span-4 flex justify-center">
              <div className="w-52 md:w-full max-w-[240px] aspect-3/4 rounded-xl overflow-hidden shadow-xl ring-1 ring-black/10 relative group">
                <img
                  src={book.coverImage}
                  alt={book.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {book.isCustomUpload && (
                  <span className="absolute top-2 right-2 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-xs font-medium">
                    사용자 업로드
                  </span>
                )}
              </div>
            </div>

            {/* Book Metadata & Actions */}
            <div className="md:col-span-8 space-y-4">
              <div>
                <span className="text-xs font-semibold text-[#E8636F] tracking-wide">
                  {book.category}
                </span>
                <h1 className="font-serif-kr text-2xl md:text-3xl font-bold text-stone-900 dark:text-zinc-100 mt-1 leading-snug">
                  {book.title}
                </h1>
                <p className="text-sm font-medium text-stone-600 dark:text-zinc-400 mt-1">
                  {book.author} 저
                </p>
              </div>

              {/* Rating & Stats Strip */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 dark:text-zinc-400 py-2 border-y border-stone-100 dark:border-zinc-800">
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center text-amber-400">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        size={15}
                        className={
                          star <= Math.round(averageRating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-300 dark:text-zinc-700'
                        }
                      />
                    ))}
                  </div>
                  <span className="font-bold text-stone-900 dark:text-zinc-100 text-sm">
                    {averageRating}
                  </span>
                  <span>({bookReviews.length}개의 독자 서평)</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-1">
                  <Eye size={14} />
                  <span>{book.viewsCount}회 열람</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-1">
                  <BookOpen size={14} />
                  <span>총 {book.totalPages}쪽</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-stone-700 dark:text-zinc-300 leading-relaxed font-serif-kr">
                {book.description}
              </p>

              {/* Meta details list */}
              <div className="grid grid-cols-2 gap-3 text-xs text-stone-500 dark:text-zinc-400 pt-1">
                <div className="flex items-center gap-1.5">
                  <Building size={14} className="text-stone-400" />
                  <span>출판사: {book.publisher}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-stone-400" />
                  <span>출간연도: {book.publicationYear}년</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {book.tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="text-xs text-stone-600 dark:text-zinc-400 bg-stone-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  onClick={() => onOpenReader(book)}
                  className="flex-1 sm:flex-initial px-6 py-3 bg-[#E8636F] hover:bg-[#D94F5C] text-white font-medium text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <BookOpen size={18} />
                  <span>지금 PDF 열람하기</span>
                </button>
                <button
                  onClick={() => onToggleLibraryBookmark(book.id)}
                  className={`px-4 py-3 border text-xs font-medium rounded-xl flex items-center gap-2 transition-colors ${
                    isBookmarkedInLibrary
                      ? 'border-[#E8636F] text-[#E8636F] bg-[#E8636F]/5'
                      : 'border-stone-200 dark:border-zinc-700 text-stone-600 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <BookmarkIcon size={16} className={isBookmarkedInLibrary ? 'fill-[#E8636F]' : ''} />
                  <span>{isBookmarkedInLibrary ? '내 서재 보관됨' : '내 서재에 담기'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Table of Contents Section */}
          <div className="pt-6 border-t border-stone-100 dark:border-zinc-800">
            <h3 className="font-serif-kr text-base font-bold text-stone-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
              <BookOpen size={16} className="text-[#E8636F]" />
              <span>도서 목차 (Table of Contents)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {book.tableOfContents.map((toc, index) => (
                <div
                  key={index}
                  className="p-3 bg-stone-50 dark:bg-zinc-850 rounded-lg flex items-center justify-between border border-stone-100 dark:border-zinc-800 text-stone-700 dark:text-zinc-300"
                >
                  <span className="truncate pr-2 font-medium">{toc.title}</span>
                  <span className="font-mono text-stone-400 tabular-nums shrink-0">{toc.page}쪽</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews & Ratings Section */}
          <div className="pt-6 border-t border-stone-100 dark:border-zinc-800 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-serif-kr text-lg font-bold text-stone-900 dark:text-zinc-100 flex items-center gap-2">
                <MessageSquare size={18} className="text-[#E8636F]" />
                <span>독자 평점 및 서평 ({bookReviews.length})</span>
              </h3>
            </div>

            {/* Rating Summary Bar Breakdown */}
            <div className="p-5 bg-stone-50 dark:bg-zinc-850 rounded-xl border border-stone-100 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-4 text-center md:border-r border-stone-200 dark:border-zinc-700 md:pr-6">
                <div className="font-serif-kr text-4xl font-bold text-stone-900 dark:text-zinc-100">
                  {averageRating}
                </div>
                <div className="flex items-center justify-center text-amber-400 my-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      size={16}
                      className={star <= Math.round(averageRating) ? 'fill-amber-400' : 'text-stone-300 dark:text-zinc-700'}
                    />
                  ))}
                </div>
                <p className="text-xs text-stone-500">전체 {bookReviews.length}명 참여</p>
              </div>

              {/* 5-to-1 Star Distribution */}
              <div className="md:col-span-8 space-y-1.5">
                {ratingCounts.map(item => (
                  <div key={item.star} className="flex items-center gap-2 text-xs">
                    <span className="w-8 text-stone-600 dark:text-zinc-400 font-medium">
                      {item.star}점
                    </span>
                    <div className="flex-1 h-2 bg-stone-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-300"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-right font-mono text-stone-400 tabular-nums">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Write New Review Form */}
            <form
              onSubmit={handleSubmitReview}
              className="p-5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4 shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-semibold text-stone-700 dark:text-zinc-300">
                  {userName} 님의 평점 선택:
                </span>
                {/* Interactive Star Picker */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 focus:outline-hidden text-amber-400 transition-transform hover:scale-110"
                      title={`${star}점`}
                    >
                      <Star
                        size={20}
                        className={
                          star <= (hoverRating || newRating)
                            ? 'fill-amber-400'
                            : 'text-stone-300 dark:text-zinc-700'
                        }
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-500 ml-1.5 font-mono">
                    {hoverRating || newRating}점
                  </span>
                </div>
              </div>

              <textarea
                rows={3}
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="책을 읽고 느낀 점이나 유익했던 점을 자유롭게 남겨주세요 (다른 독자들에게 큰 도움이 됩니다)"
                className="w-full p-3 text-xs sm:text-sm rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-[#E8636F] resize-none text-stone-900 dark:text-zinc-100"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#E8636F] hover:bg-[#D94F5C] disabled:opacity-40 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Check size={14} />
                  <span>서평 등록하기</span>
                </button>
              </div>
            </form>

            {/* Reviews List */}
            <div className="space-y-3">
              {bookReviews.length === 0 ? (
                <div className="text-center py-8 text-xs text-stone-400">
                  아직 등록된 서평이 없습니다. 첫 번째 서평의 주인공이 되어보세요!
                </div>
              ) : (
                bookReviews.map(rev => {
                  const isMyReview = rev.userId === userId;
                  const isCurrentlyEditing = editingReviewId === rev.id;

                  return (
                    <div
                      key={rev.id}
                      className="p-4 rounded-xl border border-stone-100 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-850/50 space-y-2.5 transition-colors"
                    >
                      {/* Review Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-stone-800 dark:text-zinc-200">
                            {rev.userName}
                          </span>
                          {isMyReview && (
                            <span className="text-[10px] text-[#E8636F] font-semibold bg-[#E8636F]/10 px-1.5 py-0.5 rounded">
                              내 서평
                            </span>
                          )}
                          <div className="flex items-center text-amber-400 ml-1">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star
                                key={star}
                                size={12}
                                className={
                                  star <= rev.rating
                                    ? 'fill-amber-400'
                                    : 'text-stone-300 dark:text-zinc-700'
                                }
                              />
                            ))}
                          </div>
                        </div>

                        {/* Edit / Delete actions for own reviews */}
                        {isMyReview && !isCurrentlyEditing && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleStartEdit(rev)}
                              className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 text-xs flex items-center gap-0.5"
                              title="서평 수정"
                            >
                              <Edit2 size={12} />
                              <span className="text-[11px]">수정</span>
                            </button>
                            <button
                              onClick={() => onDeleteReview(rev.id)}
                              className="p-1 text-stone-400 hover:text-red-500 text-xs flex items-center gap-0.5 ml-1"
                              title="서평 삭제"
                            >
                              <Trash2 size={12} />
                              <span className="text-[11px]">삭제</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Content or Edit Form */}
                      {isCurrentlyEditing ? (
                        <form onSubmit={handleSaveEdit} className="space-y-3 pt-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-stone-500">평점 수정:</span>
                            <div className="flex items-center gap-1 text-amber-400">
                              {[1, 2, 3, 4, 5].map(star => (
                                <button
                                  type="button"
                                  key={star}
                                  onClick={() => setEditRating(star)}
                                  className="p-0.5"
                                >
                                  <Star
                                    size={16}
                                    className={star <= editRating ? 'fill-amber-400' : 'text-stone-300'}
                                  />
                                </button>
                              ))}
                              <span className="text-xs font-mono font-bold text-amber-500 ml-1">
                                {editRating}점
                              </span>
                            </div>
                          </div>

                          <textarea
                            rows={3}
                            value={editComment}
                            onChange={e => setEditComment(e.target.value)}
                            className="w-full p-2.5 text-xs rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 resize-none"
                          />

                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingReviewId(null)}
                              className="px-3 py-1 text-xs text-stone-500 hover:bg-stone-200/50 rounded"
                            >
                              취소
                            </button>
                            <button
                              type="submit"
                              className="px-3.5 py-1 text-xs font-semibold text-white bg-[#E8636F] hover:bg-[#D94F5C] rounded"
                            >
                              수정 완료
                            </button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <p className="text-xs sm:text-sm text-stone-700 dark:text-zinc-300 leading-relaxed font-serif-kr">
                            {rev.comment}
                          </p>
                          <div className="text-[10px] text-stone-400">
                            {rev.updatedAt ? `${rev.updatedAt} (수정됨)` : rev.createdAt}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
