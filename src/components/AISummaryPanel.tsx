import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaTimes, FaGripVertical } from 'react-icons/fa';
import { LeftOutlined } from '@ant-design/icons';
import type { Article } from '../types/article';
import styled from 'styled-components';

const Panel = styled.div<{ $isCollapsed: boolean }>`
  width: ${props => props.$isCollapsed ? '40px' : '384px'};
  background: white;
  height: 100%;
  transition: width 0.3s ease;
  position: relative;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.06);
`;

const CollapseButton = styled.button<{ $isCollapsed: boolean }>`
  position: absolute;
  left: -12px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: white;
  border: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;

  &:hover {
    background: #f5f5f5;
  }

  .anticon {
    font-size: 12px;
    color: #595959;
    transition: transform 0.3s ease;
    transform: rotate(${props => props.$isCollapsed ? 0 : 180}deg);
  }
`;

const PanelContent = styled.div<{ $isCollapsed: boolean }>`
  display: ${props => props.$isCollapsed ? 'none' : 'block'};
  height: 100%;
  width: 100%;
`;

interface Props {
  articles: Article[];
  onArticlesChange: (articles: Article[]) => void;
  onClear: () => void;
}

export default function AISummaryPanel({ articles, onArticlesChange, onClear }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  const handleEnterEditMode = () => {
    setEditableContent(getFormattedContent());
    setIsEditing(true);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditableContent(e.target.value);
  };

  // 当有新文章添加时，自动展开面板
  React.useEffect(() => {
    if (articles.length > 0 && isCollapsed) {
      setIsCollapsed(false);
    }
  }, [articles.length, isCollapsed]);

  return (
    <Panel $isCollapsed={isCollapsed}>
      <CollapseButton 
        onClick={() => setIsCollapsed(!isCollapsed)}
        $isCollapsed={isCollapsed}
      >
        <LeftOutlined />
      </CollapseButton>
      <PanelContent $isCollapsed={isCollapsed}>
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">AI总结</h2>
        </div>

        {isEditing ? (
          <div className="flex-1 p-4 flex flex-col">
            <div className="relative flex-1">
              <textarea
                value={editableContent}
                onChange={handleContentChange}
                className="w-full h-full p-4 border rounded-lg resize-none"
                style={{ minHeight: '200px' }}
              />
              <div className="absolute bottom-2 right-2 text-sm text-gray-500">
                字数：{getWordCount(editableContent)}
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

        {articles.length > 0 && (
          <div className="p-4 border-t space-y-2">
            <button
              onClick={() => isEditing ? setIsEditing(false) : handleEnterEditMode()}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {isEditing ? '返回编辑' : '完成编辑'}
            </button>
            {isEditing ? (
              <button
                onClick={() => copyToClipboard(editableContent)}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                复制到剪贴板
              </button>
            ) : (
              <button
                onClick={onClear}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                清空
              </button>
            )}
          </div>
        )}
      </PanelContent>
    </Panel>
  );
} 