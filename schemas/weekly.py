from pydantic import BaseModel, ConfigDict, Field, model_validator
from typing import Optional


class WeeklySummaryInput(BaseModel):
    model_config = ConfigDict(extra='allow')  # 允许 Record_Mon 等额外字段透传
    """周记概览 — 前端提交的数据"""
    Weekly_Score: Optional[int] = Field(None, ge=1, le=5, description="周自评分 1-5")
    Avg_Mood: Optional[float] = None
    Avg_Sleep_Hours: Optional[float] = None
    Avg_Sleep_Score: Optional[float] = None
    Total_Focus: Optional[int] = None
    Total_Masturbation: Optional[int] = None

    @model_validator(mode='before')
    @classmethod
    def _empty_str_to_none(cls, data):
        """前端从 GET 拿回 summary 原样回传时，CSV 空数值是 ""，统一转 None 避免 pydantic 校验失败"""
        if isinstance(data, dict):
            return {k: (None if v == '' else v) for k, v in data.items()}
        return data
    Best_Mood_Day: Optional[str] = ""
    Worst_Mood_Day: Optional[str] = ""
    Create_Time: Optional[str] = ""
    Complete_Time: Optional[str] = ""
    Highlights: Optional[str] = ""
    Challenges: Optional[str] = ""
    Reflect_Good: Optional[str] = ""
    Reflect_Improve: Optional[str] = ""
    Reflect_Next_Week: Optional[str] = ""
    Words_To_Self: Optional[str] = ""
    Thoughts: Optional[str] = ""


class HabitItem(BaseModel):
    """单条习惯"""
    习惯: str = ""
    Mon: str = ""
    Tue: str = ""
    Wed: str = ""
    Thu: str = ""
    Fri: str = ""
    Sat: str = ""
    Sun: str = ""


class WeeklyTaskItem(BaseModel):
    """单条周任务"""
    分类: str = ""          # 工作 / 运动 / 读书/学习 / 生活事务
    计划事项: str = ""
    实际完成: str = ""
    状态: str = ""          # ✅ / ❌ / ⚠️
    原因分析: str = ""


class WeeklyInput(BaseModel):
    """保存周记的完整请求体"""
    summary: WeeklySummaryInput
    habits: list[HabitItem]
    tasks: list[WeeklyTaskItem]


# ==================== 需求46：每周事项时间轴 ====================

class TimelineTaskItem(BaseModel):
    """时间轴上的一张卡片：某个周目标在某一天的事项"""
    id: str = ""              # 卡片自身 uuid（空则后端生成）
    goal_id: str = ""         # 关联的周目标 id（weekly_tasks.goal_id）
    周几: str = ""            # Mon / Tue / ... / Sun
    内容: str = ""
    完成: str = ""            # ✅ / 空


class TimelineSaveInput(BaseModel):
    """保存整周时间轴卡片（whole-list Upsert）"""
    tasks: list[TimelineTaskItem]
