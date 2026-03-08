import csv
import os
import re
import pandas as pd
from langchain.tools import tool
from core.config import get_diary_dir, PATH_DATA, PATH_REPORTS
from core.data_manager import get_default_time_schedule
from core.report_service import send_email as _send_email_impl
from core import texts as t


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


def _normalize_time_slot(raw: str):
    """将各种时间格式规范化为 'HH:MM-HH:MM' 格式。

    支持的输入格式：
    - "08:30-09:00" → 已标准，直接返回
    - "8:30-9:00"   → 补零 → "08:30-09:00"
    - "8:30"        → 补零 + 自动加30分钟 → "08:30-09:00"
    - "08:30"       → 自动加30分钟 → "08:30-09:00"

    返回 None 表示无法解析。
    """
    raw = raw.strip()

    # 已经是标准格式 "HH:MM-HH:MM"
    if re.match(r'^\d{2}:\d{2}-\d{2}:\d{2}$', raw):
        return raw

    # "H:MM-H:MM" 或 "HH:MM-H:MM" 等不完整格式
    m = re.match(r'^(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})$', raw)
    if m:
        return f"{int(m.group(1)):02d}:{m.group(2)}-{int(m.group(3)):02d}:{m.group(4)}"

    # 只有起始时间 "H:MM" 或 "HH:MM"，自动加 30 分钟
    m = re.match(r'^(\d{1,2}):(\d{2})$', raw)
    if m:
        h, mins = int(m.group(1)), int(m.group(2))
        if mins == 0:
            return f"{h:02d}:00-{h:02d}:30"
        elif mins == 30:
            end_h = h + 1 if h < 23 else 24
            return f"{h:02d}:30-{end_h:02d}:00"

    return None


def _strip_markdown_prefix(line: str) -> str:
    """清理 Markdown 格式前缀（checkbox、bullet、编号列表）。

    - [ ] xxx  →  xxx
    - [x] xxx  →  xxx
    - xxx      →  xxx
    1. xxx     →  xxx
    """
    line = re.sub(r'^-\s*\[[ xX]\]\s*', '', line)
    line = re.sub(r'^[-*]\s+', '', line)
    line = re.sub(r'^\d+\.\s+', '', line)
    return line.strip()


def _clean_plan_text(raw_plan: str):
    """从 AI 输出的计划文本中分离出干净的计划和备注。

    AI 可能输出 "早餐/阅读《人类简史》,✅,摄入精神与物质食粮"，
    需要拆分为：plan="早餐/阅读《人类简史》", note="摄入精神与物质食粮"

    返回 (plan, note) 元组。
    """
    STATUS_MARKERS = {"✅", "❌", "⚠️", "None", ""}
    sub_parts = [p.strip() for p in raw_plan.split(",")]
    plan_parts = []
    note_parts = []
    for p in sub_parts:
        if p in STATUS_MARKERS:
            continue  # 跳过状态标记
        if not plan_parts:
            plan_parts.append(p)
        else:
            note_parts.append(p)
    plan = plan_parts[0] if plan_parts else raw_plan
    note = "；".join(note_parts) if note_parts else ""
    return plan, note


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


