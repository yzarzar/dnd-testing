# Project Management API Documentation

This API provides endpoints for managing a drag-and-drop project management system with columns and tasks.

## Base URL

```
http://localhost:8000/api
```

## Authentication

_This API implementation does not include authentication. In production, add an appropriate authentication mechanism._

## Boards

### List all boards

```
GET /boards
```

### Create a new board

```
POST /boards

{
  "name": "My Project",
  "description": "Project description"
}
```

### Get a specific board with columns and tasks

```
GET /boards/{board_id}
```

### Update a board

```
PUT /boards/{board_id}

{
  "name": "Updated Project Name",
  "description": "Updated description"
}
```

### Delete a board

```
DELETE /boards/{board_id}
```

## Columns

### Create a new column

```
POST /boards/{board_id}/columns

{
  "title": "New Column"
}
```

### Update a column

```
PUT /columns/{column_id}

{
  "title": "Updated Column Name"
}
```

### Delete a column

```
DELETE /columns/{column_id}
```

### Update column positions (drag-and-drop columns)

```
POST /boards/{board_id}/column-positions

{
  "columns": [
    {
      "id": 1,
      "position": 0
    },
    {
      "id": 2,
      "position": 1
    },
    {
      "id": 3,
      "position": 2
    }
  ]
}
```

## Tasks

### Create a new task

```
POST /columns/{column_id}/tasks

{
  "title": "New Task",
  "description": "Task description",
  "tag": "Feature",
  "due_date": "2024-06-30",
  "assigned_to": "John Doe",
  "priority": "high"
}
```

### Update a task

```
PUT /tasks/{task_id}

{
  "title": "Updated Task",
  "description": "Updated description",
  "tag": "Bug",
  "due_date": "2024-07-15",
  "assigned_to": "Jane Smith",
  "priority": "medium"
}
```

### Delete a task

```
DELETE /tasks/{task_id}
```

### Move a task (drag-and-drop functionality)

```
POST /tasks/{task_id}/move

{
  "column_id": 2,
  "position": 3
}
```

## Data Models

### Board

- `id`: Unique identifier
- `name`: Board name
- `description`: Board description

### Column

- `id`: Unique identifier
- `board_id`: ID of the parent board
- `title`: Column title
- `position`: Column order position

### Task

- `id`: Unique identifier
- `column_id`: ID of the parent column
- `title`: Task title
- `description`: Task description
- `tag`: Task category or tag
- `position`: Task order position within column
- `due_date`: Due date for task completion
- `assigned_to`: Person assigned to the task
- `priority`: Task priority (low, medium, high)

## Implementation Example

To drag and drop a task from one column to another:

1. Call the `/tasks/{task_id}/move` endpoint
2. Provide the target column ID and the new position in that column

## Setup Instructions

1. Run database migrations: `php artisan migrate`
2. Seed the database with sample data: `php artisan db:seed`
3. Start the server: `php artisan serve` 