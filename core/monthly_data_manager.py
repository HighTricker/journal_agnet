# monthly_data_manager.py
# 月记模块的数据处理：CSV 读写(Upsert)、日数据聚合、Markdown 生成

import pandas as pd
import os
import calendar
from datetime import date, datetime
from . import config as cfg
from . import monthly_texts as mt


# ==========================================
# 1. 月信息计算
# ==========================================

def get_month_info(date_obj):
    """
    根据日期计算月信息。
    返回 (month_key, year, month, first_day, last_day)
    month_key 格式："2026-03"
    """
    year = date_obj.year
    month = date_obj.month
    month_key = f"{year}-{month:02d}"
    first_day = date(year, month, 1)
    last_day_num = calendar.monthrange(year, month)[1]
    last_day = date(year, month, last_day_num)
    return month_key, year, month, first_day, last_day


# ==========================================
# 2. 文件路径
# ==========================================

def get_monthly_file_paths(year):
    """返回月记二表的 CSV 路径字典"""
    return {
        "summary": os.path.join(cfg.PATH_MONTHLY_SUMMARY, f"monthly_summary_{year}.csv"),
        "tasks": os.path.join(cfg.PATH_MONTHLY_TASKS, f"monthly_tasks_{year}.csv"),
    }


def get_monthly_md_path(year, month):
    """
    月记 Markdown 路径，放在对应月份的文件夹中。
    格式：BASE_DIR/MM月/monthly_2026-03_0301-0331.md
    """
    month_key = f"{year}-{month:02d}"
    first_day = date(year, month, 1)
    last_day_num = calendar.monthrange(year, month)[1]
    last_day = date(year, month, last_day_num)

    month_folder = f"{month:02d}月"
    md_folder = os.path.join(cfg.BASE_DIR, month_folder)
    os.makedirs(md_folder, exist_ok=True)

    date_range = f"{first_day.month:02d}{first_day.day:02d}-{last_day.month:02d}{last_day.day:02d}"
    filename = f"monthly_{month_key}_{date_range}.md"
    return os.path.join(md_folder, filename)


# ==========================================
# 3. 默认数据模板
# ==========================================

def get_default_monthly_tasks(month_key):
    """生成默认月任务 DataFrame（每个分类 3 行空任务）"""
    rows = []
    for category in mt.TASK_CATEGORIES:
        for _ in range(3):
            rows.append({
                "Month": month_key,
                mt.COL_MT_CATEGORY: category,
                mt.COL_MT_PLAN: "",
                mt.COL_MT_ACTUAL: "",
                mt.COL_MT_STATUS: "None",
                mt.COL_MT_REASON: "",
            })
    return pd.DataFrame(rows)


# ==========================================
# 4. 月数据聚合
# ==========================================

def aggregate_monthly_data(year, month):
    """
    从 daily_summary CSV 聚合该月所有天的统计数据。
    返回 dict，包含平均值/求和/最高最低心情日/不打飞机天数。
    """
    first_day = date(year, month, 1)
    last_day_num = calendar.monthrange(year, month)[1]
    last_day = date(year, month, last_day_num)

    summary_path = os.path.join(cfg.PATH_SUMMARY, f"daily_summary_{year}.csv")

    result = {
        "Avg_Mood": None,
        "Avg_Sleep_Hours": None,
        "Avg_Sleep_Score": None,
        "Total_Focus": None,
        "Total_Masturbation": None,
        "No_Masturbation_Days": None,
        "Best_Mood_Day": "",
        "Worst_Mood_Day": "",
    }

    if not os.path.exists(summary_path):
        return result

    df = pd.read_csv(summary_path, encoding='utf-8-sig')
    if "Date" not in df.columns:
        return result

    df["Date"] = pd.to_datetime(df["Date"]).dt.date
    mask = (df["Date"] >= first_day) & (df["Date"] <= last_day)
    month_df = df[mask]

    if month_df.empty:
        return result

    # 平均心情
    if "Mood" in month_df.columns:
        mood_series = pd.to_numeric(month_df["Mood"], errors="coerce")
        result["Avg_Mood"] = round(mood_series.mean(), 1) if mood_series.notna().any() else None

        # 最高/最低心情日（显示日期而非星期名）
        valid_mood = month_df[mood_series.notna()].copy()
        if not valid_mood.empty:
            valid_mood["_mood_num"] = pd.to_numeric(valid_mood["Mood"], errors="coerce")
            best_row = valid_mood.loc[valid_mood["_mood_num"].idxmax()]
            worst_row = valid_mood.loc[valid_mood["_mood_num"].idxmin()]
            best_date = best_row["Date"]
            worst_date = worst_row["Date"]
            result["Best_Mood_Day"] = f"{best_date.month}月{best_date.day}日（{int(best_row['_mood_num'])}分）"
            result["Worst_Mood_Day"] = f"{worst_date.month}月{worst_date.day}日（{int(worst_row['_mood_num'])}分）"

    # 平均睡眠时长
    if "Sleep_Hours" in month_df.columns:
        hours = pd.to_numeric(month_df["Sleep_Hours"], errors="coerce")
        result["Avg_Sleep_Hours"] = round(hours.mean(), 1) if hours.notna().any() else None

    # 平均睡眠质量
    if "Sleep_Score" in month_df.columns:
        scores = pd.to_numeric(month_df["Sleep_Score"], errors="coerce")
        result["Avg_Sleep_Score"] = round(scores.mean(), 1) if scores.notna().any() else None

    # 总番茄钟
    if "Focus_Count" in month_df.columns:
        focus = pd.to_numeric(month_df["Focus_Count"], errors="coerce")
        result["Total_Focus"] = int(focus.sum()) if focus.notna().any() else None

    # 总打飞机次数 + 不打飞机天数
    if "Masturbation_Count" in month_df.columns:
        masturb = pd.to_numeric(month_df["Masturbation_Count"], errors="coerce")
        result["Total_Masturbation"] = int(masturb.sum()) if masturb.notna().any() else None
        # 不打飞机天数 = 该列为 0 的天数
        result["No_Masturbation_Days"] = int((masturb.fillna(0) == 0).sum())

    return result


