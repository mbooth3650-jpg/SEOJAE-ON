export interface BookPage {
  pageNumber: number;
  chapterTitle?: string;
  subtitle?: string;
  content: string[];
  quote?: string;
  image?: string;
}

export interface TableOfContentItem {
  title: string;
  page: number;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  category: '소설/문학' | '인문/철학' | '과학/기술' | '경제/경영' | '자기계발' | '예술/디자인';
  coverImage: string;
  description: string;
  publisher: string;
  publicationYear: number;
  totalPages: number;
  tableOfContents: TableOfContentItem[];
  pages: BookPage[];
  pdfUrl?: string; // If user uploaded a real PDF
  tags: string[];
  rating: number;
  reviewCount: number;
  viewsCount: number;
  isCustomUpload?: boolean;
}

export interface Bookmark {
  id: string;
  userId: string;
  bookId: string;
  pageNumber: number;
  createdAt: string;
  label?: string;
}

export interface Note {
  id: string;
  userId: string;
  bookId: string;
  pageNumber: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  bookId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ReadingHistory {
  userId: string;
  bookId: string;
  category: string;
  lastPage: number;
  totalPages: number;
  viewedAt: string;
  readCount: number;
}

export interface SearchHistory {
  keyword: string;
  searchedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  role: string;
  avatarColor: string;
}

export interface RecommendationItem {
  book: Book;
  reason: string;
  score: number;
}
