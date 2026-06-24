"""需求46：每周事项时间轴的单元测试"""
import os
import pandas as pd
from datetime import date
from unittest.mock import patch


def _seed_tasks(tasks_dir, week_key="2026-W10"):
    """写一份没有 goal_id 的 weekly_tasks，模拟历史数据"""
    df = pd.DataFrame([
        {"Week": week_key, "分类": "工作", "计划事项": "完成时间轴",
         "实际完成": "", "状态": "", "原因分析": ""},
        {"Week": week_key, "分类": "读书/学习", "计划事项": "读完《深度工作》",
         "实际完成": "", "状态": "", "原因分析": ""},
    ])
    df.to_csv(os.path.join(tasks_dir, "weekly_tasks_2026.csv"),
              index=False, encoding="utf-8-sig")


class TestLanesGoalId:
    """get_weekly_lanes：回填并落库 goal_id"""

    def test_backfill_and_stable(self, tmp_path):
        from core import weekly_data_manager as wdm
        wt_dir = tmp_path / "wt"
        os.makedirs(wt_dir, exist_ok=True)
        _seed_tasks(str(wt_dir))

        with patch("core.weekly_data_manager.cfg.PATH_WEEKLY_TASKS", str(wt_dir)):
            lanes1 = wdm.get_weekly_lanes("2026-W10", 2026)
            assert len(lanes1) == 2
            assert all(l["goal_id"] for l in lanes1)          # 都补上了 id
            # 落库后第二次调用 id 不变（稳定）
            lanes2 = wdm.get_weekly_lanes("2026-W10", 2026)
            assert [l["goal_id"] for l in lanes1] == [l["goal_id"] for l in lanes2]

        # csv 里确实写进了 goal_id 列
        saved = pd.read_csv(wt_dir / "weekly_tasks_2026.csv", encoding="utf-8-sig")
        assert "goal_id" in saved.columns
        assert saved["goal_id"].astype(str).str.strip().ne("").all()


class TestTimelineRoundtrip:
    """save → load 时间轴卡片"""

    def test_roundtrip_and_skip_empty(self, tmp_path):
        from core import weekly_data_manager as wdm
        tl_dir = tmp_path / "tl"
        os.makedirs(tl_dir, exist_ok=True)

        items = [
            {"id": "", "goal_id": "g_aaa", "周几": "Mon", "内容": "写骨架", "完成": "✅"},
            {"id": "", "goal_id": "g_aaa", "周几": "Wed", "内容": "联调", "完成": ""},
            {"id": "", "goal_id": "g_bbb", "周几": "Mon", "内容": "", "完成": ""},  # 空内容应跳过
        ]
        with patch("core.weekly_data_manager.cfg.PATH_WEEKLY_TIMELINE", str(tl_dir)):
            saved = wdm.save_weekly_timeline("2026-W10", 2026, items)
            assert len(saved) == 2                      # 空内容被丢弃
            assert all(s["id"] for s in saved)          # 生成了 id
            loaded = wdm.load_weekly_timeline("2026-W10", 2026)
            assert len(loaded) == 2
            assert {l["内容"] for l in loaded} == {"写骨架", "联调"}


