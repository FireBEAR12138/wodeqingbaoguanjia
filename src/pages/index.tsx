import { useState } from 'react';
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
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <main className="flex-1 ml-64">
        {currentPage === 'all' ? (
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
                onAddToSummary={(article) => {
                  setSelectedArticles([...selectedArticles, article]);
                }}
                selectedArticleIds={selectedArticles.map(a => a.id)}
                onFilterChange={() => {}}
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