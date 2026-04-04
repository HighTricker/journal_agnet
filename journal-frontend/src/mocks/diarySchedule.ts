/* ========== 年度目标数据 ========== */
export interface YearlyGoalItem {
    id: string
    text: string
    completed: boolean
}

export interface YearlyGoalCategory {
    id: string
    name: string
    goals: YearlyGoalItem[]
}

export const YEARLY_GOALS: YearlyGoalCategory[] = [
    {
        id: 'health',
        name: '健康',
        goals: [
            { id: 'h1', text: '瘦到55kg', completed: false },
        ],
    },
    {
        id: 'wealth',
        name: '财富',
        goals: [
            { id: 'w1', text: '做一个自己的小红书、X账号', completed: false },
            { id: 'w2', text: '赚100万元', completed: false },
        ],
    },
    {
        id: 'wisdom',
        name: '智慧',
        goals: [
            { id: 'wi1', text: '考托福120分', completed: false },
            { id: 'wi2', text: '读100本书', completed: false },
        ],
    },
    {
        id: 'happiness',
        name: '幸福',
        goals: [
            { id: 'ha1', text: '买苹果笔记本写代码', completed: false },
            { id: 'ha2', text: '买5090爽玩战地6', completed: false },
            { id: 'ha3', text: '买r52相机+24105f2.8', completed: false },
            { id: 'ha4', text: '买苹果17promax2TB', completed: false },
            { id: 'ha5', text: '买claude会员', completed: false },
        ],
    },
    {
        id: 'relationship',
        name: '关系',
        goals: [
            { id: 'r1', text: '给母亲买个三菱空调', completed: false },
        ],
    },
    {
        id: 'travel',
        name: '旅行',
        goals: [
            { id: 't1', text: '去一次西藏', completed: false },
            { id: 't2', text: '去一次日本，英国，美国', completed: false },
        ],
    },
]

/* ========== 目标数据 ========== */
export interface GoalItem {
    text: string
    completed: boolean
}

export const MONTHLY_GOALS: GoalItem[] = [
    { text: '完成手稿', completed: true },
    { text: '晨间瑜伽 20/30', completed: false },
    { text: '任务 A', completed: false },
    { text: '任务 A', completed: false },
    { text: '任务 A', completed: false },
]

export const WEEKLY_GOALS: GoalItem[] = [
    { text: '撰写第 4-6 章初稿', completed: true },
    { text: '调研 AI UX 设计模式', completed: false },
    { text: '买生日礼物', completed: true },
    { text: '任务 A', completed: false },
    { text: '任务 A', completed: false },
    { text: '任务 A', completed: false },
]

export const TODAY_GOALS: GoalItem[] = [
    { text: '深度工作：设计 UI', completed: false },
    { text: '每周团队同步会', completed: false },
    { text: '每天喝 2L 水', completed: true },
    { text: '任务 A', completed: false },
    { text: '任务 A', completed: false },
    { text: '任务 A', completed: false },
]

/* ========== 日程表数据（48 个半小时） ========== */
export interface ScheduleRow {
    time: string
    plan: string
    actual: string
    remarks: string
    isHighlight?: boolean
}

