"""后端 sidecar 入口：被 Electron 主进程 spawn 启动。

Electron 通过 JOURNAL_BACKEND_PORT 环境变量传入端口（动态分配避免冲突）。
单独运行（不带环境变量）时用 18000 端口，方便开发期间脱离 Electron 直接测试。

打包时用 PyInstaller console 模式，**不要 --windowed**：
- console 模式 stdout/stderr 正常工作，Electron 主进程能捕获日志
- console 窗口在 Electron 启动 backend 时用 spawn 的 windowsHide 参数隐藏
"""

import os

import uvicorn

from main import app

if __name__ == "__main__":
    port = int(os.environ.get("JOURNAL_BACKEND_PORT", "18000"))
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="warning")
