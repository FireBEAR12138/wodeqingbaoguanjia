import { useState, useEffect } from 'react';
import type { Article, ArticleFilter } from '../types/article';
import { Input, Button, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import Sidebar from '../components/Sidebar';
import ArticleList from '../components/ArticleList';
import RSSManager from '../components/RSSManager';
import AISummaryPanel from '../components/AISummaryPanel';
import SearchView from '../components/SearchView';

const SearchHeader = styled.div`
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const SearchContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;

  .search-input {
    width: 600px;

    .ant-input-affix-wrapper {
      border-radius: 8px;
      height: 40px;
      padding: 4px 11px;
      transition: all 0.3s;
      border: 1px solid #d9d9d9;
      box-shadow: 0 2px 0 rgba(0, 0, 0, 0.02);

      &:hover, &:focus {
        border-color: #40a9ff;
        box-shadow: 0 2px 0 rgba(24, 144, 255, 0.1);
      }

      .anticon {
        color: #bfbfbf;
      }
    }

    .ant-input-group-addon {
      background-color: #1890ff;
      border-color: #1890ff;
      border-radius: 0 8px 8px 0 !important;
      
      .ant-btn {
        background: transparent;
        border: none;
        color: white;
        box-shadow: none;
        padding: 0 16px;
        height: 38px;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      }
    }

    input {
      font-size: 15px;

      &::placeholder {
        color: #bfbfbf;
      }
    }
  }
`;

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
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        timeOrder
      });

      if (searchQuery) {
        params.append('searchQuery', searchQuery);
      }

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
      if (!response.ok) throw new Error('获取文章失败');
      
      const data = await response.json();
      
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
  }, [currentPage, page, pageSize, timeOrder, filters, searchQuery]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setIsSearchMode(!!value);
    setPage(1);
  };

  const handleExitSearch = () => {
    setIsSearchMode(false);
    setSearchQuery('');
    setPage(1);
  };

  const handleAddToSummary = (article: Article) => {
    if (!selectedArticles.some(a => a.id === article.id)) {
      setSelectedArticles(prev => [...prev, article]);
      message.success('已添加到AI总结');
    }
  };

  const renderMainContent = () => {
    if (currentPage === 'rss-manage') {
      return <RSSManager />;
    }

    if (isSearchMode) {
      return (
        <SearchView
          articles={articles}
          loading={loading}
          searchQuery={searchQuery}
          onSearch={handleSearch}
          onExit={handleExitSearch}
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          selectedArticles={selectedArticles}
          onAddToSummary={handleAddToSummary}
        />
      );
    }

    return (
      <>
        <SearchContainer>
          <Input.Search
            className="search-input"
            size="large"
            placeholder="输入搜索关键词"
            allowClear
            enterButton="搜索"
            prefix={<SearchOutlined />}
            onSearch={handleSearch}
          />
        </SearchContainer>
        <ArticleList
          articles={articles}
          loading={loading}
          error={error}
          page={page}
          totalPages={totalPages}
          timeOrder={timeOrder}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          onTimeOrderChange={setTimeOrder}
          onPageChange={setPage}
          onAddToSummary={handleAddToSummary}
          selectedArticleIds={selectedArticles.map(a => a.id)}
          onFilterChange={setFilters}
          total={total}
        />
      </>
    );
  };

  return (
    <div className="flex min-h-screen max-h-screen overflow-hidden bg-gray-100">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <main className="flex-1 ml-64">
        <div className="flex h-full">
          <div className="flex-1 flex flex-col h-full">
            {renderMainContent()}
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