class TestGoalCompletion:
    """apply_goal_completion：全部卡片完成 → 目标 ✅，部分 → 清空"""

    def test_all_done_marks_goal(self, tmp_path):
        from core import weekly_data_manager as wdm
        wt_dir = tmp_path / "wt"
        os.makedirs(wt_dir, exist_ok=True)
        _seed_tasks(str(wt_dir))

        with patch("core.weekly_data_manager.cfg.PATH_WEEKLY_TASKS", str(wt_dir)):
            lanes = wdm.get_weekly_lanes("2026-W10", 2026)
            gid = lanes[0]["goal_id"]   # “完成时间轴”

            # 该目标 2 张卡，全部完成
            wdm.apply_goal_completion("2026-W10", 2026, [
                {"goal_id": gid, "完成": "✅"},
                {"goal_id": gid, "完成": "✅"},
            ])
            df = pd.read_csv(wt_dir / "weekly_tasks_2026.csv", encoding="utf-8-sig")
            row = df[df["goal_id"] == gid].iloc[0]
            assert str(row["状态"]) == "✅"
            assert str(row["实际完成"]) == "完成"

            # 改成部分完成 → 应清空
            wdm.apply_goal_completion("2026-W10", 2026, [
                {"goal_id": gid, "完成": "✅"},
                {"goal_id": gid, "完成": ""},
            ])
            df = pd.read_csv(wt_dir / "weekly_tasks_2026.csv", encoding="utf-8-sig")
            row = df[df["goal_id"] == gid].iloc[0]
            assert str(row["状态"]) in ("", "nan")

    def test_goal_without_cards_untouched(self, tmp_path):
        """没有卡片的目标，状态不应被动到"""
        from core import weekly_data_manager as wdm
        wt_dir = tmp_path / "wt"
        os.makedirs(wt_dir, exist_ok=True)
        # 第二个目标预先手动标 ✅
        df = pd.DataFrame([
            {"Week": "2026-W10", "分类": "工作", "计划事项": "A",
             "实际完成": "", "状态": "", "原因分析": "", "goal_id": "g_a"},
            {"Week": "2026-W10", "分类": "工作", "计划事项": "B",
             "实际完成": "完成", "状态": "✅", "原因分析": "", "goal_id": "g_b"},
        ])
        df.to_csv(wt_dir / "weekly_tasks_2026.csv", index=False, encoding="utf-8-sig")

        with patch("core.weekly_data_manager.cfg.PATH_WEEKLY_TASKS", str(wt_dir)):
            # 只给 g_a 卡片（未完成），g_b 不给卡片
            wdm.apply_goal_completion("2026-W10", 2026, [{"goal_id": "g_a", "完成": ""}])
            out = pd.read_csv(wt_dir / "weekly_tasks_2026.csv", encoding="utf-8-sig")
            assert str(out[out["goal_id"] == "g_b"].iloc[0]["状态"]) == "✅"  # 没动


class TestSaveCarriesGoalId:
    """save_weekly_data 按文本继承 goal_id"""

    def test_carry_over_by_text(self, tmp_path):
        from core.weekly_data_manager import save_weekly_data, get_weekly_lanes
        ws, wh, wt_dir = tmp_path / "ws", tmp_path / "wh", tmp_path / "wt"
        for p in (ws, wh, wt_dir):
            os.makedirs(p, exist_ok=True)

        with patch("core.weekly_data_manager.cfg.PATH_WEEKLY_SUMMARY", str(ws)), \
             patch("core.weekly_data_manager.cfg.PATH_WEEKLY_HABITS", str(wh)), \
             patch("core.weekly_data_manager.cfg.PATH_WEEKLY_TASKS", str(wt_dir)), \
             patch("core.weekly_data_manager.get_weekly_md_path", return_value=str(tmp_path / "w.md")):
            monday, sunday, wk = date(2026, 3, 2), date(2026, 3, 8), "2026-W10"
            habits = pd.DataFrame([{"Week": wk, "习惯": "早起", "Mon": "", "Tue": "",
                                    "Wed": "", "Thu": "", "Fri": "", "Sat": "", "Sun": ""}])
            tasks = pd.DataFrame([{"Week": wk, "分类": "工作", "计划事项": "做X",
                                   "实际完成": "", "状态": "", "原因分析": ""}])

            save_weekly_data(wk, 2026, 10, monday, sunday, {}, habits, tasks)
            gid1 = get_weekly_lanes(wk, 2026)[0]["goal_id"]   # 首次补 id 落库

            # 再次保存同名任务（前端不带 goal_id）→ 应继承同一个 id
            save_weekly_data(wk, 2026, 10, monday, sunday, {}, habits, tasks)
            gid2 = get_weekly_lanes(wk, 2026)[0]["goal_id"]
            assert gid1 == gid2
