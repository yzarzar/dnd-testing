export type ColumnName = 'backlog' | 'todo' | 'inProgress' | 'done';

export interface Column {
  id: ColumnName;
  title: string;
}

export interface Task {
  id: string;
  columnId: ColumnName;
  title: string;
  description: string;
  tag: string;
}

export const COLUMN_NAMES: Record<string, ColumnName> = {
  BACKLOG: 'backlog',
  TODO: 'todo',
  IN_PROGRESS: 'inProgress',
  DONE: 'done',
};

export const COLUMNS: Column[] = [
  {
    id: COLUMN_NAMES.BACKLOG,
    title: 'Backlog',
  },
  {
    id: COLUMN_NAMES.TODO,
    title: 'To Do',
  },
  {
    id: COLUMN_NAMES.IN_PROGRESS,
    title: 'In Progress',
  },
  {
    id: COLUMN_NAMES.DONE,
    title: 'Done',
  },
];

export const TASKS: Task[] = [
  {
    id: '1',
    columnId: COLUMN_NAMES.BACKLOG,
    title: 'Research user needs',
    description: 'Conduct interviews with 5 customers to understand pain points',
    tag: 'Research',
  },
  {
    id: '2',
    columnId: COLUMN_NAMES.BACKLOG,
    title: 'Define MVP requirements',
    description: 'Create a list of must-have features for the first release',
    tag: 'Planning',
  },
  {
    id: '3',
    columnId: COLUMN_NAMES.TODO,
    title: 'Design user authentication flow',
    description: 'Create wireframes for sign up, login, and password reset',
    tag: 'Design',
  },
  {
    id: '4',
    columnId: COLUMN_NAMES.TODO,
    title: 'Setup CI/CD pipeline',
    description: 'Configure GitHub Actions for automated testing and deployment',
    tag: 'DevOps',
  },
  {
    id: '5',
    columnId: COLUMN_NAMES.IN_PROGRESS,
    title: 'Implement login API',
    description: 'Create backend endpoints for user authentication',
    tag: 'Backend',
  },
  {
    id: '6',
    columnId: COLUMN_NAMES.IN_PROGRESS,
    title: 'Build dashboard UI',
    description: 'Create responsive layout for the main dashboard',
    tag: 'Frontend',
  },
  {
    id: '7',
    columnId: COLUMN_NAMES.DONE,
    title: 'Setup project structure',
    description: 'Initialize repository and configure basic project dependencies',
    tag: 'Setup',
  },
  {
    id: '8',
    columnId: COLUMN_NAMES.DONE,
    title: 'Implement dark mode',
    description: 'Add toggle for switching between light and dark themes',
    tag: 'Frontend',
  },
  // Additional tasks
  {
    id: '9',
    columnId: COLUMN_NAMES.BACKLOG,
    title: 'Competitor analysis',
    description: 'Review top 3 competing products and identify opportunities',
    tag: 'Research',
  },
  {
    id: '10',
    columnId: COLUMN_NAMES.BACKLOG,
    title: 'Create user personas',
    description: 'Develop 3-4 user personas based on customer interviews',
    tag: 'UX',
  },
  {
    id: '11',
    columnId: COLUMN_NAMES.TODO,
    title: 'Set up database schema',
    description: 'Design and implement initial database schema for core entities',
    tag: 'Database',
  },
  {
    id: '12',
    columnId: COLUMN_NAMES.TODO,
    title: 'Create style guide',
    description: 'Define design system including colors, typography and components',
    tag: 'Design',
  },
  {
    id: '13',
    columnId: COLUMN_NAMES.IN_PROGRESS,
    title: 'Implement user profiles',
    description: 'Create user profile pages with edit functionality',
    tag: 'Frontend',
  },
  {
    id: '14',
    columnId: COLUMN_NAMES.IN_PROGRESS,
    title: 'Setup error logging',
    description: 'Integrate Sentry for frontend and backend error tracking',
    tag: 'DevOps',
  },
  {
    id: '15',
    columnId: COLUMN_NAMES.DONE,
    title: 'Create project roadmap',
    description: 'Outline development phases with key milestones and deadlines',
    tag: 'Planning',
  },
  {
    id: '16',
    columnId: COLUMN_NAMES.DONE,
    title: 'Infrastructure setup',
    description: 'Set up AWS infrastructure with Terraform for scalable deployment',
    tag: 'DevOps',
  },
]; 