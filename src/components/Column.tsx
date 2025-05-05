import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { 
  SortableContext, 
  verticalListSortingStrategy, 
  useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskCard from './TaskCard';
import { Column as ColumnType, Task } from '../data/boards';

// Add keyframes animation styles
const shimmerAnimation = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(400%); }
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
  isUpdating?: boolean;
  updatingTaskId?: number | null;
}

export default function Column({ column, tasks, isUpdating = false, updatingTaskId = null }: ColumnProps) {
  // Set up sortable for the column
  const {
    attributes,
    listeners,
    setNodeRef: setColumnNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: `column-${column.id}`,
    data: {
      type: 'column',
      column
    }
  });

  // Set up droppable for the tasks
  const { setNodeRef: setTasksNodeRef } = useDroppable({
    id: column.id,
  });

  // Convert task ids to strings for SortableContext
  const taskIds = tasks.map(task => task.id.toString());

  // Apply styles for dragging
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <>
      <style>{shimmerAnimation}</style>
      <div 
        ref={setColumnNodeRef}
        style={style}
        className={`flex flex-col w-full min-w-[300px] max-w-[350px] h-full bg-white rounded-lg shadow-sm border border-gray-100 ${isUpdating ? 'ring-1 ring-gray-300' : ''}`}
        {...attributes}
      >
        <div 
          className={`p-4 font-medium text-gray-700 flex items-center justify-between border-b border-gray-100 cursor-grab relative ${isUpdating ? 'bg-gray-50' : ''}`}
          {...listeners}
        >
          <div className="flex items-center gap-2">
            <h2 className="font-semibold">{column.title}</h2>
            <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
              {tasks.length}
            </span>
          </div>
          
          {isUpdating ? (
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-8 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gray-400" 
                  style={{
                    width: '30%',
                    animation: 'shimmer 1.5s ease-in-out infinite'
                  }}
                ></div>
              </div>
            </div>
          ) : (
            <button className="text-gray-400 hover:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            </button>
          )}
        </div>

        <div
          ref={setTasksNodeRef}
          className="p-3 flex-1 overflow-y-auto bg-gray-50 relative"
        >
          {isUpdating && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-60 z-10">
              <div className="w-8 h-8 relative">
                <div style={{ animation: 'spin 1.5s linear infinite' }} className="border-2 border-gray-200 border-t-gray-400 rounded-full w-8 h-8"></div>
              </div>
            </div>
          )}
          <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            {tasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                isUpdating={updatingTaskId === task.id}
              />
            ))}
            {tasks.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                Drop tasks here
              </div>
            )}
          </SortableContext>
        </div>
      </div>
    </>
  );
} 