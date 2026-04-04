# 架构迁移开发计划：Streamlit → React + FastAPI

> 创建时间：2026-03-26
> 最后更新：2026-03-27
> 当前进度：Phase 0-8 全部完成 ✅。架构迁移（Streamlit → React + FastAPI）已完成。下一步：线上部署（见 `线上部署TODO.md`）。

## 这个计划是什么

把日记系统从 Streamlit 单体架构迁移到 React + FastAPI 前后端分离架构。
这不只是一个技术迁移，更是一条**从初级开发者成长为能精准指挥 AI 的架构师**的学习路径。

每个阶段都是一个独立的小项目：学一个概念 → 动手做 → 看到成果 → 进入下一阶段。

---

## 用一个故事理解整个过程

把你的日记系统想象成一家**餐厅**。

**现在的 Streamlit 版本**就像一个"自助厨房"——厨师（Python）自己做菜，自己端上桌，自己收盘子。厨房和餐厅是一个房间，一个人全包。简单，但做不大。

**你要做的迁移**是把它改造成一家正式的餐厅：
- **React 前端 = 餐厅前厅**（漂亮的装修、菜单、服务员、顾客看到的一切）
- **FastAPI 后端 = 厨房**（接收订单、做菜、把菜送出来）
- **core/ 模块 = 厨师的手艺**（不用换厨师，他的菜谱和刀工都不变，只是从自助改成了接单做菜）

迁移的过程就是：先装修前厅（Phase 1-4）→ 再改造厨房（Phase 5）→ 最后打通传菜窗口（Phase 6-7）。

---

## ~~Phase 0：开工准备~~ ✅ 已完成 (2026-03-26)
**你会学到**：现代前端工具链是什么

> 🍽 餐厅比喻：去建材市场把工具买齐，水电煤气通上。

- [x] 安装 Node.js (LTS) + npm — Node v24.14.1 / npm 11.12.0
- [x] 确认 7 个 HTML 页面文件全部就位（第一页~第七页/code.html）— 位于 `日记前端构思及工程文件/`
- [x] React 基础概念（已完成：组件、props、state、副本思维、函数传递）

**具体到你的项目**：就像你之前用 `pip install` 装 Python 包一样，Node.js 世界用 `npm install` 装包。Vite 是打包工具（类比 Python 的 `streamlit run`，但更快更强）。

---

## ~~Phase 1：搭建 React 项目骨架~~ ✅ 已完成 (2026-03-26)
**你会学到**：React 项目的文件结构 / Vite 构建工具 / TypeScript 基础配置 / Tailwind 集成

> 🍽 餐厅比喻：把空荡荡的毛坯房装上门窗和隔断。餐厅有了大门（入口）、走廊（路由）和每个包间的门牌（页面壳），但里面还是空的。

- [x] `npm create vite@latest journal-frontend -- --template react-ts` 初始化项目
- [x] `npm install react-router-dom tailwindcss @tailwindcss/vite` 安装依赖
- [x] vite.config.ts 中引入 tailwindcss 插件
- [x] index.css 替换为 `@import "tailwindcss";`
- [x] index.html 引入 Manrope 字体 + Material Symbols 图标 + 标题改为"我的个人日记"
- [x] App.tsx 配置 4 条路由：`/diary`、`/weekly`、`/monthly`、`/ai`（根路径 `/` 自动跳转 `/diary`）
- [x] 创建 10 个页面文件（4 个容器 + 6 个子页面）：
  - Diary.tsx / DiarySchedule.tsx / DiaryJournal.tsx
  - Weekly.tsx / WeeklyReview.tsx / WeeklyText.tsx
  - Monthly.tsx / MonthlyReview.tsx / MonthlyText.tsx
  - AISage.tsx
