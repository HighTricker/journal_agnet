# Journal Agent - 量化日记系统

## 项目愿景
面向商业化的 AI 增强型个人量化日记系统，**本地优先 (Local-First)**，每日做任务管理、时间颗粒度记录、日记反思。
解决"晚间复盘盲区"，数据结构化存储以便 AI 后期分析，同时生成人类可读 Markdown 作为永久存档。
当前阶段：完善核心功能、稳定性、UX。最终目标：可商业化的产品/SaaS。

## 技术栈
**架构**：前后端分离（React + FastAPI）。原 Streamlit 版本已迁移完成（commit 41d2841 Phase 5-8）。

### 后端
- 语言：Python 3.x
- Web 框架：FastAPI + Uvicorn（ASGI）
- 数据校验：Pydantic v2（`schemas/` 目录）
- 数据处理：Pandas
- 数据存储：CSV（原始数据）+ Markdown（成品输出）
- AI 对话：LangChain Agent（`langchain` + `langgraph`），SSE 流式响应
- AI 模型：Gemini（`langchain-google-genai`）+ Qwen（`langchain-openai` 走 DashScope 兼容模式）+ DeepSeek（`langchain-deepseek`）+ OpenAI（`langchain-openai`）+ Anthropic（`langchain-anthropic`）
- AI 报告分析：Gemini API（`google-genai` SDK）
- 邮件发送：Python `smtplib`（SMTP_SSL）
- 测试：`python -m pytest tests/ -v`

### 前端（`journal-frontend/`）
- React 19 + TypeScript + Vite 8
- 路由：react-router-dom 7（`App.tsx` 4 个路由：`/diary` `/weekly` `/monthly` `/ai`）
- 样式：Tailwind CSS 4（@tailwindcss/vite 插件）+ Material Design 3 风格 + Material Icons
- 状态：纯 React Hooks，无外部状态库
- API 通信：原生 `fetch`（封装在 `src/api/client.ts`）+ SSE（`/api/chat`）
- 包管理：npm

### 启动方式
**两个进程，分两个终端**：
```bash
# 终端 1：后端（默认 8000）
uvicorn main:app --reload

# 终端 2：前端（默认 5173）
cd journal-frontend
npm run dev
```
后端 CORS 已允许 5173/3000（见 `main.py`）。打开 http://localhost:5173 即可。

### 配置
- 环境变量：根目录 `.env`（参考 `.env.example`）
  - `GOOGLE_API_KEY` / `DASHSCOPE_API_KEY` / `DEEPSEEK_API_KEY` / `OPENAI_API_KEY` / `ANTHROPIC_API_KEY`
  - `JOURNAL_BASE_DIR`（数据路径，可选，默认 `./journal_data/`）
  - `JOURNAL_SMTP_USER` / `JOURNAL_SMTP_PASSWORD` / `JOURNAL_EMAIL_TO`（邮件，可选）
- 仓库：https://github.com/HighTricker/journal_agnet

