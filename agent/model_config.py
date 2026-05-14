import os
from dataclasses import dataclass


@dataclass(frozen=True)
class ModelConfig:
    key: str              # 内部标识（缓存键）
    display_name: str     # 下拉框显示名
    provider: str         # LangChain model_provider
    model_name: str       # API 模型名
    env_key: str          # API key 环境变量名
    base_url: str | None = None


MODELS: dict[str, ModelConfig] = {}


def _register(cfg: ModelConfig):
    MODELS[cfg.key] = cfg


_register(ModelConfig(
    key="gemini",
    display_name="Gemini 3 Flash Preview",
    provider="google_genai",
    model_name="gemini-3-flash-preview",
    env_key="GOOGLE_API_KEY",
))

_register(ModelConfig(
    key="qwen",
    display_name="Qwen 3.5 Plus",
    provider="openai",
    model_name="qwen3.5-plus-2026-02-15",
    env_key="DASHSCOPE_API_KEY",
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
))

_register(ModelConfig(
    key="deepseek",
    display_name="DeepSeek Chat",
    provider="deepseek",
    model_name="deepseek-chat",
    env_key="DEEPSEEK_API_KEY",
))

_register(ModelConfig(
    key="openai",
    display_name="OpenAI GPT-5.5",
    provider="openai",
    model_name="gpt-5.5",
    env_key="OPENAI_API_KEY",
))

_register(ModelConfig(
    key="anthropic",
    display_name="Claude Opus 4.7",
    provider="anthropic",
    model_name="claude-opus-4-7",
    env_key="ANTHROPIC_API_KEY",
))

_register(ModelConfig(
    key="xai",
    display_name="Grok 4",
    provider="openai",
    model_name="grok-4",
    env_key="XAI_API_KEY",
    base_url="https://api.x.ai/v1",
))

DEFAULT_MODEL_KEY = "gemini"


def get_config(model_key: str) -> ModelConfig:
    """根据 key 获取模型配置，不存在则抛出 ValueError。"""
    if model_key not in MODELS:
        raise ValueError(f"未知模型: {model_key}，可选: {list(MODELS.keys())}")
    return MODELS[model_key]
