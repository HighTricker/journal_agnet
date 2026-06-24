"""需求 40-44 新字段的单元测试：schema 校验 + Markdown 模板渲染"""
import pytest
from pydantic import ValidationError

from schemas.diary import SummaryInput
from core import md_template


# ==========================================
# 1. SummaryInput 新字段校验
# ==========================================
class TestSummaryInputNewFields:
    """schema 契约：心情收紧 1-5、精力 1-5、起夜 >=0、分岔点/三件好事文本默认空"""

    def test_mood_accepts_1_to_5(self):
        for v in [1, 2, 3, 4, 5]:
            assert SummaryInput(Mood=v).Mood == v

    def test_mood_rejects_6(self):
        """心情已收紧到 1-5（历史数据已迁移），6 应被拒绝"""
        with pytest.raises(ValidationError):
            SummaryInput(Mood=6)

    def test_mood_allows_none(self):
        assert SummaryInput().Mood is None

    def test_energy_score_bounds(self):
        assert SummaryInput(Energy_Score=5).Energy_Score == 5
        assert SummaryInput(Energy_Score=1).Energy_Score == 1
        with pytest.raises(ValidationError):
            SummaryInput(Energy_Score=0)
        with pytest.raises(ValidationError):
            SummaryInput(Energy_Score=6)

    def test_energy_score_default_none(self):
        """精力是新字段：老请求不带它也不报错"""
        assert SummaryInput().Energy_Score is None

    def test_sleep_wake_count_non_negative(self):
        assert SummaryInput(Sleep_Wake_Count=0).Sleep_Wake_Count == 0
        assert SummaryInput(Sleep_Wake_Count=3).Sleep_Wake_Count == 3
        with pytest.raises(ValidationError):
            SummaryInput(Sleep_Wake_Count=-1)

    def test_fork_fields_default_empty(self):
        """分岔点 3 组共 12 字段（需求 45）：默认全空，老请求不带 _2/_3 也不报错"""
        s = SummaryInput()
        for f in ["Fork_Trigger", "Fork_Should", "Fork_Actual", "Fork_Direction",
                  "Fork_Trigger_2", "Fork_Should_2", "Fork_Actual_2", "Fork_Direction_2",
                  "Fork_Trigger_3", "Fork_Should_3", "Fork_Actual_3", "Fork_Direction_3"]:
            assert getattr(s, f) == ""

    def test_good_things_fields_default_empty(self):
        s = SummaryInput()
        for f in ["Good_Thing_1", "Good_Why_1", "Good_Thing_2",
                  "Good_Why_2", "Good_Thing_3", "Good_Why_3"]:
            assert getattr(s, f) == ""

    def test_fork_and_good_accept_values(self):
        s = SummaryInput(
            Fork_Trigger="下午躺床上", Fork_Should="写日记",
            Fork_Actual="刷抖音", Fork_Direction="引起坏行为",
            Good_Thing_1="炒面好吃", Good_Why_1="换一家踩到宝",
            Good_Thing_2="无", Good_Why_2="无",
        )
        assert s.Fork_Direction == "引起坏行为"
        assert s.Good_Thing_2 == "无"

    def test_fork_direction_whitelist(self):
        """方向白名单（3 组共用 validator）：合法值/空通过，非法值拒绝（契约源 texts.FORK_DIRECTIONS）"""
        for v in ["引起坏行为", "中性", "引起良好行为", ""]:
            assert SummaryInput(Fork_Direction=v).Fork_Direction == v
        with pytest.raises(ValidationError):
            SummaryInput(Fork_Direction="随便写的")
        # 第 2、3 组方向同样受同一个白名单 validator 约束
        assert SummaryInput(Fork_Direction_2="中性").Fork_Direction_2 == "中性"
        assert SummaryInput(Fork_Direction_3="引起良好行为").Fork_Direction_3 == "引起良好行为"
        with pytest.raises(ValidationError):
            SummaryInput(Fork_Direction_2="瞎写")
        with pytest.raises(ValidationError):
            SummaryInput(Fork_Direction_3="乱填")

    def test_model_dump_contains_new_fields(self):
        """router 用 model_dump() 透传——新字段必须出现在 dump 结果里"""
        dumped = SummaryInput().model_dump()
        for f in ["Energy_Score", "Sleep_Wake_Count",
                  "Fork_Trigger", "Fork_Should", "Fork_Actual", "Fork_Direction",
                  "Fork_Trigger_2", "Fork_Should_2", "Fork_Actual_2", "Fork_Direction_2",
                  "Fork_Trigger_3", "Fork_Should_3", "Fork_Actual_3", "Fork_Direction_3",
                  "Good_Thing_1", "Good_Why_1", "Good_Thing_2",
                  "Good_Why_2", "Good_Thing_3", "Good_Why_3"]:
            assert f in dumped