## 项目结构
```
journal_agnet/
├── main.py                    # FastAPI 入口，挂 5 个 router + CORS
├── routers/                   # FastAPI 路由层（全部挂在 /api/ 前缀下）
│   ├── diary.py               # 日记 CRUD + 日历打点
│   ├── weekly.py              # 周记 CRUD + 周数据聚合
│   ├── monthly.py             # 月记 CRUD + 月数据聚合
│   ├── report.py              # AI 行为建议报告（Gemini 分析 + 邮件发送）
│   └── chat.py                # AI 导师 SSE 对话 + 模型列表 + 会话管理
├── schemas/                   # Pydantic 数据模型（请求/响应校验）
│   ├── diary.py               # SummaryInput / TaskItem / TimeSlotItem / DiaryInput
│   ├── weekly.py
│   └── monthly.py
├── core/                      # 业务逻辑（与 Web 框架解耦，从 Streamlit 时代沿用）
│   ├── config.py              # 路径配置、BASE_DIR
│   ├── data_manager.py        # 日记 CSV 读写 + Markdown 生成
│   ├── texts.py               # 评分定义、坏习惯关键词库
│   ├── template.py            # 日程模板（48 个时间段默认安排）
│   ├── md_template.py         # 日记 Markdown 模板
│   ├── weekly_*.py            # 周记三件套：texts / data_manager / md_template
│   ├── monthly_*.py           # 月记三件套：texts / data_manager / md_template
│   ├── report_config.py       # 行为报告配置：提示词、Gemini 模型名、SMTP
│   ├── report_data_collector.py # 收集 CSV 数据 + 加载 kingsley_context.md
│   ├── report_service.py      # Gemini 调用 + HTML 邮件发送
│   └── kingsley_context.md    # 个人北极星目标（作为 user prompt 上下文）
├── agent/                     # AI 导师对话 Agent
│   ├── model_config.py        # 模型注册中心（ModelConfig + MODELS 字典 + DEFAULT_MODEL_KEY）
│   ├── agent.py               # build_agent(model_key) 工厂 + system prompt 占位符注入
│   └── tools.py               # LangChain 工具集（read_diary / read_csv_data / save_advice_report / generate_schedule / add_task / send_email）+ _current_model_name 全局变量
├── prompts/
│   └── system_prompt.md       # Agent system prompt（含 {today}/{model_name} 占位符）
├── journal-frontend/          # React + Vite 前端
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── App.tsx            # 路由定义（4 个 page）
│       ├── main.tsx           # ReactDOM 挂载
│       ├── pages/             # 页面组件（每个路由一个）
│       │   ├── Diary.tsx               # 日记主页（含 Tab：DiarySchedule + DiaryJournal）
│       │   ├── DiarySchedule.tsx       # 日程 Tab（48 时段 + 任务清单）
│       │   ├── DiaryJournal.tsx        # 日志 Tab（量化数据 + 反思）
│       │   ├── Weekly.tsx / WeeklyText.tsx / WeeklyReview.tsx
│       │   ├── Monthly.tsx / MonthlyText.tsx / MonthlyReview.tsx
│       │   └── AISage.tsx              # AI 导师对话页（左侧模型选择 + 右侧 SSE 聊天）
│       ├── components/        # 复用组件
│       │   ├── layout/        # PageLayout / TopAppBar / BottomNavBar / WeekStrip
│       │   ├── ui/            # MaterialIcon / Card / EmojiRating
│       │   ├── diary/         # MiniCalendar / ScheduleTable / GoalCard / AIInsights
│       │   └── shared/        # SaveButton / YearlyGoalCard / ItemRecordCards
│       ├── hooks/             # 业务数据 hooks（封装 API 调用 + state 管理）
│       │   ├── useDiaryData.ts          # 日记数据
│       │   ├── useWeeklyData.ts         # 周记数据
│       │   ├── useMonthlyData.ts        # 月记数据
│       │   ├── useCrossPageGoals.ts     # 跨页目标同步（日记页编辑 → 周/月 API 落库）
│       │   └── useChat.ts               # AI 导师 SSE 对话
│       ├── api/
│       │   └── client.ts      # fetch 封装 + 类型导出（diaryApi / weeklyApi / monthlyApi / chatApi）
│       └── mocks/             # 部分尚未接后端的 mock 数据（如 YEARLY_GOALS）
├── tests/                     # pytest 测试（test_core / test_weekly / test_monthly / test_report）
├── docs/                      # PRD + Markdown 模板样例
├── 日记前端构思及工程文件/    # 原型设计 HTML（迁移参考资料，不参与运行）
├── .env.example
├── requirements.txt
├── CLAUDE.md
├── TODO.md
└── 功能TODO.md

⚠️ 已废弃但未删除（Streamlit 时代遗留，勿改勿引用）：
   diary.py、pages/1_周记.py、pages/2_月记.py、pages/3_AI导师.py、assets/styles.css
   `requirements.txt` 中的 `streamlit` 也是历史遗留，新代码不再 import
```

