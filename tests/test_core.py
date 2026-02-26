"""核心函数的基础单元测试"""
import os
import pytest
import pandas as pd
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


# ==========================================
# 4. load_data_for_date 返回数据的 Date 列行为
# ==========================================
class TestLoadDataDateHandling:
    """任务表应保留 Date 列（自动填充），时间表应 drop Date 列"""

    def _make_paths(self, tmp_path):
        """构造临时路径字典"""
        return {
            "tasks": str(tmp_path / "tasks.csv"),
            "time": str(tmp_path / "time.csv"),
            "summary": str(tmp_path / "summary.csv"),
            "markdown": str(tmp_path / "diary.md"),
        }

    def test_tasks_has_date_column(self, tmp_path):
        """任务表应包含 Date 列，且多条记录不丢失"""
        from core import texts as t

        paths = self._make_paths(tmp_path)
        # 写入含 2 条任务的 CSV
        df = pd.DataFrame([
            {"Date": "2026-03-15", t.COL_TASK_NAME: "任务A", t.COL_TASK_ACTUAL: "",
             t.COL_TASK_STATUS: "✅", t.COL_TASK_REASON: ""},
            {"Date": "2026-03-15", t.COL_TASK_NAME: "任务B", t.COL_TASK_ACTUAL: "",
             t.COL_TASK_STATUS: "", t.COL_TASK_REASON: ""},
        ])
        df.to_csv(paths["tasks"], index=False, encoding="utf-8-sig")

        with patch("core.data_manager.get_file_paths", return_value=paths):
            from core.data_manager import load_data_for_date
            _, tasks, _ = load_data_for_date(date(2026, 3, 15))

        assert "Date" in tasks.columns
        assert len(tasks) == 2

    def test_tasks_empty_has_date_column(self, tmp_path):
        """空任务表也应包含 Date 列"""
        paths = self._make_paths(tmp_path)
        # tasks CSV 不存在

        with patch("core.data_manager.get_file_paths", return_value=paths):
            from core.data_manager import load_data_for_date
            _, tasks, _ = load_data_for_date(date(2026, 3, 15))

        assert "Date" in tasks.columns
        assert tasks.empty

    def test_time_no_date_column(self, tmp_path):
        """从 CSV 加载的时间表不应包含 Date 列（48行太冗余）"""
        from core import texts as t

        paths = self._make_paths(tmp_path)
        df = pd.DataFrame([
            {"Date": "2026-03-15", t.COL_TIME_SLOT: "08:00-08:30",
             t.COL_TIME_PLAN: "工作", t.COL_TIME_ACTUAL: "",
             t.COL_TIME_STATUS: "", t.COL_TIME_NOTE: ""},
        ])
        df.to_csv(paths["time"], index=False, encoding="utf-8-sig")

        with patch("core.data_manager.get_file_paths", return_value=paths):
            from core.data_manager import load_data_for_date
            _, _, time_df = load_data_for_date(date(2026, 3, 15))

        assert "Date" not in time_df.columns

    def test_default_time_schedule_drop_date(self, tmp_path):
        """默认时间模板经 load 返回后也不含 Date"""
        paths = self._make_paths(tmp_path)
        # time CSV 不存在，走 get_default_time_schedule 路径

        with patch("core.data_manager.get_file_paths", return_value=paths):
            from core.data_manager import load_data_for_date
            _, _, time_df = load_data_for_date(date(2026, 3, 15))

        assert "Date" not in time_df.columns
        assert len(time_df) == 48


