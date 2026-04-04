from fastapi import APIRouter, HTTPException
import pandas as pd
import os
import re

from schemas.monthly import MonthlyInput
from core import monthly_data_manager as mdm
from core import monthly_texts as mt
from core import weekly_data_manager as wdm
from core import weekly_texts as wt
from core import config as cfg

router = APIRouter(prefix="/api", tags=["月记"])

# 月号格式：2026-03
MONTH_PATTERN = re.compile(r"^(\d{4})-(\d{2})$")


def _parse_month(month_str: str):
    """解析月号，返回 (month_key, year, month, first_day, last_day)"""
    m = MONTH_PATTERN.match(month_str)
    if not m:
        raise HTTPException(status_code=422, detail=f"月份格式错误，需要 YYYY-MM，收到：{month_str}")

    year = int(m.group(1))
    month = int(m.group(2))
    if month < 1 or month > 12:
        raise HTTPException(status_code=422, detail=f"月份超出范围：{month_str}")

    from datetime import date
    import calendar
    first_day = date(year, month, 1)
    last_day = date(year, month, calendar.monthrange(year, month)[1])
    month_key = f"{year}-{month:02d}"
    return month_key, year, month, first_day, last_day


# ==================== 1. 查看月记 ====================
@router.get("/monthly/{month_str}")
def get_monthly(month_str: str):
    month_key, year, month, first_day, last_day = _parse_month(month_str)
    summary_data, tasks_df = mdm.load_monthly_data(month_key, year)

    return {
        "summary": summary_data,
        "tasks": tasks_df.to_dict(orient="records"),
    }


# ==================== 2. 保存月记 ====================
@router.put("/monthly/{month_str}")
def save_monthly(month_str: str, body: MonthlyInput):
    month_key, year, month, first_day, last_day = _parse_month(month_str)

    # --- 构建 summary_dict ---
    summary_dict = body.summary.model_dump()

    # --- 构建 tasks DataFrame ---
    tasks_data = [{"Month": month_key, **t.model_dump()} for t in body.tasks]
    if tasks_data:
        tasks_df = pd.DataFrame(tasks_data)
    else:
        tasks_df = mdm.get_default_monthly_tasks(month_key)

    try:
        mdm.save_monthly_data(month_key, year, month, first_day, last_day,
                              summary_dict, tasks_df)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"保存失败：{str(e)}")

    return {"message": f"{month_key} 月记保存成功！"}


# ==================== 3. 月数据聚合 ====================

def _aggregate_monthly_habits(year: int, month: int) -> list[dict]:
    """从该月所有周的 weekly_habits CSV 聚合习惯数据"""
    from datetime import date, timedelta

    first_day = date(year, month, 1)
    import calendar
    last_day = date(year, month, calendar.monthrange(year, month)[1])

    # 读取该年的 weekly_habits CSV
    habits_path = os.path.join(cfg.PATH_WEEKLY_HABITS, f"weekly_habits_{year}.csv")
    if not os.path.exists(habits_path):
        return []

    df = pd.read_csv(habits_path, encoding="utf-8-sig")
    if df.empty or "Week" not in df.columns:
        return []

    # 找出该月包含的所有周号
    _, weeks_list_str = mdm.get_weeks_in_month(year, month)
    week_numbers = [w.strip() for w in weeks_list_str.split(",")]  # ["W14", "W15", ...]
    week_keys = [f"{year}-{w}" for w in week_numbers]

    # 筛选属于该月的周
    df["Week"] = df["Week"].astype(str)
    month_habits = df[df["Week"].isin(week_keys)]
    if month_habits.empty:
        return []

    # 按习惯名聚合
    day_cols = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    result = []
    for habit_name, group in month_habits.groupby(wt.COL_HABIT_NAME):
        if not habit_name or str(habit_name).strip() == "":
            continue
        total_done = 0
        total_days = 0
        for _, row in group.iterrows():
            for day in day_cols:
                val = str(row.get(day, "")).strip()
                if val:  # 有记录的天才计入总数
                    total_days += 1
                    if val == "✅":
                        total_done += 1

        progress = round(total_done / total_days * 100) if total_days > 0 else 0
        result.append({
            "name": str(habit_name),
            "done": total_done,
            "total": total_days,
            "progress": progress,
        })

    return result


@router.get("/monthly/{month_str}/aggregation")
def get_monthly_aggregation(month_str: str):
    month_key, year, month, first_day, last_day = _parse_month(month_str)
    result = mdm.aggregate_monthly_data(year, month)

    # 聚合习惯数据
    habits = _aggregate_monthly_habits(year, month)
    result["habits"] = habits

    return result