## 业务模块

### 日记（diary router + Diary 页面）
- **元数据**：编号 / 日期 / 星期 / 天气 / 所在地。日记编号锚点 2026-02-18 = No.1100，按日期差递推（`routers/diary.py:14`）
- **量化数据**：心情 1-6、睡眠 1-6 + 入睡/起床时间 + 自动算时长、番茄钟、静坐分钟、AI 时间、打飞机次数、睡眠/梦境
- **周/月目标展示**：日记页只读展示当前周/月目标，但通过 `useCrossPageGoals` 可双向编辑（toggle 状态立即调用周/月 API 落库）
- **任务看板**：动态增删行，状态 ✅/❌/⚠️，"原因"列扫描 `texts.py` 坏习惯关键词
- **30 分钟时间流**：48 半小时块，计划 vs 实际，固定任务（睡眠等）按 `template.py` 自动 ✅
- **结构化反思**：10 个反思维度，定义在 `core/texts.py` 的 `REFLECTIONS_MAP`

### 周记（weekly router + Weekly/WeeklyText/WeeklyReview 页面）
- **三表**：weekly_summary / weekly_habits / weekly_tasks，主键 Week（"2026-W09"）
- 周定义：ISO 周编号（isocalendar），周一~周日
- 数据聚合：从 daily_summary 自动算心情/睡眠/番茄钟统计
- 习惯追踪：6 个默认习惯 + 动态增删
- 7 个反思区块

### 月记（monthly router + Monthly/MonthlyText/MonthlyReview 页面）
- **二表**：monthly_summary / monthly_tasks，主键 Month（"2026-03"）
- 月定义：自然月（1日~月末）
- 数据聚合：从 daily_summary 计算统计 + 不打飞机天数
- 10 个反思区块（比周记多认知升级、阅读、学习成果）

### AI 行为建议报告（report router + core/report_*.py）
- 流程：收集 CSV + 个人上下文 → Gemini 分析 → HTML 邮件发送
- `report_config.py`：提示词模板（含 personal_context 等 7 个占位符）、模型 `gemini-3-flash-preview`、SMTP
- `report_data_collector.py`：从 8 张 CSV 表收集 + `load_personal_context()` 读 `kingsley_context.md`
- `report_service.py`：`generate_report()` → `send_email(powered_by)` → `generate_and_send_report()`
- 错误分层：`ValueError`（配置缺失）/ `RuntimeError`（运行时错误）

### AI 导师对话（chat router + agent/ + AISage 页面）
- 基于 LangChain Agent + LangGraph，多轮对话，SSE 流式
- **多模型**：Gemini / Qwen / DeepSeek / OpenAI / Anthropic（左侧栏点击切换）
- 模型注册中心：`agent/model_config.py` 的 `MODELS` 字典，新增模型只改这一个文件，前端 `/api/chat/models` 接口自动暴露给 UI
- `available` 字段由后端检测 `os.environ.get(env_key)` 自动判断（未配置 key 的模型在 UI 显示"未配置"）
- 每个模型一个 Agent 实例（`_agent_cache`），InMemorySaver 按 thread_id 隔离会话
- 切换模型 = 清空 messages + 新 thread_id（不重建后端 Agent，缓存复用）
- `_current_model_name` 由 `build_agent` 注入 `agent/tools.py`，供 `send_email` 工具的邮件署名使用
- **快捷指令**：分析今天 / 安排明天 / 发送周报 / 本周习惯
- **已知问题**：Qwen 模型工具调用可靠性弱于 Gemini/Anthropic，可能不调工具或参数错

### 数据持久化
- **保存触发**：用户点击"保存"按钮 → 前端 hook → POST 到对应 router → core 层 upsert CSV + 渲染 Markdown
- **CSV**：Upsert 模式，按主键覆盖
- **Markdown**：保存后自动生成 `.md` 成品
- **存储路径**：CSV 按年度分表存于 `BASE_DIR/data/`，Markdown 按月归档存于 `BASE_DIR/MM月/`

