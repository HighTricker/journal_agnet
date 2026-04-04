from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import diary, weekly, monthly, report, chat

app = FastAPI(title="Journal Agent API", version="1.0.0")

# --- CORS 配置：允许前端开发服务器访问 ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 挂载路由 ---
app.include_router(diary.router)
app.include_router(weekly.router)
app.include_router(monthly.router)
app.include_router(report.router)
app.include_router(chat.router)
