import { useState, useEffect } from 'react';
import type { Article } from '../types/article';
import Sidebar from '../components/Sidebar';
import ArticleList from '../components/ArticleList';
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

  useEffect(() => {
    fetchArticles();
  }, [page, timeOrder]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/articles?page=${page}&pageSize=10&timeOrder=${timeOrder}`);
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

  const handleAddToSummary = (article: Article) => {
    if (!selectedArticles.find(a => a.id === article.id)) {
      setSelectedArticles([...selectedArticles, article]);
    }
  };

  const handleClearSummary = () => {
    setSelectedArticles([]);
  };

  const handleReorderSummary = (articles: Article[]) => {
    setSelectedArticles(articles);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <main className="flex-1 ml-64">
        <div className="flex">
          <div className="flex-1 p-6">
            <ArticleList
              articles={articles}
              loading={loading}
              error={error}
              page={page}
              totalPages={totalPages}
              timeOrder={timeOrder}
              onTimeOrderChange={setTimeOrder}
              onPageChange={setPage}
              onAddToSummary={handleAddToSummary}
              selectedArticleIds={selectedArticles.map(a => a.id)}
            />
          </div>
          
          <AISummaryPanel
            articles={selectedArticles}
            onArticlesChange={handleReorderSummary}
            onClear={handleClearSummary}
          />
        </div>
      </main>
    </div>
  );
} 