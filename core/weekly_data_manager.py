# weekly_data_manager.py
# 周记模块的数据处理：CSV 读写(Upsert)、日数据聚合、Markdown 生成

import pandas as pd
import os
import uuid
from datetime import datetime, timedelta
from . import config as cfg
from . import weekly_texts as wt


# ==========================================
# 0. 习惯自动判定（基于日记数据）
# ==========================================

def _auto_early_rise(row: dict) -> bool:
    """早起：起床时间早于 06:00（且非空）"""
    wake = str(row.get("Sleep_Waketime", "")).strip()
    return ":" in wake and wake < "06:00"


def _auto_focus(row: dict) -> bool:
    """专注工作：番茄钟 >= 4"""
    try:
        return int(float(row.get("Focus_Count", 0))) >= 4
    except (ValueError, TypeError):
        return False


def _auto_no_fap(row: dict) -> bool:
    """不打飞机：打飞机次数 == 0（且当天有量化数据，避免空记录被误判为 ✅）"""
    val = row.get("Masturbation_Count")
    if val is None or (isinstance(val, float) and pd.isna(val)) or str(val).strip() == "":
        return False
    try:
        return int(float(val)) == 0
    except (ValueError, TypeError):
        return False


def _auto_early_sleep(row: dict) -> bool:
    """按时睡觉：入睡时间在 18:00–22:30 区间（避免凌晨上床被误判）"""
    bed = str(row.get("Sleep_Bedtime", "")).strip()
    if ":" not in bed:
        return False
    return "18:00" <= bed < "22:30"


AUTO_HABIT_RULES = {
    "早起（6:00前起床）": _auto_early_rise,
    "专注工作（4个番茄钟以上）": _auto_focus,
    "不打飞机": _auto_no_fap,
    "按时睡觉（22:30前）": _auto_early_sleep,
}


def apply_auto_habits(habits_df: pd.DataFrame, monday) -> pd.DataFrame:
    """根据 daily_summary 自动给 habits_df 中可推断的 4 个习惯打卡 ✅。
    只填**当前为空**的格子，已被用户填过的 ✅/❌ 一律保留。
    """
    if habits_df.empty:
        return habits_df

    year = monday.year
    summary_path = os.path.join(cfg.PATH_SUMMARY, f"daily_summary_{year}.csv")
    if not os.path.exists(summary_path):
        return habits_df

    df = pd.read_csv(summary_path, encoding="utf-8-sig")
    if "Date" not in df.columns:
        return habits_df
    df["Date"] = pd.to_datetime(df["Date"], errors="coerce").dt.date

    # 字符串列清洗（保证 strip 比较安全）
    str_cols = [wt.COL_HABIT_NAME] + wt.DAY_COLUMNS
    for col in str_cols:
        if col in habits_df.columns:
            habits_df[col] = habits_df[col].fillna("").astype(str)

    for habit_name, checker in AUTO_HABIT_RULES.items():
        mask = habits_df[wt.COL_HABIT_NAME] == habit_name
        if not mask.any():
            continue
        for i in range(7):
            day = monday + timedelta(days=i)
            day_col = wt.DAY_COLUMNS[i]
            day_row = df[df["Date"] == day]
            if day_row.empty:
                continue
            if not checker(day_row.iloc[0].to_dict()):
                continue
            for idx in habits_df[mask].index:
                if habits_df.at[idx, day_col].strip() == "":
                    habits_df.at[idx, day_col] = "✅"
    return habits_df


# ==========================================
# 1. 周信息计算
# ==========================================

def get_week_info(date_obj):
    """
    根据日期计算 ISO 周信息。
    返回 (week_key, iso_year, iso_week, monday, sunday)
    week_key 格式："2026-W09"
    """
    iso_year, iso_week, _ = date_obj.isocalendar()
    week_key = f"{iso_year}-W{iso_week:02d}"
    # 计算周一和周日
    weekday = date_obj.weekday()  # 0=周一, 6=周日
    monday = date_obj - timedelta(days=weekday)
    sunday = monday + timedelta(days=6)
    return week_key, iso_year, iso_week, monday, sunday


# ==========================================
# 2. 文件路径
# ==========================================