# ==========================================
# 2. Markdown 模板渲染新字段
# ==========================================
def _render(**overrides):
    """用最小参数集渲染模板，允许按需覆盖"""
    params = dict(
        diary_number=1200, date_str="2026-06-11", write_time="21:00", weekday_num=4,
        location="测试地点", weather="晴",
        mood_score=4, energy_score=3,
        sleep_bedtime="22:30", sleep_waketime="06:30", sleep_hours=8.0,
        sleep_wake_count=1, sleep_quality=4,
        focus_time=5, meditation_minutes=20, ai_time=2.5, masturbation_count=0,
        tasks_table="| 测试 | 完成 | ✅ | |", time_table="| 00:00-00:30 | 睡觉 | 睡觉 | ✅ | |",
        reflect_ai_usage="", reflect_ai_learning="", reflect_reading="",
        reflect_meditation="", reflect_good_actions="", reflect_bad_actions="",
        reflect_words_to_self="", reflect_thoughts="", reflect_sleep_dreams="",
        reflect_deep="",
        fork_trigger="下午躺床上", fork_should="写日记", fork_actual="刷抖音", fork_direction="引起坏行为",
        fork_trigger_2="刷手机", fork_should_2="早点睡", fork_actual_2="熬夜到两点", fork_direction_2="引起坏行为",
        fork_trigger_3="无", fork_should_3="无", fork_actual_3="无", fork_direction_3="",
        good_thing_1="炒面好吃", good_why_1="换一家踩到宝",
        good_thing_2="无", good_why_2="无",
        good_thing_3="无", good_why_3="无",
    )
    params.update(overrides)
    return md_template.get_template(**params)


class TestMarkdownNewFields:
    """Markdown 成品必须包含全部新字段"""

    def test_frontmatter_contains_energy_and_wake_count(self):
        md = _render()
        assert "energy_score: 3" in md
        assert "sleep_wake_count: 1" in md

    def test_frontmatter_mood_comment_updated(self):
        """心情注释应是新 5 档文案，而不是旧的'很差/较差'"""
        md = _render()
        assert "明亮" in md
        assert "很糟" in md

    def test_fork_section_rendered(self):
        """分岔点 3 组（需求 45）：标题 + 3 行编号；第 1 组沿用原字段，2/3 组为新增"""
        md = _render()
        assert "## 今日分岔点" in md
        # 第 1 组（需求 40 原单组字段）
        assert "情景：下午躺床上" in md
        assert "该做：写日记" in md
        assert "实际：刷抖音" in md
        assert "方向：引起坏行为" in md
        # 第 2 组（需求 45 新增）
        assert "情景：刷手机" in md
        assert "实际：熬夜到两点" in md
        # 三行编号都在
        assert "1. 情景：" in md
        assert "2. 情景：" in md
        assert "3. 情景：" in md

    def test_good_things_section_rendered(self):
        md = _render()
        assert "## 今天的三件好事" in md
        assert "1. 炒面好吃（为什么：换一家踩到宝）" in md
        assert "2. 无（为什么：无）" in md
        assert "3. 无（为什么：无）" in md

    def test_section_order_fork_before_thoughts_good_after(self):
        """正文顺序与 UI 一致：分岔点 → 想法(灵感) → 三件好事 → 睡眠状况"""
        md = _render()
        i_fork = md.index("## 今日分岔点")
        i_thoughts = md.index("## 想法")
        i_good = md.index("## 今天的三件好事")
        i_sleep = md.index("## 睡眠状况/梦境")
        assert i_fork < i_thoughts < i_good < i_sleep


