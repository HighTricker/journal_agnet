"""周记模块的单元测试"""
import os
import pytest
import pandas as pd
from datetime import date, timedelta
from unittest.mock import patch


# ==========================================
# 1. 周信息计算测试
# ==========================================
class TestWeekInfo:
    """get_week_info 的 ISO 周编号和日期计算"""

    def test_week_key_format(self):
        """week_key 格式应为 'YYYY-Wnn'"""
        from core.weekly_data_manager import get_week_info
        week_key, _, _, _, _ = get_week_info(date(2026, 3, 4))
        assert week_key.startswith("2026-W")
        # W 后面是两位数
        w_part = week_key.split("-W")[1]
        assert len(w_part) == 2

    def test_monday_is_correct(self):
        """无论传入周几，monday 都应是该周的周一"""
        from core.weekly_data_manager import get_week_info
        # 2026-03-04 是星期三
        _, _, _, monday, _ = get_week_info(date(2026, 3, 4))
        assert monday.weekday() == 0  # 0 = 周一
        assert monday == date(2026, 3, 2)

    def test_sunday_is_correct(self):
        """sunday 应是 monday + 6 天"""
        from core.weekly_data_manager import get_week_info
        _, _, _, monday, sunday = get_week_info(date(2026, 3, 4))
        assert sunday.weekday() == 6  # 6 = 周日
        assert sunday == monday + timedelta(days=6)

    def test_monday_input(self):
        """传入周一本身也应正确"""
        from core.weekly_data_manager import get_week_info
        _, _, _, monday, _ = get_week_info(date(2026, 3, 2))
        assert monday == date(2026, 3, 2)

    def test_sunday_input(self):
        """传入周日应属于同一周"""
        from core.weekly_data_manager import get_week_info
        key_wed, _, _, _, _ = get_week_info(date(2026, 3, 4))
        key_sun, _, _, _, _ = get_week_info(date(2026, 3, 8))
        assert key_wed == key_sun

    def test_iso_year_week(self):
        """ISO 年和周号应与 isocalendar 一致"""
        from core.weekly_data_manager import get_week_info
        d = date(2026, 3, 4)
        _, iso_year, iso_week, _, _ = get_week_info(d)
        expected_year, expected_week, _ = d.isocalendar()
        assert iso_year == expected_year
        assert iso_week == expected_week


# ==========================================
# 2. 默认习惯测试
# ==========================================
class TestDefaultHabits:
    """get_default_habits 的结构验证"""

    def test_row_count(self):
        """应有 6 个默认习惯 + 1 个空行 = 7 行"""
        from core.weekly_data_manager import get_default_habits
        df = get_default_habits("2026-W10")
        assert len(df) == 7

    def test_columns(self):
        """应包含 Week、习惯、Mon~Sun 共 9 列"""
        from core.weekly_data_manager import get_default_habits
        from core.weekly_texts import COL_HABIT_NAME, DAY_COLUMNS
        df = get_default_habits("2026-W10")
        assert "Week" in df.columns
        assert COL_HABIT_NAME in df.columns
        for day in DAY_COLUMNS:
            assert day in df.columns

    def test_week_key_filled(self):
        """所有行的 Week 字段应填充为传入的 week_key"""
        from core.weekly_data_manager import get_default_habits
        df = get_default_habits("2026-W10")
        assert (df["Week"] == "2026-W10").all()

    def test_last_row_is_empty(self):
        """最后一行习惯名应为空（供用户新增）"""
        from core.weekly_data_manager import get_default_habits
        from core.weekly_texts import COL_HABIT_NAME
        df = get_default_habits("2026-W10")
        assert df.iloc[-1][COL_HABIT_NAME] == ""


# ==========================================
# 3. 默认周任务测试
# ==========================================
class TestDefaultWeeklyTasks:
    """get_default_weekly_tasks 的结构验证"""

    def test_row_count(self):
        """4 个分类 × 3 行 = 12 行"""
        from core.weekly_data_manager import get_default_weekly_tasks
        df = get_default_weekly_tasks("2026-W10")
        assert len(df) == 12

    def test_all_categories_covered(self):
        """4 个分类都应有数据"""
        from core.weekly_data_manager import get_default_weekly_tasks
        from core.weekly_texts import TASK_CATEGORIES, COL_WT_CATEGORY
        df = get_default_weekly_tasks("2026-W10")
        categories = df[COL_WT_CATEGORY].unique().tolist()
        for cat in TASK_CATEGORIES:
            assert cat in categories

    def test_columns(self):
        """应包含 Week、分类、计划事项、实际完成、状态、原因分析"""
        from core.weekly_data_manager import get_default_weekly_tasks
        from core import weekly_texts as wt
        df = get_default_weekly_tasks("2026-W10")
        for col in ["Week", wt.COL_WT_CATEGORY, wt.COL_WT_PLAN,
                     wt.COL_WT_ACTUAL, wt.COL_WT_STATUS, wt.COL_WT_REASON]:
            assert col in df.columns


# ==========================================
# 4. 文件路径测试
# ==========================================
class TestWeeklyFilePaths:
    """get_weekly_file_paths 路径格式"""

    def test_paths_contain_year(self):
        from core.weekly_data_manager import get_weekly_file_paths
        paths = get_weekly_file_paths(2026)
        assert "2026" in paths["summary"]
        assert "2026" in paths["habits"]
        assert "2026" in paths["tasks"]

    def test_filename_format(self):
        from core.weekly_data_manager import get_weekly_file_paths
        paths = get_weekly_file_paths(2026)
        assert paths["summary"].endswith("weekly_summary_2026.csv")
        assert paths["habits"].endswith("weekly_habits_2026.csv")
        assert paths["tasks"].endswith("weekly_tasks_2026.csv")


