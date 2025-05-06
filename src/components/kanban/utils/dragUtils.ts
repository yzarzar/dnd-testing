import { Column, Task } from '../../../data/boards';

/**
 * Normalizes an ID by converting string IDs to numbers and handling column prefixes
 */
export function normalizeId(id: string | number): number {
  return typeof id === 'string' 
    ? (id.startsWith('column-') 
       ? parseInt(id.replace('column-', '')) 
       : parseInt(id))
    : id;
}

/**
 * Finds the container (column) for a given task or column ID
 */
export function findContainer(id: string | number, columns: Column[], tasks: Task[]): number | null {
  console.log('findContainer called with id:', id);
  
  // If the id starts with "column-", this is a column id
  if (typeof id === 'string' && id.startsWith('column-')) {
    const columnId = parseInt(id.replace('column-', ''));
    const columnExists = columns.some(col => col.id === columnId);
    
    if (columnExists) {
      console.log('Found column container:', columnId);
      return columnId;
    }
    return null;
  }
  
  // Otherwise it's a task id - convert to number for consistent comparison
  const numericId = typeof id === 'string' ? parseInt(id) : id;
  
  // Find the task in our tasks array
  const task = tasks.find(task => task.id === numericId);
  if (task) {
    // Verify the column exists
    const columnExists = columns.some(col => col.id === task.column_id);
    if (columnExists) {
      console.log('Found task container:', task.column_id);
      return task.column_id;
    }
  }
  
  // If we get here, we couldn't find a valid container
  console.log('No container found for id:', id);
  
  // If the id IS a column id (directly dropped on column)
  if (typeof id === 'number' && columns.some(col => col.id === id)) {
    return id;
  }
  
  return null;
}
