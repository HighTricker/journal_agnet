# Journal Agent - 量化日记系统

本地优先 (Local-First) 的个人量化日记系统。前后端分离架构（React + FastAPI），支持每日任务管理、时间颗粒度记录、结构化反思，数据双存：CSV 存原始数据，Markdown 自动生成可读归档。内置多模型 AI 导师对话（Gemini / Qwen / DeepSeek / OpenAI / Anthropic）。

## 功能特性

- **日记**：量化数据（心情/精力/睡眠质量 5 档纯文字 + 起夜次数/番茄钟/静坐/AI 时间）+ 任务看板 + 48 个 30 分钟时间块 + 结构化反思（含今日分岔点、今天的三件好事）
- **周记**：习惯追踪 + 周任务管理 + 7 个反思区块，自动聚合日记数据
- **月记**：月任务 + 10 个反思区块 + 统计，自动聚合
- **AI 导师**：多模型对话（Gemini / Qwen / DeepSeek / OpenAI / Anthropic），LangChain Agent + SSE 流式响应
- **行为建议报告**：Gemini 分析 CSV 数据 + HTML 邮件自动发送

## 技术栈

- 后端：Python 3 + FastAPI + Uvicorn + Pydantic v2 + Pandas + LangChain + LangGraph
- 前端：React 19 + TypeScript + Vite 8 + Tailwind CSS 4 + Material Icons
- 数据：CSV（原始）+ Markdown（归档）
- 测试：pytest

## 快速开始

### 1. 克隆

```bash
git clone https://github.com/HighTricker/journal_agnet.git
cd journal_agnet
```

### 2. 安装后端依赖

```bash
pip install -r requirements.txt
```

### 3. 安装前端依赖

```bash
cd journal-frontend
npm install
cd ..
```

### 4. 配置环境变量

复制 `.env.example` 为 `.env`，至少配置一个 AI 模型 API key：

```bash
GOOGLE_API_KEY=your-key       # Gemini
DASHSCOPE_API_KEY=your-key    # Qwen
DEEPSEEK_API_KEY=your-key     # DeepSeek
OPENAI_API_KEY=your-key       # OpenAI
ANTHROPIC_API_KEY=your-key    # Anthropic
```

可选环境变量：

- `JOURNAL_BASE_DIR`：数据存储路径，默认 `./journal_data/`
- `JOURNAL_SMTP_USER` / `JOURNAL_SMTP_PASSWORD` / `JOURNAL_EMAIL_TO`：邮件发送配置

### 5. 启动（两个终端）

```bash
# 终端 1：后端（端口 8000）
uvicorn main:app --reload

# 终端 2：前端（端口 5173）
cd journal-frontend
npm run dev
```

打开浏览器访问：http://localhost:5173

## 项目结构

```
journal_agnet/
├── main.py                    # FastAPI 入口
├── routers/                   # API 路由（diary/weekly/monthly/report/chat）
├── schemas/                   # Pydantic 数据模型
├── core/                      # 业务逻辑（数据处理、Markdown 生成）
├── agent/                     # AI 导师 Agent（多模型注册）
├── prompts/                   # AI Prompt 模板
├── journal-frontend/          # React + Vite 前端
├── tests/                     # pytest 测试
├── docs/                      # 文档
├── .env.example
└── requirements.txt
```

## 运行测试

```bash
python -m pytest tests/ -v
```

## License

MIT

---

# Journal Agent - Quantified Journaling System

A local-first personal quantified journaling system with separated frontend/backend (React + FastAPI). Supports daily task management, 30-minute time-block tracking, structured reflection. Dual storage: CSV for raw data, Markdown for human-readable archives. Built-in multi-model AI mentor (Gemini / Qwen / DeepSeek / OpenAI / Anthropic).

## Features

- **Daily Journal**: Quantified metrics (mood / energy / sleep on 5-point text scales, night-wake count, pomodoros, etc.) + task board + 48 half-hour time blocks + structured reflection (incl. "fork point" & "three good things")
- **Weekly Review**: Habit tracking + weekly tasks + 7 reflection sections, auto-aggregated from daily data
- **Monthly Review**: Monthly tasks + 10 reflection sections + statistics, auto-aggregated
- **AI Mentor**: Multi-model chat (Gemini / Qwen / DeepSeek / OpenAI / Anthropic) via LangChain Agent + SSE streaming
- **Behavior Report**: Gemini analyzes CSV data, HTML email auto-delivery

## Tech Stack

- Backend: Python 3 + FastAPI + Uvicorn + Pydantic v2 + Pandas + LangChain + LangGraph
- Frontend: React 19 + TypeScript + Vite 8 + Tailwind CSS 4 + Material Icons
- Data: CSV (raw) + Markdown (archive)
- Tests: pytest

## Quick Start

### 1. Clone

```bash
git clone https://github.com/HighTricker/journal_agnet.git
cd journal_agnet
```

### 2. Install backend dependencies

```bash
pip install -r requirements.txt
```

### 3. Install frontend dependencies

```bash
cd journal-frontend
npm install
cd ..
```

### 4. Configure environment variables

Copy `.env.example` to `.env` and configure at least one AI model API key:

```bash
GOOGLE_API_KEY=your-key       # Gemini
DASHSCOPE_API_KEY=your-key    # Qwen
DEEPSEEK_API_KEY=your-key     # DeepSeek
OPENAI_API_KEY=your-key       # OpenAI
ANTHROPIC_API_KEY=your-key    # Anthropic
```

Optional environment variables:

- `JOURNAL_BASE_DIR`: Data storage path, defaults to `./journal_data/`
- `JOURNAL_SMTP_USER` / `JOURNAL_SMTP_PASSWORD` / `JOURNAL_EMAIL_TO`: Email delivery configuration

### 5. Start (two terminals)

```bash
# Terminal 1: Backend (port 8000)
uvicorn main:app --reload

# Terminal 2: Frontend (port 5173)
cd journal-frontend
npm run dev
```

Open browser: http://localhost:5173

## Project Structure

```
journal_agnet/
├── main.py                    # FastAPI entry point
├── routers/                   # API routes (diary/weekly/monthly/report/chat)
├── schemas/                   # Pydantic data models
├── core/                      # Business logic (data processing, Markdown generation)
├── agent/                     # AI mentor Agent (multi-model registry)
├── prompts/                   # AI prompt templates
├── journal-frontend/          # React + Vite frontend
├── tests/                     # pytest tests
├── docs/                      # Documentation
├── .env.example
└── requirements.txt
```

## Running Tests

```bash
python -m pytest tests/ -v
```

## License

MIT