def get_weekly_file_paths(year):
    """返回周记三表的 CSV 路径字典"""
    return {
        "summary": os.path.join(cfg.PATH_WEEKLY_SUMMARY, f"weekly_summary_{year}.csv"),
        "habits": os.path.join(cfg.PATH_WEEKLY_HABITS, f"weekly_habits_{year}.csv"),
        "tasks": os.path.join(cfg.PATH_WEEKLY_TASKS, f"weekly_tasks_{year}.csv"),
    }


def get_weekly_md_path(monday):
    """
    周记 Markdown 路径，放在周一所在月份的文件夹中。
    格式：BASE_DIR/MM月/weekly_2026-W09_0302-0308.md
    """
    week_key, _, _, _, sunday = get_week_info(monday)
    month_folder = f"{monday.month:02d}月"
    md_folder = os.path.join(cfg.BASE_DIR, month_folder)
    os.makedirs(md_folder, exist_ok=True)

    # 文件名：weekly_2026-W09_0302-0308.md
    date_range = f"{monday.month:02d}{monday.day:02d}-{sunday.month:02d}{sunday.day:02d}"
    filename = f"weekly_{week_key}_{date_range}.md"
    return os.path.join(md_folder, filename)


# ==========================================
# 3. 默认数据模板
# ==========================================

def get_default_habits(week_key):
    """生成默认习惯 DataFrame（6个默认 + 1个空行供用户添加）"""
    rows = []
    for habit in wt.DEFAULT_HABITS:
        row = {"Week": week_key, wt.COL_HABIT_NAME: habit}
        for day in wt.DAY_COLUMNS:
            row[day] = ""
        rows.append(row)
    # 添加一个空行
    empty_row = {"Week": week_key, wt.COL_HABIT_NAME: ""}
    for day in wt.DAY_COLUMNS:
        empty_row[day] = ""
    rows.append(empty_row)
    return pd.DataFrame(rows)


def get_default_weekly_tasks(week_key):
    """生成默认周任务 DataFrame（每个分类 3 行空任务）"""
    rows = []
    for category in wt.TASK_CATEGORIES:
        for _ in range(3):
            rows.append({
                "Week": week_key,
                wt.COL_WT_CATEGORY: category,
                wt.COL_WT_PLAN: "",
                wt.COL_WT_ACTUAL: "",
                wt.COL_WT_STATUS: "None",
                wt.COL_WT_REASON: "",
            })
    return pd.DataFrame(rows)


# ==========================================
# 4. 日数据聚合
# ==========================================

def aggregate_daily_data(monday):
    """
    从 daily_summary CSV 聚合该周 7 天的统计数据。
    返回 dict，包含平均值/求和/最高最低心情日。
    """
    sunday = monday + timedelta(days=6)
    year = monday.year
    summary_path = os.path.join(cfg.PATH_SUMMARY, f"daily_summary_{year}.csv")

    result = {
        "Avg_Mood": None,
        "Avg_Sleep_Hours": None,
        "Avg_Sleep_Score": None,
        "Total_Focus": None,
        "Total_Masturbation": None,
        "Best_Mood_Day": "",
        "Worst_Mood_Day": "",
    }

    if not os.path.exists(summary_path):
        return result

    df = pd.read_csv(summary_path, encoding='utf-8-sig')
    if "Date" not in df.columns:
        return result

    df["Date"] = pd.to_datetime(df["Date"]).dt.date
    # 筛选该周范围内的日期
    mask = (df["Date"] >= monday) & (df["Date"] <= sunday)
    week_df = df[mask]

    if week_df.empty:
        return result

    # 平均值计算
    if "Mood" in week_df.columns:
        mood_series = pd.to_numeric(week_df["Mood"], errors="coerce")
        result["Avg_Mood"] = round(mood_series.mean(), 1) if mood_series.notna().any() else None

        # 最高/最低心情日
        valid_mood = week_df[mood_series.notna()].copy()
        if not valid_mood.empty:
            valid_mood = valid_mood.copy()
            valid_mood["_mood_num"] = pd.to_numeric(valid_mood["Mood"], errors="coerce")
            best_row = valid_mood.loc[valid_mood["_mood_num"].idxmax()]
            worst_row = valid_mood.loc[valid_mood["_mood_num"].idxmin()]
            best_day = wt.WEEKDAY_ZH[best_row["Date"].weekday()]
            worst_day = wt.WEEKDAY_ZH[worst_row["Date"].weekday()]
            result["Best_Mood_Day"] = f"{best_day}（{int(best_row['_mood_num'])}分）"
            result["Worst_Mood_Day"] = f"{worst_day}（{int(worst_row['_mood_num'])}分）"

    if "Sleep_Hours" in week_df.columns:
        hours = pd.to_numeric(week_df["Sleep_Hours"], errors="coerce")
        result["Avg_Sleep_Hours"] = round(hours.mean(), 1) if hours.notna().any() else None

    if "Sleep_Score" in week_df.columns:
        scores = pd.to_numeric(week_df["Sleep_Score"], errors="coerce")
        result["Avg_Sleep_Score"] = round(scores.mean(), 1) if scores.notna().any() else None

    if "Focus_Count" in week_df.columns:
        focus = pd.to_numeric(week_df["Focus_Count"], errors="coerce")
        result["Total_Focus"] = int(focus.sum()) if focus.notna().any() else None

    if "Masturbation_Count" in week_df.columns:
        masturb = pd.to_numeric(week_df["Masturbation_Count"], errors="coerce")
        result["Total_Masturbation"] = int(masturb.sum()) if masturb.notna().any() else None

    return result


