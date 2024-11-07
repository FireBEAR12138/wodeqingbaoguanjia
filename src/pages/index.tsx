import { useState, useEffect } from 'react';
import type { Article, ArticleFilter } from '../types/article';
import Sidebar from '../components/Sidebar';
import ArticleList from '../components/ArticleList';
import ArticleFilterPanel from '../components/ArticleFilter';
import AISummaryPanel from '../components/AISummaryPanel';

export default function Home() {
  const [currentPage, setCurrentPage] = useState('all');
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticles, setSelectedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [timeOrder, setTimeOrder] = useState<'asc' | 'desc'>('desc');
  const [filter, setFilter] = useState<ArticleFilter>({});

  useEffect(() => {
    fetchArticles();
  }, [page, timeOrder, filter]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: '10',
        timeOrder,
        ...(filter.startDate && { startDate: filter.startDate.toISOString() }),
        ...(filter.endDate && { endDate: filter.endDate.toISOString() }),
        ...(filter.author && { author: filter.author }),
        ...(filter.source && { source: filter.source }),
        ...(filter.sourceType && { sourceType: filter.sourceType })
      });

      const response = await fetch(`/api/articles?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch articles');
      
      const data = await response.json();
      setArticles(data.articles);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取文章失败');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter: ArticleFilter) => {
    setPage(1); // 重置页码
    setFilter(newFilter);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <main className="flex-1 ml-64">
        <div className="flex">
          <div className="flex-1 p-6">
            <ArticleFilterPanel onFilterChange={handleFilterChange} />
            <ArticleList
              articles={articles}
              loading={loading}
              error={error}
              page={page}
              totalPages={totalPages}
              timeOrder={timeOrder}
              onTimeOrderChange={setTimeOrder}
              onPageChange={setPage}
              onAddToSummary={(article) => {
                if (!selectedArticles.find(a => a.id === article.id)) {
                  setSelectedArticles([...selectedArticles, article]);
                }
              }}
              selectedArticleIds={selectedArticles.map(a => a.id)}
            />
          </div>
          
          <AISummaryPanel
            articles={selectedArticles}
            onArticlesChange={setSelectedArticles}
            onClear={() => setSelectedArticles([])}
          />
        </div>
      </main>
    </div>
  );
} 