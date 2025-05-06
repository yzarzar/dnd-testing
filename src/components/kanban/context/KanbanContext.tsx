import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchBoardDetails, BoardDetails, Column, Task, updateColumnPosition, updateTaskPosition, createColumn, createTask, CreateTaskPayload } from '../../../data/boards';

// Define the toast message interface
export interface ToastMessage {
  id: string;
  type: 'success' | 'error';
  message: string;
}

// Define the context interface
interface KanbanContextType {
  boardDetails: BoardDetails | null;
  columns: Column[];
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  updatingColumnId: number | null;
  updatingTaskId: number | null;
  toasts: ToastMessage[];
  activeId: string | number | null;
  activeItem: { type: 'column', data: Column } | { type: 'task', data: Task } | null;
  refreshBoard: () => void;
  setActiveId: (id: string | number | null) => void;
  setActiveItem: (item: { type: 'column', data: Column } | { type: 'task', data: Task } | null) => void;
  setColumns: React.Dispatch<React.SetStateAction<Column[]>>;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  setUpdatingColumnId: React.Dispatch<React.SetStateAction<number | null>>;
  setUpdatingTaskId: React.Dispatch<React.SetStateAction<number | null>>;
  setToasts: React.Dispatch<React.SetStateAction<ToastMessage[]>>;
  simulateApiDelay: (ms?: number) => Promise<void>;
  updateColumnPositionWithFeedback: (columnId: number, newPosition: number) => Promise<void>;
  updateTaskPositionWithFeedback: (taskId: number, columnId: number, position: number) => Promise<void>;
  createColumnWithFeedback: (title: string) => Promise<void>;
  createTaskWithFeedback: (columnId: number, taskData: CreateTaskPayload) => Promise<void>;
}

// Create the context with a default value
const KanbanContext = createContext<KanbanContextType | undefined>(undefined);

// Provider component
export const KanbanProvider: React.FC<{ children: ReactNode; boardId: string }> = ({ children, boardId }) => {
  const [boardDetails, setBoardDetails] = useState<BoardDetails | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeId, setActiveId] = useState<string | number | null>(null);
  const [activeItem, setActiveItem] = useState<{ type: 'column', data: Column } | { type: 'task', data: Task } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingColumnId, setUpdatingColumnId] = useState<number | null>(null);
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Function to simulate API delay
  const simulateApiDelay = (ms: number = 1000) => new Promise<void>(resolve => setTimeout(resolve, ms));
  
  // Function to refresh board data
  const refreshBoard = () => {
    console.log('Refreshing board data');
    setRefreshTrigger(prev => prev + 1);
  };

  // Function to update column position with feedback
  const updateColumnPositionWithFeedback = async (columnId: number, newPosition: number) => {
    setUpdatingColumnId(columnId);
    
    try {
      await simulateApiDelay();
      const success = await updateColumnPosition(columnId, newPosition);
      
      if (!success) {
        throw new Error('Failed to update column position');
      }
    } catch (error) {
      console.error('Failed to update column position:', error);
      // Add toast notification for error 
      setToasts(prevToasts => [
        ...prevToasts,
        {
          id: `error-${Date.now()}`,
          type: 'error',
          message: 'Failed to update column position. Please try again.'
        }
      ]);
      // Revert to original state if the API call fails
      setColumns(columns);
    } finally {
      setUpdatingColumnId(null);
    }
  };

  // Function to update task position with feedback
  const updateTaskPositionWithFeedback = async (taskId: number, columnId: number, position: number) => {
    setUpdatingTaskId(taskId);
    
    try {
      const success = await updateTaskPosition(taskId, columnId, position);
      
      if (!success) {
        throw new Error('Failed to update task position');
      }
      
      // Clear the updating task ID after a short delay
      setTimeout(() => {
        setUpdatingTaskId(null);
      }, 300);
    } catch (error) {
      console.error('Failed to update task position:', error);
      // Add toast notification for error
      setToasts(prevToasts => [
        ...prevToasts,
        {
          id: `error-${Date.now()}`,
          type: 'error',
          message: 'Failed to update task position. Please try again.'
        }
      ]);
      // Revert to original state if the API call fails
      setTasks(tasks);
      setUpdatingTaskId(null);
    }
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
          const allTasks: Task[] = [];
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

  // Function to create a new column with feedback
  const createColumnWithFeedback = async (title: string) => {
    if (!boardDetails) return;
    
    try {
      const newColumn = await createColumn(boardDetails.id, title);
      
      if (!newColumn) {
        throw new Error('Failed to create column');
      }
      
      // Add toast notification for success
      setToasts(prevToasts => [
        ...prevToasts,
        {
          id: `success-${Date.now()}`,
          type: 'success',
          message: 'Column created successfully!'
        }
      ]);
      
      // Refresh board to get the updated columns
      refreshBoard();
    } catch (error) {
      console.error('Failed to create column:', error);
      // Add toast notification for error
      setToasts(prevToasts => [
        ...prevToasts,
        {
          id: `error-${Date.now()}`,
          type: 'error',
          message: 'Failed to create column. Please try again.'
        }
      ]);
    }
  };
  
  // Function to create a new task with feedback
  const createTaskWithFeedback = async (columnId: number, taskData: CreateTaskPayload) => {
    try {
      const newTask = await createTask(columnId, taskData);
      
      if (!newTask) {
        throw new Error('Failed to create task');
      }
      
      // Add toast notification for success
      setToasts(prevToasts => [
        ...prevToasts,
        {
          id: `success-${Date.now()}`,
          type: 'success',
          message: 'Task created successfully!'
        }
      ]);
      
      // Refresh board to get the updated tasks
      refreshBoard();
    } catch (error) {
      console.error('Failed to create task:', error);
      // Add toast notification for error
      setToasts(prevToasts => [
        ...prevToasts,
        {
          id: `error-${Date.now()}`,
          type: 'error',
          message: 'Failed to create task. Please try again.'
        }
      ]);
    }
  };

  // Create the context value object
  const contextValue: KanbanContextType = {
    boardDetails,
    columns,
    tasks,
    isLoading,
    error,
    updatingColumnId,
    updatingTaskId,
    toasts,
    activeId,
    activeItem,
    refreshBoard,
    setActiveId,
    setActiveItem,
    setColumns,
    setTasks,
    setUpdatingColumnId,
    setUpdatingTaskId,
    setToasts,
    simulateApiDelay,
    updateColumnPositionWithFeedback,
    updateTaskPositionWithFeedback,
    createColumnWithFeedback,
    createTaskWithFeedback
  };

  return (
    <KanbanContext.Provider value={contextValue}>
      {children}
    </KanbanContext.Provider>
  );
};

// Custom hook to use the Kanban context
export const useKanban = () => {
  const context = useContext(KanbanContext);
  if (context === undefined) {
    throw new Error('useKanban must be used within a KanbanProvider');
  }
  return context;
};
