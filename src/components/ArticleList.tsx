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
  // 永久状态
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  });
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [selectedSourceTypes, setSelectedSourceTypes] = useState<string[]>([]);

  // 临时状态（用于筛选确认前）
  const [tempDateRange, setTempDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  });
  const [tempAuthors, setTempAuthors] = useState<string[]>([]);
  const [tempSources, setTempSources] = useState<string[]>([]);
  const [tempSourceTypes, setTempSourceTypes] = useState<string[]>([]);
  
  // 筛选选项
  const [filterOptions, setFilterOptions] = useState<{
    categories: string[];
    sources: string[];
    sourceTypes: string[];
  }>({
    categories: [],
    sources: [],
    sourceTypes: []
  });

  // 添加分类的临时和永久状态
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [tempCategories, setTempCategories] = useState<string[]>([]);

  // 获取筛选选项
  useEffect(() => {
    async function fetchFilterOptions() {
      try {
        const response = await fetch('/api/filter-options');
        if (!response.ok) throw new Error('Failed to fetch filter options');
        const data = await response.json();
        setFilterOptions({
          categories: data.categories,
          sources: data.sources,
          sourceTypes: data.sourceTypes
        });
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    }
    fetchFilterOptions();
  }, []);

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

  const handleFilterConfirm = (type: 'date' | 'categories' | 'sources' | 'sourceTypes') => {
    switch (type) {
      case 'date':
        setDateRange(tempDateRange);
        break;
      case 'categories':
        setSelectedCategories(tempCategories);
        break;
      case 'sources':
        setSelectedSources(tempSources);
        break;
      case 'sourceTypes':
        setSelectedSourceTypes(tempSourceTypes);
        break;
    }
    
    onFilterChange({
      startDate: type === 'date' ? tempDateRange.start : dateRange.start,
      endDate: type === 'date' ? tempDateRange.end : dateRange.end,
      categories: type === 'categories' ? tempCategories : selectedCategories,
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
    <div className="flex flex-col h-full">
      {/* 表格区域 - 使用 flex-1 使其填充剩余空间，并添加滚动 */}
      <div className="flex-1 overflow-auto">
        <div className="bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr className="text-xs">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                  标题
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
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
                        startDate={tempDateRange.start}
                        endDate={tempDateRange.end}
                        onDateChange={(start, end) => setTempDateRange({ start, end })}
                        onConfirm={() => handleFilterConfirm('date')}
                        showConfirmButtons={true}
                      />
                    </div>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <span>分类</span>
                    <FilterPopover
                      type="multiple"
                      title="筛选分类"
                      options={filterOptions.categories}
                      selectedValues={tempCategories}
                      onSelectionChange={setTempCategories}
                      onConfirm={() => handleFilterConfirm('categories')}
                    />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <span>订阅源</span>
                    <FilterPopover
                      type="multiple"
                      title="筛选订阅源"
                      options={filterOptions.sources}
                      selectedValues={tempSources}
                      onSelectionChange={setTempSources}
                      onConfirm={() => handleFilterConfirm('sources')}
                    />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <span>来源</span>
                    <FilterPopover
                      type="multiple"
                      title="筛选来源"
                      options={filterOptions.sourceTypes}
                      selectedValues={tempSourceTypes}
                      onSelectionChange={setTempSourceTypes}
                      onConfirm={() => handleFilterConfirm('sourceTypes')}
                    />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-sm">
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
                      <div className="hidden group-hover:block absolute left-0 mt-2 p-4 bg-white shadow-xl rounded-lg border border-gray-200 w-[500px] z-50">
                        <div className="relative">
                          <div className="max-h-96 overflow-y-auto">
                            {article.ai_summary}
                          </div>
                          <button
                            onClick={() => copyToClipboard(article.ai_summary)}
                            className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700 bg-white rounded-full shadow-sm"
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
                  <td className="px-6 py-4 whitespace-nowrap">{article.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{article.source_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{article.source_type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-x-2">
                      {selectedArticleIds.includes(article.id) ? (
                        <span className="text-gray-500">已加入</span>
                      ) : (
                        <>
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
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 分页器 - 固定在底部 */}
      <div className="py-4 bg-white border-t">
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
    </div>
  );
} 