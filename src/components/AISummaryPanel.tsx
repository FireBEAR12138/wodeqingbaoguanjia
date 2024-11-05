import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Article } from '../types/article';

interface Props {
  articles: Article[];
  onArticlesChange: (articles: Article[]) => void;
  onClear: () => void;
}

export default function AISummaryPanel({ articles, onArticlesChange, onClear }: Props) {
  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(articles);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onArticlesChange(items);
  };

  return (
    <div className="w-96 bg-white border-l border-gray-200 p-4 flex flex-col">
      <h2 className="text-xl font-bold mb-4">AI总结</h2>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="summaries">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex-1 overflow-y-auto space-y-4"
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
                      {...provided.dragHandleProps}
                      className="bg-gray-50 p-4 rounded-lg"
                    >
                      <h3 className="font-medium mb-2 line-clamp-2">{article.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-3">
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

      <div className="mt-4 space-x-4">
        <button
          onClick={() => {/* 实现完成编辑逻辑 */}}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          完成编辑
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