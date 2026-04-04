from fastapi import APIRouter, HTTPException
from datetime import datetime, date
import pandas as pd
import os

from schemas.diary import DiaryInput, MetadataResponse, CalendarResponse
from core import data_manager as dm
from core import config as cfg
from core import texts as t

router = APIRouter(prefix="/api", tags=["日记"])

# --- 常量 ---
ANCHOR_DATE = date(2026, 2, 18)
ANCHOR_NO = 1100
WEEKDAY_NAMES = {1: "星期一", 2: "星期二", 3: "星期三", 4: "星期四",
                 5: "星期五", 6: "星期六", 7: "星期日"}


def _parse_date(date_str: str) -> date:
    """解析日期字符串，格式不对抛 422"""
    try:
        return datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=422, detail=f"日期格式错误，需要 YYYY-MM-DD，收到：{date_str}")


# ==================== 1. 查看日记 ====================
@router.get("/diary/{date_str}")
def get_diary(date_str: str):
    date_obj = _parse_date(date_str)
    summary_data, tasks_df, time_df = dm.load_data_for_date(date_obj)

    # 即使没有日记数据也返回 200（time_df 会包含默认模板）
    return {
        "summary": summary_data,
        "tasks": tasks_df.to_dict(orient="records"),
        "time_slots": time_df.to_dict(orient="records"),
    }


# ==================== 2. 保存日记 ====================
@router.put("/diary/{date_str}")
def save_diary(date_str: str, body: DiaryInput):
    date_obj = _parse_date(date_str)

    # --- 构建 summary_dict ---
    summary_dict = body.summary.model_dump()
    # 补充自动计算字段
    diary_no = ANCHOR_NO + (date_obj - ANCHOR_DATE).days
    weekday = date_obj.isoweekday()
    summary_dict["Diary_No"] = diary_no
    summary_dict["Weekday"] = weekday
    summary_dict["Date"] = date_str

    # --- 构建 tasks DataFrame ---
    tasks_data = [{"Date": date_str, **task.model_dump()} for task in body.tasks]
    # 重命名 key 以匹配 CSV 列名（Pydantic 模型用中文字段名，直接对应）
    tasks_df = pd.DataFrame(tasks_data) if tasks_data else pd.DataFrame(
        columns=["Date", t.COL_TASK_NAME, t.COL_TASK_ACTUAL, t.COL_TASK_STATUS, t.COL_TASK_REASON]
    )

    # --- 构建 time DataFrame ---
    time_data = [{"Date": date_str, **slot.model_dump()} for slot in body.time_slots]
    time_df = pd.DataFrame(time_data) if time_data else dm.get_default_time_schedule(date_str)

    # --- 调用现有函数保存 ---
    try:
        dm.save_all_data(date_obj, summary_dict, tasks_df, time_df)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"保存失败：{str(e)}")

    return {"message": f"{date_str} 日记保存成功！"}


# ==================== 3. 日记元数据 ====================
@router.get("/diary/{date_str}/metadata", response_model=MetadataResponse)
def get_diary_metadata(date_str: str):
    date_obj = _parse_date(date_str)
    diary_no = ANCHOR_NO + (date_obj - ANCHOR_DATE).days
    weekday = date_obj.isoweekday()

    return MetadataResponse(
        diary_no=diary_no,
        weekday=weekday,
        weekday_name=WEEKDAY_NAMES[weekday],
        date=date_str,
    )


# ==================== 4. 日历打点 ====================
@router.get("/calendar/{month_str}", response_model=CalendarResponse)
def get_calendar_dots(month_str: str):
    # 解析月份
    try:
        parts = month_str.split("-")
        year = int(parts[0])
        month = int(parts[1])
        if month < 1 or month > 12:
            raise ValueError
    except (ValueError, IndexError):
        raise HTTPException(status_code=422, detail=f"月份格式错误，需要 YYYY-MM，收到：{month_str}")

    # 读取该年的 daily_summary CSV
    csv_path = os.path.join(cfg.PATH_SUMMARY, f"daily_summary_{year}.csv")
    if not os.path.exists(csv_path):
        return CalendarResponse(dates=[])

    df = pd.read_csv(csv_path, encoding="utf-8-sig")
    df["Date"] = df["Date"].astype(str)

    # 筛选属于该月的日期
    prefix = f"{year}-{month:02d}-"
    matched = df[df["Date"].str.startswith(prefix)]["Date"].tolist()
    matched.sort()

    return CalendarResponse(dates=matched)
