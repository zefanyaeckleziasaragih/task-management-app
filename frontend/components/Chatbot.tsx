"use client";

import { useState } from "react";
import { api } from "@/lib/api";

interface Message {
  role: "user" | "bot";
  text: string;
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Halo! Tanyakan apa saja tentang data task, misalnya: 'Berapa jumlah task yang sudah selesai?'" },
  ]);
  const [loading, setLoading] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.chat(text);
      setMessages((prev) => [...prev, { role: "bot", text: res.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: err instanceof Error ? err.message : "Terjadi kesalahan." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 rounded-full bg-neutral-900 text-white w-14 h-14 shadow-lg hover:bg-neutral-800 flex items-center justify-center text-xl"
        aria-label="Buka chatbot"
      >
        💬
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 h-96 bg-white rounded-2xl shadow-xl border border-neutral-200 flex flex-col overflow-hidden z-40">
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 bg-neutral-900 text-white">
        <span className="text-sm font-medium">Task Assistant</span>
        <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white text-sm">
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`text-sm px-3 py-2 rounded-lg max-w-[85%] whitespace-pre-wrap ${
              m.role === "user"
                ? "bg-neutral-900 text-white ml-auto"
                : "bg-neutral-100 text-neutral-800"
            }`}
          >
            {m.text}
          </div>
        ))}
        {loading && <div className="text-xs text-neutral-400">Mengetik...</div>}
      </div>

      <form onSubmit={handleSend} className="flex border-t border-neutral-200 p-2 gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tulis pertanyaan..."
          className="flex-1 text-sm rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900"
        />
        <button
          type="submit"
          disabled={loading}
          className="text-sm px-3 py-2 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          Kirim
        </button>
      </form>
    </div>
  );
}
