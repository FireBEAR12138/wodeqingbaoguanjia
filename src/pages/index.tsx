import { useState, useEffect } from 'react';
import type { Article, ArticleFilter } from '../types/article';
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
  const [filters, setFilters] = useState<ArticleFilter>({});
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [cachedData, setCachedData] = useState<{
    [key: string]: {
      articles: Article[];
      total: number;
      timestamp: number;
    }
  }>({});

  const getCacheKey = () => {
    return JSON.stringify({
      page,
      pageSize,
      timeOrder,
      filters
    });
  };

  const fetchArticles = async () => {
    const cacheKey = getCacheKey();
    const now = Date.now();
    const cacheTimeout = 30000; // 30秒缓存

    // 检查缓存
    if (cachedData[cacheKey] && (now - cachedData[cacheKey].timestamp) < cacheTimeout) {
      setArticles(cachedData[cacheKey].articles);
      setTotal(cachedData[cacheKey].total);
      setTotalPages(Math.ceil(cachedData[cacheKey].total / pageSize));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        timeOrder
      });

      if (filters.startDate) {
        params.append('startDate', filters.startDate.toISOString());
      }
      if (filters.endDate) {
        params.append('endDate', filters.endDate.toISOString());
      }
      if (filters.categories?.length) {
        params.append('categories', filters.categories.join(','));
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
      
      // 更新缓存
      setCachedData(prev => ({
        ...prev,
        [cacheKey]: {
          articles: data.articles,
          total: data.total,
          timestamp: now
        }
      }));

      setArticles(data.articles);
      setTotalPages(data.totalPages);
      setTotal(data.total);
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
  }, [currentPage, page, pageSize, timeOrder, filters]);

  const handleFilterChange = (newFilters: ArticleFilter) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  return (
    <div className="flex min-h-screen max-h-screen overflow-hidden bg-gray-100">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <main className="flex-1 ml-64">
        {currentPage === 'all' ? (
          <div className="flex h-full">
            <div className="flex-1 flex flex-col h-full">
              <ArticleList
                articles={articles}
                loading={loading}
                error={error}
                page={page}
                totalPages={totalPages}
                timeOrder={timeOrder}
                pageSize={pageSize}
                onPageSizeChange={handlePageSizeChange}
                onTimeOrderChange={setTimeOrder}
                onPageChange={setPage}
                onAddToSummary={(article) => {
                  setSelectedArticles([...selectedArticles, article]);
                }}
                selectedArticleIds={selectedArticles.map(a => a.id)}
                onFilterChange={handleFilterChange}
                total={total}
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