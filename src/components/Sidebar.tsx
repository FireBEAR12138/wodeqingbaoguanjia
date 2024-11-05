import React from 'react';

export default function Sidebar() {
  return (
    <div className="w-64 bg-white border-r border-gray-200">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-700">导航</h2>
        <div className="mt-4">
          <a href="/" className="block px-4 py-2 text-blue-600 bg-blue-50 rounded">
            所有文章
          </a>
        </div>
      </div>
    </div>
  );
} 