# ==========================================
# 5. 数据加载
# ==========================================

def load_weekly_data(week_key, year):
    """
    加载指定周的全部数据：概览 + 习惯 + 任务。
    无数据时返回默认模板。
    """
    paths = get_weekly_file_paths(year)

    # --- 1. 加载周概览 ---
    summary_data = {}
    if os.path.exists(paths["summary"]):
        df = pd.read_csv(paths["summary"], encoding='utf-8-sig')
        df["Week"] = df["Week"].astype(str)
        row = df[df["Week"] == week_key]
        if not row.empty:
            summary_data = {k: ("" if pd.isna(v) else v)
                           for k, v in row.iloc[0].to_dict().items()}

    # --- 2. 加载习惯 ---
    if os.path.exists(paths["habits"]):
        df_habits = pd.read_csv(paths["habits"], encoding='utf-8-sig')
        df_habits["Week"] = df_habits["Week"].astype(str)
        # 字符串列清洗
        str_cols = [wt.COL_HABIT_NAME] + wt.DAY_COLUMNS
        for col in str_cols:
            if col in df_habits.columns:
                df_habits[col] = df_habits[col].fillna("").astype(str)
        habits_df = df_habits[df_habits["Week"] == week_key].reset_index(drop=True)
    else:
        habits_df = pd.DataFrame()

    if habits_df.empty:
        habits_df = get_default_habits(week_key)

    # --- 3. 加载任务 ---
    if os.path.exists(paths["tasks"]):
        df_tasks = pd.read_csv(paths["tasks"], encoding='utf-8-sig')
        df_tasks["Week"] = df_tasks["Week"].astype(str)
        str_cols = [wt.COL_WT_CATEGORY, wt.COL_WT_PLAN, wt.COL_WT_ACTUAL,
                    wt.COL_WT_STATUS, wt.COL_WT_REASON]
        for col in str_cols:
            if col in df_tasks.columns:
                df_tasks[col] = df_tasks[col].fillna("").astype(str)
        tasks_df = df_tasks[df_tasks["Week"] == week_key].reset_index(drop=True)
    else:
        tasks_df = pd.DataFrame()

    if tasks_df.empty:
        tasks_df = get_default_weekly_tasks(week_key)

    return summary_data, habits_df, tasks_df


# ==========================================
# 6. 数据保存 (Upsert)
# ==========================================

