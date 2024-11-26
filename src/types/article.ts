export type ArticleFilter = {
  startDate?: Date | null;
  endDate?: Date | null;
  categories?: string[];
  sources?: string[];
  sourceTypes?: string[];
}

export type Article = {
  id: number;
  title: string;
  link: string;
  description: string;
  ai_summary: string;
  pub_date: string;
  source_name: string;
  source_type: string;
  category: string;
}

// 为 RSS Parser 添加类型
export type RSSItem = {
  title: string;
  link: string;
  content?: string;
  description?: string;
  pubDate?: string;
  author?: string;
} 