# ==========================================
# 3. 审查修复的回归测试
# ==========================================
class TestReviewFixes:
    """对抗式审查确认问题的修复验证"""

    def test_collect_reflections_filters_good_placeholder(self, tmp_path):
        """修复A（需求 45 扩展）：只有"无"占位（三件好事 + 分岔点）的行应被过滤掉，不进 AI 报告"""
        import pandas as pd
        from unittest.mock import patch
        from core import report_data_collector as rdc

        df = pd.DataFrame([
            # 第 1 行：有真实反思 → 应保留
            {"Date": "2026-06-10", "Reflect_Reading": "读了书",
             "Good_Thing_1": "无", "Good_Why_1": "无",
             "Fork_Trigger": "无", "Fork_Should": "无", "Fork_Actual": "无", "Fork_Direction": ""},
            # 第 2 行：反思全空、三件好事 + 分岔点全是占位"无" → 应被过滤
            {"Date": "2026-06-11", "Reflect_Reading": "",
             "Good_Thing_1": "无", "Good_Why_1": "无",
             "Fork_Trigger": "无", "Fork_Should": "无", "Fork_Actual": "无", "Fork_Direction": ""},
            # 第 3 行：好事有真实内容 → 应保留
            {"Date": "2026-06-12", "Reflect_Reading": "",
             "Good_Thing_1": "炒面好吃", "Good_Why_1": "无",
             "Fork_Trigger": "无", "Fork_Should": "无", "Fork_Actual": "无", "Fork_Direction": ""},
            # 第 4 行：仅分岔点有真实内容（反思 + 好事全空）→ 应保留
            {"Date": "2026-06-13", "Reflect_Reading": "",
             "Good_Thing_1": "无", "Good_Why_1": "无",
             "Fork_Trigger": "躺床上", "Fork_Should": "写日记", "Fork_Actual": "刷抖音", "Fork_Direction": "引起坏行为"},
        ])
        csv = tmp_path / "daily_summary_2026.csv"
        df.to_csv(csv, index=False, encoding="utf-8-sig")

        with patch.object(rdc.cfg, "PATH_SUMMARY", str(tmp_path)):
            text = rdc.collect_reflections(2026)
        assert "2026-06-10" in text
        assert "2026-06-11" not in text   # 纯占位行（含分岔点"无"）被过滤
        assert "2026-06-12" in text
        assert "2026-06-13" in text       # 分岔点有真实内容应保留

    def test_load_coerces_numeric_text_columns_to_str(self, tmp_path):
        """修复D：文本列恰好全是纯数字时不得被推断成数值（防静默数据丢失）"""
        import pandas as pd
        from datetime import date
        from unittest.mock import patch
        from core import data_manager as dm

        df = pd.DataFrame([{
            "Date": "2026-06-11", "Mood": 4,
            "Fork_Trigger": 2300,          # 用户写的纯数字文本
            "Good_Thing_1": 3,
        }])
        csv = tmp_path / "daily_summary_2026.csv"
        df.to_csv(csv, index=False, encoding="utf-8-sig")

        fake_paths = {"summary": str(csv), "tasks": str(tmp_path / "no_tasks.csv"),
                      "time": str(tmp_path / "no_time.csv"), "markdown": str(tmp_path / "x.md")}
        with patch.object(dm, "get_file_paths", return_value=fake_paths):
            summary, _, _ = dm.load_data_for_date(date(2026, 6, 11))
        # 文本列必须以字符串返回（前端 typeof string 检查才不会丢弃）
        assert isinstance(summary["Fork_Trigger"], str)
        assert summary["Fork_Trigger"] != ""
        assert isinstance(summary["Good_Thing_1"], str)
        # 数值列不受影响
        assert summary["Mood"] == 4
