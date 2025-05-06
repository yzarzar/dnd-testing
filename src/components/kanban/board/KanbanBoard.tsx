import React, { useState } from 'react';
import { 
  DndContext, 
  DragOverlay,
  closestCorners,
  rectIntersection
} from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useKanban } from '../context/KanbanContext';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { Column } from '../column/Column';
import { TaskCard } from '../task/TaskCard';
import { LoadingSpinner } from '../board/LoadingSpinner';
import { ErrorDisplay } from '../board/ErrorDisplay';
import { CreateColumnModal } from '../column/CreateColumnModal';

export const KanbanBoard: React.FC = () => {
  const { 
    boardDetails, 
    columns, 
    tasks, 
    isLoading, 
    error, 
    activeItem, 
    updatingColumnId, 
    updatingTaskId 
  } = useKanban();
  
  const { sensors, handleDragStart, handleDragOver, handleDragEnd } = useDragAndDrop();
  const [isCreateColumnModalOpen, setIsCreateColumnModalOpen] = useState(false);

  // Get the columnIds for the sortable context
  const columnIds = columns.map(column => `column-${column.id}`);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }
  
  if (!boardDetails) {
    return <ErrorDisplay message="Board not found" />;
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={(args) => {
          // For column dragging, use rectIntersection which works better for large elements
          if (typeof args.active.id === 'string' && args.active.id.startsWith('column-')) {
            return rectIntersection(args);
          }
          // For tasks, use closestCorners which is better for smaller items
          return closestCorners(args);
        }}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="bg-gray-50 p-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">{boardDetails.name}</h1>
          {boardDetails.description && (
            <p className="text-gray-600 mb-6">{boardDetails.description}</p>
          )}
          
          <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
            <div className="flex overflow-x-auto gap-6 pb-4 min-h-[calc(100vh-200px)] items-start">
              {columns.map(column => (
                <Column
                  key={column.id}
                  column={column}
                  tasks={tasks.filter(task => task.column_id === column.id)}
                  isUpdating={updatingColumnId === column.id}
                  updatingTaskId={updatingTaskId}
                />
              ))}
              
              {/* Add Column Button */}
              <div className="flex-shrink-0 w-72 bg-gray-100 rounded-md p-2 h-min">
                <button
                  onClick={() => setIsCreateColumnModalOpen(true)}
                  className="w-full py-2 px-3 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Add Column
                </button>
              </div>
            </div>
          </SortableContext>
        </div>

        <DragOverlay>
          {activeItem && activeItem.type === 'task' ? (
            <div className="transform scale-105">
              <TaskCard 
                task={activeItem.data} 
                isUpdating={updatingTaskId === activeItem.data.id}
              />
            </div>
          ) : activeItem && activeItem.type === 'column' ? (
            <div className="transform scale-105 opacity-80">
              <Column
                column={activeItem.data}
                tasks={tasks.filter(task => task.column_id === activeItem.data.id)}
                isUpdating={updatingColumnId === activeItem.data.id}
                updatingTaskId={updatingTaskId}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
            
      {/* Create Column Modal */}
      <CreateColumnModal 
        isOpen={isCreateColumnModalOpen}
        onClose={() => setIsCreateColumnModalOpen(false)}
      />
    </>
  );
};
