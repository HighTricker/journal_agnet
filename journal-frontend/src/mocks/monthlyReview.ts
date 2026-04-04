/* ========== Bento Grid 统计 ========== */
export const MOOD_BARS = [40, 60, 90, 50, 70, 85, 65] // 百分比高度

/* ========== 习惯追踪 ========== */
export interface HabitTrack {
    name: string
    days: string       // "26/31 Days"
    percent: number    // 进度条百分比
    weekGrid?: boolean[] // 可选：7天迷你网格
}

export const HABIT_TRACKS: HabitTrack[] = [
    {
        name: '晨间冥想',
        days: '26/31 天',
        percent: 84,
        weekGrid: [true, true, true, false, true, true, true],
    },
    {
        name: '每日阅读',
        days: '22/31 天',
        percent: 71,
    },
]

/* ========== 目标达成 ========== */
export interface MonthlyObjective {
    id: number
    title: string
    subtitle: string
    status: 'completed' | 'in-progress' | 'missed'
    icon: string
}

export const MONTHLY_STATUS_STYLES = {
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

export const MONTHLY_OBJECTIVES: MonthlyObjective[] = [
    { id: 1, title: '完成「设计系统」课程', subtitle: '10月15日完成全部课程', status: 'completed', icon: 'task_alt' },
    { id: 2, title: '12 次力量训练', subtitle: '已完成 9 次，剩余 3 次', status: 'in-progress', icon: 'pending' },
    { id: 3, title: '读完《数字极简主义》', subtitle: '进行中 - 第 7 章', status: 'in-progress', icon: 'pending' },
    { id: 4, title: '每周跑步 3 次', subtitle: '达成 8/12 次 - 雨天影响', status: 'missed', icon: 'error_outline' },
    { id: 5, title: '冥想 30 天打卡', subtitle: '已坚持 26 天', status: 'in-progress', icon: 'pending' },
]

/* ========== 月度满意度评分 ========== */
export interface MonthRating {
    emoji: string
    label: string
    selected: boolean
}

export const MONTH_RATINGS: MonthRating[] = [
    { emoji: '😊', label: '超赞', selected: false },
    { emoji: '🙂', label: '开心', selected: true },
    { emoji: '😐', label: '一般', selected: false },
    { emoji: '🙁', label: '低落', selected: false },
    { emoji: '😫', label: '极差', selected: false },
]
