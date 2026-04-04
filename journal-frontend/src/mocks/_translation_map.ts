/**
 * 英文 → 中文翻译映射表
 * 用于将 UI 标签和假数据从英文翻译为中文
 */

const translationMap: Record<string, string> = {
    // ========================================
    // MonthlyText.tsx / WeeklyText.tsx（共用）
    // ========================================

    // UI 标签
    "Text Records": "文字记录",
    "Ideas & Inspiration": "灵感与启发",
    "A spark of thought, a sudden realization...": "一个闪念，一次顿悟……",

    // 假数据
    "Utilized LLM for architectural brainstorming and code refactoring. The logic flow improved significantly.":
        "用大语言模型做了架构头脑风暴和代码重构，逻辑流程改善了不少。",
    "Currently exploring \"Digital Minimalism\". The concept of high-quality leisure resonates deeply with my current burnout.":
        "最近在读《数字极简主义》，\"高质量休闲\"这个概念跟我当前的倦怠状态产生了强烈共鸣。",
    "Focus on the breath felt heavy at first, then transitioned into a weightless clarity. 15 minutes of pure silence.":
        "刚开始专注呼吸的时候觉得很沉重，后来慢慢过渡到了一种失重般的清明。15 分钟纯粹的安静。",
    "Maintained a steady work-rest cycle and successfully bypassed mindless social media scrolling today.":
        "今天保持了稳定的工作-休息节奏，成功没有无意识地刷社交媒体。",
    "Need to improve water intake and reduce caffeine after 2 PM to avoid late-night restlessness.":
        "需要多喝水，下午两点以后减少咖啡因摄入，避免深夜还睡不着。",
    "Be patient with the progress. The forest doesn't grow in a day, and neither does a new habit.":
        "对进步要有耐心。森林不是一天长成的，新习惯也一样。",

    // ========================================
    // DiaryJournal.tsx
    // ========================================
    "Life Data Records": "生活量化数据",
    "Sleep Section": "睡眠记录",
    // "Text Records" 已在上方定义
    // "Ideas & Inspiration" 已在上方定义
    "Begin typing your flashes of brilliance...": "写下你的灵光一闪……",
    "Thoughts & Insights": "感悟与思考",

    // ========================================
    // DiarySchedule.tsx
    // ========================================
    "Monthly Goals": "月目标",
    "Weekly Goals": "周目标",
    "Today's Goals": "今日目标",
    "Left": "剩余",

    // ========================================
    // WeeklyReview.tsx
    // ========================================
    "Weekly Review: Oct 23 - Oct 29": "周记：10月23日 - 10月29日",
    "Reflecting on progress and cultivating mindfulness.": "回顾进展，培养觉察力。",
    "Key Metrics": "关键指标",
    "View Trends": "查看趋势",
    "Habit Consistency": "习惯坚持度",
    "Objective Status": "目标进展",
    "Week Summary": "本周总结",
    "Overall Satisfaction: 4/5": "总体满意度：4/5",
    "Key Takeaways & Reflection": "核心收获与反思",
    "What did you learn about yourself this week?": "这周你对自己有什么新的认识？",
    "Save Review": "保存周记",

    // ========================================
    // MonthlyReview.tsx
    // ========================================
    "Monthly Review: October 2023": "月记：2023年10月",
    "Take a moment to pause and observe the patterns of your journey. Reflecting on the past 31 days helps illuminate the path forward.":
        "停下来观察你旅途中的规律。回顾过去 31 天的轨迹，有助于看清前方的路。",
    "Monthly Mood": "本月心情",
    "Focus Hours": "专注时长",
    "Avg. Sleep": "平均睡眠",
    "Habit Tracking": "习惯追踪",
    "84% Consistency": "84% 坚持率",
    "Goal Achievement": "目标达成",
    "Overall Satisfaction": "总体满意度",
    "How would you rate this month's growth?": "你如何评价这个月的成长？",
    "Overall Satisfaction: 4.0": "总体满意度：4.0",
    "Monthly Summary": "月度总结",
    "Finalize Review": "保存月记",

    // 假数据
    "Calm & Focused": "平静且专注",
    "This month felt like a period of steady recalibration. While I didn't hit every fitness goal, the mental clarity gained from consistent meditation has shifted my professional focus. The Serenity project is blooming, and I'm entering November with a sense of quiet confidence.":
        "这个月像是一段稳步校准的时期。虽然没有达成每一个健身目标，但持续冥想带来的精神清明改变了我的工作状态。Serenity 项目正在开花，我带着一种安静的自信迈入十一月。",

    // ========================================
    // AISage.tsx
    // ========================================
    "Model Selection": "模型选择",
    "Quick Commands": "快捷指令",
    "GPT-4 Sage Reflection": "GPT-4 深度反思",
    "Active now · Mindful Guide": "在线中 · 正念导师",
    "Share your thoughts or ask for guidance...": "分享你的想法，或寻求指导……",
    "Serenity AI may provide creative suggestions. Journaling remains a personal journey.":
        "AI 助手提供的建议仅供参考，日记书写始终是你的个人旅程。",

    // ========================================
    // ScheduleTable.tsx
    // ========================================
    "Daily Schedule": "日程安排",
    "Add Block": "添加时段",
    "Time Range": "时间段",
    "Plan": "计划",
    "Actual": "实际",
    "Remarks": "备注",

    // 假数据
    "Wednesday, October 24": "10月24日 星期三",

    // ========================================
    // MiniCalendar.tsx（星期缩写）
    // ========================================
    "S": "日",
    "M": "一",
    "T": "二", // 注意：T 同时代表 Tue 和 Thu，需按位置区分
    "W": "三",
    // 第二个 "T" → "四"（Thu），第二个 "S" → "六"（Sat）
    // 由于 key 不能重复，日历组件需按数组顺序处理：
    // ["日", "一", "二", "三", "四", "五", "六"]
    "F": "五",

    // ========================================
    // AIInsights.tsx
    // ========================================
    "AI Insights": "AI 洞察",
    "Refresh Insights": "刷新洞察",

    // ========================================
    // weeklyReview.ts (Mock)
    // ========================================

    // 指标卡片
    "34.5": "34.5",
    "hrs": "小时",
    "12% from last week": "较上周 +12%",
    "Avg. Mood": "平均心情",
    "Calm": "平静",
    "/8.2": "/8.2",
    "Stable at target": "稳定在目标值",
    "Sleep Score": "睡眠评分",
    "88": "88",
    "/100": "/100",
    "-3 pts variance": "波动 -3 分",

    // 星期
    "Mon": "一",
    "Tue": "二",
    "Wed": "三",
    "Thu": "四",
    "Fri": "五",
    "Sat": "六",
    "Sun": "日",

    // 习惯
    "Meditation": "冥想",
    "Deep Work": "深度工作",
    "Reading": "阅读",

    // 目标
    "Finish Q4 Project Proposal": "完成 Q4 项目提案",
    "Completed on Wednesday": "周三已完成",
    "Update Personal Portfolio": "更新个人作品集",
    "Ongoing – Finalizing Case Studies": "进行中 - 正在完善案例研究",
    "Run 15km Total": "本周累计跑步 15km",
    "Achieved 8km - Delayed due to rain": "已完成 8km - 因下雨延迟",
    "Task A": "任务 A",
    "Scheduled for next week": "已排入下周计划",

    // 状态
    "Completed": "已完成",
    "In Progress": "进行中",
    "Missed": "未完成",

    // ========================================
    // monthlyReview.ts (Mock)
    // ========================================
    "Morning Meditation": "晨间冥想",
    "26/31 Days": "26/31 天",
    "Daily Reading": "每日阅读",
    "22/31 Days": "22/31 天",
    "Complete \"Design Systems\" Course": "完成「设计系统」课程",
    "DONE": "已完成",
    "12 Strength Workouts": "12 次力量训练",
    "9/12": "9/12",

    // ========================================
    // diarySchedule.ts (Mock)
    // ========================================

    // 今日目标
    "Finish Manuscript": "完成手稿",
    "Morning Yoga 20/30": "晨间瑜伽 20/30",
    // "Task A" 已在上方定义

    // 周目标
    "Draft Chapter 4-6": "撰写第 4-6 章初稿",
    "Research AI UX patterns": "调研 AI UX 设计模式",
    "Buy birthday gift": "买生日礼物",

    // 月目标
    "Deep Work: Design UI": "深度工作：设计 UI",
    "Weekly Team Sync": "每周团队同步会",
    "Drink 2L Water": "每天喝 2L 水",

    // 日程表
    "Sleep": "睡眠",
    "Restorative": "恢复性睡眠",
    "Deep cycle": "深度睡眠周期",
    "Wake Up": "起床",
    "Alarm 1": "闹钟 1",
    "Light Stretch": "轻度拉伸",
    "Done": "已完成",
    "Living room": "客厅",
    "Morning Routine": "晨间流程",
    "Felt energized": "感觉精力充沛",
    "Breakfast": "早餐",
    "Oatmeal": "燕麦粥",
    "Commute / Prep": "通勤 / 准备",
    "Podcast time": "听播客",
    "Deep Work: Dashboard": "深度工作：仪表盘",
    "No distractions": "零干扰",
    "Focus Phase": "专注阶段",
    "Flow state": "心流状态",
    "Deep Work: Wrap-up": "深度工作：收尾",
    "Save changes": "保存修改",
    "Lunch Break": "午休",
    "Walk in the park": "公园散步",
    "Mindful eating": "正念饮食",
    "Product Meeting": "产品会议",
    "Room 402": "402 会议室",
    "Q&A session": "问答环节",
    "Email Batch": "集中处理邮件",
    "Inbox zero attempt": "尝试清空收件箱",
    "October 2023": "2023年10月",

    // AI 洞察卡片
    "Focus Optimization": "专注优化",
    "Based on your past Wednesdays, your focus peaks between 10 AM and 11:30 AM. Move your \"Dashboard UI\" task here for 20% faster completion.":
        "根据你过往周三的数据，你的专注力在上午 10:00 到 11:30 之间达到峰值。把「仪表盘 UI」任务移到这个时段，完成效率可提升 20%。",
    "Burnout Warning": "倦怠预警",
    "You've logged 4 consecutive days of high-intensity tasks. Consider a 15-minute screen-free walk at 2 PM today.":
        "你已经连续 4 天记录了高强度任务。建议今天下午 2 点安排一次 15 分钟的无屏幕散步。",

    // ========================================
    // aiSage.ts (Mock)
    // ========================================

    // 模型名称
    "GPT-4 Sage": "GPT-4 Sage",
    "Claude Creative": "Claude Creative",

    // 快捷指令
    "Summarize Day": "总结今天",
    "Sentiment Analysis": "情绪分析",
    "Idea Generation": "灵感生成",

    // 对话内容
    "Good morning. I've been reflecting on your entry from last night regarding the new project. It seems you're balancing excitement with a bit of apprehension. How are you feeling about the first milestone today?":
        "早上好。我回顾了你昨晚关于新项目的日记，看起来你在兴奋和些许不安之间寻找平衡。今天对第一个里程碑感觉如何？",
    "I'm actually feeling more focused this morning. I think writing it down helped clear the mental clutter. I'd like to break down the first milestone into smaller, more manageable tasks. Can you help me with that?":
        "今天早上其实感觉更专注了。我觉得写下来帮我理清了思绪。我想把第一个里程碑拆分成更小、更容易执行的任务，你能帮我拆一下吗？",
    "Certainly. Based on your previous goals, here is a suggested flow for today. Remember to take small breaks between each focused block to maintain that clarity.":
        "当然可以。根据你之前的目标，以下是今天的建议安排。记得在每个专注时段之间安排短暂休息，保持头脑清醒。",

    // 任务分解
    "Task Decomposition": "任务拆解",
    "Audit existing documentation for technical gaps (45 mins)":
        "审查现有文档中的技术缺口（45 分钟）",
    "Draft initial architecture diagram (60 mins)":
        "绘制初版架构图（60 分钟）",
    "Schedule sync with the design team (15 mins)":
        "约设计团队同步会议（15 分钟）",
    "Today, October 24": "今天，10月24日",
};

/**
 * MiniCalendar 星期缩写数组（按周日到周六顺序）
 * 因为单字母 key 存在重复（S/T 各出现两次），用数组表示
 */
export const weekDayLabels = ["日", "一", "二", "三", "四", "五", "六"];

export default translationMap;