@tool("generate_schedule", description="生成指定日期的完整时间表（48个半小时时间段），覆盖该日期已有数据写入time_log CSV文件")
def generate_schedule(date: str, schedule: str) -> str:
    """生成指定日期的日程安排并写入CSV文件（Upsert模式：覆盖该日期已有数据）。

    会生成完整的48个时间段（00:00-24:00），Agent指定的安排覆盖模板默认值，
    未指定的时间段保留默认模板内容。时间段格式统一为 "HH:MM-HH:MM"。

    Args:
        date: 日期，格式为 YYYY-MM-DD
        schedule: 日程内容，每行一个时间段，格式为 "HH:MM-HH:MM,计划"，用换行符分隔。例如：
            06:00-06:30,晨跑
            06:30-07:00,洗漱早餐
            07:00-07:30,阅读
    """
    file_path = os.path.join(PATH_DATA, "time", "time_log_2026.csv")

    # 1. 解析 Agent 传入的安排，建立 时间段 → (计划, 备注) 映射
    agent_plans = {}
    for line in schedule.strip().split("\n"):
        parts = line.strip().split(",", 1)
        if len(parts) == 2:
            time_slot_raw = parts[0]
            time_slot = _normalize_time_slot(time_slot_raw)
            if time_slot:
                plan, note = _clean_plan_text(parts[1].strip())
                agent_plans[time_slot] = (plan, note)

    # 2. 生成完整的 48 个标准时间段（含默认模板）
    template_df = get_default_time_schedule(date)

    # 3. 将 Agent 的安排覆盖到模板中
    for idx, row in template_df.iterrows():
        slot = row[t.COL_TIME_SLOT]
        if slot in agent_plans:
            plan, note = agent_plans[slot]
            template_df.at[idx, t.COL_TIME_PLAN] = plan
            template_df.at[idx, t.COL_TIME_NOTE] = note
            # 清除自动完成状态（Agent 安排的非模板任务不应预设完成）
            template_df.at[idx, t.COL_TIME_ACTUAL] = ""
            template_df.at[idx, t.COL_TIME_STATUS] = "None"

    # 4. Upsert 模式写入：删除该日期旧数据，插入新的 48 行
    if os.path.exists(file_path):
        df_old = pd.read_csv(file_path, encoding='utf-8-sig')
        df_old["Date"] = df_old["Date"].astype(str)
        df_old = df_old[df_old["Date"] != date]
        df_final = pd.concat([df_old, template_df], ignore_index=True)
    else:
        df_final = template_df

    df_final.to_csv(file_path, index=False, encoding='utf-8-sig')

    return f"{date} 的日程已写入 {file_path}（共 {len(agent_plans)} 项自定义安排，其余使用默认模板）"


@tool("add_task", description="向指定日期的任务清单(tasks_log)中添加计划事项，支持多条任务批量写入")
def add_task(date: str, tasks: str) -> str:
    """向 tasks_log CSV 添加计划事项。

    Args:
        date: 日期，格式为 YYYY-MM-DD
        tasks: 任务内容，每行一条，格式为 "HH:MM-HH:MM - 任务内容"。例如：
            06:00-06:30 - 晨跑
            09:00-10:00 - 学习Python
            17:30-18:00 - 锻炼身体
    """
    file_path = os.path.join(PATH_DATA, "tasks", "tasks_log_2026.csv")

    # 解析每行任务
    new_rows = []
    for line in tasks.strip().split("\n"):
        line = line.strip()
        if not line:
            continue

        # 清理 Markdown 格式前缀（- [ ] / - / 1. 等）
        line = _strip_markdown_prefix(line)
        if not line:
            continue

        # 尝试解析 "时间段 - 任务内容" 格式
        m = re.match(r'^(\d{1,2}:\d{2}(?:-\d{1,2}:\d{2})?)\s*[-–]\s*(.+)$', line)
        if m:
            time_part = _normalize_time_slot(m.group(1))
            task_content = m.group(2).strip()
            plan_text = f"{time_part} {task_content}" if time_part else line
        else:
            # 无法解析时间段，整行作为计划事项
            plan_text = line

        new_rows.append({
            "Date": date,
            t.COL_TASK_NAME: plan_text,
            t.COL_TASK_ACTUAL: "",
            t.COL_TASK_STATUS: "",
            t.COL_TASK_REASON: "",
        })

    if not new_rows:
        return "未解析到有效任务"

    new_df = pd.DataFrame(new_rows)

    # Append 模式：不覆盖已有任务，追加新任务
    if os.path.exists(file_path):
        df_old = pd.read_csv(file_path, encoding='utf-8-sig')
        df_final = pd.concat([df_old, new_df], ignore_index=True)
    else:
        df_final = new_df

    df_final.to_csv(file_path, index=False, encoding='utf-8-sig')

    return f"已向 {date} 添加 {len(new_rows)} 条任务到 {file_path}"


@tool("send_email", description="将行为建议报告通过邮件发送给用户，使用专业HTML邮件模板，页脚显示当前模型名称")
def send_email(content: str, model_name: str = "Gemini") -> str:
    """发送行为建议邮件，复用已有的专业HTML邮件模板。

    Args:
        content: 邮件正文内容（markdown格式，会自动转为HTML）
        model_name: 当前使用的AI模型名称，用于邮件页脚显示（如 Gemini、DeepSeek、Qwen）
    """
    try:
        _send_email_impl(content, powered_by=model_name)
        return "邮件已发送成功"
    except ValueError as e:
        return f"邮箱配置错误: {e}"
    except RuntimeError as e:
        return f"发送失败: {e}"
