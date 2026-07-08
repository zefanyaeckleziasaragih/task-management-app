"use client";

import { useEffect } from "react";
import { AlertIcon } from "@/lib/icons";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Ya, lanjutkan",
  cancelLabel = "Batal",
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !loading) onCancel();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel, loading]);

  return (
    <div
      className="fixed inset-0 bg-ink/40 backdrop-blur-[2px] flex items-center justify-center z-50 px-4"
      onClick={() => !loading && onCancel()}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        className="w-full max-w-sm bg-surface rounded-3xl shadow-2xl p-6 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <span
            className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${
              danger
                ? "bg-danger-soft text-danger"
                : "bg-primary/10 text-primary"
            }`}
          >
            <AlertIcon className="w-5 h-5" />
          </span>
          <div className="pt-1">
            <h2
              id="confirm-dialog-title"
              className="font-display text-base font-semibold text-ink"
            >
              {title}
            </h2>
            <p
              id="confirm-dialog-message"
              className="text-sm text-ink-muted mt-1"
            >
              {message}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2.5 text-sm font-medium rounded-xl border border-border text-ink-muted hover:bg-canvas transition disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            autoFocus
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2.5 text-sm font-medium rounded-xl text-white shadow-sm transition disabled:opacity-50 ${
              danger
                ? "bg-danger shadow-danger/25 hover:opacity-90"
                : "bg-primary shadow-primary/25 hover:bg-primary-hover"
            }`}
          >
            {loading ? "Memproses…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
