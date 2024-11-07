import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaTimes, FaGripVertical, FaCopy } from 'react-icons/fa';
import type { Article } from '../types/article';

interface Props {
  articles: Article[];
  onArticlesChange: (articles: Article[]) => void;
  onClear: () => void;
}

export default function AISummaryPanel({ articles, onArticlesChange, onClear }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(articles);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onArticlesChange(items);
  };

  const removeArticle = (articleId: number) => {
    onArticlesChange(articles.filter(article => article.id !== articleId));
  };

  const getFormattedContent = () => {
    return articles.map((article, index) => (
      `${index + 1}. ${article.title}\n${article.ai_summary}\n`
    )).join('\n');
  };

  const getWordCount = (text: string) => {
    // 计算中文字数（包括标点符号）和英文单词数
    const chineseCount = (text.match(/[\u4e00-\u9fa5]|[，。！？、；：""''（）]/g) || []).length;
    const englishWords = text.match(/[a-zA-Z]+/g) || [];
    return chineseCount + englishWords.length;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('已复制到剪贴板');
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  return (
    <div className="w-96 bg-white shadow-lg h-screen overflow-hidden flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">AI总结</h2>
      </div>

      {isEditing ? (
        <div className="flex-1 p-4 flex flex-col">
          <div className="relative flex-1">
            <textarea
              readOnly
              value={getFormattedContent()}
              className="w-full h-full p-4 border rounded-lg resize-none bg-gray-50"
            />
            <button
              onClick={() => copyToClipboard(getFormattedContent())}
              className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700 bg-white rounded-full shadow-sm"
            >
              <FaCopy />
            </button>
            <div className="absolute bottom-2 right-2 text-sm text-gray-500">
              字数：{getWordCount(getFormattedContent())}
            </div>
          </div>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="summaries">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex-1 overflow-y-auto p-4 space-y-4"
              >
                {articles.map((article, index) => (
                  <Draggable
                    key={article.id}
                    draggableId={article.id.toString()}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="bg-gray-50 rounded-lg p-4 relative group"
                      >
                        <div 
                          {...provided.dragHandleProps}
                          className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 opacity-0 group-hover:opacity-100"
                        >
                          <FaGripVertical />
                        </div>
                        <button
                          onClick={() => removeArticle(article.id)}
                          className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                        >
                          <FaTimes />
                        </button>
                        <h3 className="font-medium mb-2 line-clamp-2 pl-6">
                          {article.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-3 pl-6">
                          {article.ai_summary}
                        </p>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      <div className="p-4 border-t space-x-4">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {isEditing ? '返回编辑' : '完成编辑'}
        </button>
        <button
          onClick={onClear}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          清空
        </button>
      </div>
    </div>
  );
} 