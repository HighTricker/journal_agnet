import os
from pathlib import Path
from dotenv import load_dotenv
from agent.tools import read_diary, read_csv_data, save_advice_report, generate_schedule, send_email
from langchain.agents import create_agent
from langgraph.checkpoint.memory import InMemorySaver

# 加载项目根目录的 .env（如果存在）
load_dotenv(Path(__file__).parent.parent / ".env")

# 读取 system prompt
system_prompt = (Path(__file__).parent.parent / "prompts" / "system_prompt.md").read_text(encoding="utf-8")

# 组装 Agent
agent = create_agent(
    model="google_genai:gemini-3-flash-preview",
    tools=[read_diary, read_csv_data, save_advice_report, generate_schedule, send_email],
    system_prompt=system_prompt,
    checkpointer=InMemorySaver()
)
