"use client";

import { Task, TaskStatus, User } from "@/lib/types";
import { getAvatarStyle, getInitials } from "@/lib/avatar";
import {
  AlertIcon,
  CalendarIcon,
  ChevronDownIcon,
  PencilIcon,
  TrashIcon,
} from "@/lib/icons";

const STATUS_OPTIONS: TaskStatus[] = ["Todo", "In Progress", "Done"];

function formatDeadline(iso: string | null): string {
  if (!iso) return "Tanpa deadline";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isOverdue(task: Task): boolean {
  if (!task.deadline || task.status === "Done") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(task.deadline + "T00:00:00") < today;
}

interface TaskCardProps {
  task: Task;
  users: User[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
  onAssigneeChange: (task: Task, assigneeId: string) => void;
}

export default function TaskCard({
  task,
  users,
  onEdit,
  onDelete,
  onStatusChange,
  onAssigneeChange,
}: TaskCardProps) {
  const overdue = isOverdue(task);
  const avatarStyle = task.assignee ? getAvatarStyle(task.assignee.name) : null;

  return (
    <div className="group bg-surface rounded-2xl border border-border p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition hover:border-primary/30 hover:shadow-[0_4px_14px_-4px_rgba(16,24,40,0.12)] animate-fade-in-up">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-sm text-ink leading-snug">
          {task.title}
        </h3>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition shrink-0">
          <button
            onClick={() => onEdit(task)}
            aria-label={`Edit task ${task.title}`}
            className="p-1.5 rounded-lg text-ink-faint hover:text-primary hover:bg-primary-soft transition"
          >
            <PencilIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(task)}
            aria-label={`Hapus task ${task.title}`}
            className="p-1.5 rounded-lg text-ink-faint hover:text-danger hover:bg-danger-soft transition"
          >
            <TrashIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-ink-muted mt-1.5 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-3">
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-medium rounded-full px-2 py-1 ${
            overdue ? "bg-danger-soft text-danger" : "bg-canvas text-ink-muted"
          }`}
        >
          {overdue ? (
            <AlertIcon className="w-3 h-3" />
          ) : (
            <CalendarIcon className="w-3 h-3" />
          )}
          {formatDeadline(task.deadline)}
        </span>

        {task.assignee ? (
          <span
            title={task.assignee.name}
            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold ${avatarStyle?.bg} ${avatarStyle?.text}`}
          >
            {getInitials(task.assignee.name)}
          </span>
        ) : (
          <span className="w-6 h-6 rounded-full border border-dashed border-border text-ink-faint" />
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border">
        <div className="relative">
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task, e.target.value as TaskStatus)}
            aria-label="Ubah status"
            className="w-full appearance-none text-[11px] font-medium rounded-lg border border-border bg-canvas/60 pl-2.5 pr-6 py-1.5 text-ink outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="w-3 h-3 pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-ink-faint" />
        </div>

        <div className="relative">
          <select
            value={task.assignee_id ?? ""}
            onChange={(e) => onAssigneeChange(task, e.target.value)}
            aria-label="Ubah assignee"
            className="w-full appearance-none text-[11px] font-medium rounded-lg border border-border bg-canvas/60 pl-2.5 pr-6 py-1.5 text-ink outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
          >
            <option value="">Belum ada</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="w-3 h-3 pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-ink-faint" />
        </div>
      </div>
    </div>
  );
}
