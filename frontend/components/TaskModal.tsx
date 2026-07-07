"use client";

import { useState } from "react";
import { Task, TaskInput, TaskStatus, User } from "@/lib/types";
import { getAvatarStyle, getInitials } from "@/lib/avatar";
import { CloseIcon } from "@/lib/icons";

const STATUSES: {
  value: TaskStatus;
  dot: string;
  soft: string;
  text: string;
}[] = [
  { value: "Todo", dot: "bg-todo", soft: "bg-todo-soft", text: "text-todo" },
  {
    value: "In Progress",
    dot: "bg-progress",
    soft: "bg-progress-soft",
    text: "text-progress",
  },
  { value: "Done", dot: "bg-done", soft: "bg-done-soft", text: "text-done" },
];

interface TaskModalProps {
  task: Task | null; // null = mode tambah
  users: User[];
  onClose: () => void;
  onSave: (input: TaskInput) => Promise<void>;
}

export default function TaskModal({
  task,
  users,
  onClose,
  onSave,
}: TaskModalProps) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? "Todo");
  const [deadline, setDeadline] = useState(task?.deadline ?? "");
  const [assigneeId, setAssigneeId] = useState<string>(
    task?.assignee_id ? String(task.assignee_id) : "",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSave({
        title,
        description,
        status,
        deadline,
        assignee_id: assigneeId ? Number(assigneeId) : null,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan task");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-ink/40 backdrop-blur-[2px] flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-surface rounded-3xl shadow-2xl p-6 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-semibold text-ink">
            {task ? "Edit Task" : "Tambah Task Baru"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="p-1.5 rounded-lg text-ink-faint hover:text-ink hover:bg-canvas transition"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Judul
            </label>
            <input
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Misal: Desain halaman login"
              className="w-full rounded-xl border border-border bg-canvas/40 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Deskripsi
            </label>
            <textarea
              value={description ?? ""}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Detail singkat tentang task ini (opsional)"
              className="w-full rounded-xl border border-border bg-canvas/40 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {STATUSES.map((s) => {
                const active = status === s.value;
                return (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setStatus(s.value)}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-xs font-medium transition ${
                      active
                        ? `${s.soft} ${s.text} border-transparent ring-2 ring-inset ring-current/20`
                        : "border-border text-ink-muted hover:bg-canvas"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                    {s.value}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">
                Deadline
              </label>
              <input
                type="date"
                value={deadline ?? ""}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-xl border border-border bg-canvas/40 px-3 py-2.5 text-sm text-ink outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">
                Assignee
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full rounded-xl border border-border bg-canvas/40 px-3 py-2.5 text-sm text-ink outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
              >
                <option value="">Belum ada</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {assigneeId && (
            <div className="flex items-center gap-2 -mt-1">
              {(() => {
                const u = users.find((usr) => String(usr.id) === assigneeId);
                if (!u) return null;
                const style = getAvatarStyle(u.name);
                return (
                  <>
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold ${style.bg} ${style.text}`}
                    >
                      {getInitials(u.name)}
                    </span>
                    <span className="text-xs text-ink-muted">
                      Ditugaskan ke {u.name}
                    </span>
                  </>
                );
              })()}
            </div>
          )}

          {error && (
            <p className="text-sm text-danger bg-danger-soft rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium rounded-xl border border-border text-ink-muted hover:bg-canvas transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2.5 text-sm font-medium rounded-xl bg-primary text-white shadow-sm shadow-primary/25 hover:bg-primary-hover transition disabled:opacity-50"
            >
              {saving ? "Menyimpan…" : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
