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

### 部署到桌面 .exe（生产环境，重要！）

⚠️ **用户日常运行的是 electron-builder 打包好的成品**：
```
E:\journal_agent\release\Journal Agent\Journal Agent.exe
```
**不是** `npm start` / `uvicorn` / vite dev——那些只是开发用。

#### 关键陷阱（必读）
前端 dist **被烤进 .exe 内部**，改完前端代码后**必须重新部署**，否则用户看到的还是旧版本。
- 即使源码改了、tsc 通过、eslint 通过、`journal-frontend/dist/` 有新 bundle，**只要没部署到 .exe 内部就完全无效**。
- 用户描述"修了没用"时，第一件事就是检查 .exe 内部 dist 的时间戳是否更新过。

#### 前端 dist 在 .exe 内部的实际位置
```
release\Journal Agent\resources\journal-backend\_internal\journal-frontend\dist\
├── index.html
└── assets\index-*.js / index-*.css
```
（PyInstaller 用 `--add-data "journal-frontend/dist;journal-frontend/dist"` 把前端打进 backend.exe，运行时解压到 `_internal/`。）

#### 方案 A：热替换（5 秒，快速验证前端改动）
只改了前端代码、想立刻让用户测的场景：
1. `cd journal-frontend && npm run build` — 生成新 dist 到 `journal-frontend/dist/`
2. 让用户**完全关闭** `Journal Agent.exe`（任务管理器确认 `electron.exe` 和 `journal-backend.exe` 都没了，否则 .js/.css 被锁复制失败）
3. 复制新 dist 到 .exe 内部路径（Claude Code 必须用 **Bash tool + `dangerouslyDisableSandbox: true`**，PowerShell tool 会因路径保护拒绝）：
   ```bash
   SRC="E:/journal_agent/journal-frontend/dist"
   DST="E:/journal_agent/release/Journal Agent/resources/journal-backend/_internal/journal-frontend/dist"
   rm -f "$DST/assets/"*
   cp -f "$SRC/index.html" "$DST/index.html"
   cp -f "$SRC/assets/"* "$DST/assets/"
   ```
4. 用户双击 `Journal Agent.exe` 验证

#### 方案 B：完整重打包（5-10 分钟，长期标准流程）
改了 backend Python 代码 / 依赖 / Electron 主进程 / preload 时必须走完整流程：
```powershell
npm run build:frontend     # vite build → journal-frontend/dist/
npm run build:backend      # pyinstaller 把 backend + dist 打包成 dist/journal-backend/journal-backend.exe
# 然后 electron-builder 重新打包整个 Journal Agent.exe（具体命令查 package.json/electron-builder 配置）
```

