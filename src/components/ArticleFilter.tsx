import { useState } from 'react';
import type { ArticleFilter } from '../types/article';
import DatePicker from 'react-datepicker';
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
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          分类
        </label>
        <input
          type="text"
          value={filter.categories?.[0] || ''}
          onChange={(e) => handleChange({ categories: e.target.value ? [e.target.value] : [] })}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="输入分类名称"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          订阅源
        </label>
        <input
          type="text"
          value={filter.sources?.[0] || ''}
          onChange={(e) => handleChange({ sources: e.target.value ? [e.target.value] : [] })}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="输入订阅源名称"
        />
      </div>
    </div>
  );
} 