from pydantic import BaseModel, ConfigDict, Field
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
