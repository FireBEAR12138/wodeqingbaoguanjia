import classNames from 'classnames';
import { FaNewspaper } from 'react-icons/fa';

interface Props {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export default function Sidebar({ currentPage, onPageChange }: Props) {
  return (
    <div className="w-64 bg-white shadow-lg h-screen fixed left-0 top-0">
      <div className="p-4">
        <h1 className="text-xl font-bold mb-8">RSS阅读器</h1>
        <nav>
          <button
            onClick={() => onPageChange('all')}
            className={classNames(
              'w-full text-left px-4 py-2 rounded-lg flex items-center gap-2',
              {
                'bg-blue-500 text-white': currentPage === 'all',
                'hover:bg-gray-100': currentPage !== 'all'
              }
            )}
          >
            <FaNewspaper />
            所有文章
          </button>
        </nav>
      </div>
    </div>
  );
} 