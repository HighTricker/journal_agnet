### 🧠 文件 3：`data_manager.py` (核心数据处理)

import pandas as pd
import os
from datetime import datetime
from . import texts as t
from . import template as tp
from . import config as cfg


def get_file_paths(date_obj):
    """
    根据日期动态生成存储路径
    CSV: 年度存储 (D:\\2026...\\data\\...)
    Markdown: 按月自动归档 (D:\\2026...\\MM月\\...)
    """
    year = date_obj.year
    # 生成 "02月" 格式的文件夹名
    month_folder_name = f"{date_obj.month:02d}月" 
    date_str = date_obj.strftime('%Y-%m-%d')
    
    # 1. 动态生成当月 Markdown 的文件夹路径
    # 结果例如：D:\2026年规划及文件留存\02月
    md_folder = os.path.join(cfg.BASE_DIR, month_folder_name)
    
    # 2. 核心功能：如果这个月份文件夹还不存在，就立即新建
    if not os.path.exists(md_folder):
        os.makedirs(md_folder, exist_ok=True)
    
    # 3. 返回路径字典
    return {
        "tasks": os.path.join(cfg.PATH_TASKS, f"tasks_log_{year}.csv"),
        "time": os.path.join(cfg.PATH_TIME, f"time_log_{year}.csv"),
        "summary": os.path.join(cfg.PATH_SUMMARY, f"daily_summary_{year}.csv"),
        # Markdown 文件存放在生成的月份文件夹中
        "markdown": os.path.join(md_folder, f"diary_{date_str}.md")
    }

def get_default_time_schedule(date_str):
    """根据 template.py 生成带半小时预设的48个时间段"""
    data = []
    # 获取 template.py 中的自动化列表
    auto_list = getattr(tp, "AUTO_COMPLETE_TASKS", [])
    
    for h in range(24):
        # 定义两个半小时的起始点
        times = [f"{h:02d}:00", f"{h:02d}:30"]
        
        for start_t in times:
            # 计算结束点
            h_val = int(start_t[:2])
            m_val = int(start_t[3:])
            if m_val == 0:
                end_t = f"{h_val:02d}:30"
            else:
                end_t = f"{h_val+1:02d}:00" if h_val < 23 else "24:00"
            
            time_slot = f"{start_t}-{end_t}"
            
            # 从模板获取该半小时的计划
            plan_from_template = tp.DAILY_TEMPLATE.get(start_t, "")
            
            # 初始化默认值
            actual_val = ""
            status_val = "None"
            
            # 自动化逻辑
            if plan_from_template and plan_from_template in auto_list:
                actual_val = plan_from_template
                status_val = "✅"

            data.append({
                "Date": date_str,
                t.COL_TIME_SLOT: time_slot,
                t.COL_TIME_PLAN: plan_from_template,
                t.COL_TIME_ACTUAL: actual_val,
                t.COL_TIME_STATUS: status_val,
                t.COL_TIME_NOTE: ""
            })
    return pd.DataFrame(data)

def load_data_for_date(date_obj):
    """
    读取指定日期的所有数据。如果文件不存在，返回空模板。
    """
    paths = get_file_paths(date_obj)
    date_str = date_obj.strftime('%Y-%m-%d')
    
    # --- 1. 加载每日概览 (Summary) ---
    summary_data = {}
    if os.path.exists(paths["summary"]):
        df = pd.read_csv(paths["summary"], encoding='utf-8-sig')
        df["Date"] = df["Date"].astype(str)
        # 文本列强制转字符串（与下方 tasks/time 表做法一致）：
        # 防止某文本列恰好全是纯数字时被 pandas 推断成数值类型——数值会被前端
        # `typeof val === 'string'` 检查丢弃，下次保存被空值覆盖，造成静默数据丢失
        text_cols = [c for c in df.columns if c.startswith(("Reflect_", "Fork_", "Good_"))]
        for col in text_cols:
            df[col] = df[col].fillna("").astype(str)
        df = df[df["Date"] == date_str]
        if not df.empty:
            # 将 numpy 类型转换为原生 python 类型，并清理 NaN
            summary_data = {k: ("" if pd.isna(v) else v)
                           for k, v in df.iloc[0].to_dict().items()}
    
    # --- 2. 加载任务 (Tasks) ---
    if os.path.exists(paths["tasks"]):
        df_tasks = pd.read_csv(paths["tasks"], encoding='utf-8-sig')
        df_tasks["Date"] = df_tasks["Date"].astype(str)
        # 强制转为字符串，防止空值报错
        cols_to_str = [t.COL_TASK_NAME, t.COL_TASK_ACTUAL, t.COL_TASK_REASON, t.COL_TASK_STATUS]
        for col in cols_to_str:
             if col in df_tasks.columns:
                df_tasks[col] = df_tasks[col].fillna("").astype(str)

        # 筛选当日，保留 Date 列（UI 中设为只读 + 自动填充）
        # reset_index 确保 index 从 0 连续编号，避免 data_editor 新增行 index 重复
        current_tasks = df_tasks[df_tasks["Date"] == date_str].reset_index(drop=True)
    else:
        # 如果文件不存在，创建空的 DataFrame 结构（含 Date 列）
        current_tasks = pd.DataFrame(columns=["Date", t.COL_TASK_NAME, t.COL_TASK_ACTUAL, t.COL_TASK_STATUS, t.COL_TASK_REASON])

    # --- 3. 加载时间轴 (Time Log) ---
    if os.path.exists(paths["time"]):
        df_time = pd.read_csv(paths["time"], encoding='utf-8-sig')
        df_time["Date"] = df_time["Date"].astype(str)
        # 强制转为字符串
        cols_to_str_time = [t.COL_TIME_PLAN, t.COL_TIME_ACTUAL, t.COL_TIME_NOTE, t.COL_TIME_STATUS]
        for col in cols_to_str_time:
            if col in df_time.columns:
                df_time[col] = df_time[col].fillna("").astype(str)

        current_time = df_time[df_time["Date"] == date_str]

        # 如果当日无数据，加载默认模板
        if current_time.empty:
            current_time = get_default_time_schedule(date_str)
    else:
        current_time = get_default_time_schedule(date_str)

    return summary_data, current_tasks, current_time

