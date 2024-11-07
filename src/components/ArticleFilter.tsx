import { useState } from 'react';
import DatePicker from 'react-datepicker';
import type { ArticleFilter } from '../types/article';
import "react-datepicker/dist/react-datepicker.css";

interface Props {
  onFilterChange: (filter: ArticleFilter) => void;
}

export default function ArticleFilter({ onFilterChange }: Props) {
  const [filter, setFilter] = useState<ArticleFilter>({});

  const handleChange = (updates: Partial<ArticleFilter>) => {
    const newFilter = { ...filter, ...updates };
    setFilter(newFilter);
    onFilterChange(newFilter);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            开始日期
          </label>
          <DatePicker
            selected={filter.startDate}
            onChange={(date) => handleChange({ startDate: date || undefined })}
            className="w-full px-3 py-2 border rounded-md"
            placeholderText="选择开始日期"
            dateFormat="yyyy-MM-dd"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            结束日期
          </label>
          <DatePicker
            selected={filter.endDate}
            onChange={(date) => handleChange({ endDate: date || undefined })}
            className="w-full px-3 py-2 border rounded-md"
            placeholderText="选择结束日期"
            dateFormat="yyyy-MM-dd"
            minDate={filter.startDate}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            作者
          </label>
          <input
            type="text"
            value={filter.author || ''}
            onChange={(e) => handleChange({ author: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="输入作者名称"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            订阅源
          </label>
          <input
            type="text"
            value={filter.source || ''}
            onChange={(e) => handleChange({ source: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="输入订阅源名称"
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end space-x-2">
        <button
          onClick={() => {
            setFilter({});
            onFilterChange({});
          }}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          重置筛选
        </button>
      </div>
    </div>
  );
} 