import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { FaSort, FaSortUp, FaSortDown, FaCopy } from 'react-icons/fa';
import type { Article } from '../types/article';
import FilterPopover from './FilterPopover';

interface Props {
  articles: Article[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  timeOrder: 'asc' | 'desc';
  onTimeOrderChange: (order: 'asc' | 'desc') => void;
  onPageChange: (page: number) => void;
  onAddToSummary: (article: Article) => void;
  selectedArticleIds: number[];
  onFilterChange: (filters: {
    startDate?: Date | null;
    endDate?: Date | null;
    authors?: string[];
    sources?: string[];
    sourceTypes?: string[];
  }) => void;
}

export default function ArticleList({
  articles,
  loading,
  error,
  page,
  totalPages,
  timeOrder,
  onTimeOrderChange,
  onPageChange,
  onAddToSummary,
  selectedArticleIds,
  onFilterChange
}: Props) {
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  });
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [selectedSourceTypes, setSelectedSourceTypes] = useState<string[]>([]);
  
  // 添加临时筛选状态
  const [tempAuthors, setTempAuthors] = useState<string[]>([]);
  const [tempSources, setTempSources] = useState<string[]>([]);
  const [tempSourceTypes, setTempSourceTypes] = useState<string[]>([]);

  // 获取所有可用的选项
  const uniqueAuthors = Array.from(new Set(articles.map(a => a.author)));
  const uniqueSources = Array.from(new Set(articles.map(a => a.source_name)));
  const uniqueSourceTypes = Array.from(new Set(articles.map(a => a.source_type)));

  useEffect(() => {
    onFilterChange({
      startDate: dateRange.start,
      endDate: dateRange.end,
      authors: selectedAuthors,
      sources: selectedSources,
      sourceTypes: selectedSourceTypes
    });
  }, [dateRange, selectedAuthors, selectedSources, selectedSourceTypes]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('已复制到剪贴板');
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const handleDateChange = (start: Date | null, end: Date | null) => {
    setDateRange({ start, end });
    onFilterChange({
      startDate: start,
      endDate: end,
      authors: selectedAuthors,
      sources: selectedSources,
      sourceTypes: selectedSourceTypes
    });
  };

  const handleFilterConfirm = (type: 'authors' | 'sources' | 'sourceTypes') => {
    switch (type) {
      case 'authors':
        setSelectedAuthors(tempAuthors);
        break;
      case 'sources':
        setSelectedSources(tempSources);
        break;
      case 'sourceTypes':
        setSelectedSourceTypes(tempSourceTypes);
        break;
    }
    
    onFilterChange({
      startDate: dateRange.start,
      endDate: dateRange.end,
      authors: type === 'authors' ? tempAuthors : selectedAuthors,
      sources: type === 'sources' ? tempSources : selectedSources,
      sourceTypes: type === 'sourceTypes' ? tempSourceTypes : selectedSourceTypes,
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow overflow-hidden relative">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                标题
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                AI概览
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-2">
                  <span>发布时间</span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onTimeOrderChange(timeOrder === 'asc' ? 'desc' : 'asc')}
                      className="p-1"
                    >
                      {timeOrder === 'asc' ? <FaSortUp /> : <FaSortDown />}
                    </button>
                    <FilterPopover
                      type="date"
                      title="筛选发布时间"
                      startDate={dateRange.start}
                      endDate={dateRange.end}
                      onDateChange={(start, end) => {
                        setDateRange({ start, end });
                        onFilterChange({
                          startDate: start,
                          endDate: end,
                          authors: selectedAuthors,
                          sources: selectedSources,
                          sourceTypes: selectedSourceTypes
                        });
                      }}
                    />
                  </div>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-2">
                  <span>作者</span>
                  <FilterPopover
                    type="multiple"
                    title="筛选作者"
                    options={uniqueAuthors}
                    selectedValues={tempAuthors}
                    onSelectionChange={setTempAuthors}
                    onConfirm={() => handleFilterConfirm('authors')}
                  />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-2">
                  <span>订阅源</span>
                  <FilterPopover
                    type="multiple"
                    title="筛选订阅源"
                    options={uniqueSources}
                    selectedValues={tempSources}
                    onSelectionChange={setTempSources}
                    onConfirm={() => handleFilterConfirm('sources')}
                  />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                来源
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {articles.map((article) => (
              <tr key={article.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 line-clamp-3"
                  >
                    {article.title}
                  </a>
                </td>
                <td className="px-6 py-4">
                  <div className="group relative">
                    <div className="line-clamp-3">{article.ai_summary}</div>
                    <div className="hidden group-hover:block fixed transform -translate-x-1/2 left-1/2 mt-2 p-4 bg-white shadow-xl rounded-lg border border-gray-200 max-w-2xl w-full z-50">
                      <div className="relative">
                        <div className="max-h-96 overflow-y-auto">
                          {article.ai_summary}
                        </div>
                        <button
                          onClick={() => copyToClipboard(article.ai_summary)}
                          className="absolute top-0 right-0 p-2 text-gray-500 hover:text-gray-700 bg-white rounded-full shadow-sm"
                        >
                          <FaCopy />
                        </button>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {format(new Date(article.pub_date), 'yyyy-MM-dd HH:mm')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{article.author}</td>
                <td className="px-6 py-4 whitespace-nowrap">{article.source_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{article.source_type}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {selectedArticleIds.includes(article.id) ? (
                    <span className="text-gray-500">已加入</span>
                  ) : (
                    <div className="space-x-2">
                      <button
                        onClick={() => onAddToSummary(article)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        加入AI总结
                      </button>
                      <button
                        onClick={() => copyToClipboard(article.link)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <FaCopy className="inline" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center space-x-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="px-3 py-1 rounded border disabled:opacity-50"
        >
          ←
        </button>
        {Array.from({ length: Math.min(4, totalPages) }, (_, i) => i + 1).map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`px-3 py-1 rounded border ${
              page === pageNum ? 'bg-blue-500 text-white' : ''
            }`}
          >
            {pageNum}
          </button>
        ))}
        {totalPages > 4 && <span>...</span>}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="px-3 py-1 rounded border disabled:opacity-50"
        >
          →
        </button>
      </div>
    </div>
  );
} 