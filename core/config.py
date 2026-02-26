# config.py
import os

# --- 根目录：你所有日记文件的“大本营” ---
BASE_DIR = r"D:\2026年规划及文件留存"

# --- 年度 CSV 数据存放位置 (这些路径是固定的，一年一份) ---
PATH_TASKS = os.path.join(BASE_DIR, "data", "tasks")
PATH_TIME = os.path.join(BASE_DIR, "data", "time")
PATH_SUMMARY = os.path.join(BASE_DIR, "data", "summary")

# --- 自动创建年度数据文件夹 ---
# 注意：Markdown 文件夹会根据日期在 data_manager.py 中动态创建
for path in [PATH_TASKS, PATH_TIME, PATH_SUMMARY]:
    os.makedirs(path, exist_ok=True)