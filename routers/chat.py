import os
import uuid
import json
import logging
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from agent.model_config import MODELS, DEFAULT_MODEL_KEY
from agent.agent import build_agent

router = APIRouter(prefix="/api", tags=["AI 对话"])
logger = logging.getLogger(__name__)

# --- Agent 缓存：按 model_key 缓存，避免每次请求都重建 ---
_agent_cache: dict = {}


def _get_agent(model_key: str):
    """获取或创建 Agent 实例（带缓存）"""
    if model_key not in _agent_cache:
        _agent_cache[model_key] = build_agent(model_key)
    return _agent_cache[model_key]


# ==================== 1. 获取可用模型列表 ====================
@router.get("/chat/models")
def get_models():
    models = []
    for key, cfg in MODELS.items():
        available = bool(os.environ.get(cfg.env_key))
        models.append({
            "key": cfg.key,
            "display_name": cfg.display_name,
            "available": available,
        })
    return {"models": models, "default": DEFAULT_MODEL_KEY}


# ==================== 2. 创建新对话 ====================
@router.post("/chat/new")
def create_new_chat():
    thread_id = str(uuid.uuid4())
    return {"thread_id": thread_id}


# ==================== 3. 清空对话历史 ====================
@router.delete("/chat/{thread_id}")
def delete_chat(thread_id: str):
    # InMemorySaver 的历史按 thread_id 隔离，
    # 新建 thread_id 即可实现"清空"效果，旧数据自然不再访问。
    # 如果需要主动释放内存，可以在这里清理 checkpointer 内部存储。
    return {"message": "对话已清空"}


# ==================== 4. AI 对话（SSE 流式） ====================
class ChatRequest(BaseModel):
    message: str
    model: str = DEFAULT_MODEL_KEY
    thread_id: str


@router.post("/chat")
def chat(body: ChatRequest):
    # 验证模型
    if body.model not in MODELS:
        raise HTTPException(status_code=422, detail=f"不支持的模型：{body.model}")

    # 验证 API Key
    cfg = MODELS[body.model]
    if not os.environ.get(cfg.env_key):
        raise HTTPException(status_code=422, detail=f"模型 {cfg.display_name} 未配置 API Key（{cfg.env_key}）")

    def event_stream():
        try:
            agent = _get_agent(body.model)
            config = {"configurable": {"thread_id": body.thread_id}}

            for event in agent.stream(
                {"messages": [("human", body.message)]},
                config=config,
                stream_mode="messages",
            ):
                msg, metadata = event
                msg_type = getattr(msg, "type", "")
                raw_content = getattr(msg, "content", None)

                # 提取文本：content 可能是 str 或 list[dict]
                text = ""
                if isinstance(raw_content, str):
                    text = raw_content
                elif isinstance(raw_content, list):
                    # Gemini 返回 [{'type': 'text', 'text': '...'}]
                    for part in raw_content:
                        if isinstance(part, dict) and part.get("type") == "text":
                            text += part.get("text", "")

                # 只推送 AI 消息的文本片段
                if text and msg_type in ("ai", "AIMessageChunk", ""):
                    chunk = json.dumps({"content": text}, ensure_ascii=False)
                    yield f"data: {chunk}\n\n"

            yield "data: [DONE]\n\n"

        except Exception as e:
            logger.error(f"AI 对话出错: {e}")
            error = json.dumps({"detail": str(e)}, ensure_ascii=False)
            yield f"event: error\ndata: {error}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
