# report_data_collector.py
# 从 CSV 数据文件中收集并格式化数据，供 Gemini 分析使用

import os
import pandas as pd
from datetime import datetime, timedelta
from . import config as cfg


def _read_csv_safe(file_path):
    """安全读取 CSV，文件不存在时返回 None"""
    if os.path.exists(file_path):
        try:
            return pd.read_csv(file_path, encoding='utf-8-sig')
        except Exception:
            return None
    return None


def _df_to_text(df, max_rows=None):
    """将 DataFrame 转为文本表格，便于 LLM 阅读"""
    if df is None or df.empty:
        return "暂无数据"
    if max_rows and len(df) > max_rows:
        df = df.tail(max_rows)
    return df.to_string(index=False)


def collect_daily_summary(year):
    """收集每日概览数据（全量）"""
    path = os.path.join(cfg.PATH_SUMMARY, f"daily_summary_{year}.csv")
    df = _read_csv_safe(path)
    if df is None:
        return "暂无数据"
    # 选择关键量化列，避免过长
    key_cols = [c for c in [
        "Date", "Mood", "Sleep_Score", "Sleep_Bedtime", "Sleep_Waketime",
        "Sleep_Hours", "Focus_Count", "Meditation_Minutes", "AI_Time",
        "Masturbation_Count"
    ] if c in df.columns]
    return _df_to_text(df[key_cols]) if key_cols else _df_to_text(df)


def collect_tasks(year):
    """收集任务数据（全量）"""
    path = os.path.join(cfg.PATH_TASKS, f"tasks_log_{year}.csv")
    df = _read_csv_safe(path)
    return _df_to_text(df)


def collect_time_log(year, recent_days=7):
    """收集时间日志（近 N 天，控制 token 量）"""
    path = os.path.join(cfg.PATH_TIME, f"time_log_{year}.csv")
    df = _read_csv_safe(path)
    if df is None or df.empty:
        return "暂无数据"
    # 按日期过滤近 N 天
    cutoff = (datetime.now().date() - timedelta(days=recent_days)).isoformat()
    df["Date"] = df["Date"].astype(str)
    df = df[df["Date"] >= cutoff]
    return _df_to_text(df) if not df.empty else "近7天暂无数据"


def collect_weekly_data(year):
    """收集周记三表数据"""
    parts = []
    for name, folder in [
        ("周概览", cfg.PATH_WEEKLY_SUMMARY),
        ("周习惯", cfg.PATH_WEEKLY_HABITS),
        ("周任务", cfg.PATH_WEEKLY_TASKS),
    ]:
        path = os.path.join(folder, f"{name.replace('周', 'weekly_')}_{year}.csv")
        # 文件名映射
        if "概览" in name:
            path = os.path.join(folder, f"weekly_summary_{year}.csv")
        elif "习惯" in name:
            path = os.path.join(folder, f"weekly_habits_{year}.csv")
        else:
            path = os.path.join(folder, f"weekly_tasks_{year}.csv")
        df = _read_csv_safe(path)
        text = _df_to_text(df)
        parts.append(f"### {name}\n{text}")
    return "\n\n".join(parts)


def collect_monthly_data(year):
    """收集月记二表数据"""
    parts = []
    for name, folder in [
        ("月概览", cfg.PATH_MONTHLY_SUMMARY),
        ("月任务", cfg.PATH_MONTHLY_TASKS),
    ]:
        if "概览" in name:
            path = os.path.join(folder, f"monthly_summary_{year}.csv")
        else:
            path = os.path.join(folder, f"monthly_tasks_{year}.csv")
        df = _read_csv_safe(path)
        text = _df_to_text(df)
        parts.append(f"### {name}\n{text}")
    return "\n\n".join(parts)


def collect_reflections(year):
    """从 daily_summary 的 Reflect_* 列提取反思内容，过滤空行"""
    path = os.path.join(cfg.PATH_SUMMARY, f"daily_summary_{year}.csv")
    df = _read_csv_safe(path)
    if df is None or df.empty:
        return "暂无数据"
    # 找到所有反思列
    reflect_cols = [c for c in df.columns if c.startswith("Reflect_")]
    if not reflect_cols:
        return "暂无反思数据"
    keep_cols = ["Date"] + reflect_cols
    df_reflect = df[keep_cols].copy()
    # 过滤掉所有反思列都为空的行
    mask = df_reflect[reflect_cols].apply(
        lambda row: any(str(v).strip() not in ("", "nan") for v in row), axis=1
    )
    df_reflect = df_reflect[mask]
    return _df_to_text(df_reflect) if not df_reflect.empty else "暂无反思数据"


def collect_all_data():
    """
    主入口：收集所有数据，返回 dict，key 对应提示词模板占位符。
    自动检测当前年份。
    """
    year = datetime.now().year
    return {
        "daily_summary": collect_daily_summary(year),
        "tasks_data": collect_tasks(year),
        "time_data": collect_time_log(year, recent_days=7),
        "weekly_data": collect_weekly_data(year),
        "monthly_data": collect_monthly_data(year),
        "reflections_summary": collect_reflections(year),
    }
