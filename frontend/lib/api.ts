import { Task, TaskInput, User } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function setToken(token: string) {
  localStorage.setItem("token", token);
}

export function clearToken() {
  localStorage.removeItem("token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      // ignore parse error
    }
    throw new Error(detail);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  login: (email: string, password: string) =>
    request<{ access_token: string; token_type: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  getTasks: () => request<Task[]>("/tasks"),

  createTask: (input: TaskInput) =>
    request<Task>("/tasks", { method: "POST", body: JSON.stringify(input) }),

  updateTask: (id: number, input: Partial<TaskInput>) =>
    request<Task>(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(input) }),

  deleteTask: (id: number) => request<void>(`/tasks/${id}`, { method: "DELETE" }),

  getUsers: () => request<User[]>("/users"),

  chat: (message: string) =>
    request<{ reply: string }>("/chatbot", {
      method: "POST",
      body: JSON.stringify({ message }),
    }),
};
