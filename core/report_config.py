# report_config.py
# 行为建议报告的配置：Gemini 模型、邮箱设置、提示词模板

import os

# ==================== Gemini API 配置 ====================
GEMINI_MODEL = "gemini-3-flash-preview"

# ==================== 邮箱配置（从环境变量读取） ====================
SMTP_SERVER = os.environ.get("JOURNAL_SMTP_SERVER", "smtp.163.com")
SMTP_PORT = int(os.environ.get("JOURNAL_SMTP_PORT", "465"))
SMTP_USER = os.environ.get("JOURNAL_SMTP_USER", "")
SMTP_PASSWORD = os.environ.get("JOURNAL_SMTP_PASSWORD", "")  # 163 授权码
EMAIL_RECIPIENT = os.environ.get("JOURNAL_EMAIL_TO", "")

# ==================== 提示词模板 ====================

REPORT_SYSTEM_PROMPT = """\
你是一位专业的个人行为分析师和生活教练。你的任务是根据用户的量化日记数据，\
提供深度行为分析和个性化建议报告。

分析原则：
1. 基于数据说话，不做无依据的推测
2. 发现行为模式和趋势，而不仅仅罗列数据
3. 建议要具体、可执行，避免空泛的鸡汤
4. 语气温和但直接，像一位关心你的导师
5. 用中文回答
"""

REPORT_USER_PROMPT_TEMPLATE = """\
请根据我的日记数据，帮助我分析行为模式并提供改善建议。

## 每日概览数据
{daily_summary}

## 任务完成情况
{tasks_data}

## 时间分配（近7天）
{time_data}

## 周记数据
{weekly_data}

## 月记数据
{monthly_data}

## 反思记录
{reflections_summary}

---

请从以下维度进行分析，生成一份结构化的行为建议报告：

### 1. 核心数据总结
- 心情趋势、睡眠质量趋势、专注力变化

### 2. 行为模式洞察
- 发现我的行为规律（好的和需要改进的）
- 时间利用效率分析

### 3. 目标达成评估
- 任务完成率分析
- 与周/月目标的对比

### 4. 个性化建议
- 基于数据的 3-5 条具体可行的改善建议
- 值得保持的好习惯

### 5. 下一步行动
- 最优先改善的 1-2 个方面
- 具体的行动计划
"""
