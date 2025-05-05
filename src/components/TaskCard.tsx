import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../data/tasks';

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const tagColorMap: Record<string, string> = {
    'Research': 'bg-blue-50 text-blue-600 border border-blue-200',
    'Planning': 'bg-purple-50 text-purple-600 border border-purple-200',
    'Design': 'bg-pink-50 text-pink-600 border border-pink-200',
    'DevOps': 'bg-gray-50 text-gray-600 border border-gray-200',
    'Backend': 'bg-green-50 text-green-600 border border-green-200',
    'Frontend': 'bg-amber-50 text-amber-600 border border-amber-200',
    'Setup': 'bg-indigo-50 text-indigo-600 border border-indigo-200',
    'UX': 'bg-rose-50 text-rose-600 border border-rose-200',
    'Database': 'bg-cyan-50 text-cyan-600 border border-cyan-200',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-4 mb-3 rounded-lg shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all duration-200 hover:translate-y-[-2px]"
    >
      <div className="flex flex-col gap-2">
        <h3 className="font-medium text-gray-800">{task.title}</h3>
        <p className="text-sm text-gray-500">{task.description}</p>
        <div className="mt-1">
          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${tagColorMap[task.tag] || 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
            {task.tag}
          </span>
        </div>
      </div>
    </div>
  );
} 