def save_weekly_data(week_key, year, iso_week, monday, sunday,
                     summary_dict, habits_df, tasks_df):
    """
    保存周记数据到 CSV (Upsert 模式) 并生成 Markdown。
    """
    paths = get_weekly_file_paths(year)

    # --- 1. 保存周概览 ---
    summary_dict["Week"] = week_key
    summary_dict["Year"] = year
    summary_dict["Week_Number"] = iso_week
    summary_dict["Date_Start"] = monday.strftime("%Y-%m-%d")
    summary_dict["Date_End"] = sunday.strftime("%Y-%m-%d")
    new_row = pd.DataFrame([summary_dict])

    if os.path.exists(paths["summary"]):
        df_old = pd.read_csv(paths["summary"], encoding='utf-8-sig')
        df_old["Week"] = df_old["Week"].astype(str)
        df_old = df_old[df_old["Week"] != week_key]
        df_final = pd.concat([df_old, new_row], ignore_index=True)
    else:
        df_final = new_row
    df_final.to_csv(paths["summary"], index=False, encoding='utf-8-sig')

    # --- 2. 保存习惯 ---
    habits_df = habits_df.fillna("")
    # 清理空行：习惯名为空白的行
    habits_df = habits_df[habits_df[wt.COL_HABIT_NAME].astype(str).str.strip() != ""]
    habits_df["Week"] = week_key

    if os.path.exists(paths["habits"]):
        df_old = pd.read_csv(paths["habits"], encoding='utf-8-sig')
        df_old["Week"] = df_old["Week"].astype(str)
        df_old = df_old[df_old["Week"] != week_key]
        df_final = pd.concat([df_old, habits_df], ignore_index=True)
    else:
        df_final = habits_df
    df_final.to_csv(paths["habits"], index=False, encoding='utf-8-sig')

    # --- 3. 保存任务 ---
    tasks_df = tasks_df.fillna("")
    # 清理空行：计划事项为空白的行
    tasks_df = tasks_df[tasks_df[wt.COL_WT_PLAN].astype(str).str.strip() != ""]
    tasks_df["Week"] = week_key

    # 读取旧任务：按「计划事项」文本继承 goal_id（保持时间轴关联稳定），其它周原样保留
    df_old = None
    old_goal_ids = {}
    if os.path.exists(paths["tasks"]):
        df_old = pd.read_csv(paths["tasks"], encoding='utf-8-sig')
        df_old["Week"] = df_old["Week"].astype(str)
        if "goal_id" in df_old.columns:
            week_old = df_old[df_old["Week"] == week_key]
            for _, r in week_old.iterrows():
                plan = str(r.get(wt.COL_WT_PLAN, "")).strip()
                gid = str(r.get("goal_id", "")).strip()
                if plan and gid and gid.lower() != "nan":
                    old_goal_ids[plan] = gid

    # 继承 / 保留 goal_id（前端未传则按文本继承；全新目标先留空，待时间轴首次加载补 uuid）
    if "goal_id" not in tasks_df.columns:
        tasks_df["goal_id"] = ""
    tasks_df["goal_id"] = tasks_df["goal_id"].fillna("").astype(str)
    for idx in tasks_df.index:
        cur = tasks_df.at[idx, "goal_id"].strip()
        if cur and cur.lower() != "nan":
            continue
        plan = str(tasks_df.at[idx, wt.COL_WT_PLAN]).strip()
        tasks_df.at[idx, "goal_id"] = old_goal_ids.get(plan, "")

    if df_old is not None:
        df_old = df_old[df_old["Week"] != week_key]
        df_final = pd.concat([df_old, tasks_df], ignore_index=True)
    else:
        df_final = tasks_df
    df_final = df_final.fillna("")
    df_final.to_csv(paths["tasks"], index=False, encoding='utf-8-sig')

    # --- 4. 生成 Markdown ---
    generate_weekly_markdown(week_key, year, iso_week, monday, sunday,
                             summary_dict, habits_df, tasks_df)


# ==========================================
# 7. Markdown 生成
# ==========================================

