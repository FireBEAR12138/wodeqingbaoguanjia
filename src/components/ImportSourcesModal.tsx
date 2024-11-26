import { useState } from 'react';
import { FaTimes, FaUpload } from 'react-icons/fa';
import Papa from 'papaparse';

interface ImportSource {
  category: string;
  name: string;
  source_type: string;
  url: string;
}

interface Props {
  onClose: () => void;
  onConfirm: (sources: ImportSource[]) => void;
  existingSources: { name: string; url: string }[];
}

export default function ImportSourcesModal({ onClose, onConfirm, existingSources }: Props) {
  const [parsedSources, setParsedSources] = useState<ImportSource[]>([]);
  const [duplicates, setDuplicates] = useState<ImportSource[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (results) => {
        const sources: ImportSource[] = [];
        const duplicateItems: ImportSource[] = [];

        // 跳过标题行
        results.data.slice(1).forEach((row: any) => {
          if (row.length >= 4 && row[0] && row[1] && row[2] && row[3]) {
            const source = {
              category: row[0],
              name: row[1],
              source_type: row[2],
              url: row[3]
            };

            // 检查重复
            const isDuplicate = existingSources.some(
              existing => existing.name === source.name || existing.url === source.url
            );

            if (isDuplicate) {
              duplicateItems.push(source);
            } else {
              sources.push(source);
            }
          }
        });

        setParsedSources(sources);
        setDuplicates(duplicateItems);
        setShowPreview(true);
      },
      header: false
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">批量导入RSS源</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes />
          </button>
        </div>

        {!showPreview ? (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <FaUpload className="text-4xl text-gray-400 mb-2" />
                <span className="text-gray-600">点击上传CSV文件</span>
                <span className="text-sm text-gray-500 mt-2">
                  支持的格式：分类,订阅源名称,来源,RSS链接
                </span>
              </label>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">CSV示例格式：</h4>
              <pre className="text-sm text-gray-600">
                分类,订阅源名称,来源,RSS链接{'\n'}
                资讯,极客公园,官网,https://www.geekpark.net/rss{'\n'}
                商业,界面新闻: 商业,官网,https://plink.anyfeeder.com/jiemian/business
              </pre>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {parsedSources.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">将添加以下RSS源：</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">分类</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">名称</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">来源</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">链接</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {parsedSources.map((source, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4">{source.category}</td>
                          <td className="px-6 py-4">{source.name}</td>
                          <td className="px-6 py-4">{source.source_type}</td>
                          <td className="px-6 py-4 truncate max-w-xs">{source.url}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {duplicates.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 text-yellow-600">以下RSS源可能重复：</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">分类</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">名称</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">来源</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">链接</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {duplicates.map((source, index) => (
                        <tr key={index} className="bg-yellow-50">
                          <td className="px-6 py-4">{source.category}</td>
                          <td className="px-6 py-4">{source.name}</td>
                          <td className="px-6 py-4">{source.source_type}</td>
                          <td className="px-6 py-4 truncate max-w-xs">{source.url}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
              >
                取消
              </button>
              <button
                onClick={() => onConfirm(parsedSources)}
                className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                disabled={parsedSources.length === 0}
              >
                确认导入
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 