# ==========================================
# 5. 周次列表计算
# ==========================================

def get_weeks_in_month(year, month):
    """
    计算该月包含的 ISO 周次列表。
    返回 (weeks_count, weeks_list_str)，如 (5, "W09, W10, W11, W12, W13")
    """
    first_day = date(year, month, 1)
    last_day_num = calendar.monthrange(year, month)[1]
    last_day = date(year, month, last_day_num)

    weeks = set()
    current = first_day
    while current <= last_day:
        iso_year, iso_week, _ = current.isocalendar()
        weeks.add((iso_year, iso_week))
        current += pd.Timedelta(days=1)

    sorted_weeks = sorted(weeks)
    weeks_list = [f"W{w:02d}" for _, w in sorted_weeks]
    return len(sorted_weeks), ", ".join(weeks_list)


# ==========================================
# 6. 数据加载
# ==========================================

def load_monthly_data(month_key, year):
    """
    加载指定月的全部数据：概览 + 任务。
    无数据时返回默认模板。
    """
    paths = get_monthly_file_paths(year)

    # --- 1. 加载月概览 ---
    summary_data = {}
    if os.path.exists(paths["summary"]):
        df = pd.read_csv(paths["summary"], encoding='utf-8-sig')
        df["Month"] = df["Month"].astype(str)
        row = df[df["Month"] == month_key]
        if not row.empty:
            summary_data = {k: ("" if pd.isna(v) else v)
                           for k, v in row.iloc[0].to_dict().items()}

    # --- 2. 加载任务 ---
    if os.path.exists(paths["tasks"]):
        df_tasks = pd.read_csv(paths["tasks"], encoding='utf-8-sig')
        df_tasks["Month"] = df_tasks["Month"].astype(str)
        str_cols = [mt.COL_MT_CATEGORY, mt.COL_MT_PLAN, mt.COL_MT_ACTUAL,
                    mt.COL_MT_STATUS, mt.COL_MT_REASON]
        for col in str_cols:
            if col in df_tasks.columns:
                df_tasks[col] = df_tasks[col].fillna("").astype(str)
        tasks_df = df_tasks[df_tasks["Month"] == month_key].reset_index(drop=True)
    else:
        tasks_df = pd.DataFrame()

    if tasks_df.empty:
        tasks_df = get_default_monthly_tasks(month_key)

    return summary_data, tasks_df


# ==========================================
# 7. 数据保存 (Upsert)
# ==========================================

