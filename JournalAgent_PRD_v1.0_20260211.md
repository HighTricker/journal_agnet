# 2026年2月10日20点44分
1.后端编程语言用python，网页展示用streamlit，最终是生成一个可以供下载的markdown文本。
2.可以链接api调用天气和所在地信息。
3.可以链接api自动上传谷歌云盘或者百度网盘。
4.在网页写日记的时候可以自动保存，不会因为误触关掉而把之前写的内容都删除了。
# 2026年2月17日13点24分
今日开发安排：
1.先加入文字输入框。完成
2.调整样式和颜色。完成
3.看看如何处理时间表格。
4.自动写入日期、时间，计算睡眠时间按钮。
5.写函数写成文件。
6.试用一下。

# 2026年2月18日18点10分
项目开发文档：AI 增强型个人量化日记系统
Project Specification: AI-Enhanced Personal Quantified Diary

版本：V1.1 (Updated with Sidebar Navigation)
日期：2026-02-18
开发者：Kingsley (User) & Gemini (Assistant)

1. 项目愿景 (Project Vision)
构建一个 本地优先 (Local-First) 的个人管理系统。通过 Streamlit 界面进行每日的 任务管理、时间颗粒度记录 和 日记反思。
核心目标是解决 “晚间复盘盲区”（无法记录当晚数据）的问题，并实现数据结构化存储以便于 AI 后期分析，同时生成人类可读的 Markdown 文件作为永久存档。

2. 核心架构 (System Architecture)
2.1 设计原则
读写分离：

存储层 (Storage)：使用追加式 CSV 文件作为数据库，累积历史数据。

展示层 (Presentation)：每日生成独立的 .md 文件，作为日记成品。

以日期为轴：系统界面以“日期”为核心上下文，所有数据的增删改查均基于当前选定的日期。

2.2 目录结构 (Directory Structure)
3. 数据模型设计 (Data Schema)
所有表均以 Date (YYYY-MM-DD) 作为主键/外键进行关联。

表 1：任务流水表 (data/tasks_log.csv)
用途：记录每日待办事项及完成情况。

核心字段：Date, Task_Name (事项), Status (✅/❌/Wait), Reason (原因分析).

表 2：时间切片表 (data/time_log.csv)
用途：记录全天 48 个 30 分钟时间块的实际执行情况。

核心字段：Date, Time_Slot (00:00-00:30...), Plan (计划), Actual (实际), Status (✅/❌), Note (备注).

表 3：每日概览表 (data/daily_summary.csv)
用途：记录当天的元数据和长文本日记。

核心字段：Date, Mood_Score (1-5), Diary_Content (Markdown 文本), Weather, Sleep_Hours.

4. 交互与功能模块 (Interaction & Modules)
模块 A：侧边栏日期导航 (Sidebar Navigation) —— [核心更新]
组件：st.sidebar.radio 或 st.sidebar.selectbox。

选项逻辑：动态生成包含以下内容的列表：

明天 (2026-02-19) —— 用于规划

今天 (2026-02-18) —— 用于执行

昨天 (2026-02-17) —— 用于补录

... (过去 6 天的日期)

交互行为：

用户点击某个日期 -> 主界面立即刷新。

后台从 CSV 中读取该 特定日期 的数据填充到编辑器中。

若选择“明天”且 CSV 中无数据，自动创建空模板。

模块 B：主界面工作流 (Main Workflow)
主界面根据侧边栏选定的日期，展示以下三个区域：

1. 任务看板 (Task Dashboard)
功能：使用 st.data_editor 展示当日任务。

逻辑：

支持动态添加行。

坏习惯检测：若“原因”列包含关键词（如“游戏”、“拖宕”），UI 弹出警告。

2. 时间切片管理 (Time Slicing)
功能：使用 st.data_editor 展示当日 48 个时间块。

逻辑：

锁定时间列：防止误改时间段。

统计：实时计算当日“有效时间块”数量。

3. 日记撰写 (Journaling)
功能：Markdown 文本输入框。

逻辑：包含心情评分组件，支持长文本输入。

模块 C：数据持久化 (Data Persistence)
1. 实时保存 (Save to CSV)
触发：用户点击主界面的“💾 保存数据”按钮。

逻辑：

获取当前界面上的所有数据（任务、时间、文本）。

以 Upsert (更新或插入) 模式写入 data/ 目录下的 3 个 CSV 文件。

注意：确保覆盖该日期的旧数据，而不是无限追加。

2. 归档生成 (Generate Markdown)
触发：保存成功后自动触发，或单独按钮触发。

逻辑：

读取当日所有数据。

格式化为 Markdown 表格和文本。

生成/覆盖 diary_output/YYYY-MM-DD.md 文件。

5. 待合并代码清单 (Integration Checklist)
请准备发送你的代码，我们将进行以下合并：

UI 框架：采用你现有的 Streamlit 界面风格，但将导航改为 侧边栏日期列表。

数据层：废弃直接读写 MD 的逻辑，替换为 CSV 读写函数。

功能层：植入 坏习惯检测算法 和 时间统计算法。

补录逻辑：确保选择“昨天”时，能正确加载昨日数据供修改。

# 2026年2月19日09点01分
1.修复csv文件中文乱码问题。
2.生成的markdown文件应该按照我的样本来。我的需求是把streamlit的输入内容（Input）直接填充到我的样本markdown里面。
这两个都完成了

# 2026年2月19日09点38分
1.没有日程安排的时候写入日期，并写入日程安排。
2.静坐情况没有前端。
3.修复前端输入框提示词。