## 数据架构
- **日记三表**：tasks_log / time_log / daily_summary，主键 Date（YYYY-MM-DD）
- **周记三表**：weekly_summary / weekly_habits / weekly_tasks，主键 Week（2026-W09）
- **月记二表**：monthly_summary / monthly_tasks，主键 Month（2026-03）
- 路径基于 `core/config.py` 的 `BASE_DIR`，按年度分表、按月归档
- 聚合链：日记原始 → 周记统计 → 月记统计

## 前后端通信约定
- 后端所有路由统一前缀 `/api/`，挂在 8000 端口
- 前端 dev 服务器 5173，开发时直接访问 `http://127.0.0.1:8000/api/...`（CORS 已开）
- 数据格式：JSON in / JSON out，日期一律 `YYYY-MM-DD`，周 `YYYY-Www`，月 `YYYY-MM`
- AI 对话用 SSE：`data: {"content": "..."}` 增量推送，`data: [DONE]` 终止，`event: error` 报错
- Pydantic schema 是契约源——改 `schemas/*.py` 时同步更新 `journal-frontend/src/api/client.ts` 的 TypeScript 类型

## 会话风格

### 角色定位：导师式协作
- 解释每个技术决策背后的**原因和权衡**，不只是给代码
- 遇到新技术概念时**主动教学**
- 从**产品和架构角度**分析问题
- 主动分享**行业最佳实践**和常见陷阱

### 沟通规则
- 始终使用中文回答
- 回答时要有自己的独立思考
- 小改动直接执行，大改动或涉及架构的先讨论再动手
- 提出建议时说明利弊，但尊重用户最终决策

### 用户定位：产品经理 + 验收员，不是程序员
- **用户负责**：描述想要什么、看效果对不对、指出哪里不满意
- **AI 负责**：把描述变成代码、处理所有技术细节
- 用户核心能力是**精准表述想构建什么**，不是理解每行代码
- 用户需要理解的是**模式**（数据驱动 UI、组件 = 函数、state 驱动更新），不是语法细节
- 不要求用户"学会写 React"，目标是"学会精准告诉 AI 要什么，并能看懂结果对不对"

### 代码协作范式：我写你审你述我验
- **不要让用户手动复制粘贴代码**
- 流程：我直接用工具创建/编辑文件 → 用户打开文件审阅 → 用户用自己的话描述理解 → 我验证纠正
- 重复性/模式相同的代码：直接写，不走审阅流程
- 涉及新概念的关键代码：必须走审阅流程
- 用户负责决策和验收，我负责实现

## 代码规范
- 变量名、函数名英文（snake_case Python / camelCase TypeScript）
- 注释、文档、commit message 用中文
- 新增核心功能附带单元测试（pytest 在 `tests/`）
- 遵循现有代码风格
- 不做未被要求的重构或优化
- **缩进统一 4 个空格**（TS / TSX / CSS 所有前端文件）

## 开发原则
- **本地优先**：所有数据存本地，隐私安全第一
- **读写分离**：CSV 存原始数据，Markdown 是展示层
- **以日期为轴**：所有数据操作围绕日期
- **Upsert 模式**：更新覆盖同主键，不重复追加
- **契约驱动**：Pydantic schema 是前后端契约源，先改 schema 再改两端
- **商业化意识**：代码质量、可维护性、可扩展性为未来做准备

## 当前阶段重点
- React + FastAPI 架构稳定后，逐步把 mocks/ 中残留的假数据接到真实 API（如 `YEARLY_GOALS`）
- 完善已迁移功能的稳定性、修 bug
- AI 导师对话：Gemini / DeepSeek / Anthropic 较稳定；Qwen 工具调用可靠性待调；OpenAI 待用户首次验证
- 不急于加新功能，先把基础打扎实
