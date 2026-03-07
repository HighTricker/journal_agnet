import csv
import os
from langchain.tools import tool
from core.config import get_diary_dir, PATH_DATA, PATH_REPORTS
from core.report_service import send_email as _send_email_impl


# 文件夹名 → 文件名的映射
CSV_FILE_MAP = {
    "tasks": "tasks_log_2026.csv",
    "time": "time_log_2026.csv",
    "summary": "daily_summary_2026.csv",
    "weekly_habits": "weekly_habits_2026.csv",
    "weekly_summary": "weekly_summary_2026.csv",
    "weekly_tasks": "weekly_tasks_2026.csv",
    "monthly_summary": "monthly_summary_2026.csv",
    "monthly_tasks": "monthly_tasks_2026.csv",
}


@tool("read_diary", description="读取指定日期的日记文件，返回日记内容")
def read_diary(date: str) -> str:
    """读取指定日期的markdown日记文件。

    Args:
        date: 日期字符串，格式为 YYYY-MM-DD，例如 2026-03-01
    """
    month = int(date.split("-")[1])
    diary_dir = get_diary_dir(month)
    file_path = os.path.join(diary_dir, f"diary_{date}.md")

    if not os.path.exists(file_path):
        return f"{date} 没有找到日记文件"

    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    return content


@tool("read_csv_data", description="读取指定类别的CSV量化数据，按时间段筛选后返回")
def read_csv_data(category: str, period: str) -> str:
    """读取指定类别的CSV量化数据，按时间段筛选后返回。

    Args:
        category: 数据类别，可选值：tasks, time, summary, weekly_habits, weekly_summary, weekly_tasks, monthly_summary, monthly_tasks
        period: 时间段，如 "2026-03-01"（日）、"2026-W10"（周）、"2026-03"（月）
    """
    filename = CSV_FILE_MAP.get(category)
    if not filename:
        return f"未知类别: {category}"

    file_path = os.path.join(PATH_DATA, category, filename)
    if not os.path.exists(file_path):
        return f"文件不存在: {file_path}"

    with open(file_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        header = ",".join(reader.fieldnames)
        rows = [",".join(row.values()) for row in reader if period in ",".join(row.values())]

    if not rows:
        return f"{category} 中没有 {period} 的数据"

    return header + "\n" + "\n".join(rows)


@tool("save_advice_report", description="将大模型生成的行为建议报告保存为markdown文件到指定目录")
def save_advice_report(date: str, content: str) -> str:
    """将行为建议报告保存为markdown文件。

    Args:
        date: 报告对应的日期，格式为 YYYY-MM-DD
        content: 行为建议的完整内容
    """
    os.makedirs(PATH_REPORTS, exist_ok=True)
    file_path = os.path.join(PATH_REPORTS, f"advice_{date}.md")

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

    return f"建议报告已保存到 {file_path}"


@tool("generate_schedule", description="生成第二天的时间表，按半小时为单位追加写入time_log CSV文件")
def generate_schedule(date: str, schedule: str) -> str:
    """生成第二天的日程安排并写入CSV文件。

    Args:
        date: 日期，格式为 YYYY-MM-DD
        schedule: 日程内容，每行一个时间段，格式为 "时间段,计划"，用换行符分隔。例如：
            06:00-06:30,晨跑
            06:30-07:00,洗漱早餐
            07:00-07:30,阅读
    """
    file_path = os.path.join(PATH_DATA, "time", "time_log_2026.csv")

    if not os.path.exists(file_path):
        return f"文件不存在: {file_path}"

    with open(file_path, "a", encoding="utf-8", newline="") as f:
        for line in schedule.strip().split("\n"):
            parts = line.strip().split(",", 1)
            if len(parts) == 2:
                time_slot, plan = parts
                f.write(f"{date},{time_slot},{plan},,,\n")

    return f"{date} 的日程已写入 {file_path}"


@tool("send_email", description="将行为建议报告通过邮件发送给用户，使用专业HTML邮件模板")
def send_email(content: str) -> str:
    """发送行为建议邮件，复用已有的专业HTML邮件模板。

    Args:
        content: 邮件正文内容（markdown格式，会自动转为HTML）
    """
    try:
        _send_email_impl(content)
        return "邮件已发送成功"
    except ValueError as e:
        return f"邮箱配置错误: {e}"
    except RuntimeError as e:
        return f"发送失败: {e}"
