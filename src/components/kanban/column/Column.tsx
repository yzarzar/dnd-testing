import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { 
  SortableContext, 
  verticalListSortingStrategy, 
  useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Column as ColumnType, Task } from '../../../data/boards';
import { TaskCard } from '../task/TaskCard';
import { CreateTaskModal } from '../task/CreateTaskModal';

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

  @keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
`;

interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
  isUpdating?: boolean;
  updatingTaskId?: number | null;
}

export const Column: React.FC<ColumnProps> = ({ 
  column, 
  tasks, 
  isUpdating = false, 
  updatingTaskId = null 
}) => {
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
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
        className={`flex flex-col w-full min-w-[300px] max-w-[350px] h-full bg-white rounded-xs shadow-md hover:shadow-lg border border-gray-200/50 hover:border-gray-300/50 transition-all duration-200 ${isUpdating ? 'ring-2 ring-blue-400/50' : ''} overflow-hidden`}
        {...attributes}
      >
        {/* Column Header - Modern table-like header */}
        <div 
          className={`px-5 py-4 font-medium text-gray-800 flex items-center justify-between border-b border-gray-200 cursor-grab relative ${isUpdating ? 'bg-gray-50' : 'bg-white'}`}
          {...listeners}
        >
          <div className="flex items-center gap-2">
            <div>
              <h2 className="font-semibold text-gray-900">{column.title}</h2>
              <div className="flex items-center mt-1">
                <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-0.5 rounded">
                  {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                </span>
              </div>
            </div>
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
            <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            </button>
          )}
        </div>

        {/* Tasks Container - Table-like content area */}
        <div
          ref={setTasksNodeRef}
          className="p-3 flex-1 overflow-y-auto bg-gray-50 relative"
          style={{ animation: tasks.length > 0 ? 'fadeIn 0.3s ease-in-out' : 'none' }}
        >
          {/* Loading Indicator */}
          {isUpdating && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-60 z-10">
              <div className="w-8 h-8 relative">
                <div style={{ animation: 'spin 1.5s linear infinite' }} className="border-2 border-gray-200 border-t-gray-500 rounded-full w-8 h-8"></div>
              </div>
            </div>
          )}
          
          {/* Column Header Labels - Table-like column headers */}
          {tasks.length > 0 && (
            <div className="flex items-center justify-between px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-200 mb-2">
              <div className="flex-1">Task</div>
              <div className="w-20 text-right">Priority</div>
            </div>
          )}
          
          {/* Tasks List */}
          <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            {tasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                isUpdating={updatingTaskId === task.id}
              />
            ))}
            {tasks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-md bg-white bg-opacity-50 mt-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p>Drop tasks here</p>
              </div>
            )}
          </SortableContext>
          
          {/* Add Task Button */}
          <div className="mt-3 flex justify-center">
            <button 
              onClick={() => setIsAddTaskModalOpen(true)}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors w-full justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Task
            </button>
          </div>
        </div>
      </div>
      
      {/* Create Task Modal */}
      <CreateTaskModal 
        isOpen={isAddTaskModalOpen} 
        onClose={() => setIsAddTaskModalOpen(false)} 
        columnId={column.id} 
      />
    </>
  );
};
