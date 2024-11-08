import { useState, useEffect } from 'react';
import type { Article } from '../types/article';
import Sidebar from '../components/Sidebar';
import ArticleList from '../components/ArticleList';
import RSSManager from '../components/RSSManager';
import AISummaryPanel from '../components/AISummaryPanel';

export default function Home() {
  const [currentPage, setCurrentPage] = useState('all');
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticles, setSelectedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [timeOrder, setTimeOrder] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState<{
    startDate?: Date | null;
    endDate?: Date | null;
    authors?: string[];
    sources?: string[];
    sourceTypes?: string[];
  }>({});

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '10',
        timeOrder
      });

      if (filters.startDate) {
        params.append('startDate', filters.startDate.toISOString());
      }
      if (filters.endDate) {
        params.append('endDate', filters.endDate.toISOString());
      }
      if (filters.authors?.length) {
        params.append('authors', filters.authors.join(','));
      }
      if (filters.sources?.length) {
        params.append('sources', filters.sources.join(','));
      }
      if (filters.sourceTypes?.length) {
        params.append('sourceTypes', filters.sourceTypes.join(','));
      }

      const response = await fetch(`/api/articles?${params}`);
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

  useEffect(() => {
    if (currentPage === 'all') {
      fetchArticles();
    }
  }, [currentPage, page, timeOrder, filters]);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPage(1);
  };
  
  return (
    <div className="flex min-h-screen max-h-screen overflow-hidden bg-gray-100">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <main className="flex-1 ml-64">
        {currentPage === 'all' ? (
          <div className="flex h-screen">
            <div className="flex-1 p-6 flex flex-col">
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
                  setSelectedArticles([...selectedArticles, article]);
                }}
                selectedArticleIds={selectedArticles.map(a => a.id)}
                onFilterChange={handleFilterChange}
              />
            </div>
            <AISummaryPanel
              articles={selectedArticles}
              onArticlesChange={setSelectedArticles}
              onClear={() => setSelectedArticles([])}
            />
          </div>
        ) : (
          <RSSManager />
        )}
      </main>
    </div>
  );
} 