import sys
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# 必须早于 routers 导入：routers 及其依赖（core.report_config 等）在 import
# 阶段就读 os.environ，先加载 .env 才能拿到 API 密钥 / SMTP 配置。
import core.env_setup  # noqa: F401  （import 即加载 .env）
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
    # 额外放行任意端口的本机地址：dev 服务器端口可能变化（如 --port 3000）。
    # 打包后前后端同源、本不依赖 CORS，留此正则可避免端口变动导致跨域被拒。
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
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

# --- 前端静态资源 serve（打包后 / 本地 build 后启用）---
# 资源根目录：PyInstaller 打包后用 sys._MEIPASS（onedir 的 _internal/），开发模式用脚本目录
if getattr(sys, "frozen", False):
    _BASE_DIR = Path(sys._MEIPASS)
else:
    _BASE_DIR = Path(__file__).parent

FRONTEND_DIST = _BASE_DIR / "journal-frontend" / "dist"

if FRONTEND_DIST.exists():
    # 静态资源（CSS / JS / 图片）走 mount，效率最高
    app.mount(
        "/assets",
        StaticFiles(directory=str(FRONTEND_DIST / "assets")),
        name="assets",
    )

    # SPA fallback：非 /api 的所有路径处理
    # 必须放在所有 include_router 之后，否则会拦截 /api/* 请求
    # 优先返回 dist 下真实存在的文件（favicon.svg 等根级静态资源），否则 fallback 到 index.html
    @app.get("/{full_path:path}")
    async def spa_fallback(full_path: str):
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404)
        # 防路径穿越
        if ".." in full_path or full_path.startswith("/"):
            raise HTTPException(status_code=404)
        candidate = FRONTEND_DIST / full_path
        if full_path and candidate.is_file():
            return FileResponse(str(candidate))
        return FileResponse(str(FRONTEND_DIST / "index.html"))