- [x] 从 HTML 原型迁移 Tailwind 配置（47 个颜色 token + 3 个字体变量 → index.css @theme 块，Tailwind 4 方式）
- [x] 配置全局样式（glass-card、custom-scrollbar、material-symbols-outlined、scale-98-on-click → index.css 底部）
- [x] 所有 CSS 颜色 token 和全局样式均已添加中文注释，按 MD3 功能分组

**页面结构调整**（与原计划不同）：顶部导航 4 个按钮（日记/周记/月记/AI），日记/周记/月记各自内部有两个子页面，通过角落按钮 + 左右滑动切换。

**开发备注**：
- VPN 全局模式下 localhost 被拦截，启动命令改为 `npx vite --host 0.0.0.0 --port 3000`，访问 `http://127.0.0.1:3000/`
- index.html 中 Google Fonts 链接的 `"` 和 `rel` 之间必须有空格，否则报 parse5 错误

**成果验证**：`npm run dev` 跑起来，4 个路由都能访问，页面显示对应中文名称。 ✅

---

## ~~Phase 2：搭建共享组件~~ ✅ 已完成 (2026-03-26)
**你会学到**：React 组件化思维 / Props 与 TypeScript 接口 / 组件复用

> 🍽 餐厅比喻：定制统一风格的桌椅、餐具、灯具。所有包间用同一套家具，换色不换款。

- [x] MaterialIcon 图标组件 — `src/components/ui/MaterialIcon.tsx`（封装 Material Symbols，支持 filled 属性）
- [x] Card 白底卡片容器 — `src/components/ui/Card.tsx`（children 模式，统一圆角阴影边框）
- [x] TopAppBar 导航栏组件 — `src/components/layout/TopAppBar.tsx`（4 项导航，当前页蓝色高亮，字号可自定义）
- [x] PageLayout 壳组件 — `src/components/layout/PageLayout.tsx`（TopAppBar + 内容区 + BottomNavBar 打包）
- [x] EmojiRating 表情评级组件 — `src/components/ui/EmojiRating.tsx`（5 级心情，选中高亮放大，通过 onChange 回调父组件）
- [x] BottomNavBar 移动端底部导航 — `src/components/layout/BottomNavBar.tsx`（md:hidden，4 项导航+图标，选中实心高亮）

**学到的关键概念**：
- `children: React.ReactNode` — 组件可以包裹任意子内容
- `interface` — TypeScript 类型声明，定义组件接收参数的"清单"
- `=>` 箭头函数 — 在 interface 里是描述函数类型，在其他地方是创建函数
- `useLocation()` — React Router 的 Hook，获取当前 URL 路径
- `map()` — 遍历数组生成多个元素，等价于 Python 的 for...in
- 三元表达式 `? :` — 等价于 Python 的 `x if condition else y`
- 数据与 UI 分离 — 常量数组 + map 循环，改数据不用改 UI 代码

**成果验证**：4 个页面都有顶部导航栏，点击可切换页面，当前页高亮显示。 ✅

---

## ~~Phase 3：逐页转换 HTML → React（静态版）~~ ✅ 已完成 (2026-03-27)
**你会学到**：JSX 语法 / HTML 与 React 的差异 / 布局组合 / 假数据驱动 UI

> 🍽 餐厅比喻：按照设计图把每个包间装修好——贴墙纸、铺地板、摆桌椅。用模型食物拍照，确认效果满意。

- [x] 第 6 页 MonthlyText：月记文字记录展示 — `MonthlyText.tsx`（数据数组 + map 循环）
- [x] 第 4 页 WeeklyText：周记文字记录区 — `WeeklyText.tsx`
- [x] 第 2 页 Journal：量化数据输入区 + 文字反思区 — `DiaryJournal.tsx`（双栏 grid + ScrollPicker 组件）
- [x] 第 3 页 WeeklyReview：周统计卡片 + 习惯打卡表 + 目标状态 — `WeeklyReview.tsx`（mock 数据文件 + map 循环渲染）
- [x] 第 5 页 MonthlyReview：月度 Bento Grid + 习惯进度条 + 目标成就 — `MonthlyReview.tsx`（进度条内联 style）
- [x] 第 7 页 AISage：AI 对话界面 + 模型选择 + 快捷指令 — `AISage.tsx`（聊天气泡 + 条件渲染）
- [x] 第 1 页 Dashboard：三栏布局（目标卡片 | 日程表 | 日历+AI建议）— `DiarySchedule.tsx`（拆分 4 个子组件）
- [x] 3 个容器页面（Diary/Weekly/Monthly）均已添加 useState 子页面切换
- [ ] 每页转换后，在浏览器里与原始 HTML 对比，微调设计细节（待用户验收）

