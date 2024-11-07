import { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { FaFilter } from 'react-icons/fa';
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
  onConfirm
}: FilterPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

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
                    onChange={(date: Date | null) => onDateChange?.(date, endDate)}
                    className="w-full border rounded p-2"
                    placeholderText="选择开始日期"
                    isClearable
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">结束日期</label>
                  <DatePicker
                    selected={endDate}
                    onChange={(date: Date | null) => onDateChange?.(startDate, date)}
                    className="w-full border rounded p-2"
                    placeholderText="选择结束日期"
                    isClearable
                  />
                </div>
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto">
                {options.map((option) => (
                  <label key={option} className="flex items-center p-2 hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedValues.includes(option)}
                      onChange={() => toggleValue(option)}
                      className="mr-2"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {type === 'multiple' && (
            <div className="p-3 border-t flex justify-end space-x-2">
              <button
                onClick={() => onSelectionChange?.([])}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                清除
              </button>
              <button
                onClick={onConfirm}
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