# ==========================================
# 6. Bug 2 回归：空行清理与多任务保存
# ==========================================
class TestEmptyRowCleaning:
    """Bug 2 回归：save_all_data 应过滤空行，保留有效任务"""

    def _make_paths(self, tmp_path):
        return {
            "tasks": str(tmp_path / "tasks.csv"),
            "time": str(tmp_path / "time.csv"),
            "summary": str(tmp_path / "summary.csv"),
            "markdown": str(tmp_path / "diary.md"),
        }

    def test_ghost_rows_not_saved(self, tmp_path):
        """含幽灵空行的 DataFrame 保存后，CSV 只保留有效行"""
        from core import texts as t

        paths = self._make_paths(tmp_path)
        # 模拟 data_editor 产生的含空行数据
        tasks = pd.DataFrame([
            {t.COL_TASK_NAME: "有效任务", t.COL_TASK_ACTUAL: "",
             t.COL_TASK_STATUS: "✅", t.COL_TASK_REASON: ""},
            {t.COL_TASK_NAME: "", t.COL_TASK_ACTUAL: "",
             t.COL_TASK_STATUS: "", t.COL_TASK_REASON: ""},
            {t.COL_TASK_NAME: "  ", t.COL_TASK_ACTUAL: "",
             t.COL_TASK_STATUS: "", t.COL_TASK_REASON: ""},
        ])
        time = pd.DataFrame([{
            t.COL_TIME_SLOT: "08:00-08:30", t.COL_TIME_PLAN: "工作",
            t.COL_TIME_ACTUAL: "", t.COL_TIME_STATUS: "", t.COL_TIME_NOTE: "",
        }])
        summary = {"Mood": 4}

        with patch("core.data_manager.get_file_paths", return_value=paths), \
             patch("core.data_manager.generate_markdown"):
            from core.data_manager import save_all_data
            save_all_data(date(2026, 3, 15), summary, tasks, time)

        saved = pd.read_csv(paths["tasks"], encoding="utf-8-sig")
        # 只保留 1 条有效任务，空行和纯空格行都被过滤
        assert len(saved) == 1
        assert saved.iloc[0][t.COL_TASK_NAME] == "有效任务"

    def test_all_empty_becomes_placeholder(self, tmp_path):
        """全空行保存后应变为 '此日未作安排' 占位行"""
        from core import texts as t

        paths = self._make_paths(tmp_path)
        tasks = pd.DataFrame([
            {t.COL_TASK_NAME: "", t.COL_TASK_ACTUAL: "",
             t.COL_TASK_STATUS: "", t.COL_TASK_REASON: ""},
        ])
        time = pd.DataFrame([{
            t.COL_TIME_SLOT: "08:00-08:30", t.COL_TIME_PLAN: "工作",
            t.COL_TIME_ACTUAL: "", t.COL_TIME_STATUS: "", t.COL_TIME_NOTE: "",
        }])
        summary = {"Mood": 4}

        with patch("core.data_manager.get_file_paths", return_value=paths), \
             patch("core.data_manager.generate_markdown"):
            from core.data_manager import save_all_data
            save_all_data(date(2026, 3, 15), summary, tasks, time)

        saved = pd.read_csv(paths["tasks"], encoding="utf-8-sig")
        assert len(saved) == 1
        assert saved.iloc[0][t.COL_TASK_NAME] == "此日未作安排"

    def test_multi_task_roundtrip(self, tmp_path):
        """3 个任务 save → load 后仍是 3 个（端到端回归）"""
        from core import texts as t

        paths = self._make_paths(tmp_path)
        tasks = pd.DataFrame([
            {t.COL_TASK_NAME: "任务1", t.COL_TASK_ACTUAL: "完成",
             t.COL_TASK_STATUS: "✅", t.COL_TASK_REASON: ""},
            {t.COL_TASK_NAME: "任务2", t.COL_TASK_ACTUAL: "",
             t.COL_TASK_STATUS: "❌", t.COL_TASK_REASON: "没时间"},
            {t.COL_TASK_NAME: "任务3", t.COL_TASK_ACTUAL: "部分",
             t.COL_TASK_STATUS: "⚠️", t.COL_TASK_REASON: ""},
        ])
        time = pd.DataFrame([{
            t.COL_TIME_SLOT: "08:00-08:30", t.COL_TIME_PLAN: "工作",
            t.COL_TIME_ACTUAL: "", t.COL_TIME_STATUS: "", t.COL_TIME_NOTE: "",
        }])
        summary = {"Mood": 4}

        with patch("core.data_manager.get_file_paths", return_value=paths), \
             patch("core.data_manager.generate_markdown"):
            from core.data_manager import save_all_data
            save_all_data(date(2026, 3, 15), summary, tasks, time)

        # 再次 load 回来验证
        with patch("core.data_manager.get_file_paths", return_value=paths):
            from core.data_manager import load_data_for_date
            _, loaded_tasks, _ = load_data_for_date(date(2026, 3, 15))

        assert len(loaded_tasks) == 3
        assert list(loaded_tasks[t.COL_TASK_NAME]) == ["任务1", "任务2", "任务3"]


