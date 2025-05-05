import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  DndContext, 
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent
} from '@dnd-kit/core';
import { 
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import Column from './Column';
import TaskCard from './TaskCard';
import { fetchBoardDetails, BoardDetails, Column as ColumnType, Task as TaskType } from '../data/boards';

export default function KanbanBoard(): React.ReactElement {
  const params = useParams();
  const boardId = params?.id as string;
  
  const [boardDetails, setBoardDetails] = useState<BoardDetails | null>(null);
  const [columns, setColumns] = useState<ColumnType[]>([]);
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [activeId, setActiveId] = useState<string | number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    async function loadBoardDetails() {
      if (!boardId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const numericBoardId = parseInt(boardId);
        const data = await fetchBoardDetails(numericBoardId);
        
        if (data) {
          setBoardDetails(data);
          setColumns(data.columns.sort((a, b) => a.position - b.position));
          
          // Extract all tasks from all columns
          const allTasks: TaskType[] = [];
          data.columns.forEach(column => {
            column.tasks.forEach(task => {
              allTasks.push(task);
            });
          });
          
          setTasks(allTasks);
        } else {
          setError('Board not found');
        }
      } catch (err) {
        console.error('Error loading board details:', err);
        setError('Failed to load board details');
      } finally {
        setIsLoading(false);
      }
    }

    loadBoardDetails();
  }, [boardId]);

  function findContainer(id: string | number): number | null {
    // Convert id to number if it's a string (for consistent comparison)
    const numericId = typeof id === 'string' ? parseInt(id) : id;
    
    const task = tasks.find(task => task.id === numericId);
    if (task) return task.column_id;
    return null;
  }

  function handleDragStart(event: DragStartEvent): void {
    const { active } = event;
    setActiveId(active.id);
  }

  function handleDragOver(event: DragOverEvent): void {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id;
    const overId = over.id;
    
    // Convert string IDs to numbers for task lookup
    const numericActiveId = typeof activeId === 'string' ? parseInt(activeId) : activeId;
    
    const activeContainer = findContainer(activeId);
    const overContainer = typeof overId === 'number' 
      ? overId 
      : findContainer(overId);
    
    if (
      activeContainer !== overContainer &&
      columns.some(col => col.id === overContainer)
    ) {
      setTasks(prevTasks => {
        const activeIndex = prevTasks.findIndex(t => t.id === numericActiveId);
        if (activeIndex === -1) return prevTasks;
        
        return [
          ...prevTasks.slice(0, activeIndex),
          { ...prevTasks[activeIndex], column_id: overContainer as number },
          ...prevTasks.slice(activeIndex + 1),
        ] as TaskType[];
      });
    }
  }

  function handleDragEnd(event: DragEndEvent): void {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }
    
    const activeId = active.id;
    const overId = over.id;
    
    // Convert string IDs to numbers for task lookup
    const numericActiveId = typeof activeId === 'string' ? parseInt(activeId) : activeId;
    const numericOverId = typeof overId === 'string' ? parseInt(overId) : overId;
    
    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);
    
    if (numericActiveId !== numericOverId) {
      setTasks(prevTasks => {
        const activeIndex = prevTasks.findIndex(t => t.id === numericActiveId);
        const overIndex = prevTasks.findIndex(t => t.id === numericOverId);
        
        if (activeIndex === -1 || overIndex === -1) return prevTasks;
        
        if (activeContainer === overContainer) {
          return arrayMove(prevTasks, activeIndex, overIndex);
        }
        
        // If dropped in different container, the position is already updated in handleDragOver
        return prevTasks;
      });
    }
    
    setActiveId(null);
  }

  // Get the active task
  const activeTask = activeId 
    ? tasks.find(task => task.id === (typeof activeId === 'string' ? parseInt(activeId) : activeId))
    : null;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }
  
  if (!boardDetails) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-500 text-xl">Board not found</div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="bg-gray-50 p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">{boardDetails.name}</h1>
        {boardDetails.description && (
          <p className="text-gray-600 mb-6">{boardDetails.description}</p>
        )}
        
        <div className="flex overflow-x-auto gap-6 pb-4 min-h-[calc(100vh-200px)] items-start">
          {columns.map(column => (
            <Column
              key={column.id}
              column={column}
              tasks={tasks.filter(task => task.column_id === column.id)}
            />
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeId && activeTask ? (
          <div className="transform scale-105">
            <TaskCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
} 