def save_monthly_data(month_key, year, month, first_day, last_day,
                      summary_dict, tasks_df):
    """
    保存月记数据到 CSV (Upsert 模式) 并生成 Markdown。
    """
    paths = get_monthly_file_paths(year)

    # --- 1. 保存月概览 ---
    summary_dict["Month"] = month_key
    summary_dict["Year"] = year
    summary_dict["Month_Number"] = month
    summary_dict["Date_Start"] = first_day.strftime("%Y-%m-%d")
    summary_dict["Date_End"] = last_day.strftime("%Y-%m-%d")
    new_row = pd.DataFrame([summary_dict])

    if os.path.exists(paths["summary"]):
        df_old = pd.read_csv(paths["summary"], encoding='utf-8-sig')
        df_old["Month"] = df_old["Month"].astype(str)
        df_old = df_old[df_old["Month"] != month_key]
        df_final = pd.concat([df_old, new_row], ignore_index=True)
    else:
        df_final = new_row
    df_final.to_csv(paths["summary"], index=False, encoding='utf-8-sig')

    # --- 2. 保存任务 ---
    tasks_df = tasks_df.fillna("")
    # 清理空行：计划事项为空白的行
    tasks_df = tasks_df[tasks_df[mt.COL_MT_PLAN].astype(str).str.strip() != ""]
    tasks_df["Month"] = month_key

    if os.path.exists(paths["tasks"]):
        df_old = pd.read_csv(paths["tasks"], encoding='utf-8-sig')
        df_old["Month"] = df_old["Month"].astype(str)
        df_old = df_old[df_old["Month"] != month_key]
        df_final = pd.concat([df_old, tasks_df], ignore_index=True)
    else:
        df_final = tasks_df
    df_final.to_csv(paths["tasks"], index=False, encoding='utf-8-sig')

    # --- 3. 生成 Markdown ---
    generate_monthly_markdown(month_key, year, month, first_day, last_day,
                              summary_dict, tasks_df)


# ==========================================
# 8. Markdown 生成
# ==========================================

def generate_monthly_markdown(month_key, year, month, first_day, last_day,
                              summary_dict, tasks_df):
    """将数据填充到月记 Markdown 模板并写入文件"""
    from . import monthly_md_template as mmdt

    # 按分类构建任务表格
    tasks_table_parts = []
    for category in mt.TASK_CATEGORIES:
        cat_df = tasks_df[tasks_df[mt.COL_MT_CATEGORY] == category]
        cat_rows = []
        for _, row in cat_df.iterrows():
            plan = row.get(mt.COL_MT_PLAN, "")
            actual = row.get(mt.COL_MT_ACTUAL, "")
            status = row.get(mt.COL_MT_STATUS, "")
            reason = row.get(mt.COL_MT_REASON, "")
            cat_rows.append(f"| {plan} | {actual} | {status} | {reason} |")
        tasks_table_parts.append({
            "category": category,
            "rows": "\n".join(cat_rows) if cat_rows else "| | | | |",
        })

    # 周次信息
    weeks_count, weeks_list = get_weeks_in_month(year, month)

    content = mmdt.get_template(
        month_key=month_key,
        year=year,
        month=month,
        date_start=first_day.strftime("%Y-%m-%d"),
        date_end=last_day.strftime("%Y-%m-%d"),
        create_time=summary_dict.get("Create_Time", ""),
        complete_time=summary_dict.get("Complete_Time", ""),
        weeks_count=weeks_count,
        weeks_list=weeks_list,
        tasks_table_parts=tasks_table_parts,
        monthly_score=summary_dict.get("Monthly_Score", ""),
        no_masturbation_days=summary_dict.get("No_Masturbation_Days", ""),
        avg_mood=summary_dict.get("Avg_Mood", ""),
        avg_sleep_hours=summary_dict.get("Avg_Sleep_Hours", ""),
        avg_sleep_score=summary_dict.get("Avg_Sleep_Score", ""),
        total_focus=summary_dict.get("Total_Focus", ""),
        total_masturbation=summary_dict.get("Total_Masturbation", ""),
        best_mood_day=summary_dict.get("Best_Mood_Day", ""),
        worst_mood_day=summary_dict.get("Worst_Mood_Day", ""),
        highlights=summary_dict.get("Highlights", ""),
        challenges=summary_dict.get("Challenges", ""),
        reflect_good=summary_dict.get("Reflect_Good", ""),
        reflect_improve=summary_dict.get("Reflect_Improve", ""),
        reflect_cognitive=summary_dict.get("Reflect_Cognitive", ""),
        reflect_next_month=summary_dict.get("Reflect_Next_Month", ""),
        reading_books=summary_dict.get("Reading_Books", ""),
        learning_content=summary_dict.get("Learning_Content", ""),
        words_to_self=summary_dict.get("Words_To_Self", ""),
        thoughts=summary_dict.get("Thoughts", ""),
    )

    md_path = get_monthly_md_path(year, month)
    with open(md_path, "w", encoding="utf-8-sig") as f:
        f.write(content)
