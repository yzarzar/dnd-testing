import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../../../data/boards';

interface TaskCardProps {
  task: Task;
  isUpdating?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, isUpdating = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const tagColorMap: Record<string, string> = {
    'planning': 'bg-purple-50 text-purple-600 border border-purple-200',
    'backend': 'bg-green-50 text-green-600 border border-green-200',
    'frontend': 'bg-amber-50 text-amber-600 border border-amber-200',
    'research': 'bg-blue-50 text-blue-600 border border-blue-200',
    'design': 'bg-pink-50 text-pink-600 border border-pink-200',
    'devops': 'bg-gray-50 text-gray-600 border border-gray-200',
    'setup': 'bg-indigo-50 text-indigo-600 border border-indigo-200',
    'ux': 'bg-rose-50 text-rose-600 border border-rose-200',
    'database': 'bg-cyan-50 text-cyan-600 border border-cyan-200',
  };

  const priorityColorMap: Record<string, string> = {
    'high': 'text-red-600',
    'medium': 'text-yellow-600',
    'low': 'text-green-600',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white mb-3 rounded border relative ${isUpdating ? 'border-gray-300 ring-1 ring-gray-300' : 'border-gray-200'} cursor-pointer hover:shadow-md transition-all duration-200 overflow-hidden`}
    >
      {/* Loading indicator */}
      {isUpdating && (
        <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center z-10">
          <div className="h-5 w-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Task content in table-like format */}
      <div className="flex flex-col">
        {/* Main content area */}
        <div className="p-3 flex items-start justify-between border-l-0 hover:bg-gray-50 transition-all duration-200">
          <div className="flex-1 pr-3">
            <h3 className="font-medium text-gray-800 mb-1">{task.title}</h3>
            <p className="text-sm text-gray-500 line-clamp-2">{task.description}</p>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${tagColorMap[task.tag.toLowerCase()] || 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
                {task.tag}
              </span>
            </div>
          </div>
          
          {/* Priority indicator */}
          <div className="flex flex-col items-end">
            {task.priority && (
              <span className={`text-xs font-medium ${priorityColorMap[task.priority] || 'text-gray-500'}`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
            )}
          </div>
        </div>
        
        {/* Footer with metadata - table-like footer */}
        <div className="flex items-center justify-between px-3 py-2 text-xs text-gray-500 bg-gray-50 border-t border-gray-100">
          {task.assigned_to ? (
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              {task.assigned_to}
            </div>
          ) : <div></div>}
          
          {task.due_date && (
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              {new Date(task.due_date).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