def generate_weekly_markdown(week_key, year, iso_week, monday, sunday,
                              summary_dict, habits_df, tasks_df):
    """将数据填充到周记 Markdown 模板并写入文件"""
    from . import weekly_md_template as wmdt

    # 构建习惯表格行
    habit_rows = []
    for _, row in habits_df.iterrows():
        name = row.get(wt.COL_HABIT_NAME, "")
        days = [row.get(d, "") for d in wt.DAY_COLUMNS]
        # 计算完成率
        done = sum(1 for d in days if d == "✅")
        total = 7
        rate = f"{done}/{total}"
        habit_rows.append(f"| {name} | {' | '.join(days)} | {rate} |")
    habits_table = "\n".join(habit_rows) if habit_rows else ""

    # 按分类构建任务表格
    tasks_table_parts = []
    for category in wt.TASK_CATEGORIES:
        cat_df = tasks_df[tasks_df[wt.COL_WT_CATEGORY] == category]
        cat_rows = []
        for _, row in cat_df.iterrows():
            plan = row.get(wt.COL_WT_PLAN, "")
            actual = row.get(wt.COL_WT_ACTUAL, "")
            status = row.get(wt.COL_WT_STATUS, "")
            reason = row.get(wt.COL_WT_REASON, "")
            cat_rows.append(f"| {plan} | {actual} | {status} | {reason} |")
        tasks_table_parts.append({
            "category": category,
            "rows": "\n".join(cat_rows) if cat_rows else "| | | | |",
        })

    content = wmdt.get_template(
        week_key=week_key,
        year=year,
        iso_week=iso_week,
        date_start=monday.strftime("%Y-%m-%d"),
        date_end=sunday.strftime("%Y-%m-%d"),
        create_time=summary_dict.get("Create_Time", ""),
        complete_time=summary_dict.get("Complete_Time", ""),
        habits_table=habits_table,
        avg_mood=summary_dict.get("Avg_Mood", ""),
        avg_sleep_hours=summary_dict.get("Avg_Sleep_Hours", ""),
        avg_sleep_score=summary_dict.get("Avg_Sleep_Score", ""),
        total_focus=summary_dict.get("Total_Focus", ""),
        total_masturbation=summary_dict.get("Total_Masturbation", ""),
        best_mood_day=summary_dict.get("Best_Mood_Day", ""),
        worst_mood_day=summary_dict.get("Worst_Mood_Day", ""),
        tasks_table_parts=tasks_table_parts,
        weekly_score=summary_dict.get("Weekly_Score", ""),
        highlights=summary_dict.get("Highlights", ""),
        challenges=summary_dict.get("Challenges", ""),
        reflect_good=summary_dict.get("Reflect_Good", ""),
        reflect_improve=summary_dict.get("Reflect_Improve", ""),
        reflect_next_week=summary_dict.get("Reflect_Next_Week", ""),
        words_to_self=summary_dict.get("Words_To_Self", ""),
        thoughts=summary_dict.get("Thoughts", ""),
    )

    md_path = get_weekly_md_path(monday)
    with open(md_path, "w", encoding="utf-8-sig") as f:
        f.write(content)


# ==========================================
# 8. 需求46：每周事项时间轴
# ==========================================

TIMELINE_COLS = ["Week", "id", "goal_id", "周几", "内容", "完成"]


def _gen_id(prefix):
    return f"{prefix}_{uuid.uuid4().hex[:8]}"


def get_weekly_timeline_path(year):
    return os.path.join(cfg.PATH_WEEKLY_TIMELINE, f"weekly_timeline_{year}.csv")


def get_weekly_lanes(week_key, year):
    """返回某周的「泳道」= 周目标列表（每条带稳定 goal_id）。
    若 weekly_tasks 中非空目标缺 goal_id，则补 uuid 并落库（一次性回填）。
    返回 [{goal_id, text, category, status}, ...]
    """
    paths = get_weekly_file_paths(year)
    if not os.path.exists(paths["tasks"]):
        return []

    df = pd.read_csv(paths["tasks"], encoding="utf-8-sig")
    if "Week" not in df.columns or wt.COL_WT_PLAN not in df.columns:
        return []
    df["Week"] = df["Week"].astype(str)
    if "goal_id" not in df.columns:
        df["goal_id"] = ""
    df["goal_id"] = df["goal_id"].fillna("").astype(str)

    week_mask = df["Week"] == week_key
    changed = False
    for idx in df[week_mask].index:
        plan = str(df.at[idx, wt.COL_WT_PLAN]).strip()
        if not plan or plan.lower() == "nan":
            continue
        gid = df.at[idx, "goal_id"].strip()
        if gid == "" or gid.lower() == "nan":
            df.at[idx, "goal_id"] = _gen_id("g")
            changed = True

    if changed:
        df = df.fillna("")
        df.to_csv(paths["tasks"], index=False, encoding="utf-8-sig")

    lanes = []
    for idx in df[week_mask].index:
        plan = str(df.at[idx, wt.COL_WT_PLAN]).strip()
        if not plan or plan.lower() == "nan":
            continue
        def _clean(col):
            if col not in df.columns:
                return ""
            v = df.at[idx, col]
            if pd.isna(v):
                return ""
            s = str(v).strip()
            return "" if s.lower() == "nan" else s
        lanes.append({
            "goal_id": df.at[idx, "goal_id"].strip(),
            "text": plan,
            "category": _clean(wt.COL_WT_CATEGORY),
            "status": _clean(wt.COL_WT_STATUS),
        })
    return lanes


