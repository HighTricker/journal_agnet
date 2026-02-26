"""月记模块的单元测试"""
import os
import pytest
import pandas as pd
from datetime import date
from unittest.mock import patch


# ==========================================
# 1. 月信息计算测试
# ==========================================
class TestMonthInfo:
    """get_month_info 的月编号和日期计算"""

    def test_month_key_format(self):
        """month_key 格式应为 'YYYY-MM'"""
        from core.monthly_data_manager import get_month_info
        month_key, _, _, _, _ = get_month_info(date(2026, 3, 15))
        assert month_key == "2026-03"

    def test_month_key_single_digit(self):
        """1月份应补零为 '2026-01'"""
        from core.monthly_data_manager import get_month_info
        month_key, _, _, _, _ = get_month_info(date(2026, 1, 5))
        assert month_key == "2026-01"

    def test_first_day(self):
        """first_day 应是当月1号"""
        from core.monthly_data_manager import get_month_info
        _, _, _, first_day, _ = get_month_info(date(2026, 3, 15))
        assert first_day == date(2026, 3, 1)

    def test_last_day_march(self):
        """3月末日应是31号"""
        from core.monthly_data_manager import get_month_info
        _, _, _, _, last_day = get_month_info(date(2026, 3, 15))
        assert last_day == date(2026, 3, 31)

    def test_last_day_february_normal(self):
        """非闰年2月末日应是28号"""
        from core.monthly_data_manager import get_month_info
        _, _, _, _, last_day = get_month_info(date(2026, 2, 10))
        assert last_day == date(2026, 2, 28)

    def test_last_day_february_leap(self):
        """闰年2月末日应是29号"""
        from core.monthly_data_manager import get_month_info
        _, _, _, _, last_day = get_month_info(date(2028, 2, 10))
        assert last_day == date(2028, 2, 29)

    def test_year_and_month(self):
        """year 和 month 应正确返回"""
        from core.monthly_data_manager import get_month_info
        _, year, month, _, _ = get_month_info(date(2026, 12, 25))
        assert year == 2026
        assert month == 12


# ==========================================
# 2. 默认月任务测试
# ==========================================
class TestDefaultMonthlyTasks:
    """get_default_monthly_tasks 的结构验证"""

    def test_row_count(self):
        """4 个分类 × 3 行 = 12 行"""
        from core.monthly_data_manager import get_default_monthly_tasks
        df = get_default_monthly_tasks("2026-03")
        assert len(df) == 12

    def test_all_categories_covered(self):
        """4 个分类都应有数据"""
        from core.monthly_data_manager import get_default_monthly_tasks
        from core.monthly_texts import TASK_CATEGORIES, COL_MT_CATEGORY
        df = get_default_monthly_tasks("2026-03")
        categories = df[COL_MT_CATEGORY].unique().tolist()
        for cat in TASK_CATEGORIES:
            assert cat in categories

    def test_columns(self):
        """应包含 Month、分类、计划事项、实际完成、状态、原因分析"""
        from core.monthly_data_manager import get_default_monthly_tasks
        from core import monthly_texts as mt
        df = get_default_monthly_tasks("2026-03")
        for col in ["Month", mt.COL_MT_CATEGORY, mt.COL_MT_PLAN,
                     mt.COL_MT_ACTUAL, mt.COL_MT_STATUS, mt.COL_MT_REASON]:
            assert col in df.columns

    def test_month_key_filled(self):
        """所有行的 Month 字段应填充为传入的 month_key"""
        from core.monthly_data_manager import get_default_monthly_tasks
        df = get_default_monthly_tasks("2026-03")
        assert (df["Month"] == "2026-03").all()


# ==========================================
# 3. 文件路径测试
# ==========================================
class TestMonthlyFilePaths:
    """get_monthly_file_paths 路径格式"""

    def test_paths_contain_year(self):
        from core.monthly_data_manager import get_monthly_file_paths
        paths = get_monthly_file_paths(2026)
        assert "2026" in paths["summary"]
        assert "2026" in paths["tasks"]

    def test_filename_format(self):
        from core.monthly_data_manager import get_monthly_file_paths
        paths = get_monthly_file_paths(2026)
        assert paths["summary"].endswith("monthly_summary_2026.csv")
        assert paths["tasks"].endswith("monthly_tasks_2026.csv")

    def test_only_two_tables(self):
        """月记只有 2 张表（无习惯表）"""
        from core.monthly_data_manager import get_monthly_file_paths
        paths = get_monthly_file_paths(2026)
        assert len(paths) == 2
        assert "summary" in paths
        assert "tasks" in paths


