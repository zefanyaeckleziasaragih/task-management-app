from __future__ import annotations

import difflib
import os
import re
from datetime import date, timedelta
from typing import Optional

from dotenv import load_dotenv
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Task, User
from app.schemas import ChatRequest, ChatResponse

load_dotenv()

router = APIRouter(prefix="/chatbot", tags=["chatbot"])

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")

STOPWORDS = {
    "task", "tugas", "yang", "dari", "untuk", "dengan", "adalah", "apa", "saja",
    "siapa", "assignee", "status", "statusnya", "itu", "ini", "punya", "nya",
    "tampilkan", "lihat", "berapa", "jumlah", "daftar", "list", "semua", "ada",
}


def _normalize(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^\w\s]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def _significant_words(text: str) -> set:
    return {w for w in _normalize(text).split() if w not in STOPWORDS and len(w) > 2}


def _format_task_line(t: Task) -> str:
    assignee_name = t.assignee.name if t.assignee else "belum ada assignee"
    deadline = t.deadline.strftime("%d %b %Y") if t.deadline else "tanpa deadline"
    return f"- {t.title} [{t.status.value}] — assignee: {assignee_name}, deadline: {deadline}"


def _build_task_context(tasks) -> str:
    """Ubah seluruh data task jadi teks ringkas untuk dikirim ke LLM sebagai konteks."""
    if not tasks:
        return "Tidak ada task sama sekali."
    return "\n".join(
        f"- Judul: {t.title} | Status: {t.status.value} | Deadline: "
        f"{t.deadline.isoformat() if t.deadline else '-'} | Assignee: "
        f"{t.assignee.name if t.assignee else '-'}"
        for t in tasks
    )


def _find_best_task(msg_norm: str, tasks) -> Optional[Task]:
    """Cari task yang judulnya paling relevan dengan pesan user.

    1) Cocokkan substring persis dulu (paling akurat).
    2) Kalau tidak ada, hitung overlap kata-kata signifikan antara pesan & judul.
    3) Terakhir, coba fuzzy-match string (toleran typo) sebagai fallback tipis.
    """
    if not tasks:
        return None

    for t in tasks:
        if t.title.lower() in msg_norm:
            return t

    msg_words = _significant_words(msg_norm)
    best_task, best_score = None, 0.0
    for t in tasks:
        title_words = _significant_words(t.title)
        if not title_words:
            continue
        overlap = len(msg_words & title_words)
        score = overlap / len(title_words)
        if score > best_score:
            best_task, best_score = t, score

    if best_score >= 0.5:
        return best_task

    titles = [t.title for t in tasks]
    matches = difflib.get_close_matches(msg_norm, [ti.lower() for ti in titles], n=1, cutoff=0.6)
    if matches:
        for t in tasks:
            if t.title.lower() == matches[0]:
                return t
    return None