def load_weekly_timeline(week_key, year):
    """加载某周的时间轴卡片列表。"""
    path = get_weekly_timeline_path(year)
    if not os.path.exists(path):
        return []
    df = pd.read_csv(path, encoding="utf-8-sig")
    if "Week" not in df.columns:
        return []
    df["Week"] = df["Week"].astype(str)
    wk = df[df["Week"] == week_key]
    items = []
    for _, r in wk.iterrows():
        items.append({c: ("" if pd.isna(r.get(c)) else str(r.get(c, ""))) for c in TIMELINE_COLS})
    return items


def save_weekly_timeline(week_key, year, items):
    """保存整周时间轴卡片（Upsert by Week）。空内容卡片不落库。
    返回实际落库的卡片列表（含生成好的 id）。"""
    path = get_weekly_timeline_path(year)
    rows = []
    for it in items:
        content = str(it.get("内容", "")).strip()
        if not content:
            continue
        rows.append({
            "Week": week_key,
            "id": (str(it.get("id", "")).strip() or _gen_id("t")),
            "goal_id": str(it.get("goal_id", "")).strip(),
            "周几": str(it.get("周几", "")).strip(),
            "内容": content,
            "完成": str(it.get("完成", "")).strip(),
        })
    new_df = pd.DataFrame(rows, columns=TIMELINE_COLS)

    if os.path.exists(path):
        df_old = pd.read_csv(path, encoding="utf-8-sig")
        df_old["Week"] = df_old["Week"].astype(str)
        df_old = df_old[df_old["Week"] != week_key]
        df_final = pd.concat([df_old, new_df], ignore_index=True)
    else:
        df_final = new_df
    df_final = df_final.fillna("")
    df_final.to_csv(path, index=False, encoding="utf-8-sig")
    return rows


def apply_goal_completion(week_key, year, timeline_items):
    """按时间轴卡片完成情况回写 weekly_tasks 的 状态/实际完成。
    规则（方案1）：仅影响**有卡片**的目标——其全部卡片完成→✅/完成，否则清空；
    没有卡片的目标完全不动（保持手动）。
    """
    paths = get_weekly_file_paths(year)
    if not os.path.exists(paths["tasks"]):
        return

    df = pd.read_csv(paths["tasks"], encoding="utf-8-sig")
    if "goal_id" not in df.columns or "Week" not in df.columns:
        return
    df["Week"] = df["Week"].astype(str)
    df["goal_id"] = df["goal_id"].fillna("").astype(str)
    # 状态/实际完成列可能因整列为空被推断为 float，先转 str 以便写入 ✅/完成
    for col in (wt.COL_WT_STATUS, wt.COL_WT_ACTUAL):
        if col in df.columns:
            df[col] = df[col].fillna("").astype(str)

    total, done = {}, {}
    for it in timeline_items:
        gid = str(it.get("goal_id", "")).strip()
        if not gid:
            continue
        total[gid] = total.get(gid, 0) + 1
        if str(it.get("完成", "")).strip() == "✅":
            done[gid] = done.get(gid, 0) + 1

    week_mask = df["Week"] == week_key
    changed = False
    for idx in df[week_mask].index:
        gid = df.at[idx, "goal_id"].strip()
        if gid in total and total[gid] > 0:
            all_done = done.get(gid, 0) == total[gid]
            new_status = "✅" if all_done else ""
            new_actual = "完成" if all_done else ""
            if str(df.at[idx, wt.COL_WT_STATUS]) != new_status:
                df.at[idx, wt.COL_WT_STATUS] = new_status
                changed = True
            if str(df.at[idx, wt.COL_WT_ACTUAL]) != new_actual:
                df.at[idx, wt.COL_WT_ACTUAL] = new_actual
                changed = True

    if changed:
        df = df.fillna("")
        df.to_csv(paths["tasks"], index=False, encoding="utf-8-sig")
