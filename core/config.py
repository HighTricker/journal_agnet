# config.py
import os

# --- 根目录：从环境变量读取，未设置时使用 D 盘的实际数据目录 ---
BASE_DIR = os.environ.get(
    "JOURNAL_BASE_DIR",
    r"D:\2026年规划及文件留存"
)

# --- 年度 CSV 数据存放位置 (这些路径是固定的，一年一份) ---
PATH_TASKS = os.path.join(BASE_DIR, "data", "tasks")
PATH_TIME = os.path.join(BASE_DIR, "data", "time")
PATH_SUMMARY = os.path.join(BASE_DIR, "data", "summary")

# --- 周记 CSV 数据存放位置 ---
PATH_WEEKLY_SUMMARY = os.path.join(BASE_DIR, "data", "weekly_summary")
PATH_WEEKLY_HABITS = os.path.join(BASE_DIR, "data", "weekly_habits")
PATH_WEEKLY_TASKS = os.path.join(BASE_DIR, "data", "weekly_tasks")

# --- 月记 CSV 数据存放位置 ---
PATH_MONTHLY_SUMMARY = os.path.join(BASE_DIR, "data", "monthly_summary")
PATH_MONTHLY_TASKS = os.path.join(BASE_DIR, "data", "monthly_tasks")

# --- 自动创建年度数据文件夹 ---
# 注意：Markdown 文件夹会根据日期在 data_manager.py 中动态创建
for path in [PATH_TASKS, PATH_TIME, PATH_SUMMARY,
             PATH_WEEKLY_SUMMARY, PATH_WEEKLY_HABITS, PATH_WEEKLY_TASKS,
             PATH_MONTHLY_SUMMARY, PATH_MONTHLY_TASKS]:
    os.makedirs(path, exist_ok=True)
