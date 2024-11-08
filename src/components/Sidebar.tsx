import classNames from 'classnames';
import { FaNewspaper, FaRss } from 'react-icons/fa';

interface Props {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export default function Sidebar({ currentPage, onPageChange }: Props) {
  const menuItems = [
    { id: 'all', label: '所有文章', icon: FaNewspaper },
    { id: 'rss-manage', label: 'RSS源管理', icon: FaRss },
  ];

  return (
    <div className="w-64 bg-white shadow-lg h-screen fixed left-0 top-0">
      <div className="p-4">
        <h1 className="text-xl font-bold mb-8">RSS阅读器</h1>
        <nav className="space-y-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={classNames(
                'w-full text-left px-4 py-2 rounded-lg flex items-center gap-2',
                {
                  'bg-blue-500 text-white': currentPage === item.id,
                  'hover:bg-gray-100': currentPage !== item.id
                }
              )}
            >
              <item.icon />
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
} 