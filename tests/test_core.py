"""核心函数的基础单元测试"""
import os
import pytest
from datetime import datetime, date
from unittest.mock import patch, MagicMock


# ==========================================
# 1. 日记编号计算逻辑测试
# ==========================================
# get_diary_metadata 定义在 app.py 中，因为 app.py 导入时会触发 Streamlit，
# 这里直接测试其核心计算逻辑（纯数学，无外部依赖）。

def calc_diary_no(target_date):
    """复刻 app.py 中 get_diary_metadata 的编号计算逻辑"""
    anchor_date = date(2026, 2, 18)
    return 1100 + (target_date - anchor_date).days


def calc_weekday(target_date):
    """复刻星期计算逻辑，返回 (数字1-7, 中文名)"""
    weekday_num = target_date.weekday() + 1
    week_map = {1: "星期一", 2: "星期二", 3: "星期三",
                4: "星期四", 5: "星期五", 6: "星期六", 7: "星期日"}
    return weekday_num, week_map[weekday_num]


class TestDiaryMetadata:
    """日记编号与星期计算"""

    def test_anchor_date_is_1100(self):
        """锚定日 2026-02-18 编号应为 1100"""
        assert calc_diary_no(date(2026, 2, 18)) == 1100

    def test_one_day_after_anchor(self):
        assert calc_diary_no(date(2026, 2, 19)) == 1101

    def test_one_day_before_anchor(self):
        assert calc_diary_no(date(2026, 2, 17)) == 1099

    def test_far_future(self):
        """2026-12-31 距锚定日 316 天"""
        assert calc_diary_no(date(2026, 12, 31)) == 1100 + 316

    def test_weekday_monday(self):
        """2026-02-16 是星期一"""
        num, zh = calc_weekday(date(2026, 2, 16))
        assert num == 1
        assert zh == "星期一"

    def test_weekday_sunday(self):
        """2026-02-22 是星期日"""
        num, zh = calc_weekday(date(2026, 2, 22))
        assert num == 7
        assert zh == "星期日"

    def test_weekday_wednesday(self):
        """2026-02-18 (锚定日) 是星期三"""
        num, zh = calc_weekday(date(2026, 2, 18))
        assert num == 3
        assert zh == "星期三"


# ==========================================
# 2. 文件路径生成测试
# ==========================================
class TestGetFilePaths:
    """data_manager.get_file_paths 路径生成逻辑"""

    @patch("core.data_manager.os.path.exists", return_value=True)
    @patch("core.data_manager.os.makedirs")
    def test_paths_contain_correct_year(self, mock_makedirs, mock_exists):
        from core.data_manager import get_file_paths
        paths = get_file_paths(date(2026, 3, 15))

        assert "2026" in paths["tasks"]
        assert "2026" in paths["time"]
        assert "2026" in paths["summary"]

    @patch("core.data_manager.os.path.exists", return_value=True)
    @patch("core.data_manager.os.makedirs")
    def test_paths_filename_format(self, mock_makedirs, mock_exists):
        from core.data_manager import get_file_paths
        paths = get_file_paths(date(2026, 3, 15))

        assert paths["tasks"].endswith("tasks_log_2026.csv")
        assert paths["time"].endswith("time_log_2026.csv")
        assert paths["summary"].endswith("daily_summary_2026.csv")
        assert paths["markdown"].endswith("diary_2026-03-15.md")

    @patch("core.data_manager.os.path.exists", return_value=True)
    @patch("core.data_manager.os.makedirs")
    def test_markdown_in_month_folder(self, mock_makedirs, mock_exists):
        """Markdown 路径应包含月份文件夹"""
        from core.data_manager import get_file_paths
        paths = get_file_paths(date(2026, 3, 15))

        # 路径中应包含 "03月"
        assert "03月" in paths["markdown"]

    @patch("core.data_manager.os.path.exists", return_value=False)
    @patch("core.data_manager.os.makedirs")
    def test_creates_month_folder_if_missing(self, mock_makedirs, mock_exists):
        """月份文件夹不存在时应自动创建"""
        from core.data_manager import get_file_paths
        get_file_paths(date(2026, 7, 1))

        # makedirs 至少被调用一次（创建月份文件夹）
        assert mock_makedirs.called


# ==========================================
# 3. 默认时间表生成测试
# ==========================================
class TestDefaultTimeSchedule:
    """data_manager.get_default_time_schedule 时间表模板"""

    def test_returns_48_rows(self):
        """一天 24 小时 × 2 = 48 个半小时时间段"""
        from core.data_manager import get_default_time_schedule
        df = get_default_time_schedule("2026-03-15")
        assert len(df) == 48

    def test_all_rows_have_date(self):
        from core.data_manager import get_default_time_schedule
        df = get_default_time_schedule("2026-03-15")
        assert (df["Date"] == "2026-03-15").all()

    def test_first_slot_starts_at_midnight(self):
        from core.data_manager import get_default_time_schedule
        from core import texts as t
        df = get_default_time_schedule("2026-03-15")
        first_slot = df.iloc[0][t.COL_TIME_SLOT]
        assert first_slot.startswith("00:00")

    def test_last_slot_ends_at_midnight(self):
        from core.data_manager import get_default_time_schedule
        from core import texts as t
        df = get_default_time_schedule("2026-03-15")
        last_slot = df.iloc[-1][t.COL_TIME_SLOT]
        assert last_slot.endswith("24:00")
