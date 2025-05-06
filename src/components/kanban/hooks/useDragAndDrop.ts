import { } from 'react';
import { 
  DragStartEvent, 
  DragOverEvent, 
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useKanban } from '../context/KanbanContext';
import { normalizeId, findContainer } from '../utils/dragUtils';
import { Task } from '../../../data/boards';

export function useDragAndDrop() {
  const { 
    columns, 
    tasks, 
    setColumns, 
    setTasks, 
    setActiveId, 
    setActiveItem,
    updateColumnPositionWithFeedback,
    updateTaskPositionWithFeedback
  } = useKanban();

  // Set up sensors for drag and drop
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

  // Handle drag start
  function handleDragStart(event: DragStartEvent): void {
    console.log('Drag started:', event);
    const { active } = event;
    setActiveId(active.id);
    
    // Check if we're dragging a column or a task
    if (typeof active.id === 'string' && active.id.startsWith('column-')) {
      const columnId = normalizeId(active.id);
      const column = columns.find(col => col.id === columnId);
      if (column) {
        setActiveItem({ type: 'column', data: column });
      }
    } else {
      // It's a task
      const taskId = normalizeId(active.id);
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        setActiveItem({ type: 'task', data: task });
      }
    }
  }

  // Handle drag over
  function handleDragOver(event: DragOverEvent): void {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id;
    const overId = over.id;
    
    // If we're dragging a column, return - column reordering is handled in handleDragEnd
    if (typeof activeId === 'string' && activeId.startsWith('column-')) {
      return;
    }
    
    // Convert IDs to numbers for task lookup
    const numericActiveId = normalizeId(activeId);
    
    const activeContainer = findContainer(activeId, columns, tasks);
    const overContainer = typeof overId === 'number' 
      ? overId 
      : findContainer(overId, columns, tasks);
    
    // If we couldn't determine the containers, do nothing
    if (activeContainer === null || overContainer === null) return;
    
    // Update the task's column_id for the visual representation
    // This handles both same column reordering and column-to-column movement
    setTasks(prevTasks => {
      const activeIndex = prevTasks.findIndex(t => t.id === numericActiveId);
      if (activeIndex === -1) return prevTasks;
      
      // Always update the task's column_id during dragOver for visual feedback
      return [
        ...prevTasks.slice(0, activeIndex),
        { ...prevTasks[activeIndex], column_id: overContainer },
        ...prevTasks.slice(activeIndex + 1),
      ] as Task[];
    });
  }

  // Handle drag end
  function handleDragEnd(event: DragEndEvent): void {
    console.log('Drag ended:', event);
    const { active, over } = event;
    
    if (!over) {
      console.log('No over target found');
      setActiveId(null);
      setActiveItem(null);
      return;
    }
    
    const activeId = active.id;
    const overId = over.id;
    console.log('Drag end details:', { activeId, overId });
    
    // Handle column reordering
    if (typeof activeId === 'string' && activeId.startsWith('column-') &&
        typeof overId === 'string' && overId.startsWith('column-')) {
      handleColumnReordering(activeId, overId);
    } else {
      handleTaskReordering(activeId, overId);
    }
    
    setActiveId(null);
    setActiveItem(null);
  }

  // Handle column reordering
  function handleColumnReordering(activeId: string, overId: string): void {
    console.log('Column reordering detected');
    
    const activeColumnId = normalizeId(activeId);
    const overColumnId = normalizeId(overId);
    
    if (activeColumnId !== overColumnId) {
      // Find the indices of the columns
      const activeColumnIndex = columns.findIndex(col => col.id === activeColumnId);
      const overColumnIndex = columns.findIndex(col => col.id === overColumnId);
      
      if (activeColumnIndex !== -1 && overColumnIndex !== -1) {
        // Update the columns state with the new order
        const newColumns = arrayMove(columns, activeColumnIndex, overColumnIndex);
        
        // Update positions based on new order (using 0-based indexing)
        const updatedColumns = newColumns.map((col, index) => ({
          ...col,
          position: index  // 0-based positions
        }));
        
        setColumns(updatedColumns);
        
        // Call API to update the position
        const draggedColumn = columns[activeColumnIndex];
        const newPosition = overColumnIndex;
        
        updateColumnPositionWithFeedback(draggedColumn.id, newPosition);
      }
    }
  }

  // Handle task reordering
  function handleTaskReordering(activeId: string | number, overId: string | number): void {
    console.log('Task reordering detected');
    
    const numericActiveId = normalizeId(activeId);
    const numericOverId = normalizeId(overId);
    
    const activeContainer = findContainer(activeId, columns, tasks);
    const overContainer = typeof overId === 'number' 
      ? overId 
      : findContainer(overId, columns, tasks);
    
    console.log('Task containers:', { activeContainer, overContainer });
    
    // Skip if we couldn't determine either container
    if (activeContainer === null || overContainer === null) {
      setActiveId(null);
      setActiveItem(null);
      return;
    }
    
    // Get the active task
    const activeTask = tasks.find(t => t.id === numericActiveId);
    if (!activeTask) {
      console.error('Active task not found:', numericActiveId);
      setActiveId(null);
      setActiveItem(null);
      return;
    }
    
    // Always update the task position, even when dropping in the same place
    // This ensures the backend gets the correct position information
    setTasks(prevTasks => {
      const activeIndex = prevTasks.findIndex(t => t.id === numericActiveId);
      
      if (activeIndex === -1) return prevTasks;
      
      // Create a copy of the tasks array
      const newTasks = [...prevTasks];
      
      // Create the updated task with the new column_id
      const updatedTask = { ...newTasks[activeIndex], column_id: overContainer };
      
      // Remove the task from its current position
      newTasks.splice(activeIndex, 1);
      
      // Default to inserting at the end
      let insertIndex = newTasks.length;
      
      // COMPLETELY REDESIGNED APPROACH FOR CROSS-COLUMN MOVEMENT
      if (activeContainer !== overContainer) {
        console.log('Cross-column movement detected');
        
        // Get tasks in the target column before insertion
        const tasksInTargetColumn = newTasks.filter(t => t.column_id === overContainer);
        
        // SPECIAL CASE: Dropping directly on a column
        if (numericOverId === overContainer) {
          console.log('Dropping directly on column:', overContainer);
          
          // ALWAYS insert at position 0 when dropping directly on a column
          if (tasksInTargetColumn.length > 0) {
            // Find the first task in the target column
            const firstTaskIndex = newTasks.findIndex(t => t.column_id === overContainer);
            if (firstTaskIndex !== -1) {
              console.log('Inserting at beginning of column (position 0)');
              insertIndex = firstTaskIndex;
            }
          }
          // If column is empty, insertIndex remains at newTasks.length
        }
        // SPECIAL CASE: Dropping on a task at position 0
        else if (typeof numericOverId === 'number') {
          const overTask = newTasks.find(t => t.id === numericOverId);
          const overIndex = newTasks.findIndex(t => t.id === numericOverId);
          
          if (overTask) {
            console.log('Target task position:', overTask.position);
            
            // FORCE position 0 handling - if the target is the first task in its column
            const isFirstTaskInColumn = !newTasks.some(t => 
              t.column_id === overContainer && t.position < overTask.position
            );
            
            if (isFirstTaskInColumn || overTask.position === 0) {
              console.log('Target is first task in column - inserting at position 0');
              // Find the first task in the target column
              const firstTaskIndex = newTasks.findIndex(t => t.column_id === overContainer);
              if (firstTaskIndex !== -1) {
                insertIndex = firstTaskIndex;
              } else {
                insertIndex = overIndex;
              }
            } else {
              // For other positions, insert at the task's position
              insertIndex = overIndex;
            }
          } else {
            // Task not found, insert at the end
            console.log('Target task not found, inserting at end');
          }
        }
      } else {
        // Handle same column reordering
        // Find the index where we should insert the task
        // If in the same column, find the index of the task we're dropping onto
        const overIndex = newTasks.findIndex(t => t.id === numericOverId);
        
        if (overIndex === -1) {
          insertIndex = newTasks.length;
        } else {
          // If dragging downward within the same column, we need to insert after the target
          // to account for the shift that happened when removing the item
          const originalActiveIndex = prevTasks.findIndex(t => t.id === numericActiveId);
          const originalOverIndex = prevTasks.findIndex(t => t.id === numericOverId);
          
          if (originalActiveIndex < originalOverIndex) {
            // When dragging downward, insert after the target
            insertIndex = overIndex + 1;
          } else {
            // When dragging upward or onto itself, insert at the target position
            insertIndex = overIndex;
          }
        }
      }
      
      // Insert the task at the new position
      newTasks.splice(insertIndex, 0, updatedTask);
      
      // IMPROVED POSITION CALCULATION
      // Recalculate positions within each column to ensure they are sequential
      const columnGroups = new Map<number, Task[]>();
      
      // Group tasks by column
      newTasks.forEach(task => {
        if (!columnGroups.has(task.column_id)) {
          columnGroups.set(task.column_id, []);
        }
        columnGroups.get(task.column_id)?.push(task);
      });
      
      // Update positions within each column group
      const finalTasks: Task[] = [];
      columnGroups.forEach((tasksInColumn, columnId) => {
        // Sort tasks by their current index in the newTasks array to preserve the order
        const sortedTasks = [...tasksInColumn].sort((a, b) => {
          return newTasks.findIndex(t => t.id === a.id) - newTasks.findIndex(t => t.id === b.id);
        });
        
        // Update positions sequentially
        const updatedTasks = sortedTasks.map((task, idx) => {
          // Log position updates for the target column
          if (columnId === overContainer && task.id === numericActiveId) {
            console.log(`Setting task ${task.id} to position ${idx} in column ${columnId}`);
          }
          
          return {
            ...task,
            position: idx
          };
        });
        
        finalTasks.push(...updatedTasks);
      });
      
      // Calculate the task's position within its column
      const tasksInSameColumn = finalTasks.filter(t => t.column_id === overContainer);
      const positionInColumn = tasksInSameColumn.findIndex(t => t.id === numericActiveId);
      
      // Double-check position 0 case
      let finalPosition = positionInColumn === -1 ? 0 : positionInColumn;
      
      // FORCE position 0 for cross-column movement to position 0
      if (activeContainer !== overContainer && 
          (numericOverId === overContainer || 
           (typeof numericOverId === 'number' && 
            tasksInSameColumn.some(t => t.id === numericOverId && t.position === 0)))) {
        console.log('FORCING position 0 for cross-column movement');
        finalPosition = 0;
      }
      
      console.log('Final task position calculation:', {
        taskId: numericActiveId,
        columnId: overContainer,
        calculatedPosition: positionInColumn,
        finalPosition: finalPosition
      });
      
      // Enhanced logging for debugging
      console.log('New task position in column:', {
        taskId: numericActiveId,
        columnId: overContainer,
        position: finalPosition,
        wasMovedBetweenColumns: activeContainer !== overContainer,
        droppedDirectlyOnColumn: numericOverId === overContainer
      });
      
      // Use setTimeout to ensure the API call happens after state update
      setTimeout(() => {
        // For cross-column movements to position 0, force position 0
        if (activeContainer !== overContainer && finalPosition === 0) {
          console.log('Sending position 0 to API for cross-column movement');
          updateTaskPositionWithFeedback(numericActiveId, overContainer as number, 0);
        } else {
          updateTaskPositionWithFeedback(numericActiveId, overContainer as number, finalPosition);
        }
      }, 100);
      
      return finalTasks;
    });
  }

  return {
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd
  };
}
