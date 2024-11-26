import { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

interface SourceModalProps {
  source?: {
    id?: number;
    category: string;
    name: string;
    source_type: string;
    url: string;
  } | null;
  onClose: () => void;
  onSave: (source: any) => void;
}

export default function SourceModal({ source, onClose, onSave }: SourceModalProps) {
  const [formData, setFormData] = useState({
    category: '',
    name: '',
    source_type: '',
    url: '',
  });

  const [options, setOptions] = useState<{
    categories: string[];
    sourceTypes: string[];
  }>({
    categories: [],
    sourceTypes: []
  });

  const [newCategory, setNewCategory] = useState('');
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);

  // 获取选项数据
  useEffect(() => {
    async function fetchOptions() {
      try {
        const response = await fetch('/api/source-options');
        if (!response.ok) throw new Error('Failed to fetch options');
        const data = await response.json();
        setOptions(data);
      } catch (error) {
        console.error('Error fetching options:', error);
      }
    }
    fetchOptions();
  }, []);

  // 设置初始值
  useEffect(() => {
    if (source) {
      setFormData(source);
    }
  }, [source]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleCategoryChange = (value: string) => {
    if (value === 'add_new') {
      setIsAddingNewCategory(true);
    } else {
      setFormData({ ...formData, category: value });
    }
  };

  const handleAddNewCategory = () => {
    if (newCategory.trim()) {
      setFormData({ ...formData, category: newCategory.trim() });
      setIsAddingNewCategory(false);
      setNewCategory('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">
            {source ? '编辑RSS源' : '添加RSS源'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">名称</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">分类</label>
            {isAddingNewCategory ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="输入新分类"
                />
                <button
                  type="button"
                  onClick={handleAddNewCategory}
                  className="mt-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  添加
                </button>
              </div>
            ) : (
              <select
                value={formData.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">选择分类</option>
                {options.categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
                <option value="add_new">+ 添加新分类</option>
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">类型</label>
            <select
              value={formData.source_type}
              onChange={(e) => setFormData({ ...formData, source_type: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">选择类型</option>
              {options.sourceTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">URL</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 