# ==========================================
# 5. Markdown 路径测试
# ==========================================
class TestWeeklyMdPath:
    """get_weekly_md_path 路径格式"""

    @patch("core.weekly_data_manager.os.makedirs")
    def test_md_path_in_month_folder(self, mock_makedirs):
        """Markdown 路径应在周一所在月份的文件夹中"""
        from core.weekly_data_manager import get_weekly_md_path
        monday = date(2026, 3, 2)
        path = get_weekly_md_path(monday)
        assert "03月" in path

    @patch("core.weekly_data_manager.os.makedirs")
    def test_md_filename_contains_week_key(self, mock_makedirs):
        """文件名应包含周编号"""
        from core.weekly_data_manager import get_weekly_md_path
        monday = date(2026, 3, 2)
        path = get_weekly_md_path(monday)
        assert "weekly_" in os.path.basename(path)
        assert "W" in os.path.basename(path)


# ==========================================
# 6. 数据聚合测试
# ==========================================
class TestAggregateDailyData:
    """aggregate_daily_data 从日记数据聚合"""

    def test_no_file_returns_none(self):
        """日记文件不存在时返回 None 值"""
        from core.weekly_data_manager import aggregate_daily_data
        with patch("core.weekly_data_manager.os.path.exists", return_value=False):
            result = aggregate_daily_data(date(2026, 3, 2))
        assert result["Avg_Mood"] is None
        assert result["Total_Focus"] is None

    def test_aggregation_with_data(self, tmp_path):
        """有数据时应正确计算平均值和求和"""
        from core.weekly_data_manager import aggregate_daily_data

        # 创建模拟日记数据
        df = pd.DataFrame([
            {"Date": "2026-03-02", "Mood": 4, "Sleep_Hours": 7.5,
             "Sleep_Score": 4, "Focus_Count": 6, "Masturbation_Count": 0},
            {"Date": "2026-03-03", "Mood": 3, "Sleep_Hours": 6.5,
             "Sleep_Score": 3, "Focus_Count": 4, "Masturbation_Count": 1},
            {"Date": "2026-03-04", "Mood": 5, "Sleep_Hours": 8.0,
             "Sleep_Score": 5, "Focus_Count": 8, "Masturbation_Count": 0},
        ])
        csv_path = str(tmp_path / "daily_summary_2026.csv")
        df.to_csv(csv_path, index=False, encoding="utf-8-sig")

        with patch("core.weekly_data_manager.cfg.PATH_SUMMARY", str(tmp_path)):
            result = aggregate_daily_data(date(2026, 3, 2))

        assert result["Avg_Mood"] == 4.0
        assert result["Total_Focus"] == 18
        assert result["Total_Masturbation"] == 1
        assert "周三" in result["Best_Mood_Day"]  # 心情最好是3月4日周三
        assert "周二" in result["Worst_Mood_Day"]  # 心情最差是3月3日周二


# ==========================================
# 7. 保存与加载回环测试
# ==========================================
class TestWeeklySaveLoadRoundtrip:
    """save → load 回环验证"""

    def test_summary_roundtrip(self, tmp_path):
        """保存周概览后再加载应一致"""
        from core.weekly_data_manager import save_weekly_data, load_weekly_data

        # 设置临时路径
        with patch("core.weekly_data_manager.cfg.PATH_WEEKLY_SUMMARY", str(tmp_path / "ws")), \
             patch("core.weekly_data_manager.cfg.PATH_WEEKLY_HABITS", str(tmp_path / "wh")), \
             patch("core.weekly_data_manager.cfg.PATH_WEEKLY_TASKS", str(tmp_path / "wt")), \
             patch("core.weekly_data_manager.get_weekly_md_path", return_value=str(tmp_path / "weekly.md")):
            os.makedirs(tmp_path / "ws", exist_ok=True)
            os.makedirs(tmp_path / "wh", exist_ok=True)
            os.makedirs(tmp_path / "wt", exist_ok=True)

            monday = date(2026, 3, 2)
            sunday = date(2026, 3, 8)
            week_key = "2026-W10"

            summary = {"Weekly_Score": 4, "Highlights": "测试亮点"}
            habits = pd.DataFrame([{
                "Week": week_key, "习惯": "早起", "Mon": "✅", "Tue": "",
                "Wed": "✅", "Thu": "", "Fri": "✅", "Sat": "", "Sun": "",
            }])
            tasks = pd.DataFrame([{
                "Week": week_key, "分类": "工作", "计划事项": "完成项目",
                "实际完成": "完成", "状态": "✅", "原因分析": "",
            }])

            save_weekly_data(week_key, 2026, 10, monday, sunday,
                             summary, habits, tasks)

            # 重新加载
            loaded_summary, loaded_habits, loaded_tasks = load_weekly_data(week_key, 2026)

        assert loaded_summary.get("Weekly_Score") == 4
        assert loaded_summary.get("Highlights") == "测试亮点"
        assert len(loaded_habits) == 1
        assert len(loaded_tasks) == 1