def save_all_data(date_obj, summary_dict, tasks_df, time_df):
    """
    保存所有数据到对应的年份CSV文件中 (Upsert模式)
    """
    paths = get_file_paths(date_obj)
    date_str = date_obj.strftime('%Y-%m-%d')
    
    # --- 1. 保存概览 (Summary) ---
    summary_dict["Date"] = date_str # 确保有日期
    new_row = pd.DataFrame([summary_dict])
    
    if os.path.exists(paths["summary"]):
        df_old = pd.read_csv(paths["summary"], encoding='utf-8-sig')
        df_old["Date"] = df_old["Date"].astype(str)
        # 删除旧的当日数据 (覆盖更新逻辑)
        df_old = df_old[df_old["Date"] != date_str]
        # 追加新的
        df_final = pd.concat([df_old, new_row], ignore_index=True)
    else:
        df_final = new_row
    df_final.to_csv(paths["summary"], index=False, encoding='utf-8-sig')
    
    # --- 2. 保存任务 (Tasks) ---
    tasks_df = tasks_df.fillna("")  # 防止 NaN 写入 CSV
    # 清理空行：移除任务名为空白的幽灵行（data_editor dynamic 模式可能产生）
    tasks_df = tasks_df[tasks_df[t.COL_TASK_NAME].astype(str).str.strip() != ""]
    if tasks_df.empty:
        tasks_df = pd.DataFrame([{
            t.COL_TASK_NAME: "此日未作安排",
            t.COL_TASK_ACTUAL: "",
            t.COL_TASK_STATUS: "",
            t.COL_TASK_REASON: ""
        }])
    tasks_df["Date"] = date_str  # 确保所有行都有日期

    if os.path.exists(paths["tasks"]):
        df_old = pd.read_csv(paths["tasks"], encoding='utf-8-sig')
        df_old["Date"] = df_old["Date"].astype(str)
        df_old = df_old[df_old["Date"] != date_str]
        df_final = pd.concat([df_old, tasks_df], ignore_index=True)
    else:
        df_final = tasks_df
    df_final.to_csv(paths["tasks"], index=False, encoding='utf-8-sig')

    # --- 3. 保存时间轴 (Time) ---
    time_df = time_df.fillna("")  # 防止 NaN 写入 CSV
    time_df["Date"] = date_str

    if os.path.exists(paths["time"]):
        df_old = pd.read_csv(paths["time"], encoding='utf-8-sig')
        df_old["Date"] = df_old["Date"].astype(str)
        df_old = df_old[df_old["Date"] != date_str]
        df_final = pd.concat([df_old, time_df], ignore_index=True)
    else:
        df_final = time_df
    df_final.to_csv(paths["time"], index=False, encoding='utf-8-sig')
    
    # --- 4. 生成 Markdown 成品 ---
    generate_markdown(date_obj, summary_dict, tasks_df, time_df, paths["markdown"])

from . import md_template as mdt
from datetime import datetime

