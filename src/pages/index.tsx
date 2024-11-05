import { useState } from 'react';
import { Article, ArticleFilter } from '../types/article';
import Sidebar from '../components/Sidebar';
import ArticleList from '../components/ArticleList';
import AISummaryPanel from '../components/AISummaryPanel';

export default function Home() {
  const [selectedArticles, setSelectedArticles] = useState<Article[]>([]);
  const [filter, setFilter] = useState<ArticleFilter>({});
  const [timeOrder, setTimeOrder] = useState<'asc' | 'desc'>('desc');

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 左侧导航 */}
      <Sidebar />

      {/* 主内容区 */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <ArticleList
            filter={filter}
            timeOrder={timeOrder}
            onTimeOrderChange={setTimeOrder}
            onAddToSummary={(article) => 
              setSelectedArticles(prev => [...prev, article])
            }
            selectedArticleIds={selectedArticles.map(a => a.id)}
          />
        </div>

        {/* 右侧AI总结面板 */}
        <AISummaryPanel
          articles={selectedArticles}
          onArticlesChange={setSelectedArticles}
          onClear={() => setSelectedArticles([])}
        />
      </div>
    </div>
  );
} 