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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">开始日期</label>
        <DatePicker
          selected={filter.startDate}
          onChange={(date) => handleChange({ startDate: date || undefined })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          placeholderText="选择开始日期"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">结束日期</label>
        <DatePicker
          selected={filter.endDate}
          onChange={(date) => handleChange({ endDate: date || undefined })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          placeholderText="选择结束日期"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">作者</label>
        <input
          type="text"
          value={filter.author || ''}
          onChange={(e) => handleChange({ author: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          placeholder="输入作者名称"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">来源</label>
        <input
          type="text"
          value={filter.source || ''}
          onChange={(e) => handleChange({ source: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          placeholder="输入来源名称"
        />
      </div>
    </div>
  );
} 