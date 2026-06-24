# Bug 记录

> 专门记录 **Bug**（功能需求见 `功能需求.md`）。
> 工作流：报 bug **先记录、暂不修复**——在 `## Bug（待修）` 追加带编号的条目（现象 + 日期 + 根因结论 + 建议方向），是否修复由用户单独决定；修复后移到 `## 已修复`，用 `~~删除线~~ + ✅ 已修复：说明`。

## Bug（待修）
暂无 ✅

## 已修复
1. ~~当我打开这个项目后，任务清单的"Date"列没有自动写入当日的日期。(2026-02-26)~~ ✅ 已修复：Date 列保留显示，disabled + default 自动填充
2. ~~当我输入多个任务清单后，点击保存，再次打开这个项目，只会保存一个，有时候是第一个，有时候是第二个。(2026-02-26)~~ ✅ 已修复：reset_index(drop=True) 解决 index 重复 + 修复 CSV 数据格式
3. ~~当我上午打开日记，写入目标安排后，我保存。之后我再打开，所有的输入框内容都会自动写入"nan"。(2026-02-26)~~ ✅ 已修复：加载时 NaN 清理为空字符串，保存时 fillna 防止写入
4. ~~每日日程的日程安排界面，右侧的日期是写死的10月24日 星期三，这个应该和日历日期一致（2026-04-04T12:20:09）~~ ✅ React 迁移期间已修复：`ScheduleTable.tsx:15` dateLabel 由 `Diary.tsx:247-253` 动态生成；硬编码仅残留在死代码 `mocks/_translation_map.ts`
5. ~~生活记录页面，灵感与启发和感悟与思考的读数据读错了，两个相反了。（2026-04-04T12:21:41）~~ ✅ React 迁移期间已修复：`useDiaryData.ts:195-197` 读写映射一致（灵感与启发 ↔ Reflect_Thoughts，感悟与思考 ↔ Reflect_Deep_Reflections）
6. ~~生活记录页面的文字记录部分的六个卡片标题我想全部改成中文，请告诉我在哪里改？（2026-04-04T12:22:44）~~ ✅ React 迁移期间已修复：`DiaryJournal.tsx:26-34` 的 `DAILY_TEXT_RECORDS` 全部为中文（AI使用情况 / AI学习情况 / 读书感受 / 静坐感受 / 做得好的动作 / 需改进的动作 / 给自己的话）
7. ~~保存日记成功后，无法再修改「生活记录」「时间段」「生活量化数据」等所有输入框——鼠标能点进输入框、光标也在闪，但键盘敲字无反应；必须完全关闭程序重新打开才能恢复编辑。周记/月记同一保存模式存在同样隐患。(2026-05-21)~~ ✅ 已修复（2026-05-23）：分三轮才真正让用户能用上，过程见下方
   - **根因**（2026-05-21 已分析）：非 React 状态 bug，是 Electron 原生 `alert()` 对话框抢占键盘焦点。保存末尾调用 `alert('日记保存成功！')`（`useDiaryData.ts:284`），在 Electron 中这是操作系统原生模态对话框；Windows + Electron 已知缺陷——原生对话框关闭后键盘焦点未正确交还给 WebContents，`<input>` 收不到键盘事件，只有重启程序才恢复。
   - **排除 React 的依据**：输入框为受控组件，保存后 state / setter / 组件树均完好，且无 disabled / readOnly / 遮罩层；顶栏导航走 `window.location.href` 整页跳转（等价于同窗口内重新挂载 React）仍修不好——证明问题在窗口 / WebContents 原生层级。
   - **第 1 轮修复**：新建 `journal-frontend/src/hooks/useToast.tsx` ToastProvider（最多 3 条堆叠 / 1s 内同 message+type 去重 / success 2.5s · warning 4s · error 6s 自动消失，严格复刻 `usePageActions.tsx:41-44` 的 useMemo+useCallback 模式防重渲染雪崩）+ `components/ui/Toast.tsx` 视图组件（顶部居中），`App.tsx` 包裹 ToastProvider，4 个 hook（useDiaryData / useWeeklyData / useMonthlyData / useCrossPageGoals）中 **10 处 `alert()` 全部替换为 `showToast()`**，根除 Electron 原生模态对话框来源。
   - **第 2 轮修复**：用户反馈"保存后点输入框要点两下才出光标"——发现 Toast 整张 `pointer-events: auto` + `onClick={dismiss}` 拦截了下层 input 的点击（第一下被 toast 吃掉关闭 toast，第二下才落到 input）。改为整张 `pointer-events: none`，只让 error/warning 的 X 按钮单独 `pointer-events: auto`；success 等 2.5s 自动消失不可手动关闭。
   - **第 3 轮真正落地**（⚠️ 关键教训）：用户两轮反馈都是"完全没解决"——根因是**所有代码修改根本没部署到用户运行的 .exe 里**。用户实际跑的是 `E:\journal_agent\release\Journal Agent\Journal Agent.exe`（electron-builder 成品），前端 dist 被烤在 `resources\journal-backend\_internal\journal-frontend\dist\`，是 5 月 21 日打包的冻结快照。源码改了、`tsc -b` 通过、`eslint` 通过、`journal-frontend/dist/` 重新 build 都没用——**.exe 是独立的，不会自动读外部源码**。最终用 Bash + `dangerouslyDisableSandbox: true` 把新 dist 热替换到 .exe 内部，让用户关闭再重启 `Journal Agent.exe`，bug 才真正消失。**完整部署流程（方案 A 热替换 / 方案 B 完整重打包）已写入 `CLAUDE.md`「部署到桌面 .exe（生产环境，重要！）」一节**——以后任何 AI 修前端 bug 前必须先看那节，避免让用户验证空气修复。
8. ~~需求 39 的睡眠分迁移（migrate_sleep_score.py）把全部 103 天统一按 `新=max(1,6−旧)` 翻转，但数据横跨两个录入时代：Streamlit 时代（<2026-04-11，1=最差…5=最好，方向本就与新标准一致）不该翻却被翻了，误伤 49 天（如 04-05 睡眠"很好5"被错改成"像没睡过1"）。(2026-06-11 当日发现)~~ ✅ 已修复（2026-06-11）：分界证据=心情/睡眠的 6 分均从 2026-04-11 同日首次出现（Streamlit 单选只有 1-5，6 只可能来自 React 的 6 表情 UI）。`migrate_mood_and_fix_sleep.py`：<04-11 的 52 天 Sleep_Score 从原始备份恢复原值（26 天实际变化），≥04-11 保留正确翻转；同脚本顺带完成需求 42 的 Mood 迁移（<04-11 保留原值、≥04-11 翻转 61 天）。执行前新备份 `daily_summary_2026.backup_20260611_134135.csv`。**教训：对历史数据做语义迁移前，必须先确认整个时间跨度内录入约定是否一致（按月分布 + 极值首现日期是廉价的验证手段）。**