def _fallback_answer(message: str, db: Session) -> str:
    """Jawaban rule-based (dipakai kalau GEMINI_API_KEY tidak diset atau LLM gagal)."""
    tasks = db.query(Task).all()
    msg = _normalize(message)
    today = date.today()

    is_count_query = any(k in msg for k in ["berapa", "jumlah", "ada berapa"])
    is_list_query = any(k in msg for k in ["tampilkan", "lihat", "daftar", "list", "sebutkan"])

    # --- Status: belum selesai (todo + in progress) ---
    if any(k in msg for k in ["belum selesai", "belum kelar", "pending"]):
        pending = [t for t in tasks if t.status.value != "Done"]
        if is_count_query:
            return f"Jumlah task yang belum selesai: {len(pending)}."
        if not pending:
            return "Semua task sudah selesai."
        return "Task yang belum selesai:\n" + "\n".join(_format_task_line(t) for t in pending)

    # --- Status: in progress ---
    if "in progress" in msg or "sedang dikerjakan" in msg or "sedang berjalan" in msg:
        in_progress = [t for t in tasks if t.status.value == "In Progress"]
        if is_count_query:
            return f"Jumlah task yang sedang dikerjakan: {len(in_progress)}."
        if not in_progress:
            return "Tidak ada task yang sedang dikerjakan."
        return "Task yang sedang dikerjakan:\n" + "\n".join(_format_task_line(t) for t in in_progress)

    # --- Status: sudah selesai ---
    if "sudah selesai" in msg or ("selesai" in msg and "belum" not in msg) or "done" in msg:
        done = [t for t in tasks if t.status.value == "Done"]
        if is_count_query or not is_list_query:
            return f"Jumlah task yang sudah selesai: {len(done)}."
        if not done:
            return "Belum ada task yang selesai."
        return "Task yang sudah selesai:\n" + "\n".join(_format_task_line(t) for t in done)

    # --- Task yang sudah lewat deadline ---
    if any(k in msg for k in ["terlambat", "overdue", "lewat deadline", "melewati deadline"]):
        overdue = [t for t in tasks if t.deadline and t.deadline < today and t.status.value != "Done"]
        if not overdue:
            return "Tidak ada task yang terlambat."
        return "Task yang sudah melewati deadline:\n" + "\n".join(_format_task_line(t) for t in overdue)

    # --- Deadline hari ini / besok / minggu ini ---
    if any(k in msg for k in ["deadline", "jatuh tempo", "due"]):
        if "besok" in msg:
            target = today + timedelta(days=1)
            due = [t for t in tasks if t.deadline == target]
            label = "besok"
        elif "minggu ini" in msg:
            week_end = today + timedelta(days=(6 - today.weekday()))
            due = [t for t in tasks if t.deadline and today <= t.deadline <= week_end]
            label = "minggu ini"
        else:
            due = [t for t in tasks if t.deadline == today]
            label = "hari ini"

        if not due:
            return f"Tidak ada task dengan deadline {label}."
        return f"Task dengan deadline {label}:\n" + "\n".join(_format_task_line(t) for t in due)

    # --- Assignee dari task tertentu ---
    if any(k in msg for k in ["assignee", "siapa yang mengerjakan", "siapa yang pegang", "penanggung jawab"]):
        task = _find_best_task(msg, tasks)
        if task:
            assignee_name = task.assignee.name if task.assignee else "belum ada assignee"
            return f"Assignee dari task '{task.title}' adalah {assignee_name}."
        return "Task tersebut tidak ditemukan. Coba sebutkan judul task-nya lebih lengkap ya."

    # --- Semua task milik seorang user tertentu ---
    for user in db.query(User).all():
        if user.name.lower() in msg:
            user_tasks = [t for t in tasks if t.assignee_id == user.id]
            if not user_tasks:
                return f"{user.name} belum memiliki task."
            return f"Task milik {user.name}:\n" + "\n".join(_format_task_line(t) for t in user_tasks)

    # --- Daftar semua task ---
    if is_list_query or "semua task" in msg:
        if not tasks:
            return "Belum ada task sama sekali."
        return "Semua task:\n" + "\n".join(_format_task_line(t) for t in tasks)

    return (
        "Maaf, saya belum dapat memahami pertanyaan tersebut. Coba tanyakan misalnya:\n"
        "- \"Tampilkan semua task yang belum selesai\"\n"
        "- \"Berapa jumlah task yang sudah selesai?\"\n"
        "- \"Tugas apa saja yang deadlinenya hari ini?\"\n"
        "- \"Siapa assignee dari task [judul task]?\""
    )


def _ask_gemini(message: str, tasks) -> str:
    import google.generativeai as genai

    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel(GEMINI_MODEL)

    context = _build_task_context(tasks)
    prompt = (
        "Kamu adalah asisten yang membantu menjawab pertanyaan seputar data task "
        f"management untuk sebuah tim. Hari ini tanggal {date.today().isoformat()}. "
        "Jawab HANYA berdasarkan data task di bawah, jangan mengarang data yang tidak ada. "
        "Jika data yang ditanyakan tidak ditemukan, katakan dengan jujur bahwa datanya "
        "tidak tersedia. Jawab singkat, jelas, dan ramah dalam Bahasa Indonesia.\n\n"
        f"Data task saat ini:\n{context}\n\n"
        f"Pertanyaan pengguna: {message}"
    )
    response = model.generate_content(prompt)
    text = (response.text or "").strip()
    if not text:
        raise ValueError("Respon kosong dari model Gemini")
    return text


@router.post("", response_model=ChatResponse)
def chat(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    message = payload.message.strip()
    if not message:
        return ChatResponse(reply="Silakan tulis pertanyaanmu terlebih dahulu ya.")

    if GEMINI_API_KEY:
        try:
            tasks = db.query(Task).all()
            reply = _ask_gemini(message, tasks)
            return ChatResponse(reply=reply)
        except Exception:
            pass  # LLM gagal/tidak tersedia -> pakai jawaban rule-based di bawah

    return ChatResponse(reply=_fallback_answer(message, db))