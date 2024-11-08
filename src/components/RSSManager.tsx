import { useState, useEffect } from 'react';
import { FaPlay, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import SourceModal from './SourceModal';

interface RSSSource {
  id: number;
  category: string;
  name: string;
  source_type: string;
  url: string;
  update_frequency?: number;
  last_update?: string;
}

interface Props {
  onClose?: () => void;
}

export default function RSSManager({ onClose }: Props) {
  const [sources, setSources] = useState<RSSSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingSource, setEditingSource] = useState<RSSSource | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [updateFrequency, setUpdateFrequency] = useState(24); // 默认24小时

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      const response = await fetch('/api/rss-sources');
      const data = await response.json();
      setSources(data);
    } catch (error) {
      console.error('Failed to fetch RSS sources:', error);
    }
  };

  const handleManualUpdate = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/update-rss', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Update failed');
      }

      const data = await response.json();
      alert('RSS更新成功完成');
      // 刷新源列表以更新最后更新时间
      fetchSources();
    } catch (error) {
      console.error('Failed to trigger RSS update:', error);
      alert('更新失败，请查看控制台了解详情');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFrequency = async () => {
    try {
      await fetch('/api/update-frequency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frequency: updateFrequency })
      });
      alert('更新频率已保存');
    } catch (error) {
      console.error('Failed to update frequency:', error);
      alert('保存失败');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个RSS源吗？')) return;
    
    try {
      await fetch(`/api/rss-sources?id=${id}`, { method: 'DELETE' });
      fetchSources(); // 重新加载列表
    } catch (error) {
      console.error('Failed to delete RSS source:', error);
      alert('删除失败');
    }
  };

  const handleSaveSource = async (sourceData: any) => {
    try {
      const method = sourceData.id ? 'PUT' : 'POST';
      await fetch('/api/rss-sources', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sourceData)
      });
      
      setShowAddModal(false);
      setEditingSource(null);
      fetchSources(); // 重新加载列表
    } catch (error) {
      console.error('Failed to save RSS source:', error);
      alert('保存失败');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">RSS源管理</h2>
        <div className="space-x-4">
          <button
            onClick={handleManualUpdate}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
          >
            <FaPlay />
            {loading ? '更新中...' : '手动更新'}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2"
          >
            <FaPlus />
            添加源
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-medium mb-4">更新频率设置</h3>
        <div className="flex items-center gap-4">
          <input
            type="number"
            value={updateFrequency}
            onChange={(e) => setUpdateFrequency(Number(e.target.value))}
            className="px-3 py-2 border rounded w-24"
            min="1"
          />
          <span>小时</span>
          <button
            onClick={handleUpdateFrequency}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            保存
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                名称
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                分类
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                类型
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                URL
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                最后更新
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sources.map((source) => (
              <tr key={source.id}>
                <td className="px-6 py-4 whitespace-nowrap">{source.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{source.category}</td>
                <td className="px-6 py-4 whitespace-nowrap">{source.source_type}</td>
                <td className="px-6 py-4 whitespace-nowrap truncate max-w-xs">
                  {source.url}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {source.last_update ? new Date(source.last_update).toLocaleString() : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditingSource(source)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(source.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 编辑/添加模态框 */}
      {(showAddModal || editingSource) && (
        <SourceModal
          source={editingSource}
          onClose={() => {
            setShowAddModal(false);
            setEditingSource(null);
          }}
          onSave={handleSaveSource}
        />
      )}
    </div>
  );
} 