# ==========================================
# 4. Markdown 路径测试
# ==========================================
class TestMonthlyMdPath:
    """get_monthly_md_path 路径格式"""

    @patch("core.monthly_data_manager.os.makedirs")
    def test_md_path_in_month_folder(self, mock_makedirs):
        """Markdown 路径应在对应月份的文件夹中"""
        from core.monthly_data_manager import get_monthly_md_path
        path = get_monthly_md_path(2026, 3)
        assert "03月" in path

    @patch("core.monthly_data_manager.os.makedirs")
    def test_md_filename_contains_month_key(self, mock_makedirs):
        """文件名应包含月编号"""
        from core.monthly_data_manager import get_monthly_md_path
        path = get_monthly_md_path(2026, 3)
        assert "monthly_2026-03" in os.path.basename(path)

    @patch("core.monthly_data_manager.os.makedirs")
    def test_md_filename_date_range(self, mock_makedirs):
        """文件名应包含日期范围"""
        from core.monthly_data_manager import get_monthly_md_path
        path = get_monthly_md_path(2026, 3)
        assert "0301-0331" in os.path.basename(path)


# ==========================================
# 5. 周次列表测试
# ==========================================
class TestWeeksInMonth:
    """get_weeks_in_month 周次计算"""

    def test_returns_tuple(self):
        from core.monthly_data_manager import get_weeks_in_month
        result = get_weeks_in_month(2026, 3)
        assert isinstance(result, tuple)
        assert len(result) == 2

    def test_weeks_count_positive(self):
        from core.monthly_data_manager import get_weeks_in_month
        count, _ = get_weeks_in_month(2026, 3)
        assert count >= 4  # 一个月至少跨4个ISO周

    def test_weeks_list_format(self):
        """周次列表应包含 'W' 前缀"""
        from core.monthly_data_manager import get_weeks_in_month
        _, weeks_list = get_weeks_in_month(2026, 3)
        assert "W" in weeks_list


# ==========================================
# 6. 数据聚合测试
# ==========================================
class TestAggregateMonthlyData:
    """aggregate_monthly_data 从日记数据聚合"""

    def test_no_file_returns_none(self):
        """日记文件不存在时返回 None 值"""
        from core.monthly_data_manager import aggregate_monthly_data
        with patch("core.monthly_data_manager.os.path.exists", return_value=False):
            result = aggregate_monthly_data(2026, 3)
        assert result["Avg_Mood"] is None
        assert result["Total_Focus"] is None
        assert result["No_Masturbation_Days"] is None

    def test_aggregation_with_data(self, tmp_path):
        """有数据时应正确计算平均值、求和和不打飞机天数"""
        from core.monthly_data_manager import aggregate_monthly_data

        df = pd.DataFrame([
            {"Date": "2026-03-01", "Mood": 4, "Sleep_Hours": 7.5,
             "Sleep_Score": 4, "Focus_Count": 6, "Masturbation_Count": 0},
            {"Date": "2026-03-02", "Mood": 3, "Sleep_Hours": 6.5,
             "Sleep_Score": 3, "Focus_Count": 4, "Masturbation_Count": 1},
            {"Date": "2026-03-03", "Mood": 5, "Sleep_Hours": 8.0,
             "Sleep_Score": 5, "Focus_Count": 8, "Masturbation_Count": 0},
            {"Date": "2026-03-15", "Mood": 2, "Sleep_Hours": 5.0,
             "Sleep_Score": 2, "Focus_Count": 2, "Masturbation_Count": 0},
        ])
        csv_path = str(tmp_path / "daily_summary_2026.csv")
        df.to_csv(csv_path, index=False, encoding="utf-8-sig")

        with patch("core.monthly_data_manager.cfg.PATH_SUMMARY", str(tmp_path)):
            result = aggregate_monthly_data(2026, 3)

        assert result["Avg_Mood"] == 3.5
        assert result["Total_Focus"] == 20
        assert result["Total_Masturbation"] == 1
        # 不打飞机天数：3月1日、3月3日、3月15日 = 3天
        assert result["No_Masturbation_Days"] == 3

    def test_best_worst_mood_day_format(self, tmp_path):
        """最高/最低心情日应显示日期格式（如 '3月3日（5分）'）"""
        from core.monthly_data_manager import aggregate_monthly_data

        df = pd.DataFrame([
            {"Date": "2026-03-05", "Mood": 5, "Sleep_Hours": 7,
             "Sleep_Score": 4, "Focus_Count": 6, "Masturbation_Count": 0},
            {"Date": "2026-03-20", "Mood": 1, "Sleep_Hours": 5,
             "Sleep_Score": 2, "Focus_Count": 2, "Masturbation_Count": 0},
        ])
        csv_path = str(tmp_path / "daily_summary_2026.csv")
        df.to_csv(csv_path, index=False, encoding="utf-8-sig")

        with patch("core.monthly_data_manager.cfg.PATH_SUMMARY", str(tmp_path)):
            result = aggregate_monthly_data(2026, 3)

        assert "3月5日" in result["Best_Mood_Day"]
        assert "5分" in result["Best_Mood_Day"]
        assert "3月20日" in result["Worst_Mood_Day"]
        assert "1分" in result["Worst_Mood_Day"]


