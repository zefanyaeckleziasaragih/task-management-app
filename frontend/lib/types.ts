export type TaskStatus = "Todo" | "In Progress" | "Done";

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  deadline: string | null; // ISO date string (YYYY-MM-DD)
  assignee_id: number | null;
  assignee: User | null;
  created_at: string;
  updated_at: string;
}

export interface TaskInput {
  title: string;
  description: string;
  status: TaskStatus;
  deadline: string;
  assignee_id: number | null;
}
