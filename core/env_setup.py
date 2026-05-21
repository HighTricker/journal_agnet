"""加载 .env 环境变量。

必须在任何会读取 os.environ 的模块（routers、agent、report_config 等）之前被 import，
因此 main.py 把 `import core.env_setup` 放在 routers 导入之前。

- 开发模式：读项目根目录的 .env。
- 打包模式（PyInstaller frozen）：读 %APPDATA%\\journal-agent\\.env
  （用户可编辑、重新打包不会丢失），兜底读 exe 同级目录的 .env。
  打包后 .env 不进发行包 —— 密钥按机器/按用户单独配置，符合本地优先与商业化。
"""

import os
import sys
from pathlib import Path

from dotenv import load_dotenv


def _env_candidates() -> list[Path]:
    """按优先级返回 .env 候选路径。"""
    if getattr(sys, "frozen", False):
        # 打包模式：密钥放在用户可写、重新打包不丢失的位置
        paths: list[Path] = []
        appdata = os.environ.get("APPDATA")
        if appdata:
            paths.append(Path(appdata) / "journal-agent" / ".env")
        paths.append(Path(sys.executable).parent / ".env")  # exe 同级兜底
        return paths
    # 开发模式：core/ 的上一级就是项目根
    return [Path(__file__).resolve().parent.parent / ".env"]


def load_env() -> Path | None:
    """加载第一个存在的 .env，返回其路径；都不存在返回 None（AI 优雅降级为「未配置」）。

    load_dotenv 默认 override=False —— 不覆盖已存在的真实环境变量。
    """
    for candidate in _env_candidates():
        if candidate.is_file():
            load_dotenv(candidate)
            return candidate
    return None


# import 即加载
ENV_FILE = load_env()
