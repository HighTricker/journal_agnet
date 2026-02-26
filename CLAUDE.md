# Journal Agent - 量化日记系统

## 项目愿景
这是一个面向商业化的 AI 增强型个人量化日记系统。
构建一个 本地优先 (Local-First) 的个人管理系统。通过 Streamlit 界面进行每日的 任务管理、时间颗粒度记录 和 日记反思。
核心目标是解决 “晚间复盘盲区”（无法记录当晚数据）的问题，并实现数据结构化存储以便于 AI 后期分析，同时生成人类可读的 Markdown 文件作为永久存档。
当前阶段：完善核心功能，确保稳定性和用户体验。
最终目标：发展为可商业化的产品/SaaS 服务。

## 技术栈
- 语言：Python 3.x
- Web 框架：Streamlit
- 数据处理：Pandas
- 数据存储：CSV（原始数据）+ Markdown（成品输出）
- 启动方式：`streamlit run diary.py`
- 数据路径：通过环境变量 `JOURNAL_BASE_DIR` 配置，默认 `./journal_data/`
- 依赖管理：`pip install -r requirements.txt`
- 测试：`python -m pytest tests/ -v`（当前 72 个测试）
- 仓库：https://github.com/HighTricker/journal_agnet

## 项目结构
```
journal_agnet/
├── diary.py                  # 日记主页面（日历导航 + 量化数据 + 目标展示 + 任务看板 + 反思）
├── pages/                    # Streamlit 多页面
│   ├── 1_周记.py             # 周记页面（习惯追踪 + 周任务 + 周反思）
│   └── 2_月记.py             # 月记页面（月任务 + 月反思 + 数据聚合）
├── core/                     # 所有业务模块
│   ├── __init__.py
│   ├── config.py             # 路径配置，基础目录定义
│   ├── data_manager.py       # 日记数据处理，CSV 读写和 Markdown 生成
│   ├── texts.py              # 日记 UI 文案、评分定义、坏习惯关键词库
│   ├── template.py           # 日程模板，48 个时间段的默认安排
│   ├── md_template.py        # 日记 Markdown 模板生成器
│   ├── weekly_texts.py       # 周记文案、习惯列表、任务分类、反思区块定义
│   ├── weekly_data_manager.py # 周记数据处理：周信息计算、日数据聚合、CSV 读写
│   ├── weekly_md_template.py # 周记 Markdown 模板生成器
│   ├── monthly_texts.py      # 月记文案、任务分类、反思区块定义
│   ├── monthly_data_manager.py # 月记数据处理：月信息计算、月数据聚合、CSV 读写
│   └── monthly_md_template.py # 月记 Markdown 模板生成器
├── assets/
│   └── styles.css            # Streamlit 自定义样式（日历紧凑化 + 目标卡片等）
├── tests/                    # 测试目录（72 个测试：日记26 + 周记20 + 月记26）
│   ├── test_core.py          # 日记核心功能测试
│   ├── test_weekly.py        # 周记功能测试
│   └── test_monthly.py       # 月记功能测试
├── docs/                     # 项目文档 + Markdown 模板样例
├── CLAUDE.md
├── TODO.md
├── .gitignore
└── requirements.txt
```

## 核心功能模块

### 模块 A：侧边栏月历导航（diary.py）
- 月历网格：`calendar` 模块 + `st.columns(7)`，周日为首列
- 月份切换：◀▶ 按钮切换月份，"回到今天"快捷按钮
- ⊙今天标记 + primary 按钮高亮选中日期
- 只显示本月日期，非本月位置留空白
- session_state 管理：`selected_date`, `cal_year`, `cal_month`
- 日记编号系统：以 2026-02-18 = No.1100 为锚点，按日期差值递推

### 模块 B：主界面工作流（diary.py，从上到下）

**1. 元数据**：编号 / 日期 / 星期 / 天气 / 所在地

**2. 量化数据**：心情评分(1-5)、睡眠评分(1-5)+入睡/起床时间+自动计算时长、番茄钟、静坐分钟、AI 使用时间、打飞机计数、睡眠状况/梦境

