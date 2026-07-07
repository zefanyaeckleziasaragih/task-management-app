"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, clearToken, getToken } from "@/lib/api";
import { Task, TaskInput, TaskStatus, User } from "@/lib/types";
import TaskModal from "@/components/TaskModal";
import Chatbot from "@/components/Chatbot";

const STATUS_STYLES: Record<TaskStatus, string> = {
  Todo: "bg-neutral-200 text-neutral-700",
  "In Progress": "bg-amber-100 text-amber-700",
  Done: "bg-emerald-100 text-emerald-700",
};

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [taskList, userList] = await Promise.all([api.getTasks(), api.getUsers()]);
      setTasks(taskList);
      setUsers(userList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    clearToken();
    router.push("/login");
  }

  function openCreateModal() {
    setEditingTask(null);
    setModalOpen(true);
  }

  function openEditModal(task: Task) {
    setEditingTask(task);
    setModalOpen(true);
  }

  async function handleSave(input: TaskInput) {
    if (editingTask) {
      const updated = await api.updateTask(editingTask.id, input);
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } else {
      const created = await api.createTask(input);
      setTasks((prev) => [created, ...prev]);
    }
  }

  async function handleDelete(task: Task) {
    if (!confirm(`Hapus task "${task.title}"?`)) return;
    await api.deleteTask(task.id);
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
  }

  async function handleStatusChange(task: Task, status: TaskStatus) {
    const updated = await api.updateTask(task.id, { status });
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }

  async function handleAssigneeChange(task: Task, assigneeId: string) {
    const updated = await api.updateTask(task.id, {
      assignee_id: assigneeId ? Number(assigneeId) : null,
    });
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }

  return (
    <div className="flex-1 bg-neutral-50 min-h-screen">
      <header className="border-b border-neutral-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-neutral-900">Task Management</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-neutral-600 hover:text-neutral-900"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-neutral-500">{tasks.length} task</p>
          <button
            onClick={openCreateModal}
            className="text-sm px-4 py-2 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800"
          >
            + Tambah Task
          </button>
        </div>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        {loading ? (
          <p className="text-sm text-neutral-500">Memuat...</p>
        ) : tasks.length === 0 ? (
          <p className="text-sm text-neutral-500">Belum ada task.</p>
        ) : (
          <div className="bg-white rounded-2xl border border-neutral-200 divide-y divide-neutral-100 overflow-hidden">
            {tasks.map((task) => (
              <div key={task.id} className="p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-neutral-900">{task.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[task.status]}`}>
                      {task.status}
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-sm text-neutral-500 mt-0.5">{task.description}</p>
                  )}
                  <p className="text-xs text-neutral-400 mt-1">
                    Deadline: {task.deadline ?? "-"}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task, e.target.value as TaskStatus)}
                    className="text-xs rounded-lg border border-neutral-300 px-2 py-1.5"
                  >
                    <option value="Todo">Todo</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>

                  <select
                    value={task.assignee_id ?? ""}
                    onChange={(e) => handleAssigneeChange(task, e.target.value)}
                    className="text-xs rounded-lg border border-neutral-300 px-2 py-1.5"
                  >
                    <option value="">- Assignee -</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => openEditModal(task)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(task)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {modalOpen && (
        <TaskModal
          task={editingTask}
          users={users}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}

      <Chatbot />
    </div>
  );
}
