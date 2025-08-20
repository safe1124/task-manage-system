export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: number;
  due_date: string | null; // local datetime string "YYYY-MM-DDTHH:MM" or ISO from server
  created_at: string; // ISO
  updated_at: string; // ISO
}

