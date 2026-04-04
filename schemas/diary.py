from pydantic import BaseModel, Field
from typing import Optional


class SummaryInput(BaseModel):
    """日记概览 — 前端提交的量化数据和反思"""
    Mood: Optional[int] = Field(None, ge=1, le=5, description="心情评分 1-5")
    Sleep_Score: Optional[int] = Field(None, ge=1, le=5, description="睡眠质量 1-5")
    Sleep_Bedtime: Optional[str] = Field(None, description="入睡时间 HH:MM")
    Sleep_Waketime: Optional[str] = Field(None, description="起床时间 HH:MM")
    Sleep_Hours: Optional[float] = Field(None, description="睡眠时长（小时）")
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
