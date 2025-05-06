export interface Board {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  column_id: number;
  title: string;
  description: string;
  tag: string;
  position: number;
  due_date: string;
  assigned_to: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

export interface Column {
  id: number;
  board_id: number;
  title: string;
  position: number;
  created_at: string;
  updated_at: string;
  tasks: Task[];
}

export interface BoardDetails extends Board {
  columns: Column[];
}

export async function fetchBoards(): Promise<Board[]> {
  try {
    const response = await fetch('http://localhost:8000/api/boards');
    if (!response.ok) {
      throw new Error('Failed to fetch boards');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching boards:', error);
    return [];
  }
}

export async function fetchBoardDetails(boardId: number): Promise<BoardDetails | null> {
  try {
    const response = await fetch(`http://localhost:8000/api/boards/${boardId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch board details for board ${boardId}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching board details for board ${boardId}:`, error);
    return null;
  }
}

export async function createBoard(name: string, description: string): Promise<Board | null> {
  try {
    const response = await fetch('http://localhost:8000/api/boards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, description }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create board');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating board:', error);
    return null;
  }
}

export async function updateColumnPosition(columnId: number, position: number): Promise<boolean> {
  try {
    const response = await fetch(`http://localhost:8000/api/columns/${columnId}/move`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ position }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update column position`);
    }
    
    return true;
  } catch (error) {
    console.error('Error updating column position:', error);
    return false;
  }
}

export async function updateTaskPosition(taskId: number, columnId: number, position: number): Promise<boolean> {
  console.log('Calling updateTaskPosition API:', { taskId, columnId, position });
  
  const url = `http://localhost:8000/api/tasks/${taskId}/move`;
  const requestBody = { 
    column_id: columnId,
    position: position 
  };
  
  console.log('Request details:', {
    url,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    console.log('API response status:', response.status);
    
    const responseData = await response.text();
    console.log('API response data:', responseData);
    
    if (!response.ok) {
      console.error('API error response:', responseData);
      throw new Error(`Failed to update task position: ${responseData}`);
    }
    
    console.log('Task position updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating task position:', error);
    return false;
  }
}

export async function createColumn(boardId: number, title: string): Promise<Column | null> {
  try {
    const response = await fetch(`http://localhost:8000/api/boards/${boardId}/columns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create column for board ${boardId}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error creating column for board ${boardId}:`, error);
    return null;
  }
} 