# ==========================================
# 5. Bug 3 回归：NaN 值应被清理为空字符串
# ==========================================
class TestNaNHandling:
    """Bug 3 回归：NaN 值应被清理为空字符串"""

    def _make_paths(self, tmp_path):
        return {
            "tasks": str(tmp_path / "tasks.csv"),
            "time": str(tmp_path / "time.csv"),
            "summary": str(tmp_path / "summary.csv"),
            "markdown": str(tmp_path / "diary.md"),
        }

    def test_summary_nan_cleaned(self, tmp_path):
        """summary_data 中的 NaN 应被替换为空字符串"""
        paths = self._make_paths(tmp_path)
        # 写入含空值的 summary CSV
        df = pd.DataFrame([{
            "Date": "2026-03-15", "Mood": 4,
            "Reflect_AI_Usage": None, "Sleep_Bedtime": None,
        }])
        df.to_csv(paths["summary"], index=False, encoding="utf-8-sig")

        with patch("core.data_manager.get_file_paths", return_value=paths):
            from core.data_manager import load_data_for_date
            summary, _, _ = load_data_for_date(date(2026, 3, 15))

        # 不应有任何 NaN 值
        for k, v in summary.items():
            assert not pd.isna(v), f"summary['{k}'] 仍为 NaN"

    def test_task_status_no_nan(self, tmp_path):
        """任务表 Status 列的 NaN 应被替换为空字符串"""
        from core import texts as t

        paths = self._make_paths(tmp_path)
        df = pd.DataFrame([
            {"Date": "2026-03-15", t.COL_TASK_NAME: "任务A",
             t.COL_TASK_ACTUAL: None, t.COL_TASK_STATUS: None,
             t.COL_TASK_REASON: None},
        ])
        df.to_csv(paths["tasks"], index=False, encoding="utf-8-sig")

        with patch("core.data_manager.get_file_paths", return_value=paths):
            from core.data_manager import load_data_for_date
            _, tasks, _ = load_data_for_date(date(2026, 3, 15))

        assert tasks.iloc[0][t.COL_TASK_STATUS] == ""
        assert tasks.iloc[0][t.COL_TASK_REASON] == ""

    def test_time_status_no_nan(self, tmp_path):
        """时间表 Status 列的 NaN 应被替换为空字符串"""
        from core import texts as t

        paths = self._make_paths(tmp_path)
        df = pd.DataFrame([
            {"Date": "2026-03-15", t.COL_TIME_SLOT: "08:00-08:30",
             t.COL_TIME_PLAN: "工作", t.COL_TIME_ACTUAL: None,
             t.COL_TIME_STATUS: None, t.COL_TIME_NOTE: None},
        ])
        df.to_csv(paths["time"], index=False, encoding="utf-8-sig")

        with patch("core.data_manager.get_file_paths", return_value=paths):
            from core.data_manager import load_data_for_date
            _, _, time_df = load_data_for_date(date(2026, 3, 15))

        assert time_df.iloc[0][t.COL_TIME_STATUS] == ""
        assert time_df.iloc[0][t.COL_TIME_NOTE] == ""

    def test_nan_not_written_to_csv(self, tmp_path):
        """save_all_data 写入的 CSV 不应包含 NaN"""
        from core import texts as t

        paths = self._make_paths(tmp_path)
        # 构造含 NaN 的任务 DataFrame
        tasks = pd.DataFrame([{
            t.COL_TASK_NAME: "测试任务",
            t.COL_TASK_ACTUAL: None,
            t.COL_TASK_STATUS: None,
            t.COL_TASK_REASON: None,
        }])
        time = pd.DataFrame([{
            t.COL_TIME_SLOT: "08:00-08:30",
            t.COL_TIME_PLAN: "工作",
            t.COL_TIME_ACTUAL: None,
            t.COL_TIME_STATUS: None,
            t.COL_TIME_NOTE: None,
        }])
        summary = {"Mood": 4, "Reflect_AI_Usage": None}

        with patch("core.data_manager.get_file_paths", return_value=paths), \
             patch("core.data_manager.generate_markdown"):
            from core.data_manager import save_all_data
            save_all_data(date(2026, 3, 15), summary, tasks, time)

        # 读回 CSV 原始文本，确认无 "nan" 字面量
        # 注意：空字段写入 CSV 后是空字符串（逗号间无内容），
        # pandas 读回时会变成 NaN，但关键是不能出现 "nan" 文本
        with open(paths["tasks"], "r", encoding="utf-8-sig") as f:
            tasks_content = f.read()
        assert "nan" not in tasks_content.lower(), f"tasks CSV 中出现 nan 文本: {tasks_content}"

        with open(paths["time"], "r", encoding="utf-8-sig") as f:
            time_content = f.read()
        assert "nan" not in time_content.lower(), f"time CSV 中出现 nan 文本: {time_content}"
