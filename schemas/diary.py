from pydantic import BaseModel, Field, field_validator
from typing import Optional

from core.texts import FORK_DIRECTIONS


class SummaryInput(BaseModel):
    """日记概览 — 前端提交的量化数据和反思"""
    Mood: Optional[int] = Field(None, ge=1, le=5, description="心情评分 1-5（5=明亮 最好 … 1=很糟 最差）")
    Energy_Score: Optional[int] = Field(None, ge=1, le=5, description="精力评分 1-5（5=充沛 … 1=枯竭）")
    Sleep_Score: Optional[int] = Field(None, ge=1, le=5, description="睡眠质量 1-5（5=神清气爽 最好 … 1=像没睡过 最差）")
    Sleep_Bedtime: Optional[str] = Field(None, description="入睡时间 HH:MM")
    Sleep_Waketime: Optional[str] = Field(None, description="起床时间 HH:MM")
    Sleep_Hours: Optional[float] = Field(None, description="睡眠时长（小时）")
    Sleep_Wake_Count: Optional[int] = Field(None, ge=0, description="起夜/醒来次数")
    Focus_Count: Optional[int] = Field(None, description="番茄钟数量")
    Meditation_Minutes: Optional[int] = Field(None, description="静坐分钟数")
    AI_Time: Optional[float] = Field(None, description="AI 使用时间（小时）")
    Masturbation_Count: Optional[int] = Field(None, description="打飞机次数")
    Reflect_AI_Usage: Optional[str] = ""
    Reflect_AI_Learning: Optional[str] = ""
    Reflect_Reading: Optional[str] = ""
    Reflect_Meditation: Optional[str] = ""
    Reflect_Good_Actions: Optional[str] = ""
    Reflect_Bad_Actions: Optional[str] = ""
    Reflect_Words_To_Self: Optional[str] = ""
    Reflect_Thoughts: Optional[str] = ""
    Reflect_Deep_Reflections: Optional[str] = ""
    Reflect_Sleep_Dreams: Optional[str] = ""
    # 今日分岔点（需求 40 单组 → 需求 45 扩展为最多 3 组）：方向取值 引起坏行为/中性/引起良好行为/空
    # 第 1 组沿用原列名（不带后缀，老数据零迁移）；第 2、3 组加 _2/_3 后缀，均 Optional（老请求不带也不报错）
    Fork_Trigger: Optional[str] = ""
    Fork_Should: Optional[str] = ""
    Fork_Actual: Optional[str] = ""
    Fork_Direction: Optional[str] = ""
    Fork_Trigger_2: Optional[str] = ""
    Fork_Should_2: Optional[str] = ""
    Fork_Actual_2: Optional[str] = ""
    Fork_Direction_2: Optional[str] = ""
    Fork_Trigger_3: Optional[str] = ""
    Fork_Should_3: Optional[str] = ""
    Fork_Actual_3: Optional[str] = ""
    Fork_Direction_3: Optional[str] = ""
    # 今天的三件好事（需求 44）：未填写的格子前端保存为"无"
    Good_Thing_1: Optional[str] = ""
    Good_Why_1: Optional[str] = ""
    Good_Thing_2: Optional[str] = ""
    Good_Why_2: Optional[str] = ""
    Good_Thing_3: Optional[str] = ""
    Good_Why_3: Optional[str] = ""

    @field_validator("Fork_Direction", "Fork_Direction_2", "Fork_Direction_3")
    @classmethod
    def validate_fork_direction(cls, v):
        """方向白名单校验（3 组共用）：契约源是 core/texts.py 的 FORK_DIRECTIONS（防止绕过 UI 的写入方塞任意值）"""
        if v and v not in FORK_DIRECTIONS:
            raise ValueError(f"方向只能是 {'/'.join(FORK_DIRECTIONS)} 之一或空，收到：{v}")
        return v


class TaskItem(BaseModel):
    """单条任务"""
    计划事项: str = ""
    实际完成: str = ""
    状态: str = ""          # ✅ / ❌ / ⚠️ / ""
    原因分析: str = ""


class TimeSlotItem(BaseModel):
    """单个时间段"""
    时间段: str             # HH:MM-HH:MM
    计划: str = ""
    实际: str = ""
    状态: str = ""          # ✅ / ""
    备注: str = ""


class DiaryInput(BaseModel):
    """保存日记的完整请求体"""
    summary: SummaryInput
    tasks: list[TaskItem]
    time_slots: list[TimeSlotItem]


class MetadataResponse(BaseModel):
    """日记元数据响应"""
    diary_no: int
    weekday: int
    weekday_name: str
    date: str


class CalendarResponse(BaseModel):
    """日历打点响应"""
    dates: list[str]
