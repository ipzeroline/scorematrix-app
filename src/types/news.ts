export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  image: string;
  author: string;
  category: 'analysis' | 'news' | 'feature' | 'tips';
  publishedAt: string;
  tags: string[];
  readTime: number;
}
