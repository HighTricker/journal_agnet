# TODO

## Bug（全部已修复 ✅）
1. ~~当我打开这个项目后，任务清单的"Date"列没有自动写入当日的日期。(2026-02-26)~~ ✅ 已修复：Date 列保留显示，disabled + default 自动填充
2. ~~当我输入多个任务清单后，点击保存，再次打开这个项目，只会保存一个，有时候是第一个，有时候是第二个。(2026-02-26)~~ ✅ 已修复：reset_index(drop=True) 解决 index 重复 + 修复 CSV 数据格式
3. ~~当我上午打开日记，写入目标安排后，我保存。之后我再打开，所有的输入框内容都会自动写入"nan"。(2026-02-26)~~ ✅ 已修复：加载时 NaN 清理为空字符串，保存时 fillna 防止写入
4. ~~每日日程的日程安排界面，右侧的日期是写死的10月24日 星期三，这个应该和日历日期一致（2026-04-04T12:20:09）~~ ✅ React 迁移期间已修复：`ScheduleTable.tsx:15` dateLabel 由 `Diary.tsx:247-253` 动态生成；硬编码仅残留在死代码 `mocks/_translation_map.ts`
5. ~~生活记录页面，灵感与启发和感悟与思考的读数据读错了，两个相反了。（2026-04-04T12:21:41）~~ ✅ React 迁移期间已修复：`useDiaryData.ts:195-197` 读写映射一致（灵感与启发 ↔ Reflect_Thoughts，感悟与思考 ↔ Reflect_Deep_Reflections）
6. ~~生活记录页面的文字记录部分的六个卡片标题我想全部改成中文，请告诉我在哪里改？（2026-04-04T12:22:44）~~ ✅ React 迁移期间已修复：`DiaryJournal.tsx:26-34` 的 `DAILY_TEXT_RECORDS` 全部为中文（AI使用情况 / AI学习情况 / 读书感受 / 静坐感受 / 做得好的动作 / 需改进的动作 / 给自己的话）

