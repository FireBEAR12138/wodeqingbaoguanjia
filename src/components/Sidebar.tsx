export default function Sidebar() {
  return (
    <div className="w-48 bg-white border-r border-gray-200">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900">RSS阅读器</h2>
      </div>
      <nav className="mt-4">
        <a
          href="/"
          className="block px-4 py-2 text-sm text-blue-600 bg-blue-50 border-l-4 border-blue-600"
        >
          所有文章
        </a>
      </nav>
    </div>
  );
} 