**3. 周/月目标展示区**（只读）
- 位于量化数据和任务看板之间，`st.columns(2)` 左右双栏
- 左栏：当前周目标（从周记 CSV 加载），右栏：当前月目标（从月记 CSV 加载）
- 按分类分组，显示状态 emoji（✅/❌/⚠️），无数据时显示友好提示
- 辅助函数 `_render_goals()` 过滤空行 → 按分类分组 → 渲染 Markdown

**4. 任务看板（Tab: 任务清单）**
- `st.data_editor` 可编辑表格，支持动态增删行
- 状态列：✅ / ❌ / ⚠️ 三态选择
- 坏习惯检测：扫描"原因"列，匹配 `texts.py` 中的关键词库后弹出告警
- 空任务保护：无任务时自动插入"此日未作安排"占位行

**5. 时间切片管理（Tab: 30分钟时间流）**
- 48 个半小时时间块（00:00-24:00），计划 vs 实际对比
- 时间段列锁定（`disabled=True`），防止误改
- 自动完成：`template.py` 中标记的固定任务（如睡眠）自动填充 ✅

**6. 结构化反思**：10 个反思维度，定义在 `texts.py` 的 `REFLECTIONS_MAP` 中

### 模块 C：周记（pages/1_周记.py）
- 三表设计：weekly_summary / weekly_habits / weekly_tasks（主键：Week，格式 "2026-W09"）
- 周定义：ISO 周编号（isocalendar），周一~周日
- 数据聚合：从 daily_summary 自动计算心情/睡眠/番茄钟等统计
- 习惯追踪：6 个默认习惯 + 动态增删行，按周一~周日打卡
- 任务分类：工作、运动、读书/学习、生活事务
- 7 个反思区块

### 模块 D：月记（pages/2_月记.py）
- 二表设计：monthly_summary / monthly_tasks（主键：Month，格式 "2026-03"）
- 月定义：自然月（1日~月末），`calendar.monthrange` 计算末日
- 数据聚合：从 daily_summary 计算统计 + 不打飞机天数
- 任务分类：工作/学习、运动/健康、个人成长、生活事务
- 10 个反思区块（比周记多认知升级、阅读、学习成果）

### 模块 E：数据持久化
- **保存触发**：用户点击"💾 保存并生成日记"按钮（日记/周记/月记各自独立）
- **CSV 写入**：Upsert 模式（覆盖同主键旧数据，不重复追加）
- **Markdown 生成**：保存后自动调用对应模板生成 `.md` 成品
- **存储路径**：CSV 按年度分表存于 `BASE_DIR/data/`，Markdown 按月归档存于 `BASE_DIR/MM月/`

## 数据架构
- **日记三表**：tasks_log（任务）、time_log（时间切片）、daily_summary（每日概览），主键 Date (YYYY-MM-DD)
- **周记三表**：weekly_summary、weekly_habits、weekly_tasks，主键 Week (2026-W09)
- **月记二表**：monthly_summary、monthly_tasks，主键 Month (2026-03)
- 存储路径基于 `config.py` 中的 BASE_DIR，按年度分表、按月份归档
- 日记 → 周记 → 月记的数据聚合链：日记原始数据自动汇总到周/月统计

## 会话风格

### 角色定位：导师式协作
- 解释每个技术决策背后的**原因和权衡**，不只是给代码
- 遇到新技术概念时**主动教学**，帮助提升编程能力
- 从**产品和架构角度**分析问题，培养系统思维
- 主动分享**行业最佳实践**和常见陷阱

### 沟通规则
- 始终使用中文回答
- 回答时要有自己的独立思考，不只是执行指令
- 小改动直接执行，大改动或涉及架构的先讨论再动手
- 提出建议时说明利弊，但尊重用户最终决策

## 代码规范
- 变量名、函数名使用英文（snake_case）
- 注释、文档、commit message 使用中文
- 新增核心功能必须附带单元测试
- 遵循现有代码风格，保持一致性
- 不做未被要求的重构或优化

## 开发原则
- **本地优先**：所有数据存储在本地，隐私安全第一
- **读写分离**：CSV 存原始数据，Markdown 为最终展示层
- **以日期为轴**：所有数据操作围绕日期展开
- **Upsert 模式**：更新时覆盖同日期数据，不重复追加
- **商业化意识**：代码质量、可维护性、可扩展性要为未来做准备

## 当前阶段重点
- 完善现有核心功能的稳定性
- 修复已知 bug，优化用户体验
- 不急于加新功能，先把基础打扎实
