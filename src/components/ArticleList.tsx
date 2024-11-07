import { format } from 'date-fns';
import type { Article } from '../types/article';

interface Props {
  articles: Article[];
  loading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function ArticleList({
  articles,
  loading,
  page,
  totalPages,
  onPageChange
}: Props) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow overflow-hidden">
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
                发布时间
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                作者
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                来源
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {articles.map((article) => (
              <tr key={article.id}>
                <td className="px-6 py-4">
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {article.title}
                  </a>
                </td>
                <td className="px-6 py-4">
                  <div className="line-clamp-2">{article.ai_summary}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {format(new Date(article.pub_date), 'yyyy-MM-dd HH:mm')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{article.author}</td>
                <td className="px-6 py-4 whitespace-nowrap">{article.source_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 分页器 */}
      <div className="flex justify-center space-x-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="px-3 py-1 rounded border disabled:opacity-50"
        >
          上一页
        </button>
        <span className="px-3 py-1">
          第 {page} 页，共 {totalPages} 页
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="px-3 py-1 rounded border disabled:opacity-50"
        >
          下一页
        </button>
      </div>
    </div>
  );
} 