## 功能需求
1. ~~我希望当我增加任务清单里面的任务的时候，第一列的数字和"Date"列能自动填充。(2026-02-26)~~ ✅ 已随 Bug 1 一并修复
2. ~~在睡眠分数的下面，加入一个新的输入框，标题是"睡眠状况/梦境"。(2026-02-26)~~ ✅ 已完成：输入框放在睡眠区域，数据存入 Reflect_Sleep_Dreams 写入 Markdown
3. ~~我希望左侧的时间胶囊不再只是展示7天的内容，我希望这像一个真正的日历，第一行展示"周日、周一、周二、周三、周四、周五、周六"，下面的日期则自动对应分行写入，一行争取表示一周。每次展示一个月的。设置一个按钮，让我可以切换上个月和下个月。(2026-02-26)~~ ✅ 已完成：月历网格 + ◀▶切换月份 + 只显示本月日期
4. ~~当我点击时间胶囊或者说叫时间日历里面的日期后，会自动展示当天的日记，如果是第二天的，则自动进入第二天日记的填写。(2026-02-26)~~ ✅ 已完成：点击日期跳转 + session_state 驱动数据加载
5. ~~加入"周记"，"月记"功能。我每周都会设定目标，总结日程，我希望这个可以在左侧栏目显示，同样是markdown和csv数据记录。月记也是一样。我想我会单独设计一个streamlt前端，同样有分别对应周记和月记的markdown模板，写入对应内容。(2026-02-26)~~ ✅ 已完成：5a 周记 + 5b 月记
6. ~~当有了周记和月记后，我希望在每日目标上面有一个滚动区域，周记和月记的目标滚动显示在这里。像股票交易大厅里面左右滚动显示股票信息一样。(2026-02-26)~~ ✅ 已完成：日记页量化数据下方双栏展示周/月目标
7. ~~发送行为建议报告：侧边栏按钮一键收集 CSV 数据 → Gemini API 分析 → 邮件发送报告。(2026-02-28)~~ ✅ 已完成：report_config + report_data_collector + report_service + 23 个测试
8. ~~加载个人上下文 kingsley_context.md 作为提示词一部分发送给 Gemini，让 AI 结合个人目标给出更精准建议。(2026-03-03)~~ ✅ 已完成：report_config 新增路径常量 + 模板新增 personal_context 占位符 + report_data_collector 新增 load_personal_context()
9. ~~结构化邮件格式：专业 HTML 模板（头部横幅 + 分节卡片 + 页脚）+ 邮件标题加日期。(2026-03-03)~~ ✅ 已完成：重写 _markdown_to_simple_html() + 邮件 Subject 带日期
10. ~~AI 导师页面添加模型选择下拉框 + system prompt 数据访问指南。(2026-03-07)~~ ✅ 已完成：model_config.py 模型注册表 + build_agent 工厂函数 + 侧边栏下拉框切换 + system prompt 动态注入日期 + period 格式规范
11. ~~Qwen 模型工具调用可靠性调试：文件目录识别问题，Gemini 正常但 Qwen 不稳定。(2026-03-07)~~ ✅ 已增强：`prompts/system_prompt.md` 加「工具调用健壮性要求」章节（必先读取/参数严格/错误重试/写入前确认）；`agent/tools.py` 工具 docstring 全部中文化 + 加用法示例。后续观察实际调用率
12. ~~添加 DeepSeek 模型到 AI 导师下拉框 + 修复 Gemini env_key 命名不一致。(2026-03-08)~~ ✅ 已完成：model_config.py 新增 DeepSeek 注册 + Gemini env_key 改为 GOOGLE_API_KEY + requirements.txt 添加 langchain-deepseek
13. ~~修复邮件页脚 "Powered by Gemini" 硬编码，改为动态显示当前模型名称。(2026-03-08)~~ ✅ 已完成：report_service 加 powered_by 参数 + Agent send_email 工具传入 model_name
14. ~~修复 generate_schedule 工具时间格式不规范，改为生成完整48行标准时间段 + Upsert 模式。(2026-03-08)~~ ✅ 已完成：_normalize_time_slot 规范化 + 复用 get_default_time_schedule 模板 + Upsert 写入
15. ~~修复 Streamlit 前端时间表不展示 Date 列，恢复日期列显示在最左侧。(2026-03-08)~~ ✅ 已完成：data_manager 不再 drop Date 列 + diary.py column_config 添加 Date 列
16. ~~新增 add_task 工具，解析 "HH:MM-HH:MM - 任务内容" 格式写入 tasks_log CSV。(2026-03-08)~~ ✅ 已完成：agent/tools.py 新增 add_task + agent.py 注册工具
17. ~~修复 add_task 写入带 Markdown checkbox 前缀（- [ ]）的问题。(2026-03-08)~~ ✅ 已完成：_strip_markdown_prefix 清理 checkbox/bullet/编号前缀
18. ~~修复 generate_schedule 写入带 ,✅, 状态标记的问题 + system prompt 新增工具格式规范。(2026-03-08)~~ ✅ 已完成：_clean_plan_text 分离计划/状态/备注 + system_prompt.md 新增工具调用格式规范
19. ~~修复模型身份认知错误：选 DeepSeek 却自称 Gemini + 邮件页脚始终显示 Gemini。(2026-03-08)~~ ✅ 已完成：system prompt 注入 {model_name} + send_email 自动使用当前模型名
20. ~~周记页面的"本周的所思所想"部分的输入框高度调整为400px。(2026-03-08)~~ ✅ 已完成：weekly_texts.py Thoughts 增加 height 字段 + 周记.py 循环读取 meta.get("height", 120)
21. ~~支持 Ctrl+点击在新标签页打开日记/页面导航。(2026-03-08)~~ ✅ 已完成：日记月历 st.button→st.link_button + URL参数传日期 + 周记侧边栏日期改HTML链接 + 自定义导航替换Streamlit默认导航
22. ~~我希望大模型在回答我的问题时，尤其是安排日程和时间表两个问题上，安排日程的部分只说当日目标，要细化一些，类似于读书读到多少页，程序写多少行，写到什么效果。时间表上，事实上我只希望大模型填空，填写我在这一天没有预制好的时间段里面的任务，每30分钟一个，而不是重写我整个日程表。（2026-03-09T11:10:32）~~ ✅ 已完成（方案 B）：`agent/tools.py` 的 `generate_schedule` 重写——读取该日期已有时间表（CSV 或默认模板），只填**真正空白**的 slot，已有内容的 slot 绝对不覆盖。`system_prompt.md` 加「日目标细化规范」章节（必须可量化、可验收：读 X 页 / 写 X 行 / 等具体效果）
23. ~~接入Xai的api，在ai导师部分下拉框加入Xai选项。我会在.env配置好api，我会安装好基础框架。（2026-03-09T11:21:17）~~ ✅ 已完成：`agent/model_config.py` 注册 Xai（provider=openai 兼容模式，base_url=https://api.x.ai/v1，model=grok-4）+ `.env.example` 加 XAI_API_KEY
24. ~~每日日程安排，无论是哪一个表格，我都希望它能够批量进行填写。像 Excel 那样的：
直接多选，然后写一个直接进去或者连续复制。（2026-04-04T19:32:49）~~ ✅ 已完成：`ScheduleTable.tsx` 重写为 Excel 体验——单击选中、Shift+Click / 鼠标拖选范围选、双击编辑、Ctrl+C 复制（剪贴板含 tab/换行可粘到 Excel）、Ctrl+V 粘贴、Ctrl+D 向下填充、Delete 清空、Esc 取消选区
25. ~~还是日程安排这一部分，我希望当我的预期和实际不一样的时候，这一格能变成别的颜色。如果一致的话就没有颜色，如果不一致就是红色。（2026-04-04T19:34:38）~~ ✅ 已完成：`ScheduleTable.tsx` 检测 plan 和 actual 都非空且不同 → "计划"和"实际"两个单元格变红色（bg-red-50）
26. ~~生活记录页面添加"打飞机次数"量化卡片，步长1，从0开始，样式与其他卡片一致。（2026-04-05）~~ ✅ 已完成：METRIC_CARDS 增加 fap 卡片 + useDiaryData 绑定 Masturbation_Count 读写
27. ~~日历 Ctrl+点击日期在新标签页打开对应日期日记。（2026-04-05）~~ ✅ 已完成：MiniCalendar button→a 标签 + Diary.tsx URL ?date= 双向同步
28. ~~顶部导航栏添加横向周日历（WeekStrip），全局可用，与 MiniCalendar 联动。（2026-04-05）~~ ✅ 已完成：WeekStrip 组件（月份滚轮切换 + 周切换 + datechange 事件联动）+ TopAppBar 嵌入
29. ~~月记和周记的每周、每天干什么了，用agent来写。（2026-04-06T11:57:15）~~ ✅ 已完成：`agent/tools.py` 新增 `write_weekly_daily_records`（写 weekly_summary 的 Record_Mon~Sun）+ `write_monthly_weekly_records`（写 monthly_summary 的 Record_Week1~Week5）；`agent/agent.py` 注册新工具；`system_prompt.md` 加「周/月记总结生成流程」章节。在 AI 导师页对话「帮我写本周每天干什么」即可触发，写入自动同步到周/月记页面
30. ~~周记和月记的评分表情反了，开心代表了1分，实际上应该是相反才对。（2026-04-06T11:57:34）~~ ✅ 已完成（仅 UI 反转，不迁移历史数据）：`EmojiRating.tsx` 默认 options 反转为 1=极差 → 5=超赞；日记自身的 6 档 MOOD_OPTIONS 未动；已生成 `weekly_summary_2026.csv.bak.before-emoji-reverse` 备份留作未来迁移之用
31. ~~月记的习惯追踪和本月心情，数据统计这部分，我要单独写一个逻辑。（2026-04-06T12:38:02）~~ ✅ 已完成（方案 A 自动反馈）：`core/weekly_data_manager.py` 新增 `apply_auto_habits`：基于 daily_summary 自动判定 4 个习惯打卡 — 早起（Sleep_Waketime<06:00）/ 专注（Focus_Count≥4）/ 不打飞机（Masturbation_Count==0）/ 按时睡觉（18:00≤Sleep_Bedtime<22:30）；只填空格子，用户手填 ✅/❌ 一律保留；`routers/weekly.py` GET 接口已接入，月记习惯通过周记 CSV 间接受益
32. ~~月目标和周目标这里，我想复刻年度目标那样的样式，换不同的颜色，位置也换一下。现在这个版本感觉不好看，分类也不明晰。~~ ✅ 已完成：与需求 33 合并实现
33. ~~每日日记里面的月目标，周目标都放在年度目标的卡片里面。不同阶段用不同的颜色，设置一个按钮来实现PPT里面的翻页效果。原来侧边栏的月、周目标卡片删除，提升日目标卡片高度。（2026-04-06T12:44:47）~~ ✅ 已完成：新建 `GoalsCarousel`（年/月/周三 tab + 三色渐变 + ◀▶翻页按钮 + 内容区固定 400px min-height），替换原 `YearlyGoalCard`；`DiarySchedule.tsx` 删除侧栏月/周 GoalCard，今日目标卡高度提到 814px；`GoalCard` 新增 `heightClass` 可选 prop。**补强**：月/周 tab 改为 6 大固定分类网格（健康/财富/智慧/幸福/关系/旅行 + 未分类兜底），支持新增/删除/编辑/拖拽换分类，分类字段写入 `weekly_tasks.分类` / `monthly_tasks.分类` 字段持久化
34. ~~当我切换日记周记月记的时候，浏览器标签栏对应调整，格式为[日记]-[日记具体栏目]。（2026-04-06T13:20:57）~~ ✅ 已完成：新建 `hooks/useDocumentTitle.ts`，日记/周记/月记/AI 四个 page 都调用（动态拼当前 Tab 标题）
35. ~~每个栏目下面的数据/文字切换，放到顶部导航栏。（2026-04-06T13:21:22）~~ ✅ 已完成：新建 `hooks/usePageActions.tsx`（Context + Provider）；TopAppBar 中间显示子 Tab + 状态文字；Diary/Weekly/Monthly 用 useEffect 注册 sub-tabs 到 Context，移除内部 Tab 按钮
36. ~~睡眠卡片下面加入文本输入框，标题"睡眠情况"，placeholder"回忆睡眠情况，有无起夜，有无做梦，梦是什么？"（2026-04-06T19:24:09）~~ ✅ 已完成：`DiaryJournal.tsx` 睡眠 section 在睡眠质量下加 textarea，绑定 `textRecords['sleep_dreams']`（Reflect_Sleep_Dreams 字段已存在）
37. ~~每日日程的输入框放大，最好变成卡片式，可以像excel那样直接下拉以便复制。（2026-04-07T08:51:39）~~ ✅ 已完成：与需求 24 合并实现，单元格采用 click→select / dblclick→edit 的 Excel 范式
38. ~~保存日记/周记/月记按钮放在顶部导航栏（2026-04-08T19:11:09）~~ ✅ 已完成：TopAppBar 右侧（WeekStrip 后）显示保存按钮；Diary/Weekly/Monthly 通过 `usePageActions` Context 注册 `onSave` handler，删除浮动 `SaveButton`
## 已完成
- Bug 1/2/3 + 功能需求 1：修复多任务丢失、Date自动填充、NaN显示、列表包裹等核心bug (2026-02-26)
- 额外修复：CSV 数据格式统一（编码、日期格式、整行引号）、column_config 补全防止值被包成 list (2026-02-26)
- 功能需求 2：新增"睡眠状况/梦境"输入框，放在睡眠评分区域下方 (2026-02-26)
- 功能需求 3+4：侧边栏月历视图 + 点击日期跳转，只显示本月日期 (2026-02-26)
- 功能需求 5：周记功能（5a）+ 月记功能（5b），独立页面 + 三/二表设计 + Markdown 模板 (2026-02-26)
- 功能需求 6：日记页顶部展示周/月目标，双栏布局按分类分组显示状态 (2026-02-26)
- GitHub 公开仓库准备：移除硬编码路径、环境变量化 config、补充 .gitignore/README/requirements.txt (2026-02-26)
- 功能需求 7：AI 行为建议报告（Gemini API + 163 邮箱发送），含 23 个单元测试 (2026-02-28)
- 功能需求 8+9：个人上下文提示词 + 结构化邮件格式，新增 8 个测试（共 103 个）(2026-03-03)
- 功能需求 10：AI 导师多模型切换（Gemini + Qwen）+ system prompt 数据访问指南 + 动态日期注入 (2026-03-07)
- 功能需求 12：添加 DeepSeek 模型支持 + 修复 Gemini env_key 为 GOOGLE_API_KEY (2026-03-08)
- 需求 13-16：邮件页脚动态模型名 + generate_schedule 重写 + 时间表 Date 列恢复 + add_task 工具 (2026-03-08)
- 需求 17-18：add_task 清理 Markdown 前缀 + generate_schedule 分离状态标记 + system prompt 格式规范 (2026-03-08)
- 需求 19：修复模型身份认知 + 邮件页脚自动跟随当前模型（system prompt 注入 model_name + tools 全局变量）(2026-03-08)
- 需求 20-21：周记"所思所想"输入框调高(400px) + Ctrl+点击新标签页支持（日记月历link_button + 周记日期链接 + 自定义侧边栏导航）(2026-03-08)
- 需求 26-28：打飞机次数卡片 + 日历Ctrl+点击新标签页 + 顶栏WeekStrip周日历（全局联动）(2026-04-05)
- 需求 11+22+23+29+36 + Bug 4-6：Agent 改造（generate_schedule 只填空白 / 周月记 AI 写入工具 / Qwen 工具调用健壮性） + 接入 Xai Grok 4 + 睡眠情况输入框 + 历史 bug 调研确认已修 (2026-05-14)
- 需求 32-35+38：全局布局重构（GoalsCarousel 年/月/周三 tab 含 6 大分类拖拽 / useDocumentTitle / usePageActions Context / TopAppBar 整合子 Tab 与 Save / 删除浮动 SaveButton）(2026-05-14)
- 需求 24-25+30-31+37：日程表 Excel 化（多选 / Ctrl+CVD / Delete / 不一致变红 / 单一编辑框） + EmojiRating UI 反转 + 4 习惯自动从日记打卡 (2026-05-14)
- Bug 修复：周/月记保存 422 静默失败（pydantic schema 加 model_validator 把空字符串转 None）(2026-05-14)
