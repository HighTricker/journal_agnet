from pydantic import BaseModel, ConfigDict, Field, model_validator
from typing import Optional


class MonthlySummaryInput(BaseModel):
    model_config = ConfigDict(extra='allow')  # 允许 Record_Week1 等额外字段透传
    """月记概览 — 前端提交的数据"""
    Monthly_Score: Optional[int] = Field(None, ge=1, le=5, description="月自评分 1-5")
    Avg_Mood: Optional[float] = None
    Avg_Sleep_Hours: Optional[float] = None
    Avg_Sleep_Score: Optional[float] = None
    Total_Focus: Optional[int] = None
    Total_Masturbation: Optional[int] = None
    No_Masturbation_Days: Optional[int] = None

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
    Reflect_Cognitive: Optional[str] = ""
    Reflect_Next_Month: Optional[str] = ""
    Reading_Books: Optional[str] = ""
    Learning_Content: Optional[str] = ""
    Words_To_Self: Optional[str] = ""
    Thoughts: Optional[str] = ""


class MonthlyTaskItem(BaseModel):
    """单条月任务"""
    分类: str = ""          # 工作/学习 / 运动/健康 / 阅读 / 油管访谈 / 个人成长 / 生活事务
    计划事项: str = ""
    实际完成: str = ""
    状态: str = ""          # ✅ / ❌ / ⚠️
    原因分析: str = ""


class MonthlyInput(BaseModel):
    """保存月记的完整请求体"""
    summary: MonthlySummaryInput
    tasks: list[MonthlyTaskItem]
