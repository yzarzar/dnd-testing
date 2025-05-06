// import React from 'react';
// import { useSortable } from '@dnd-kit/sortable';
// import { CSS } from '@dnd-kit/utilities';
// import { Task } from '../data/boards';

// interface TaskCardProps {
//   task: Task;
//   isUpdating?: boolean;
// }

// export default function TaskCard({ task, isUpdating = false }: TaskCardProps) {
//   const {
//     attributes,
//     listeners,
//     setNodeRef,
//     transform,
//     transition,
//     isDragging,
//   } = useSortable({ id: task.id.toString() });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     opacity: isDragging ? 0.5 : 1,
//   };

//   const tagColorMap: Record<string, string> = {
//     'planning': 'bg-purple-50 text-purple-600 border border-purple-200',
//     'backend': 'bg-green-50 text-green-600 border border-green-200',
//     'frontend': 'bg-amber-50 text-amber-600 border border-amber-200',
//     'research': 'bg-blue-50 text-blue-600 border border-blue-200',
//     'design': 'bg-pink-50 text-pink-600 border border-pink-200',
//     'devops': 'bg-gray-50 text-gray-600 border border-gray-200',
//     'setup': 'bg-indigo-50 text-indigo-600 border border-indigo-200',
//     'ux': 'bg-rose-50 text-rose-600 border border-rose-200',
//     'database': 'bg-cyan-50 text-cyan-600 border border-cyan-200',
//   };

//   const priorityColorMap: Record<string, string> = {
//     'high': 'text-red-600',
//     'medium': 'text-yellow-600',
//     'low': 'text-green-600',
//   };

//   return (
//     <div
//       ref={setNodeRef}
//       style={style}
//       {...attributes}
//       {...listeners}
//       className={`bg-white p-4 mb-3 rounded-lg shadow-sm border relative ${isUpdating ? 'border-blue-300 ring-1 ring-blue-300' : 'border-gray-100'} cursor-pointer hover:shadow-md transition-all duration-200 hover:translate-y-[-2px]`}
//     >
//       {isUpdating && (
//         <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center rounded-lg z-10">
//           <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//         </div>
//       )}
//       <div className="flex flex-col gap-2">
//         <h3 className="font-medium text-gray-800">{task.title}</h3>
//         <p className="text-sm text-gray-500">{task.description}</p>
//         <div className="flex items-center justify-between mt-3">
//           <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${tagColorMap[task.tag.toLowerCase()] || 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
//             {task.tag}
//           </span>
//           {task.priority && (
//             <span className={`text-xs font-medium ${priorityColorMap[task.priority] || 'text-gray-500'}`}>
//               {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
//             </span>
//           )}
//         </div>
//         <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
//           {task.assigned_to && (
//             <div>Assigned to: {task.assigned_to}</div>
//           )}
//           {task.due_date && (
//             <div>Due: {new Date(task.due_date).toLocaleDateString()}</div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// } 