export const SCHEDULE_DATA: ScheduleRow[] = [
    { time: '00:00 - 00:30', plan: '睡眠', actual: '--', remarks: '恢复性睡眠' },
    { time: '00:30 - 01:00', plan: '睡眠', actual: '--', remarks: '深度睡眠周期' },
    { time: '01:00 - 01:30', plan: '睡眠', actual: '--', remarks: '--' },
    { time: '01:30 - 02:00', plan: '睡眠', actual: '--', remarks: '' },
    { time: '02:00 - 02:30', plan: '睡眠', actual: '--', remarks: '' },
    { time: '02:30 - 03:00', plan: '睡眠', actual: '--', remarks: '' },
    { time: '03:00 - 03:30', plan: '睡眠', actual: '--', remarks: '' },
    { time: '03:30 - 04:00', plan: '睡眠', actual: '--', remarks: '' },
    { time: '04:00 - 04:30', plan: '睡眠', actual: '--', remarks: '' },
    { time: '04:30 - 05:00', plan: '睡眠', actual: '--', remarks: '' },
    { time: '05:00 - 05:30', plan: '睡眠', actual: '--', remarks: '' },
    { time: '05:30 - 06:00', plan: '睡眠', actual: '--', remarks: '' },
    { time: '06:00 - 06:30', plan: '睡眠', actual: '--', remarks: '' },
    { time: '06:30 - 07:00', plan: '睡眠', actual: '--', remarks: '' },
    { time: '07:00 - 07:30', plan: '起床', actual: '07:05', remarks: '闹钟 1' },
    { time: '07:30 - 08:00', plan: '轻度拉伸', actual: '已完成', remarks: '客厅' },
    { time: '08:00 - 08:30', plan: '晨间流程', actual: '08:15 Start', remarks: '感觉精力充沛' },
    { time: '08:30 - 09:00', plan: '早餐', actual: '--', remarks: '燕麦粥' },
    { time: '09:00 - 09:30', plan: '通勤 / 准备', actual: '--', remarks: '听播客' },
    { time: '09:30 - 10:00', plan: '深度工作：仪表盘', actual: '进行中', remarks: '零干扰', isHighlight: true },
    { time: '10:00 - 10:30', plan: '深度工作：仪表盘', actual: '专注阶段', remarks: '心流状态', isHighlight: true },
    { time: '10:30 - 11:00', plan: '深度工作：仪表盘', actual: '--', remarks: '--', isHighlight: true },
    { time: '11:00 - 11:30', plan: '深度工作：仪表盘', actual: '--', remarks: '--', isHighlight: true },
    { time: '11:30 - 12:00', plan: '深度工作：收尾', actual: '--', remarks: '保存修改', isHighlight: true },
    { time: '12:00 - 12:30', plan: '午休', actual: '--', remarks: '公园散步' },
    { time: '12:30 - 13:00', plan: '午休', actual: '--', remarks: '正念饮食' },
    { time: '13:00 - 13:30', plan: '产品会议', actual: '--', remarks: '402 会议室' },
    { time: '13:30 - 14:00', plan: '产品会议', actual: '--', remarks: '问答环节' },
    { time: '14:00 - 14:30', plan: '集中处理邮件', actual: '--', remarks: '尝试清空收件箱' },
    { time: '14:30 - 15:00', plan: '集中处理邮件', actual: '--', remarks: '--' },
    { time: '15:00 - 15:30', plan: '深度工作：前端开发', actual: '--', remarks: '', isHighlight: true },
    { time: '15:30 - 16:00', plan: '深度工作：前端开发', actual: '--', remarks: '', isHighlight: true },
    { time: '16:00 - 16:30', plan: '休息/散步', actual: '--', remarks: '' },
    { time: '16:30 - 17:00', plan: '深度工作：前端开发', actual: '--', remarks: '', isHighlight: true },
    { time: '17:00 - 17:30', plan: '深度工作：前端开发', actual: '--', remarks: '', isHighlight: true },
    { time: '17:30 - 18:00', plan: '深度工作：前端开发', actual: '--', remarks: '', isHighlight: true },
    { time: '18:00 - 18:30', plan: '晚餐/休息', actual: '--', remarks: '' },
    { time: '18:30 - 19:00', plan: '晚餐/休息', actual: '--', remarks: '' },
    { time: '19:00 - 19:30', plan: '阅读', actual: '--', remarks: '' },
    { time: '19:30 - 20:00', plan: '阅读', actual: '--', remarks: '' },
    { time: '20:00 - 20:30', plan: '冥想/反思', actual: '--', remarks: '' },
    { time: '20:30 - 21:00', plan: '冥想/反思', actual: '--', remarks: '' },
    { time: '21:00 - 21:30', plan: '自由时间', actual: '--', remarks: '' },
    { time: '21:30 - 22:00', plan: '自由时间', actual: '--', remarks: '' },
    { time: '22:00 - 22:30', plan: '准备睡觉', actual: '--', remarks: '' },
    { time: '22:30 - 23:00', plan: '准备睡觉', actual: '--', remarks: '' },
    { time: '23:00 - 23:30', plan: '睡眠', actual: '--', remarks: '' },
    { time: '23:30 - 24:00', plan: '睡眠', actual: '--', remarks: '' },
]

/* ========== 日历数据 ========== */
export const CALENDAR = {
    title: '2023年10月',
    today: 24,
    prevMonthDays: [24, 25, 26, 27, 28, 29, 30],
    currentMonthDays: Array.from({ length: 27 }, (_, i) => i + 1),
}

/* ========== AI 建议 ========== */
export interface AIInsight {
    title: string
    content: string
}

export const AI_INSIGHTS: AIInsight[] = [
    {
        title: '专注优化',
        content: '根据你过往周三的数据，你的专注力在上午 10:00 到 11:30 之间达到峰值。把「仪表盘 UI」任务移到这个时段，完成效率可提升 20%。',
    },
    {
        title: '倦怠预警',
        content: '你已经连续 4 天记录了高强度任务。建议今天下午 2 点安排一次 15 分钟的无屏幕散步。',
    },
    {
        title: '睡眠建议',
        content: '本周平均入睡时间为 23:40，比目标晚了 40 分钟。尝试在 22:30 关闭屏幕，有助于提前进入深度睡眠。',
    },
]
