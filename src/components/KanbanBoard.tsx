import React, { useState } from 'react';
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
import { COLUMNS, TASKS, Task, ColumnName } from '../data/tasks';

export default function KanbanBoard(): React.ReactElement {
  const [tasks, setTasks] = useState<Task[]>(TASKS);
  const [activeId, setActiveId] = useState<string | null>(null);

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

  function findContainer(id: string): string {
    const task = tasks.find(task => task.id === id);
    if (task) return task.columnId;
    return id;
  }

  function handleDragStart(event: DragStartEvent): void {
    const { active } = event;
    setActiveId(active.id as string);
  }

  function handleDragOver(event: DragOverEvent): void {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);
    
    if (
      activeContainer !== overContainer &&
      COLUMNS.map(col => col.id).includes(overContainer as ColumnName)
    ) {
      setTasks(prevTasks => {
        const activeIndex = prevTasks.findIndex(t => t.id === activeId);
        
        return [
          ...prevTasks.slice(0, activeIndex),
          { ...prevTasks[activeIndex], columnId: overContainer as ColumnName },
          ...prevTasks.slice(activeIndex + 1),
        ] as Task[];
      });
    }
  }

  function handleDragEnd(event: DragEndEvent): void {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);
    
    if (activeId !== overId) {
      setTasks(prevTasks => {
        const activeIndex = prevTasks.findIndex(t => t.id === activeId);
        const overIndex = prevTasks.findIndex(t => t.id === overId);
        
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
  const activeTask = tasks.find(task => task.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="bg-gray-50 p-6">
        <div className="flex overflow-x-auto gap-6 pb-4 min-h-[calc(100vh-64px)] items-start">
          {COLUMNS.map(column => (
            <Column
              key={column.id}
              column={column}
              tasks={tasks.filter(task => task.columnId === column.id)}
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