#### 历史教训：Bug #7 修复事件（2026-05-23）
修复期间 AI 改了 4 个 hook + 加了 ToastProvider + 通过了类型检查和 lint，用户在 .exe 里测试**两轮都说"完全没解决"**。根因是改完代码忘了部署到 .exe，用户实际跑的还是 5 月 21 日打包的旧 bundle。
**永远记得**：改代码 ≠ 部署。前端改动验证前，**先用 `ls -la` 检查 .exe 内部 dist 时间戳**，确认是新的再让用户测。

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
│   ├── weekly.py              # 周记 CRUD + 周数据聚合 + 每周事项时间轴（/weekly/{week}/timeline GET·PUT，需求46）
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
│       │   ├── diary/         # MiniCalendar / ScheduleTable / GoalCard / GoalsCarousel(年/月/周/本周节点 4 tab) / WeeklyTimeline(每周事项甘特图谱,需求46) / AIInsights / SleepQualityPicker(睡眠5档) / RatingScale(心情·精力5档) / ForkPoint(今日分岔点) / GoodThings(三件好事)
│       │   └── shared/        # SaveButton / YearlyGoalCard / ItemRecordCards
│       ├── hooks/             # 业务数据 hooks（封装 API 调用 + state 管理）
│       │   ├── useDiaryData.ts          # 日记数据
│       │   ├── useWeeklyData.ts         # 周记数据
│       │   ├── useMonthlyData.ts        # 月记数据
│       │   ├── useCrossPageGoals.ts     # 跨页目标同步（日记页编辑 → 周/月 API 落库）
│       │   ├── useWeeklyTimeline.ts     # 每周事项时间轴数据（需求46：lanes=周目标 + 卡片增删改/勾选，整周 PUT）
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
├── 功能需求.md            # 功能需求清单 + 已完成日志（与 Bug 分开）
└── BUG记录.md             # Bug 待修 + 已修复记录（与功能分开）
```

## 业务模块

### 日记（diary router + Diary 页面）
- **元数据**：编号 / 日期 / 星期 / 天气 / 所在地。日记编号锚点 2026-02-18 = No.1100，按日期差递推（`routers/diary.py:14`）
- **量化数据**（均 5 档纯文字，5=最好，方向统一）：心情 1-5（5明亮…1很糟）、精力 1-5（5充沛…1枯竭）、睡眠质量 1-5（5神清气爽…1像没睡过）+ 入睡/起床时间 + 自动算时长 + 起夜/醒来次数 + 番茄钟、静坐分钟、AI 时间、打飞机次数、睡眠情况/梦境
  - 评分组件：睡眠用 `SleepQualityPicker`、心情/精力用通用 `RatingScale`（带电量填充）；均存真实分数 1-5。心情/睡眠原为 1-6 表情，2026-06 改 5 档并迁移历史数据（详见 `BUG记录.md` 已修复 #8）；周/月记 Review 页仍用 `EmojiRating`（1-5）
- **周/月目标展示**：日记页只读展示当前周/月目标，但通过 `useCrossPageGoals` 可双向编辑（toggle 状态立即调用周/月 API 落库）
- **任务看板**：动态增删行，状态 ✅/❌/⚠️，"原因"列扫描 `texts.py` 坏习惯关键词
- **30 分钟时间流**：48 半小时块，计划 vs 实际，固定任务（睡眠等）按 `template.py` 自动 ✅
- **结构化反思**：`REFLECTIONS_MAP` 多维反思（AI使用/学习、读书、静坐、做得好/需改进、给自己的话、灵感、感悟）+ **今日分岔点**（需求 45 起为**最多 3 组**，每组 情景/该做的/实际做的/方向；第 1 组沿用原列名不带后缀、第 2/3 组为 `Fork_*_2`/`Fork_*_3`，老单组数据零迁移；方向白名单 = `texts.FORK_DIRECTIONS`「引起坏行为/中性/引起良好行为」，schema field_validator 一次覆盖 3 个方向字段强制）+ **今天的三件好事**（3 组「好事+为什么」）。这两块未填的**文本**格子均存为"无"、加载还原空框（分岔点的方向 pill 除外，未选存空串），AI 报告收集器对 `Good_`+`Fork_` 列的"无"占位统一清洗。全部文本字段走 `useDiaryData` 的 `textRecords` 管道（TEXT_RECORD_MAP）落库到 daily_summary

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
- **周记四表**：weekly_summary / weekly_habits / weekly_tasks / weekly_timeline，主键 Week（2026-W09）。`weekly_tasks` 含稳定 `goal_id`（后端按计划事项文本继承、首次时间轴加载补 uuid 落库）；`weekly_timeline`（Week/id/goal_id/周几/内容/完成）= 每周事项时间轴卡片，按 goal_id 挂到周目标，卡片全完成自动回写 `weekly_tasks.状态=✅`（需求46）
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
- **契约驱动**：Pydantic schema 是前后端契约源，先改 schema 再改两端。daily_summary 列只加不改、新字段一律 `Optional`，保证老数据/老请求不报错
- **历史数据迁移谨慎**：对历史数据做语义迁移（如评分方向翻转）前，先按「月分布 + 极值首现日期」验证整个时间跨度内录入约定是否一致，并务必先备份；切忌全量统一处理（曾因此误翻 49 天睡眠分，见 BUG记录.md 已修复 #8）。迁移用的一次性脚本用完即删，映射逻辑（方向翻转、按 2026-04-11 时代分界）记录在 BUG记录.md / 功能需求.md 备查
- **商业化意识**：代码质量、可维护性、可扩展性为未来做准备

## 当前阶段重点
- React + FastAPI 架构稳定后，逐步把 mocks/ 中残留的假数据接到真实 API（如 `YEARLY_GOALS`）
- 完善已迁移功能的稳定性、修 bug
- AI 导师对话：Gemini / DeepSeek / Anthropic 较稳定；Qwen 工具调用可靠性待调；OpenAI 待用户首次验证
- 不急于加新功能，先把基础打扎实
