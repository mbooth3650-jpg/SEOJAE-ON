import React, { useState } from 'react';
import { Book } from '../types/library';
import { Upload, X, FileText, CheckCircle2 } from 'lucide-react';

interface UploadPdfModalProps {
  onClose: () => void;
  onAddCustomBook: (book: Book) => void;
}

export const UploadPdfModal: React.FC<UploadPdfModalProps> = ({
  onClose,
  onAddCustomBook
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState<string>('');
  const [author, setAuthor] = useState<string>('');
  const [category, setCategory] = useState<Book['category']>('인문/철학');
  const [description, setDescription] = useState<string>('');
  const [publisher, setPublisher] = useState<string>('개인 소장 자료');
  const [estimatedPages, setEstimatedPages] = useState<number>(10);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleFileChange = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.endsWith('.pdf')) {
      alert('PDF 파일(.pdf)만 업로드 가능합니다.');
      return;
    }
    setFile(selectedFile);
    // Auto populate title from file name
    const cleanName = selectedFile.name.replace(/\.[^/.]+$/, '');
    if (!title) {
      setTitle(cleanName);
    }
    if (!author) {
      setAuthor('소장자 (User)');
    }
    if (!description) {
      setDescription(`사용자가 직접 업로드한 PDF 도서 '${cleanName}' 입니다.`);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let pdfBlobUrl: string | undefined = undefined;
    if (file) {
      pdfBlobUrl = URL.createObjectURL(file);
    }

    // Generate sample synthetic pages for reading mode if needed
    const pagesCount = Math.max(3, estimatedPages);
    const pages = Array.from({ length: pagesCount }, (_, i) => ({
      pageNumber: i + 1,
      chapterTitle: `제 ${i + 1} 장: ${title}`,
      subtitle: `${title} - ${i + 1}번째 페이지`,
      content: [
        `본 도서는 사용자가 서재온에 등록한 PDF 책 '${title}'의 내용입니다.`,
        `페이지 상단의 '원본 PDF 뷰' 버튼을 클릭하시면 첨부된 원본 PDF 파일 전체를 즉시 임베드 뷰어로 확인하실 수 있습니다.`,
        `원하시는 페이지에 책갈피를 추가하거나 메모를 남겨 나만의 디지털 서재를 완성해 보세요.`
      ]
    }));

    const newBook: Book = {
      id: `custom-book-${Date.now()}`,
      title: title.trim(),
      author: author.trim() || '소장자',
      category,
      coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800', // fallback or generated
      description: description.trim() || '사용자 소장 도서',
      publisher: publisher.trim() || '서재온 개인 컬렉션',
      publicationYear: new Date().getFullYear(),
      totalPages: pagesCount,
      tableOfContents: [
        { title: `${title} 시작하기`, page: 1 },
        { title: '핵심 내용 및 본문', page: 2 },
        { title: '마무리 및 결론', page: pagesCount }
      ],
      pages,
      pdfUrl: pdfBlobUrl,
      tags: ['소장도서', category, 'PDF열람'],
      rating: 5.0,
      reviewCount: 1,
      viewsCount: 1,
      isCustomUpload: true
    };

    onAddCustomBook(newBook);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-zinc-800 p-6 md:p-8 space-y-5 my-auto">
        <div className="flex items-center justify-between border-b pb-4 border-stone-100 dark:border-zinc-800">
          <div>
            <h2 className="font-serif-kr text-lg md:text-xl font-bold text-stone-900 dark:text-zinc-100">
              PDF 책자 추가 및 온라인 등록
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              소장하고 계신 PDF 파일을 서재온에 등록하여 언제든 열람하고 메모를 작성하세요.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Drag & Drop Box */}
          <div
            onDragOver={e => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-[#E8636F] bg-[#E8636F]/5'
                : 'border-stone-200 dark:border-zinc-700 hover:border-stone-400 bg-stone-50 dark:bg-zinc-850'
            }`}
          >
            <input
              type="file"
              accept=".pdf"
              id="pdf-file-input"
              className="hidden"
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />
            <label htmlFor="pdf-file-input" className="cursor-pointer block">
              {file ? (
                <div className="flex flex-col items-center gap-2 text-[#E8636F]">
                  <CheckCircle2 size={32} />
                  <span className="text-sm font-semibold text-stone-900 dark:text-zinc-100 truncate max-w-xs">
                    {file.name}
                  </span>
                  <span className="text-xs text-stone-500">
                    ({(file.size / (1024 * 1024)).toFixed(2)} MB) · 파일이 준비되었습니다
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-stone-400">
                  <Upload size={32} className="text-[#E8636F]" />
                  <p className="text-sm font-medium text-stone-700 dark:text-zinc-300">
                    PDF 파일을 끌어다 놓거나 클릭하여 선택
                  </p>
                  <p className="text-xs text-stone-400">
                    PDF 파일(.pdf)을 선택하시면 즉시 온라인 리더와 연동됩니다
                  </p>
                </div>
              )}
            </label>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1 sm:col-span-2">
              <label className="font-semibold text-stone-700 dark:text-zinc-300">
                도서명 (제목) *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="예: 인공지능 윤리 가이드라인"
                className="w-full p-2.5 rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-stone-900 dark:text-zinc-100"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700 dark:text-zinc-300">
                저자 (작성자)
              </label>
              <input
                type="text"
                value={author}
                onChange={e => setAuthor(e.target.value)}
                placeholder="예: 홍길동 연구원"
                className="w-full p-2.5 rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-stone-900 dark:text-zinc-100"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700 dark:text-zinc-300">
                카테고리 분류 *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as Book['category'])}
                className="w-full p-2.5 rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-stone-900 dark:text-zinc-100"
              >
                <option value="소설/문학">소설/문학</option>
                <option value="인문/철학">인문/철학</option>
                <option value="과학/기술">과학/기술</option>
                <option value="경제/경영">경제/경영</option>
                <option value="자기계발">자기계발</option>
                <option value="예술/디자인">예술/디자인</option>
              </select>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="font-semibold text-stone-700 dark:text-zinc-300">
                책 간단 설명
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="도서의 주요 내용 및 소개를 적어주세요..."
                className="w-full p-2.5 rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-stone-600 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-lg"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#E8636F] hover:bg-[#D94F5C] disabled:opacity-40 rounded-lg shadow-sm"
            >
              온라인 도서관에 등록
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
