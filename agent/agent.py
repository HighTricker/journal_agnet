import os
from datetime import date
from pathlib import Path
from dotenv import load_dotenv
from agent import tools as agent_tools
from agent.tools import (
    read_diary,
    read_csv_data,
    save_advice_report,
    generate_schedule,
    add_task,
    send_email,
    write_weekly_daily_records,
    write_monthly_weekly_records,
)
from agent.model_config import DEFAULT_MODEL_KEY, get_config
from langchain.chat_models import init_chat_model
from langchain.agents import create_agent
from langgraph.checkpoint.memory import InMemorySaver

# 加载项目根目录的 .env（如果存在）
load_dotenv(Path(__file__).parent.parent / ".env")

# 读取 system prompt 模板（含 {today}/{model_name} 等占位符）
_system_prompt_template = (Path(__file__).parent.parent / "prompts" / "system_prompt.md").read_text(encoding="utf-8")

TOOLS = [
    read_diary,
    read_csv_data,
    save_advice_report,
    generate_schedule,
    add_task,
    write_weekly_daily_records,
    write_monthly_weekly_records,
    send_email,
]

WEEKDAY_NAMES = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]


def _build_system_prompt(model_display_name: str) -> str:
    """动态注入当前日期和模型名称到 system prompt。"""
    today = date.today()
    iso = today.isocalendar()
    return _system_prompt_template.format(
        model_name=model_display_name,
        today=today.isoformat(),
        weekday=WEEKDAY_NAMES[today.weekday()],
        current_week=f"{iso.year}-W{iso.week:02d}",
        current_month=today.strftime("%Y-%m"),
    )


def build_agent(model_key: str = DEFAULT_MODEL_KEY):
    """根据 model_key 构建 Agent 实例。"""
    cfg = get_config(model_key)
    api_key = os.environ.get(cfg.env_key)
    if not api_key:
        raise ValueError(f"模型 {cfg.display_name} 需要设置环境变量 {cfg.env_key}")

    # 设置当前模型名，供 send_email 等工具自动使用
    agent_tools._current_model_name = cfg.display_name

    kwargs = {"api_key": api_key}
    if cfg.base_url:
        kwargs["base_url"] = cfg.base_url

    model = init_chat_model(cfg.model_name, model_provider=cfg.provider, **kwargs)

    return create_agent(
        model=model, tools=TOOLS,
        system_prompt=_build_system_prompt(cfg.display_name),
        checkpointer=InMemorySaver()
    )