# ==========================================
# 7. 保存与加载回环测试
# ==========================================
class TestMonthlySaveLoadRoundtrip:
    """save → load 回环验证"""

    def test_summary_roundtrip(self, tmp_path):
        """保存月概览后再加载应一致"""
        from core.monthly_data_manager import save_monthly_data, load_monthly_data

        with patch("core.monthly_data_manager.cfg.PATH_MONTHLY_SUMMARY", str(tmp_path / "ms")), \
             patch("core.monthly_data_manager.cfg.PATH_MONTHLY_TASKS", str(tmp_path / "mt")), \
             patch("core.monthly_data_manager.get_monthly_md_path", return_value=str(tmp_path / "monthly.md")):
            os.makedirs(tmp_path / "ms", exist_ok=True)
            os.makedirs(tmp_path / "mt", exist_ok=True)

            month_key = "2026-03"
            first_day = date(2026, 3, 1)
            last_day = date(2026, 3, 31)

            summary = {"Monthly_Score": 4, "Highlights": "测试亮点",
                       "No_Masturbation_Days": 25}
            tasks = pd.DataFrame([{
                "Month": month_key, "分类": "工作/学习", "计划事项": "完成项目",
                "实际完成": "完成", "状态": "✅", "原因分析": "",
            }])

            save_monthly_data(month_key, 2026, 3, first_day, last_day,
                              summary, tasks)

            # 重新加载
            loaded_summary, loaded_tasks = load_monthly_data(month_key, 2026)

        assert loaded_summary.get("Monthly_Score") == 4
        assert loaded_summary.get("Highlights") == "测试亮点"
        assert len(loaded_tasks) == 1

    def test_tasks_roundtrip(self, tmp_path):
        """保存月任务后再加载应保持分类和内容"""
        from core.monthly_data_manager import save_monthly_data, load_monthly_data

        with patch("core.monthly_data_manager.cfg.PATH_MONTHLY_SUMMARY", str(tmp_path / "ms")), \
             patch("core.monthly_data_manager.cfg.PATH_MONTHLY_TASKS", str(tmp_path / "mt")), \
             patch("core.monthly_data_manager.get_monthly_md_path", return_value=str(tmp_path / "monthly.md")):
            os.makedirs(tmp_path / "ms", exist_ok=True)
            os.makedirs(tmp_path / "mt", exist_ok=True)

            month_key = "2026-03"
            first_day = date(2026, 3, 1)
            last_day = date(2026, 3, 31)

            summary = {"Monthly_Score": 3}
            tasks = pd.DataFrame([
                {"Month": month_key, "分类": "工作/学习", "计划事项": "写报告",
                 "实际完成": "完成一半", "状态": "⚠️", "原因分析": "时间不够"},
                {"Month": month_key, "分类": "运动/健康", "计划事项": "跑步20次",
                 "实际完成": "跑步18次", "状态": "⚠️", "原因分析": "下雨"},
            ])

            save_monthly_data(month_key, 2026, 3, first_day, last_day,
                              summary, tasks)

            _, loaded_tasks = load_monthly_data(month_key, 2026)

        assert len(loaded_tasks) == 2
        categories = loaded_tasks["分类"].tolist()
        assert "工作/学习" in categories
        assert "运动/健康" in categories

    def test_empty_tasks_cleaned(self, tmp_path):
        """空任务行应在保存时被清理"""
        from core.monthly_data_manager import save_monthly_data, load_monthly_data

        with patch("core.monthly_data_manager.cfg.PATH_MONTHLY_SUMMARY", str(tmp_path / "ms")), \
             patch("core.monthly_data_manager.cfg.PATH_MONTHLY_TASKS", str(tmp_path / "mt")), \
             patch("core.monthly_data_manager.get_monthly_md_path", return_value=str(tmp_path / "monthly.md")):
            os.makedirs(tmp_path / "ms", exist_ok=True)
            os.makedirs(tmp_path / "mt", exist_ok=True)

            month_key = "2026-03"
            first_day = date(2026, 3, 1)
            last_day = date(2026, 3, 31)

            summary = {"Monthly_Score": 3}
            tasks = pd.DataFrame([
                {"Month": month_key, "分类": "工作/学习", "计划事项": "写报告",
                 "实际完成": "", "状态": "None", "原因分析": ""},
                {"Month": month_key, "分类": "工作/学习", "计划事项": "",
                 "实际完成": "", "状态": "None", "原因分析": ""},
            ])

            save_monthly_data(month_key, 2026, 3, first_day, last_day,
                              summary, tasks)

            _, loaded_tasks = load_monthly_data(month_key, 2026)

        # 空行被清理，只剩 1 行
        assert len(loaded_tasks) == 1
