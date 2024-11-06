import { useState } from 'react';
import { Article, ArticleFilterParams } from '../types/article';
import { format } from 'date-fns';

interface Props {
  filter: ArticleFilterParams;
  timeOrder: 'asc' | 'desc';
  onTimeOrderChange: (order: 'asc' | 'desc') => void;
  onAddToSummary: (article: Article) => void;
  selectedArticleIds: number[];
}

export default function ArticleList({
  filter,
  timeOrder,
  onTimeOrderChange,
  onAddToSummary,
  selectedArticleIds
}: Props) {
  const [page, setPage] = useState(1);
  const [articles, setArticles] = useState<Article[]>([]);
  const pageSize = 10;

  return (
    <div className="space-y-4">
      {/* 筛选器 */}
      <div className="bg-white p-4 rounded-lg shadow">
        {/* 实现筛选器UI */}
      </div>

      {/* 文章表格 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                标题
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                AI概览
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => onTimeOrderChange(timeOrder === 'asc' ? 'desc' : 'asc')}>
                发布时间
                {/* 添加排序图标 */}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                作者
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                订阅源
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
            {articles.map(article => (
              <tr key={article.id}>
                <td className="px-6 py-4">
                  <a href={article.link} target="_blank" rel="noopener noreferrer"
                     className="text-blue-600 hover:text-blue-800 line-clamp-3">
                    {article.title}
                  </a>
                </td>
                <td className="px-6 py-4">
                  <div className="group relative">
                    <div className="line-clamp-3">{article.ai_summary}</div>
                    {/* 悬浮预览 */}
                    <div className="hidden group-hover:block absolute z-10 w-96 p-4 bg-white shadow-lg rounded-lg">
                      {article.ai_summary}
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
                    <button
                      onClick={() => onAddToSummary(article)}
                      className="text-blue-600 hover:text-blue-800">
                      加入AI总结
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 分页器 */}
      <div className="flex justify-center space-x-2">
        {/* 实现分页器UI */}
      </div>
    </div>
  );
} 