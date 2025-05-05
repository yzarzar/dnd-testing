import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import { Column as ColumnType, Task } from '../data/boards';

interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
}

export default function Column({ column, tasks }: ColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  // Convert task ids to strings for SortableContext
  const taskIds = tasks.map(task => task.id.toString());

  return (
    <div className="flex flex-col w-full min-w-[300px] max-w-[350px] h-full bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="p-4 font-medium text-gray-700 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold">{column.title}</h2>
          <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
            {tasks.length}
          </span>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </button>
      </div>

      <div
        ref={setNodeRef}
        className="p-3 flex-1 overflow-y-auto bg-gray-50"
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
          {tasks.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">
              Drop tasks here
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
} 