export interface Article {
  id: number;
  title: string;
  link: string;
  description: string;
  ai_summary: string;
  pub_date: string;
  author: string;
  source_name: string;
  source_type: string;
}

export interface ArticleFilter {
  startDate?: Date;
  endDate?: Date;
  author?: string;
  source?: string;
  sourceType?: string;
} 