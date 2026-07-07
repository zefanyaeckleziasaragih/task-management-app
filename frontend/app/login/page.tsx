"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, setToken } from "@/lib/api";
import { ClipboardIcon } from "@/lib/icons";

const DEMO_ACCOUNTS = [
  { label: "Admin", email: "admin@example.com", password: "admin123" },
  { label: "Zefanya", email: "zefanya@example.com", password: "password123" },
  { label: "Budi", email: "budi@example.com", password: "budi123" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.login(email, password);
      setToken(res.access_token);
      router.push("/tasks");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login gagal");
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(demoEmail: string, demoPassword: string) {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError("");
  }

  return (
    <div className="relative flex-1 flex items-center justify-center overflow-hidden px-4 py-12 bg-canvas">
      {/* Aksen dekoratif lembut di latar belakang */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -left-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-progress/10 blur-3xl"
      />

      <div className="relative w-full max-w-sm">
        <div className="flex flex-col items-center mb-7 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white font-display font-semibold text-lg shadow-sm shadow-primary/30">
            T
          </div>
          <h1 className="font-display mt-3 text-xl font-semibold text-ink">
            Taskbase
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            Masuk untuk mengelola task tim kamu.
          </p>
        </div>

        <div className="bg-surface rounded-3xl border border-border shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-4px_rgba(16,24,40,0.08)] p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-canvas/40 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                placeholder="nama@perusahaan.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-border bg-canvas/40 px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-danger bg-danger-soft rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary text-white py-2.5 text-sm font-medium tracking-wide shadow-sm shadow-primary/30 transition hover:bg-primary-hover disabled:opacity-50"
            >
              {loading ? "Memproses…" : "Masuk"}
            </button>
          </form>
        </div>

        <div className="mt-5 rounded-2xl border border-dashed border-border bg-surface/60 p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-ink-muted mb-2.5">
            <ClipboardIcon className="w-3.5 h-3.5" />
            Akun demo — klik untuk isi otomatis
          </div>
          <div className="flex flex-wrap gap-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => fillDemo(acc.email, acc.password)}
                className="text-xs px-3 py-1.5 rounded-full border border-border bg-surface text-ink-muted hover:border-primary/40 hover:text-primary transition"
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
