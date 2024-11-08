import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ArticleList from '../components/ArticleList';
import RSSManager from '../components/RSSManager';
import AISummaryPanel from '../components/AISummaryPanel';

export default function Home() {
  const [currentPage, setCurrentPage] = useState('all');
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <main className="flex-1 ml-64">
        {currentPage === 'all' ? (
          <div className="flex">
            <div className="flex-1 p-6">
              <ArticleList
                // ... ArticleList props ...
              />
            </div>
            <AISummaryPanel
              // ... AISummaryPanel props ...
            />
          </div>
        ) : (
          <RSSManager />
        )}
      </main>
    </div>
  );
} 