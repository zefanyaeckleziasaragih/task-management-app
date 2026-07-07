from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth import router as auth_router
from app.routers.chatbot import router as chatbot_router
from app.routers.tasks import router as tasks_router
from app.routers.users import router as users_router

app = FastAPI(title="Task Management API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # untuk keperluan technical test; batasi di production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(tasks_router)
app.include_router(users_router)
app.include_router(chatbot_router)


@app.get("/")
def health_check():
    return {"status": "ok", "message": "Task Management API is running"}