**新增文件清单**：
- `src/mocks/` — 3 个 mock 数据文件（weeklyReview.ts / monthlyReview.ts / diarySchedule.ts / aiSage.ts）
- `src/components/diary/` — 4 个 Dashboard 子组件（GoalCard / ScheduleTable / MiniCalendar / AIInsights）

**学到的关键概念**：
- 数据驱动 UI：常量数组 + `map()` 循环生成 JSX，替代 HTML 复制粘贴
- 组件拆分：491 行 HTML → 1 个主页面 + 4 个子组件 + 1 个 mock 数据文件
- 容器 + 子页面模式：`useState` 控制子页面切换（Phase 3 唯一的 state）
- HTML → JSX 转换规则：class→className / 自闭合标签 / style 对象 / defaultChecked
- 内联函数组件：`ScrollPicker` / `TimePicker` 在文件内定义，无需独立文件

**具体到你的项目**：这一步就是把 `第一页/code.html` 的 `<body>` 内容搬到 `Dashboard.tsx` 里。改动很少：`class` → `className`，自闭合标签加 `/>`。数据先写死（硬编码），比如日程表里的"07:00 Wake Up"直接写在代码里。

你打开浏览器，应该看到和 HTML 文件一模一样的页面。如果不一样，就是某个 class 名丢了或者标签没闭合。

**成果验证**：7 个页面视觉效果与 HTML 原型一致。`npm run build` 零 TypeScript 错误。

---

## ~~Phase 4：给页面加上交互~~ ✅ 已完成 (2026-03-27)
**你会学到**：useState 状态管理 / 事件处理 / 表单绑定 / 受控组件

> 🍽 餐厅比喻：模型食物换成真正能操作的菜单——顾客能翻页、能点菜、能按铃叫服务员。但厨房还没开工，点的菜只是记在纸上，不会真的做出来。

- [x] 日历组件：点击日期 → 高亮选中（MiniCalendar + selectedDate prop）
- [x] 心情评分：点击表情 → 高亮选中（EmojiRating 组件统一处理 4 处评分）
- [x] 睡眠/番茄钟等数字输入：input type=number / type=text 受控绑定
- [x] 任务看板：今日目标支持添加/编辑/删除（GoalCard editable 模式），周记/月记目标支持完整 CRUD + 状态切换
- [x] 时间表：Plan/Actual/Remarks 三列 inline input 可编辑（ScheduleTable）
- [x] 习惯打卡：勾选/取消勾选（WeeklyReview button toggle）
- [x] 反思文本区域：所有 textarea 受控绑定（DiaryJournal/WeeklyText/MonthlyText）
- [x] 保存按钮：Diary/Weekly/Monthly 容器层 console.log 完整 JSON 数据

**具体到你的项目**：在 Streamlit 里，你用 `st.radio` 选心情评分，Streamlit 自动帮你管理状态。在 React 里，你需要自己管理：

```tsx
const [mood, setMood] = useState(3);  // 默认心情 3 分
<EmojiRating value={mood} onChange={(val) => setMood(val)} />
```

当你点击 😊 时，`setMood(5)` 被调用，React 自动重新渲染页面显示新选择。这就是 React 的核心循环：**用户操作 → 更新 state → UI 自动更新**。

