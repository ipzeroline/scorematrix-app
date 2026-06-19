export interface NewsArticle {
  id: string;
  slug: string;
  title: string | Record<string, string>;
  summary: string | Record<string, string>;
  content: string | Record<string, string>;
  image: string;
  author: string;
  category: 'analysis' | 'news' | 'feature' | 'tips';
  publishedAt: string;
  tags: string[];
  readTime: number;
  keywords?: string[];
  viewCount?: number;
  updatedAt?: string | null;
}
