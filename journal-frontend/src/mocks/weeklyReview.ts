/* ========== Key Metrics ========== */
export interface MetricCard {
    icon: string
    label: string
    value: string
    unit: string
    trend: { icon: string; text: string; color: string }
}

export const KEY_METRICS: MetricCard[] = [
    {
        icon: 'timer',
        label: '专注时长',
        value: '34.5',
        unit: '小时',
        trend: { icon: 'trending_up', text: '较上周 +12%', color: 'text-green-600' },
    },
    {
        icon: 'mood',
        label: '平均心情',
        value: '平静',
        unit: '/8.2',
        trend: { icon: 'horizontal_rule', text: '稳定在目标值', color: 'text-primary' },
    },
    {
        icon: 'bedtime',
        label: '睡眠评分',
        value: '88',
        unit: '/100',
        trend: { icon: 'trending_down', text: '波动 -3 分', color: 'text-error' },
    },
]

/* ========== Habit Tracking ========== */
export const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日']

export interface HabitRow {
    name: string
    checks: boolean[] // 7 天，true = 完成，false = 未完成
}

export const HABITS: HabitRow[] = [
    { name: '冥想', checks: [true, true, false, true, true, true, true] },
    { name: '深度工作', checks: [true, true, true, true, true, false, false] },
    { name: '阅读', checks: [true, false, true, false, true, true, true] },
]

/* ========== Objective Status ========== */
export interface Objective {
    id: number
    title: string
    subtitle: string
    status: 'completed' | 'in-progress' | 'missed'
    icon: string
}

const STATUS_STYLES = {
    'completed': {
        iconBg: 'bg-green-100 text-green-700',
        badgeBg: 'bg-green-50 text-green-700',
        badgeText: '已完成',
        titleClass: '',
    },
    'in-progress': {
        iconBg: 'bg-blue-100 text-blue-700',
        badgeBg: 'bg-blue-50 text-blue-700',
        badgeText: '进行中',
        titleClass: '',
    },
    'missed': {
        iconBg: 'bg-slate-100 text-slate-500',
        badgeBg: 'bg-slate-100 text-slate-500',
        badgeText: '未完成',
        titleClass: 'text-slate-500 line-through',
    },
}

export { STATUS_STYLES }

export const OBJECTIVES: Objective[] = [
    { id: 1, title: '完成 Q4 项目提案', subtitle: '周三已完成', status: 'completed', icon: 'task_alt' },
    { id: 2, title: '更新个人作品集', subtitle: '进行中 - 正在完善案例研究', status: 'in-progress', icon: 'pending' },
    { id: 3, title: '累计跑步 15km', subtitle: '已完成 8km - 因下雨延迟', status: 'missed', icon: 'error_outline' },
    { id: 4, title: '任务 A', subtitle: '已排入下周计划', status: 'in-progress', icon: 'pending' },
    { id: 5, title: '任务 A', subtitle: '已排入下周计划', status: 'in-progress', icon: 'pending' },
    { id: 6, title: '任务 A', subtitle: '已排入下周计划', status: 'in-progress', icon: 'pending' },
]

/* ========== Week Summary Rating ========== */
export interface WeekRating {
    emoji: string
    label: string
    selected: boolean
}

export const WEEK_RATINGS: WeekRating[] = [
    { emoji: '😊', label: '超赞', selected: false },
    { emoji: '🙂', label: '开心', selected: true },
    { emoji: '😐', label: '一般', selected: false },
    { emoji: '🙁', label: '低落', selected: false },
    { emoji: '😫', label: '极差', selected: false },
]
