import { useState } from 'react';

interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: Props) {
  const [inputPage, setInputPage] = useState('');

  // 生成要显示的页码数组
  const getPageNumbers = () => {
    const pages = new Set<number>();
    const showPages = 4; // 显示的页码数量

    // 添加第一页
    pages.add(1);

    // 添加当前页附近的页码
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(currentPage + 1, totalPages - 1); i++) {
      pages.add(i);
    }

    // 添加最后一页
    if (totalPages > 1) {
      pages.add(totalPages);
    }

    // 转换为数组并排序
    const pageArray = Array.from(pages).sort((a, b) => a - b);

    // 添加省略号
    const result: (number | string)[] = [];
    for (let i = 0; i < pageArray.length; i++) {
      if (i > 0 && pageArray[i] - pageArray[i - 1] > 1) {
        result.push('...');
      }
      result.push(pageArray[i]);
    }

    return result;
  };

  const handleJump = () => {
    const pageNum = parseInt(inputPage);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum);
      setInputPage('');
    }
  };

  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleJump();
    }
  };

  return (
    <div className="flex justify-center items-center space-x-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded border disabled:opacity-50"
      >
        ←
      </button>

      {getPageNumbers().map((pageNum, index) => (
        pageNum === '...' ? (
          <span key={`ellipsis-${index}`} className="px-3 py-1">...</span>
        ) : (
          <button
            key={`page-${pageNum}`}
            onClick={() => onPageChange(Number(pageNum))}
            className={`px-3 py-1 rounded border ${
              currentPage === pageNum ? 'bg-blue-500 text-white' : ''
            }`}
          >
            {pageNum}
          </button>
        )
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded border disabled:opacity-50"
      >
        →
      </button>

      <div className="flex items-center space-x-2 ml-4">
        <span className="text-sm text-gray-600">跳转到</span>
        <input
          type="text"
          value={inputPage}
          onChange={(e) => setInputPage(e.target.value)}
          onKeyPress={handleInputKeyPress}
          className="w-16 px-2 py-1 border rounded text-center"
          placeholder="页码"
        />
        <button
          onClick={handleJump}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          跳转
        </button>
      </div>
    </div>
  );
} 