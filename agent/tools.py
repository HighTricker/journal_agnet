import csv
import os
import re
import pandas as pd
from datetime import datetime, date
import calendar
from langchain.tools import tool
from core.config import get_diary_dir, PATH_DATA, PATH_REPORTS
from core.data_manager import get_default_time_schedule
from core.report_service import send_email as _send_email_impl
from core import texts as t
from core import weekly_data_manager as wdm
from core import monthly_data_manager as mdm

# 当前模型名称，由 agent.py 的 build_agent() 在构建时设置
_current_model_name = "Gemini"


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


@tool(
    "generate_schedule",
    description="只填补指定日期时间表中【真正空白】的时间段。不会覆盖用户已写或模板预制的内容（如睡觉/晨跑/吃饭等固定项）。"
)
def generate_schedule(date: str, schedule: str) -> str:
    """在指定日期的 time_log 中只填补空白时间段（**绝对不覆盖**已有内容）。

    工作流程：
    1. 读取该日期当前的时间表（用户已写过的，或默认模板）
    2. 解析你提供的 schedule 安排
    3. 对每个安排：若对应 slot 的"计划"列**为空字符串**，则写入；否则**跳过**

    推荐用法：先调 read_csv_data("time", "<date>") 查看当前时间表，
    识别哪些 slot 的"计划"列为空，再针对性补充这些空白 slot。

    Args:
        date: 日期 YYYY-MM-DD（如 2026-05-14）
        schedule: 每行一个时间段，格式 "HH:MM-HH:MM,纯文本计划"。例如：
            08:30-09:00,深度学习：阅读《XX》到 P50
            09:00-09:30,完成 Agent RAG 架构第 1 部分（约 100 行）
            14:00-14:30,LeetCode Hard 1 题思路梳理
    """
    file_path = os.path.join(PATH_DATA, "time", "time_log_2026.csv")

    # 1. 加载当前时间表（已有数据优先，否则用默认模板）
    base_df = None
    if os.path.exists(file_path):
        df_all = pd.read_csv(file_path, encoding='utf-8-sig')
        df_all["Date"] = df_all["Date"].astype(str)
        day_df = df_all[df_all["Date"] == date].reset_index(drop=True)
        if not day_df.empty:
            base_df = day_df.copy()

    if base_df is None:
        base_df = get_default_time_schedule(date)

    # 字符串列清洗（避免 NaN 影响 strip 比较）
    for col in [t.COL_TIME_PLAN, t.COL_TIME_ACTUAL, t.COL_TIME_STATUS, t.COL_TIME_NOTE]:
        if col in base_df.columns:
            base_df[col] = base_df[col].fillna("").astype(str)

    # 2. 解析 Agent 安排
    agent_plans = {}
    for line in schedule.strip().split("\n"):
        parts = line.strip().split(",", 1)
        if len(parts) == 2:
            time_slot_raw = parts[0]
            time_slot = _normalize_time_slot(time_slot_raw)
            if time_slot:
                plan, note = _clean_plan_text(parts[1].strip())
                agent_plans[time_slot] = (plan, note)

    # 3. 只填空白 slot
    filled = []
    skipped = []
    for idx, row in base_df.iterrows():
        slot = row[t.COL_TIME_SLOT]
        if slot not in agent_plans:
            continue
        existing_plan = str(row.get(t.COL_TIME_PLAN, "")).strip()
        if existing_plan:
            skipped.append(f"{slot}({existing_plan})")
            continue
        plan, note = agent_plans[slot]
        base_df.at[idx, t.COL_TIME_PLAN] = plan
        base_df.at[idx, t.COL_TIME_NOTE] = note
        base_df.at[idx, t.COL_TIME_ACTUAL] = ""
        base_df.at[idx, t.COL_TIME_STATUS] = "None"
        filled.append(slot)

    # 4. Upsert：删除该日期旧行，插入新行
    if os.path.exists(file_path):
        df_old = pd.read_csv(file_path, encoding='utf-8-sig')
        df_old["Date"] = df_old["Date"].astype(str)
        df_old = df_old[df_old["Date"] != date]
        df_final = pd.concat([df_old, base_df], ignore_index=True)
    else:
        df_final = base_df

    df_final.to_csv(file_path, index=False, encoding='utf-8-sig')

    msg_parts = [f"{date} 时间表已更新：填入 {len(filled)} 个空白时间段"]
    if filled:
        msg_parts.append(f"已填：{', '.join(filled[:5])}{'...' if len(filled) > 5 else ''}")
    if skipped:
        msg_parts.append(
            f"跳过 {len(skipped)} 个已有内容的时间段（这些 slot 用户已写过或属于固定模板项，按工具规则不覆盖）"
        )
        if len(skipped) <= 5:
            msg_parts.append(f"被跳过：{', '.join(skipped)}")
    return "；".join(msg_parts)


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


WEEKLY_DAY_MAP = {
    "周一": "Record_Mon", "周二": "Record_Tue", "周三": "Record_Wed",
    "周四": "Record_Thu", "周五": "Record_Fri", "周六": "Record_Sat",
    "周日": "Record_Sun",
}

MONTHLY_WEEK_MAP = {
    "第一周": "Record_Week1", "第二周": "Record_Week2",
    "第三周": "Record_Week3", "第四周": "Record_Week4",
    "第五周": "Record_Week5",
}


