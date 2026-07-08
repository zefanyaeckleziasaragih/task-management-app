"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api, clearToken, getToken } from "@/lib/api";
import { Task, TaskInput, TaskStatus, User } from "@/lib/types";
import TaskModal from "@/components/TaskModal";
import TaskCard from "@/components/TaskCard";
import Chatbot from "@/components/Chatbot";
import ConfirmDialog from "@/components/ConfirmDialog";
import { getAvatarStyle, getInitials } from "@/lib/avatar";
import { ChevronDownIcon, LogoutIcon, PlusIcon, SearchIcon } from "@/lib/icons";

const COLUMNS: {
  status: TaskStatus;
  label: string;
  dot: string;
  soft: string;
  text: string;
}[] = [
  {
    status: "Todo",
    label: "Todo",
    dot: "bg-todo",
    soft: "bg-todo-soft",
    text: "text-todo",
  },
  {
    status: "In Progress",
    label: "In Progress",
    dot: "bg-progress",
    soft: "bg-progress-soft",
    text: "text-progress",
  },
  {
    status: "Done",
    label: "Done",
    dot: "bg-done",
    soft: "bg-done-soft",
    text: "text-done",
  },
];

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [search, setSearch] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);

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
      const [taskList, userList] = await Promise.all([
        api.getTasks(),
        api.getUsers(),
      ]);
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

  function handleDelete(task: Task) {
    setTaskToDelete(task);
  }

  async function confirmDelete() {
    if (!taskToDelete) return;
    setDeleting(true);
    try {
      await api.deleteTask(taskToDelete.id);
      setTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id));
      setTaskToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus task");
    } finally {
      setDeleting(false);
    }
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

  const filteredTasks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks.filter((t) => {
      const matchesSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        (t.description ?? "").toLowerCase().includes(q);
      const matchesAssignee =
        !assigneeFilter || String(t.assignee_id ?? "") === assigneeFilter;
      return matchesSearch && matchesAssignee;
    });
  }, [tasks, search, assigneeFilter]);

  const counts = useMemo(
    () => ({
      total: tasks.length,
      Todo: tasks.filter((t) => t.status === "Todo").length,
      "In Progress": tasks.filter((t) => t.status === "In Progress").length,
      Done: tasks.filter((t) => t.status === "Done").length,
    }),
    [tasks],
  );

  return (
    <div className="flex-1 bg-canvas min-h-screen pb-16">
      <header className="border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-primary text-white flex items-center justify-center font-display font-semibold text-sm">
              T
            </div>
            <span className="font-display font-semibold text-ink">
              Taskbase
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition"
            suppressHydrationWarning
          >
            <LogoutIcon className="w-4 h-4" />
            Keluar
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-7">
        {/* Ringkasan */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard label="Total task" value={counts.total} dot="bg-primary" />
          <StatCard label="Todo" value={counts.Todo} dot="bg-todo" />
          <StatCard
            label="In Progress"
            value={counts["In Progress"]}
            dot="bg-progress"
          />
          <StatCard label="Done" value={counts.Done} dot="bg-done" />
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <div className="relative flex-1">
            <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari task berdasarkan judul atau deskripsi…"
              className="w-full rounded-xl border border-border bg-surface pl-9 pr-3 py-2.5 text-sm text-ink placeholder:text-ink-faint outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
              suppressHydrationWarning
            />
          </div>

          <div className="relative">
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              suppressHydrationWarning
              className="appearance-none rounded-xl border border-border bg-surface pl-3 pr-8 py-2.5 text-sm text-ink outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
            >
              <option value="">Semua assignee</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="w-3.5 h-3.5 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-primary text-white px-4 py-2.5 text-sm font-medium shadow-sm shadow-primary/25 hover:bg-primary-hover transition whitespace-nowrap"
            suppressHydrationWarning
          >
            <PlusIcon className="w-4 h-4" />
            Tambah Task
          </button>
        </div>

        {error && (
          <p className="text-sm text-danger bg-danger-soft rounded-xl px-4 py-3 mb-4">
            {error}
          </p>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-40 rounded-2xl bg-surface border border-border animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            {COLUMNS.map((col) => {
              const columnTasks = filteredTasks.filter(
                (t) => t.status === col.status,
              );
              return (
                <div key={col.status} className="bg-canvas rounded-2xl">
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                    <h2 className="text-sm font-semibold text-ink">
                      {col.label}
                    </h2>
                    <span
                      className={`ml-auto text-xs font-medium rounded-full px-2 py-0.5 ${col.soft} ${col.text}`}
                    >
                      {columnTasks.length}
                    </span>
                  </div>

                  <div className="space-y-3 min-h-[80px]">
                    {columnTasks.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-border py-8 text-center">
                        <p className="text-xs text-ink-faint">
                          {tasks.length === 0
                            ? "Belum ada task."
                            : "Tidak ada task di sini."}
                        </p>
                      </div>
                    ) : (
                      columnTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          users={users}
                          onEdit={openEditModal}
                          onDelete={handleDelete}
                          onStatusChange={handleStatusChange}
                          onAssigneeChange={handleAssigneeChange}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && tasks.length === 0 && (
          <div className="mt-2 flex flex-col items-center text-center py-10">
            <p className="text-sm text-ink-muted mb-3">
              Belum ada task sama sekali. Yuk mulai dengan menambahkan task
              pertamamu.
            </p>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-1.5 rounded-xl bg-primary text-white px-4 py-2.5 text-sm font-medium hover:bg-primary-hover transition"
              suppressHydrationWarning
            >
              <PlusIcon className="w-4 h-4" />
              Tambah Task Pertama
            </button>
          </div>
        )}

        {users.length > 0 && (
          <div className="mt-8 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-ink-faint">Tim:</span>
            {users.map((u) => {
              const style = getAvatarStyle(u.name);
              return (
                <span
                  key={u.id}
                  className={`inline-flex items-center gap-1.5 text-xs rounded-full pl-1 pr-2.5 py-1 ${style.bg} ${style.text}`}
                >
                  <span className="w-5 h-5 rounded-full bg-white/60 flex items-center justify-center text-[9px] font-semibold">
                    {getInitials(u.name)}
                  </span>
                  {u.name}
                </span>
              );
            })}
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

      {taskToDelete && (
        <ConfirmDialog
          title="Hapus task ini?"
          message={`Hapus task "${taskToDelete.title}"? Tindakan ini tidak bisa dibatalkan.`}
          confirmLabel="Hapus"
          danger
          loading={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setTaskToDelete(null)}
        />
      )}

      <Chatbot />
    </div>
  );
}

function StatCard({
  label,
  value,
  dot,
}: {
  label: string;
  value: number;
  dot: string;
}) {
  return (
    <div className="bg-surface rounded-2xl border border-border px-4 py-3.5">
      <div className="flex items-center gap-1.5 text-xs text-ink-muted mb-1.5">
        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
        {label}
      </div>
      <p className="font-display text-2xl font-semibold text-ink">{value}</p>
    </div>
  );
}
