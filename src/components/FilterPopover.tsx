import { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { FaFilter, FaSearch } from 'react-icons/fa';
import "react-datepicker/dist/react-datepicker.css";

interface FilterPopoverProps {
  type: 'date' | 'multiple';
  title: string;
  options?: string[];
  selectedValues?: string[];
  startDate?: Date | null;
  endDate?: Date | null;
  onDateChange?: (start: Date | null, end: Date | null) => void;
  onSelectionChange?: (values: string[]) => void;
  onConfirm?: () => void;
  showConfirmButtons?: boolean;
}

export default function FilterPopover({
  type,
  title,
  options = [],
  selectedValues = [],
  startDate = null,
  endDate = null,
  onDateChange,
  onSelectionChange,
  onConfirm,
  showConfirmButtons = type === 'multiple'
}: FilterPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleValue = (value: string) => {
    if (!onSelectionChange) return;
    
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    onSelectionChange(newValues);
  };

  // 过滤选项
  const filteredOptions = options.filter(option => 
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-1 rounded hover:bg-gray-100 ${
          (selectedValues.length > 0 || startDate || endDate) ? 'text-blue-500' : 'text-gray-500'
        }`}
      >
        <FaFilter />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 min-w-[250px]">
          <div className="p-3 border-b">
            <h3 className="font-medium">{title}</h3>
          </div>

          <div className="p-3">
            {type === 'date' ? (
              <div className="space-y-2">
                <div>
                  <label className="block text-sm text-gray-600">开始日期</label>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => onDateChange?.(date, endDate)}
                    className="w-full border rounded p-2"
                    placeholderText="选择开始日期"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">结束日期</label>
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => onDateChange?.(startDate, date)}
                    className="w-full border rounded p-2"
                    placeholderText="选择结束日期"
                  />
                </div>
              </div>
            ) : (
              <div>
                {/* 搜索框 */}
                <div className="mb-3 relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="搜索..."
                    className="w-full px-3 py-2 border rounded-lg pr-10"
                  />
                  <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                
                {/* 选项列表 */}
                <div className="max-h-60 overflow-y-auto">
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map((option) => (
                      <label key={option} className="flex items-center p-2 hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={selectedValues.includes(option)}
                          onChange={() => toggleValue(option)}
                          className="mr-2"
                        />
                        <span>{option}</span>
                      </label>
                    ))
                  ) : (
                    <div className="text-gray-500 text-center py-2">
                      无匹配结果
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {showConfirmButtons && (
            <div className="p-3 border-t flex justify-end space-x-2">
              <button
                onClick={() => {
                  if (type === 'date') {
                    onDateChange?.(null, null);
                  } else {
                    onSelectionChange?.([]);
                  }
                  setSearchTerm('');
                }}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                清除
              </button>
              <button
                onClick={() => {
                  onConfirm?.();
                  setIsOpen(false);
                  setSearchTerm('');
                }}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                确定
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 