def _parse_records_dict(text: str, key_map: dict) -> dict:
    """从 'XX: 内容' 多行格式解析出 dict，匹配 key_map 中的中文 key。"""
    result = {}
    for line in text.strip().split("\n"):
        line = line.strip()
        if not line:
            continue
        for sep in ("：", ":"):
            if sep in line:
                k, _, v = line.partition(sep)
                k = k.strip()
                if k in key_map:
                    result[key_map[k]] = v.strip()
                break
    return result


@tool(
    "write_weekly_daily_records",
    description="把每天干什么的总结写入指定周的周记（Record_Mon~Record_Sun 字段），自动持久化到 weekly_summary CSV"
)
def write_weekly_daily_records(week: str, records: str) -> str:
    """写入周记的每日事项记录。

    用法：先用 read_csv_data("summary", "<date>") / read_diary 收集这周 7 天的数据，
    然后为每天生成 1-3 句话（上午/下午/晚上分别干了什么），最后调本工具一次性写入。

    Args:
        week: 周编号 YYYY-Wxx（如 2026-W20）
        records: 每行一条，格式 "周X: 内容"。中文冒号 / 英文冒号均可。例如：
            周一: 上午完成 Agent RAG 框架（约 300 行），下午开会 2 小时，晚上读《心流》到 P80
            周二: 上午写测试用例，下午调试，晚上跑步 5km
            ...
            周日: 复盘本周 + 计划下周
    """
    m = re.match(r'^(\d{4})-W(\d{2})$', week)
    if not m:
        return f"周编号格式错误，需要 YYYY-Wxx，收到：{week}"
    year = int(m.group(1))
    iso_week = int(m.group(2))

    try:
        monday = datetime.strptime(f"{year}-W{iso_week:02d}-1", "%G-W%V-%u").date()
    except ValueError:
        return f"无效的周号：{week}"
    week_key, _, iso_week, monday, sunday = wdm.get_week_info(monday)

    parsed = _parse_records_dict(records, WEEKLY_DAY_MAP)
    if not parsed:
        return "未解析到有效记录。请确保格式为 '周X: 内容'（如 '周一: 上午做了 XXX，下午...'）"

    summary_data, habits_df, tasks_df = wdm.load_weekly_data(week_key, year)
    summary_data.update(parsed)

    try:
        wdm.save_weekly_data(week_key, year, iso_week, monday, sunday,
                             summary_data, habits_df, tasks_df)
    except Exception as e:
        return f"保存失败：{e}"

    days_zh = [zh for zh, en in WEEKLY_DAY_MAP.items() if en in parsed]
    return f"已写入 {week_key} 周记的每日事项（{', '.join(days_zh)}）"


@tool(
    "write_monthly_weekly_records",
    description="把每周干什么的总结写入指定月份的月记（Record_Week1~Record_Week5 字段），自动持久化到 monthly_summary CSV"
)
def write_monthly_weekly_records(month: str, records: str) -> str:
    """写入月记的每周事项记录。

    用法：先用 read_csv_data("weekly_summary", "<week>") 读各周数据 + read_csv_data("summary", "<month>")
    读该月所有日数据，然后为每周生成 1-3 句总结，最后调本工具一次性写入。

    Args:
        month: 月份 YYYY-MM（如 2026-05）
        records: 每行一条，格式 "第X周: 内容"。例如：
            第一周: 启动 Agent 项目 + 完成 RAG 选型
            第二周: 写完 retrieval 模块，跑步 4 次
            第三周: ...
            第四周: ...
            第五周: ...（如果当月跨 5 个 ISO 周）
    """
    m = re.match(r'^(\d{4})-(\d{2})$', month)
    if not m:
        return f"月份格式错误，需要 YYYY-MM，收到：{month}"
    year = int(m.group(1))
    mm = int(m.group(2))
    if mm < 1 or mm > 12:
        return f"月份超出范围：{month}"

    first_day = date(year, mm, 1)
    last_day = date(year, mm, calendar.monthrange(year, mm)[1])
    month_key = f"{year}-{mm:02d}"

    parsed = _parse_records_dict(records, MONTHLY_WEEK_MAP)
    if not parsed:
        return "未解析到有效记录。请确保格式为 '第X周: 内容'（如 '第一周: 完成了 XXX'）"

    summary_data, tasks_df = mdm.load_monthly_data(month_key, year)
    summary_data.update(parsed)

    try:
        mdm.save_monthly_data(month_key, year, mm, first_day, last_day,
                              summary_data, tasks_df)
    except Exception as e:
        return f"保存失败：{e}"

    weeks_zh = [zh for zh, en in MONTHLY_WEEK_MAP.items() if en in parsed]
    return f"已写入 {month_key} 月记的每周事项（{', '.join(weeks_zh)}）"


@tool("send_email", description="将行为建议报告通过邮件发送给用户，使用专业HTML邮件模板")
def send_email(content: str) -> str:
    """发送行为建议邮件，复用已有的专业HTML邮件模板。
    邮件页脚会自动显示当前使用的模型名称。

    Args:
        content: 邮件正文内容（markdown格式，会自动转为HTML）
    """
    try:
        _send_email_impl(content, powered_by=_current_model_name)
        return "邮件已发送成功"
    except ValueError as e:
        return f"邮箱配置错误: {e}"
    except RuntimeError as e:
        return f"发送失败: {e}"
