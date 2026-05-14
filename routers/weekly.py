from fastapi import APIRouter, HTTPException
from datetime import datetime
import pandas as pd
import re

from schemas.weekly import WeeklyInput
from core import weekly_data_manager as wdm
from core import weekly_texts as wt

router = APIRouter(prefix="/api", tags=["周记"])

# 周号格式：2026-W09
WEEK_PATTERN = re.compile(r"^(\d{4})-W(\d{2})$")


def _parse_week(week_str: str):
    """解析周号，返回 (week_key, year, iso_week, monday, sunday)"""
    m = WEEK_PATTERN.match(week_str)
    if not m:
        raise HTTPException(status_code=422, detail=f"周号格式错误，需要 YYYY-Wxx，收到：{week_str}")

    year = int(m.group(1))
    iso_week = int(m.group(2))
    if iso_week < 1 or iso_week > 53:
        raise HTTPException(status_code=422, detail=f"周号超出范围：{week_str}")

    # 用 ISO 周号反推 monday
    try:
        monday = datetime.strptime(f"{year}-W{iso_week:02d}-1", "%G-W%V-%u").date()
    except ValueError:
        raise HTTPException(status_code=422, detail=f"无效的周号：{week_str}")

    week_key, iso_year, iso_week, monday, sunday = wdm.get_week_info(monday)
    return week_key, iso_year, iso_week, monday, sunday


# ==================== 1. 查看周记 ====================
@router.get("/weekly/{week_str}")
def get_weekly(week_str: str):
    week_key, year, iso_week, monday, sunday = _parse_week(week_str)
    summary_data, habits_df, tasks_df = wdm.load_weekly_data(week_key, year)

    # 自动从日记反馈 4 个能推断的习惯（早起/专注/不打飞机/按时睡觉）
    # 仅对**空格子**填 ✅，用户手填的 ✅/❌ 保留
    habits_df = wdm.apply_auto_habits(habits_df, monday)

    return {
        "summary": summary_data,
        "habits": habits_df.to_dict(orient="records"),
        "tasks": tasks_df.to_dict(orient="records"),
    }


# ==================== 2. 保存周记 ====================
@router.put("/weekly/{week_str}")
def save_weekly(week_str: str, body: WeeklyInput):
    week_key, year, iso_week, monday, sunday = _parse_week(week_str)

    # --- 构建 summary_dict ---
    summary_dict = body.summary.model_dump()

    # --- 构建 habits DataFrame ---
    habits_data = [{"Week": week_key, **h.model_dump()} for h in body.habits]
    if habits_data:
        habits_df = pd.DataFrame(habits_data)
    else:
        habits_df = wdm.get_default_habits(week_key)

    # --- 构建 tasks DataFrame ---
    tasks_data = [{"Week": week_key, **t.model_dump()} for t in body.tasks]
    if tasks_data:
        tasks_df = pd.DataFrame(tasks_data)
    else:
        tasks_df = wdm.get_default_weekly_tasks(week_key)

    try:
        wdm.save_weekly_data(week_key, year, iso_week, monday, sunday,
                             summary_dict, habits_df, tasks_df)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"保存失败：{str(e)}")

    return {"message": f"{week_key} 周记保存成功！"}


# ==================== 3. 周数据聚合 ====================
@router.get("/weekly/{week_str}/aggregation")
def get_weekly_aggregation(week_str: str):
    week_key, year, iso_week, monday, sunday = _parse_week(week_str)
    result = wdm.aggregate_daily_data(monday)

    # 判断是否有数据（全部 None 说明没有日记可聚合）
    if all(v is None or v == "" for v in result.values()):
        raise HTTPException(status_code=404, detail=f"{week_key} 没有可聚合的日记数据")

    return result
