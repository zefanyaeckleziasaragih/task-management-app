"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { BotIcon, CloseIcon, SendIcon, SparkleIcon } from "@/lib/icons";

interface Message {
  role: "user" | "bot";
  text: string;
}

const SUGGESTIONS = [
  "Tampilkan semua task yang belum selesai",
  "Berapa jumlah task yang sudah selesai?",
  "Tugas apa saja yang deadlinenya hari ini?",
];

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "Halo! Aku Task Assistant. Tanyakan apa saja tentang data task di board kamu.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading, open]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    const historyForRequest = messages;
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.chat(text, historyForRequest);
      setMessages((prev) => [...prev, { role: "bot", text: res.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text:
            err instanceof Error
              ? `Maaf, terjadi kendala: ${err.message}`
              : "Maaf, terjadi kesalahan. Coba lagi ya.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Buka Task Assistant"
        className="fixed bottom-6 right-6 rounded-full bg-primary text-white w-14 h-14 shadow-lg shadow-primary/30 hover:bg-primary-hover transition flex items-center justify-center z-40"
      >
        <BotIcon className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-88 max-w-[calc(100vw-2rem)] h-120 max-h-[calc(100vh-3rem)] bg-surface rounded-3xl shadow-2xl border border-border flex flex-col overflow-hidden z-40 animate-fade-in-up">
      <div className="flex items-center justify-between px-4 py-3.5 bg-primary text-white">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
            <BotIcon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-medium leading-none">Task Assistant</p>
            <p className="text-[11px] text-white/70 mt-0.5">
              Tanya apa saja soal task-mu
            </p>
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="p-1 text-white/80 hover:text-white transition"
        >
          <CloseIcon className="w-4 h-4" />
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3.5 py-3.5 space-y-3"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex items-end gap-2 ${m.role === "user" ? "justify-end" : ""}`}
          >
            {m.role === "bot" && (
              <div className="w-6 h-6 rounded-full bg-primary-soft text-primary flex items-center justify-center shrink-0">
                <BotIcon className="w-3.5 h-3.5" />
              </div>
            )}
            <div
              className={`text-sm px-3.5 py-2.5 rounded-2xl max-w-[80%] whitespace-pre-wrap leading-relaxed ${
                m.role === "user"
                  ? "bg-primary text-white rounded-br-sm"
                  : "bg-canvas text-ink rounded-bl-sm"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-end gap-2">
            <div className="w-6 h-6 rounded-full bg-primary-soft text-primary flex items-center justify-center shrink-0">
              <BotIcon className="w-3.5 h-3.5" />
            </div>
            <div className="bg-canvas rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
              <span
                className="w-1.5 h-1.5 rounded-full bg-ink-faint animate-typing-dot"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="w-1.5 h-1.5 rounded-full bg-ink-faint animate-typing-dot"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="w-1.5 h-1.5 rounded-full bg-ink-faint animate-typing-dot"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        )}

        {messages.length === 1 && !loading && (
          <div className="pt-1">
            <p className="flex items-center gap-1 text-[11px] font-medium text-ink-faint mb-2">
              <SparkleIcon className="w-3 h-3" />
              Coba tanyakan
            </p>
            <div className="flex flex-col gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-left text-xs px-3 py-2 rounded-xl border border-border text-ink-muted hover:border-primary/40 hover:text-primary transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSend}
        className="flex items-center border-t border-border p-2.5 gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tulis pertanyaan…"
          className="flex-1 text-sm rounded-xl border border-border bg-canvas/40 px-3.5 py-2.5 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          aria-label="Kirim pesan"
          className="w-9 h-9 shrink-0 flex items-center justify-center rounded-xl bg-primary text-white hover:bg-primary-hover transition disabled:opacity-40"
        >
          <SendIcon className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