保存按钮点击后，你在浏览器按 F12 打开控制台，能看到所有填写的数据以 JSON 格式打印出来。数据已经在前端准备好了，就等后端厨房开工。

**成果验证**：所有表单能输入，state 正确更新，console.log 输出完整的数据对象。

---

## ~~Phase 5：搭建 FastAPI 后端~~ ✅ 已完成 (2026-04-04)
**你会学到**：REST API 概念 / FastAPI 框架 / 路由和请求处理 / 用 Python 写接口

> 🍽 餐厅比喻：改造厨房。厨师的手艺（core/ 模块）不变，但现在他不再自己端菜了。你给厨房装了一个"传菜窗口"（API 端点），服务员（前端）把订单递进来，厨师做好菜放到窗口。

- [ ] 初始化 FastAPI 项目：`pip install fastapi uvicorn`
- [ ] 创建第一个端点：`GET /api/diary/{date}`
  - 内部调用现有的 `data_manager.load_data_for_date(date)`
  - 把 DataFrame 转成 JSON 返回
- [ ] 配置 CORS（允许前端 localhost:5173 访问后端 localhost:8000）
- [ ] 日记 API 完整版：
  - `GET /api/diary/{date}` → 加载日记数据
  - `POST /api/diary/{date}` → 保存日记数据
  - `GET /api/diary/{date}/metadata` → 日记编号、星期
- [ ] 周记 API：
  - `GET /api/weekly/{week_key}` → 加载周记 + 聚合统计
  - `POST /api/weekly/{week_key}` → 保存周记
- [ ] 月记 API：
  - `GET /api/monthly/{month_key}` → 加载月记 + 聚合统计
  - `POST /api/monthly/{month_key}` → 保存月记
- [ ] 报告 API：
  - `POST /api/report/generate-and-send` → 生成报告 + 发送邮件

**具体到你的项目**：你现在的 `data_manager.py` 里有一个函数 `load_data_for_date(date)`，Streamlit 直接调用它获取数据。在 FastAPI 里，你写一个"端点"（endpoint）来包装它：

```python
@app.get("/api/diary/{date}")
def get_diary(date: str):
    data = data_manager.load_data_for_date(date)
    return data  # FastAPI 自动转成 JSON
```

就这么简单。**厨师的菜谱没变，只是加了一个传菜窗口。**

安装完 FastAPI 后，运行 `uvicorn main:app --reload`，浏览器打开 `localhost:8000/docs`，你会看到一个自动生成的交互式 API 文档（Swagger UI）。你可以在网页上直接点击"Try it out"测试每个端点。这是 FastAPI 最爽的功能之一。

**成果验证**：Swagger UI 上能手动测试所有端点，返回正确的 JSON 数据。

---

## ~~Phase 6：前后端联调~~ ✅ 已完成 (2026-04-04)
**你会学到**：fetch API / async/await / 自定义 React Hooks / 加载状态与错误处理

> 🍽 餐厅比喻：前厅和厨房正式联通。服务员开始真正走到传菜窗口递订单、取菜。第一次配合可能手忙脚乱，但理顺后就是行云流水。

- [ ] 创建 API 客户端模块（`src/api/client.ts`，封装 fetch 调用）
- [ ] 自定义 Hook：`useJournalData(date)` — 自动从后端加载日记数据
- [ ] 自定义 Hook：`useWeeklyData(weekKey)` — 加载周记数据
- [ ] 自定义 Hook：`useMonthlyData(monthKey)` — 加载月记数据
- [ ] 逐页替换假数据 → API 调用
- [ ] 保存按钮：`console.log` → `fetch POST` 到后端
- [ ] 加载状态 UI（数据请求中显示"加载中..."）
- [ ] 错误处理 UI（后端挂了显示友好提示）
- [ ] **跨页目标同步**：每日日程的"月目标""周目标"从 API 读取（与月记/周记是同一份数据），完成状态双向同步；"今日目标"通过 ID 关联到月/周目标，勾选完成时自动同步。Phase 4 中三个目标列表各自独立（无同步），此功能在接后端后通过唯一 ID 实现

