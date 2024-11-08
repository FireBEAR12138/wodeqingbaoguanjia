import classNames from 'classnames';
import Image from 'next/image';
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
        <div className="flex items-center gap-3 mb-8">
          <Image
            src="/logo.png"
            alt="我的情报管家"
            width={40}
            height={40}
            className="rounded-lg"
          />
          <h1 className="text-xl font-bold">我的情报管家</h1>
        </div>

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