import os
from datetime import date

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


def _build_task_context(db: Session) -> str:
    """Ubah seluruh data task jadi teks ringkas untuk dikirim ke LLM sebagai konteks."""
    tasks = db.query(Task).all()
    lines = []
    for t in tasks:
        assignee_name = t.assignee.name if t.assignee else "-"
        deadline = t.deadline.isoformat() if t.deadline else "-"
        lines.append(
            f"- Judul: {t.title} | Status: {t.status.value} | Deadline: {deadline} | Assignee: {assignee_name}"
        )
    return "\n".join(lines) if lines else "Tidak ada task."


def _fallback_answer(message: str, db: Session) -> str:
    """Jawaban rule-based jika LLM tidak tersedia."""
    msg = message.lower()
    tasks = db.query(Task).all()

    if "belum selesai" in msg:
        pending = [t for t in tasks if t.status.value != "Done"]
        if not pending:
            return "Semua task sudah selesai."
        return "Task yang belum selesai:\n" + "\n".join(
            f"- {t.title} ({t.status.value})" for t in pending
        )

    if "sudah selesai" in msg or "jumlah task" in msg:
        done = [t for t in tasks if t.status.value == "Done"]
        return f"Jumlah task yang sudah selesai: {len(done)}."

    if "deadline" in msg and ("hari ini" in msg or "today" in msg):
        today = date.today()
        due_today = [t for t in tasks if t.deadline == today]
        if not due_today:
            return "Tidak ada task dengan deadline hari ini."
        return "Task dengan deadline hari ini:\n" + "\n".join(f"- {t.title}" for t in due_today)

    for t in tasks:
        if t.title.lower() in msg:
            assignee_name = t.assignee.name if t.assignee else "belum ada assignee"
            return f"Assignee dari task '{t.title}' adalah {assignee_name}."

    return (
        "Maaf, saya belum bisa memahami pertanyaan itu. Coba tanyakan tentang status, "
        "jumlah task selesai, deadline hari ini, atau assignee dari task tertentu."
    )


def _ask_gemini(message: str, context: str) -> str:
    import google.generativeai as genai

    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-2.0-flash")

    prompt = (
        "Kamu adalah asisten yang menjawab pertanyaan seputar data task management. "
        "Jawab HANYA berdasarkan data berikut, jangan mengarang data. "
        "Jawab singkat dan jelas dalam Bahasa Indonesia.\n\n"
        f"Data task:\n{context}\n\n"
        f"Pertanyaan: {message}"
    )
    response = model.generate_content(prompt)
    return response.text.strip()


@router.post("", response_model=ChatResponse)
def chat(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if GEMINI_API_KEY:
        try:
            context = _build_task_context(db)
            reply = _ask_gemini(payload.message, context)
            return ChatResponse(reply=reply)
        except Exception:
            pass

    return ChatResponse(reply=_fallback_answer(payload.message, db))