**具体到你的项目**：之前 Dashboard 的日程数据是写死的。现在改成：

```tsx
function Dashboard() {
  const { data, loading, error } = useJournalData("2026-03-26");

  if (loading) return <p>加载中...</p>;
  if (error) return <p>出错了：{error.message}</p>;

  return <ScheduleTable rows={data.timeLog} />;
}
```

页面打开时，React 自动向 `localhost:8000/api/diary/2026-03-26` 发请求，FastAPI 调用 `data_manager` 读 CSV，返回 JSON，React 拿到数据渲染表格。**第一次看到真实数据出现在你的新前端上，会非常有成就感。**

**成果验证**：前端能读取、展示、保存真实的 CSV 数据。保存后刷新页面数据不丢失。

---

## ~~Phase 7：AI 对话集成~~ ✅ 已完成 (2026-04-04)
**你会学到**：WebSocket 或 Server-Sent Events / 流式数据处理 / 实时 UI 更新

> 🍽 餐厅比喻：这是餐厅里最高级的区域——开放式厨房吧台。厨师（AI）一边做菜一边和顾客聊天，菜一勺一勺地往外递（流式输出），不是一次端一整盘。

- [ ] FastAPI 端：WebSocket 或 SSE 端点 `/api/chat`
- [ ] 封装现有 `agent/` 模块（build_agent + tools）
- [ ] React 端：WebSocket 客户端 Hook
- [ ] 流式消息渲染（AI 的回复像打字一样一字一字出现）
- [ ] 模型切换（Gemini / Qwen / DeepSeek 下拉框）
- [ ] 快捷指令按钮（分析今天、安排明天等）
- [ ] 工具调用结果展示（AI 安排的日程实时显示在 UI 上）

**具体到你的项目**：普通的 REST API 是"一问一答"——发请求，等完整响应。但 AI 对话需要"一边想一边说"。WebSocket 就像一根持续连接的电话线，AI 生成一个字就传一个字，前端实时显示。

这是整个项目中技术难度最高的部分，但你到这一步时已经积累了足够的基础。

**成果验证**：能正常与 AI 对话，回复流式显示，工具调用正常执行。

---

## ~~Phase 8：收尾与验证~~ ✅ 已完成 (2026-04-04)
**你会学到**：端到端测试思维 / 构建优化 / 项目打包

> 🍽 餐厅比喻：试营业。邀请第一批顾客（你自己）走完整个流程，记录每个卡壳的地方，逐一修复。

- [ ] 完整流程测试：填写日记 → 保存 → 打开周记 → 聚合统计 → 月记 → AI 对话 → 发送报告
- [ ] Markdown 生成验证（保存后自动生成 .md 文件）
- [ ] `npm run build` 零错误
- [ ] 现有 103 个 pytest 测试全部通过
- [ ] 修复所有发现的 bug

---

## 技术栈总览

| 层级 | 技术 | 角色 |
|------|------|------|
| 前端框架 | React 18 + TypeScript | UI 渲染和交互 |
| 构建工具 | Vite | 开发服务器 + 打包 |
| 样式 | Tailwind CSS | 从 HTML 原型零迁移成本 |
| 路由 | react-router-dom | 7 个页面切换 |
| 后端框架 | FastAPI | REST API 服务器 |
| 业务逻辑 | 现有 core/ 模块 | 数据读写、聚合、报告生成（不用改） |
| AI 对话 | 现有 agent/ 模块 | LangChain Agent + Tools（不用改） |
| 数据存储 | CSV 文件（本地） | 与现有系统兼容 |

## 关键原则