def generate_markdown(date_obj, summary, tasks_df, time_df, file_path):
    
    # --- 基础元数据 ---
    anchor_date = datetime(2026, 2, 18).date()
    diary_number = 1100 + (date_obj - anchor_date).days
    weekday_num = date_obj.weekday() + 1
    write_time = datetime.now().strftime("%H:%M")
    
    # --- 任务表格：逐行拼接 ---
    if len(tasks_df) == 1 and tasks_df.iloc[0].get(t.COL_TASK_NAME, "") == "此日未作安排":
        tasks_table = "此日未作安排"
    else:
        task_rows = []
        for _, row in tasks_df.iterrows():
            name   = row.get(t.COL_TASK_NAME, "")
            actual = row.get(t.COL_TASK_ACTUAL, "")
            status = row.get(t.COL_TASK_STATUS, "")
            reason = row.get(t.COL_TASK_REASON, "")
            task_rows.append(f"| {name} | {actual} | {status} | {reason} |")
        tasks_table = "\n".join(task_rows)
    
    # --- 时间表格：逐行拼接 ---
    time_rows = []
    for _, row in time_df.iterrows():
        slot   = row.get(t.COL_TIME_SLOT, "")
        plan   = row.get(t.COL_TIME_PLAN, "")
        actual = row.get(t.COL_TIME_ACTUAL, "")
        status = row.get(t.COL_TIME_STATUS, "")
        note   = row.get(t.COL_TIME_NOTE, "")
        time_rows.append(f"| {slot} | {plan} | {actual} | {status} | {note} |")
    time_table = "\n".join(time_rows)
    
    # --- 调用模板 ---
    content = mdt.get_template(
        diary_number      = diary_number,
        date_str          = date_obj.strftime('%Y-%m-%d'),
        write_time        = write_time,
        weekday_num       = weekday_num,
        location          = t.LOCATION,
        weather           = t.WEATHER,
        mood_score        = summary.get("Mood", ""),
        energy_score      = summary.get("Energy_Score", ""),
        sleep_bedtime     = summary.get("Sleep_Bedtime", ""),
        sleep_waketime    = summary.get("Sleep_Waketime", ""),
        sleep_hours       = summary.get("Sleep_Hours", ""),
        sleep_wake_count  = summary.get("Sleep_Wake_Count", ""),
        sleep_quality     = summary.get("Sleep_Score", ""),
        focus_time        = summary.get("Focus_Count", ""),
        meditation_minutes = summary.get("Meditation_Minutes", ""),
        ai_time = summary.get("AI_Time", ""),
        masturbation_count= summary.get("Masturbation_Count", ""),
        tasks_table       = tasks_table,
        time_table        = time_table,
        reflect_ai_usage     = summary.get("Reflect_AI_Usage", ""),
        reflect_ai_learning  = summary.get("Reflect_AI_Learning", ""),
        reflect_reading      = summary.get("Reflect_Reading", ""),
        reflect_meditation   = summary.get("Reflect_Meditation", ""),
        reflect_good_actions = summary.get("Reflect_Good_Actions", ""),
        reflect_bad_actions  = summary.get("Reflect_Bad_Actions", ""),
        reflect_words_to_self= summary.get("Reflect_Words_To_Self", ""),
        reflect_thoughts     = summary.get("Reflect_Thoughts", ""),
        reflect_sleep_dreams = summary.get("Reflect_Sleep_Dreams", ""),
        reflect_deep         = summary.get("Reflect_Deep_Reflections", ""),
        fork_trigger         = summary.get("Fork_Trigger", ""),
        fork_should          = summary.get("Fork_Should", ""),
        fork_actual          = summary.get("Fork_Actual", ""),
        fork_direction       = summary.get("Fork_Direction", ""),
        fork_trigger_2       = summary.get("Fork_Trigger_2", ""),
        fork_should_2        = summary.get("Fork_Should_2", ""),
        fork_actual_2        = summary.get("Fork_Actual_2", ""),
        fork_direction_2     = summary.get("Fork_Direction_2", ""),
        fork_trigger_3       = summary.get("Fork_Trigger_3", ""),
        fork_should_3        = summary.get("Fork_Should_3", ""),
        fork_actual_3        = summary.get("Fork_Actual_3", ""),
        fork_direction_3     = summary.get("Fork_Direction_3", ""),
        good_thing_1         = summary.get("Good_Thing_1", ""),
        good_why_1           = summary.get("Good_Why_1", ""),
        good_thing_2         = summary.get("Good_Thing_2", ""),
        good_why_2           = summary.get("Good_Why_2", ""),
        good_thing_3         = summary.get("Good_Thing_3", ""),
        good_why_3           = summary.get("Good_Why_3", ""),
    )
    
    with open(file_path, "w", encoding="utf-8-sig") as f:
        f.write(content)
