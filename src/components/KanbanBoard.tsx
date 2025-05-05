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
  SortableContext,
  horizontalListSortingStrategy
} from '@dnd-kit/sortable';
import Column from './Column';
import TaskCard from './TaskCard';
import { fetchBoardDetails, BoardDetails, Column as ColumnType, Task as TaskType, updateColumnPosition, updateTaskPosition } from '../data/boards';

interface ToastMessage {
  id: string;
  type: 'success' | 'error';
  message: string;
}

export default function KanbanBoard(): React.ReactElement {
  const params = useParams();
  const boardId = params?.id as string;
  
  const [boardDetails, setBoardDetails] = useState<BoardDetails | null>(null);
  const [columns, setColumns] = useState<ColumnType[]>([]);
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [activeId, setActiveId] = useState<string | number | null>(null);
  const [activeItem, setActiveItem] = useState<{type: 'task' | 'column', data: any} | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingColumnId, setUpdatingColumnId] = useState<number | null>(null);
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

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

  // Function to simulate API delay
  const simulateApiDelay = (ms: number = 1000) => new Promise(resolve => setTimeout(resolve, ms));
  
  // Function to refresh board data
  const refreshBoard = () => {
    console.log('Refreshing board data');
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    async function loadBoardDetails() {
      if (!boardId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const numericBoardId = parseInt(boardId);
        console.log('Loading board details for boardId:', numericBoardId);
        const data = await fetchBoardDetails(numericBoardId);
        
        if (data) {
          console.log('Board details loaded successfully:', data);
          setBoardDetails(data);
          // Sort columns by position (starting from 0)
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
  }, [boardId, refreshTrigger]);

  function findContainer(id: string | number): number | null {
    console.log('findContainer called with id:', id);
    
    // Convert id to number if it's a string (for consistent comparison)
    const numericId = typeof id === 'string' ? parseInt(id) : id;
    
    // If the id starts with "column-", this is a column id
    if (typeof id === 'string' && id.startsWith('column-')) {
      const columnId = parseInt(id.replace('column-', ''));
      console.log('Found column container:', columnId);
      return columnId;
    }
    
    // Otherwise it's a task id
    const task = tasks.find(task => task.id === numericId);
    if (task) {
      console.log('Found task container:', task.column_id);
      return task.column_id;
    }
    
    console.log('No container found for id:', id);
    return null;
  }

  function handleDragStart(event: DragStartEvent): void {
    console.log('Drag started:', event);
    const { active } = event;
    setActiveId(active.id);
    
    // Check if we're dragging a column or a task
    if (typeof active.id === 'string' && active.id.startsWith('column-')) {
      const columnId = parseInt(active.id.replace('column-', ''));
      const column = columns.find(col => col.id === columnId);
      if (column) {
        setActiveItem({ type: 'column', data: column });
      }
    } else {
      // It's a task
      const taskId = typeof active.id === 'string' ? parseInt(active.id) : active.id;
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        setActiveItem({ type: 'task', data: task });
      }
    }
  }

  function handleDragOver(event: DragOverEvent): void {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id;
    const overId = over.id;
    
    // If we're not dragging a task, return
    if (typeof activeId === 'string' && activeId.startsWith('column-')) {
      return; // Column drag over logic is handled in handleDragEnd
    }
    
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
      // Only update the visual representation in drag over
      // The actual API call will be made in handleDragEnd
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
    
    // Test direct API call
    if (typeof activeId === 'string' || typeof activeId === 'number') {
      const taskId = typeof activeId === 'string' ? parseInt(activeId) : activeId;
      console.log('Testing direct API call for task:', taskId);
      
      // Make a direct test call to the API using fetch
      fetch(`http://localhost:8000/api/tasks/2/move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          column_id: 4,
          position: 0 
        }),
      })
      .then(response => {
        console.log('Direct API test response:', response.status);
        return response.text();
      })
      .then(text => {
        console.log('Direct API test response text:', text);
      })
      .catch(error => {
        console.error('Direct API test error:', error);
      });
    }
    
    // Handle column reordering
    if (typeof activeId === 'string' && activeId.startsWith('column-') &&
        typeof overId === 'string' && overId.startsWith('column-')) {
      console.log('Column reordering detected');
      
      const activeColumnId = parseInt(activeId.replace('column-', ''));
      const overColumnId = parseInt(overId.replace('column-', ''));
      
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
            position: index  // Changed from index + 1 to index for 0-based positions
          }));
          
          setColumns(updatedColumns);
          
          // Set the column as being updated
          const draggedColumn = columns[activeColumnIndex];
          setUpdatingColumnId(draggedColumn.id);
          
          // Call API to update the position (using 0-based indexing) with simulated delay
          const newPosition = overColumnIndex;  // Changed from overColumnIndex + 1 to overColumnIndex
          
          // Simulate API delay and then make the actual call
          simulateApiDelay()
            .then(() => updateColumnPosition(draggedColumn.id, newPosition))
            .then(() => {
              // Clear updating state on success
              setUpdatingColumnId(null);
            })
            .catch(error => {
              console.error('Failed to update column position:', error);
              // Revert to original state if the API call fails
              setColumns(columns);
              setUpdatingColumnId(null);
            });
        }
      }
    } else {
      console.log('Task reordering detected');
      // Handle task reordering
      const numericActiveId = typeof activeId === 'string' ? parseInt(activeId) : activeId;
      const numericOverId = typeof overId === 'string' ? parseInt(overId) : overId;
      
      const activeContainer = findContainer(activeId);
      const overContainer = typeof overId === 'number' 
        ? overId 
        : findContainer(overId);
      
      console.log('Task containers:', { activeContainer, overContainer });
      
      // Always update the task position, even when dropping in the same place
      // This ensures the backend gets the correct position information
      setTasks(prevTasks => {
        const activeIndex = prevTasks.findIndex(t => t.id === numericActiveId);
        
        if (activeIndex === -1) return prevTasks;
        
        let newTasks = [...prevTasks];
        const updatedTask = { ...newTasks[activeIndex], column_id: overContainer as number };
        
        // Remove the task from its current position
        newTasks.splice(activeIndex, 1);
        
        // Find the index where we should insert the task
        let insertIndex;
        if (activeContainer === overContainer) {
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
        } else {
          // If moving to a different column, find the right position in that column
          const tasksInTargetColumn = newTasks.filter(t => t.column_id === overContainer);
          
          if (tasksInTargetColumn.length === 0) {
            // If the column is empty, insert at the end of all tasks
            insertIndex = newTasks.length;
          } else if (numericOverId === overContainer) {
            // If dropped directly on the column (not on a task), insert at the beginning of that column
            const firstTaskInColumnIndex = newTasks.findIndex(t => t.column_id === overContainer);
            insertIndex = firstTaskInColumnIndex === -1 ? newTasks.length : firstTaskInColumnIndex;
          } else {
            // If dropped on a task in another column, insert at that position
            const overIndex = newTasks.findIndex(t => t.id === numericOverId);
            insertIndex = overIndex === -1 ? newTasks.length : overIndex;
          }
        }
        
        // Insert the task at the new position
        newTasks.splice(insertIndex, 0, updatedTask);
        
        // Update positions for all tasks in the affected column(s)
        const finalTasks = newTasks.map((task, index) => ({
          ...task,
          position: index
        }));
        
        // Calculate the task's position within its column
        const tasksInSameColumn = finalTasks.filter(t => t.column_id === overContainer);
        const positionInColumn = tasksInSameColumn.findIndex(t => t.id === numericActiveId);
        
        console.log('New task position in column:', {
          taskId: numericActiveId,
          columnId: overContainer,
          position: positionInColumn
        });
        
        // Use setTimeout to ensure the API call happens after state update
        setTimeout(() => {
          console.log('About to call updateTaskPosition with:', {
            taskId: numericActiveId,
            columnId: overContainer,
            position: positionInColumn
          });
          
          // Set the updating task
          setUpdatingTaskId(numericActiveId);
          
          updateTaskPosition(
            numericActiveId, 
            overContainer as number, 
            positionInColumn
          )
          .then(success => {
            console.log('Task position update result:', success);
            // Clear the updating task ID after a short delay
            setTimeout(() => {
              setUpdatingTaskId(null);
              // No need to refresh the entire board
            }, 300);
          })
          .catch(error => {
            console.error('Failed to update task position:', error);
            setUpdatingTaskId(null);
          });
        }, 100);
        
        return finalTasks;
      });
    }
    
    setActiveId(null);
    setActiveItem(null);
  }

  // Get the columnIds for the sortable context
  const columnIds = columns.map(column => `column-${column.id}`);

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
    <>
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
      
      {/* Toast notifications */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <div 
            key={toast.id}
            className={`py-2 px-4 rounded-md shadow-md text-white text-sm font-medium flex items-center justify-between transition-all duration-300 ease-in-out transform translate-y-0
              ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
          >
            <div className="flex items-center">
              {toast.type === 'success' ? (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              {toast.message}
            </div>
            <button 
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="ml-4 text-white hover:text-gray-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </>
  );
} 