1. **每个 Phase 独立可验证**：完成一个阶段就能看到成果，不依赖后续阶段
2. **core/ 模块不改**：只在 FastAPI 层做薄薄的包装
3. **Phase 1-4 不需要后端**：纯前端独立开发，用假数据
4. **Phase 5 不需要前端**：纯后端独立开发，用 Swagger UI 测试
5. **先能跑，再优化**：每一步先追求"能工作"，再追求"工作得漂亮"

## 源文件参考

| 文件 | 用途 |
|------|------|
| `日记前端构思/第一页~第七页/code.html` | 7 个 HTML 页面原型（转换源） |
| `日记前端构思/第一页/DESIGN.md` | 设计系统规范（颜色/字体/组件规则） |
| `core/data_manager.py` | 日记数据 CRUD（FastAPI 包装对象） |
| `core/weekly_data_manager.py` | 周记数据 CRUD（FastAPI 包装对象） |
| `core/monthly_data_manager.py` | 月记数据 CRUD（FastAPI 包装对象） |
| `agent/model_config.py` + `agent.py` + `tools.py` | AI 对话模块（FastAPI 包装对象） |

---

## 开发日志

| 时间 | 内容 |
|------|------|
| 2026-03-30 | 新增 YearlyGoalCard 共享组件（落日余晖渐变 + 玻璃拟态），支持目标级和分类级 CRUD（增删改 + 勾选）。已集成到日记-每日日程、周记-周度数据、月记-月度数据三个页面，样式和参数完全一致。涉及文件：`src/components/shared/YearlyGoalCard.tsx`（新建）、`src/mocks/diarySchedule.ts`、`src/pages/Diary.tsx`、`src/pages/DiarySchedule.tsx`、`src/pages/Weekly.tsx`、`src/pages/WeeklyReview.tsx`、`src/pages/Monthly.tsx`、`src/pages/MonthlyReview.tsx` |
| 2026-04-04 | **Phase 5：搭建 FastAPI 后端**。创建 `main.py`（CORS + 路由挂载）、`routers/`（diary/weekly/monthly/report/chat 共 5 个路由文件）、`schemas/`（Pydantic 模型）。实现 15 个 API 接口：日记 CRUD + 元数据 + 日历打点、周记 CRUD + 聚合、月记 CRUD + 聚合、报告后台任务、AI 对话 SSE + 模型列表 + 会话管理。19/19 测试全部通过。 |
| 2026-04-04 | **Phase 6：前后端联调**。创建 `src/api/client.ts`（全部 15 个接口封装）和 3 个数据 Hook（`useDiaryData` / `useWeeklyData` / `useMonthlyData`）。日记页：真实数据加载+保存+日历打点+日期切换+默认模板。周记页：数据加载+保存+◀▶周切换+习惯boolean↔emoji转换。月记页：数据加载+保存+◀▶月切换。跨页目标同步：日记页显示周/月目标，toggle 立即保存回对应 API。修复多个 bug：ScheduleTable 日期硬编码、灵感/感悟数据映射反转、空日期无模板、任务文字方括号格式、MiniCalendar 假数据等。周记关键指标接入真实聚合数据，月记统计卡片+习惯追踪从周记聚合。文字记录卡片标题中文化+placeholder。每日/每周事项记录持久化（weekly_summary 加 Record_Mon~Sun、monthly_summary 加 Record_Week1~5）。 |
| 2026-04-04 | **Phase 7：AI 对话集成**。创建 `src/hooks/useChat.ts`（SSE 流解析 + 会话管理）。重写 `AISage.tsx`：真实模型列表从 API 加载、SSE 流式输出逐字显示、4 个快捷指令（分析今天/安排明天/发送周报/本周习惯）、模型切换自动清空对话、新建对话、Enter 发送、自动滚动、加载/错误状态。修复 Gemini content 为 list 格式导致不显示的 bug。 |
| 2026-04-04 | **Phase 8：收尾验证**。103 个 pytest 测试全部通过。`npm run build` 零错误。创建一键启动脚本 `启动日记系统(React版).bat`。编写 `线上部署TODO.md` 部署计划。 |
