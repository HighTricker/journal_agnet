import MaterialIcon from '../components/ui/MaterialIcon'
import EmojiRating from '../components/ui/EmojiRating'
import YearlyGoalCard from '../components/shared/YearlyGoalCard'
import {
    WEEKDAYS,
    STATUS_STYLES,
} from '../mocks/weeklyReview'
import type { HabitRow, Objective } from '../mocks/weeklyReview'
import type { WeeklyAggregation } from '../api/client'
import type { YearlyGoalCategory } from '../mocks/diarySchedule'

interface WeeklyReviewProps {
    yearlyGoals: YearlyGoalCategory[]
    onYearlyGoalToggle: (categoryId: string, goalId: string) => void
    onYearlyGoalTextChange: (categoryId: string, goalId: string, text: string) => void
    onYearlyGoalDelete: (categoryId: string, goalId: string) => void
    onYearlyGoalAdd: (categoryId: string) => void
    onYearlyCategoryAdd: () => void
    onYearlyCategoryDelete: (categoryId: string) => void
    onYearlyCategoryRename: (categoryId: string, name: string) => void
    weekRating: number | null
    onWeekRatingChange: (v: number) => void
    habits: HabitRow[]
    onHabitToggle: (habitIndex: number, dayIndex: number) => void
    objectives: Objective[]
    onObjectiveChange: (index: number, field: 'title' | 'subtitle', value: string) => void
    onObjectiveStatusToggle: (index: number) => void
    onObjectiveDelete: (index: number) => void
    onObjectiveAdd: () => void
    weekLabel?: string
    aggregation?: WeeklyAggregation | null
}

function WeeklyReview({
    yearlyGoals, onYearlyGoalToggle, onYearlyGoalTextChange, onYearlyGoalDelete, onYearlyGoalAdd,
    onYearlyCategoryAdd, onYearlyCategoryDelete, onYearlyCategoryRename,
    weekRating, onWeekRatingChange,
    habits, onHabitToggle,
    objectives, onObjectiveChange, onObjectiveStatusToggle, onObjectiveDelete, onObjectiveAdd,
    weekLabel, aggregation,
}: WeeklyReviewProps) {
    // 从聚合数据构建关键指标
    const realMetrics = [
        {
            icon: 'timer',
            label: '总番茄钟',
            value: aggregation?.Total_Focus != null ? String(aggregation.Total_Focus) : '--',
            unit: '个',
        },
        {
            icon: 'mood',
            label: '平均心情',
            value: aggregation?.Avg_Mood != null ? String(aggregation.Avg_Mood) : '--',
            unit: '/ 5',
        },
        {
            icon: 'bedtime',
            label: '平均睡眠',
            value: aggregation?.Avg_Sleep_Hours != null ? String(aggregation.Avg_Sleep_Hours) : '--',
            unit: '小时',
        },
    ]
    return (
        <>
            {/* Header Title */}
            <section className="max-w-4xl mx-auto space-y-2 text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface">
                    周记：{weekLabel || '加载中...'}
                </h1>
                <p className="text-on-surface-variant/70 font-medium">
                    回顾进展，培养觉察力。
                </p>
            </section>

            {/* 年度目标 */}
            <div className="mb-16">
                <YearlyGoalCard
                    categories={yearlyGoals}
                    onToggle={onYearlyGoalToggle}
                    onTextChange={onYearlyGoalTextChange}
                    onDelete={onYearlyGoalDelete}
                    onAdd={onYearlyGoalAdd}
                    onCategoryAdd={onYearlyCategoryAdd}
                    onCategoryDelete={onYearlyCategoryDelete}
                    onCategoryRename={onYearlyCategoryRename}
                />
            </div>

            <div className="max-w-4xl mx-auto space-y-16">
            {/* Key Metrics */}
            <section className="space-y-6">
                <div className="flex items-end justify-between px-2">
                    <h2 className="text-xl font-bold tracking-tight">关键指标</h2>
                    <span className="text-sm font-semibold text-primary cursor-pointer">查看趋势</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {realMetrics.map((metric) => (
                        <div key={metric.icon} className="p-8 rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col gap-4">
                                <MaterialIcon name={metric.icon} className="text-primary text-3xl" />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-on-surface-variant">{metric.label}</p>
                                    <p className="text-3xl font-bold">
                                        {metric.value}
                                        <span className="text-lg font-normal text-on-surface-variant ml-1">{metric.unit}</span>
                                    </p>
                                </div>
                                {aggregation?.Best_Mood_Day && metric.icon === 'mood' && (
                                    <p className="text-xs text-primary font-medium">最高 {aggregation.Best_Mood_Day}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Habit Consistency */}
            <section className="space-y-6">
                <div className="px-2">
                    <h2 className="text-xl font-bold tracking-tight">习惯坚持度</h2>
                </div>
                <div className="bg-surface-container-low rounded-xl p-8 overflow-hidden">
                    <div className="grid grid-cols-8 gap-4 min-w-[600px]">
                        {/* 表头：空格 + 7 天 */}
                        <div className="col-span-1" />
                        {WEEKDAYS.map((day) => (
                            <div key={day} className="text-center text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                                {day}
                            </div>
                        ))}
                        {/* 每行一个习惯 */}
                        {habits.map((habit, habitIdx) => (
                            <>
                                <div key={habit.name} className="text-sm font-semibold flex items-center">
                                    {habit.name}
                                </div>
                                {habit.checks.map((checked, dayIdx) => (
                                    <div key={`${habit.name}-${dayIdx}`} className="flex justify-center">
                                        <button onClick={() => onHabitToggle(habitIdx, dayIdx)}>
                                            {checked ? (
                                                <MaterialIcon name="check_circle" filled className="text-primary" />
                                            ) : (
                                                <MaterialIcon name="circle" className="text-outline-variant/30" />
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </>
                        ))}
                    </div>
                </div>
            </section>

            {/* Objective Status */}
            <section className="space-y-6">
                <div className="flex items-end justify-between px-2">
                    <h2 className="text-xl font-bold tracking-tight">目标进展</h2>
                    <button
                        onClick={onObjectiveAdd}
                        className="text-sm font-semibold text-primary cursor-pointer hover:text-primary/80 transition-colors"
                    >
                        + 添加目标
                    </button>
                </div>
                <div
                    className="h-[400px] overflow-y-auto pr-2 space-y-4"
                    style={{ scrollbarWidth: 'thin', scrollbarColor: '#00288e #f2f4f6' }}
                >
                    {objectives.map((obj, index) => {
                        const styles = STATUS_STYLES[obj.status]
                        return (
                            <div key={obj.id} className="group flex items-center gap-6 p-6 rounded-xl bg-surface-container-lowest shadow-sm">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${styles.iconBg}`}>
                                    <MaterialIcon name={obj.icon} />
                                </div>
                                <div className="flex-grow min-w-0">
                                    <input
                                        type="text"
                                        value={obj.title}
                                        onChange={(e) => onObjectiveChange(index, 'title', e.target.value)}
                                        placeholder="目标标题"
                                        className={`w-full font-bold text-lg bg-transparent border-none outline-none focus:ring-0 focus:bg-primary/5 rounded px-1 -ml-1 ${styles.titleClass}`}
                                    />
                                    <input
                                        type="text"
                                        value={obj.subtitle}
                                        onChange={(e) => onObjectiveChange(index, 'subtitle', e.target.value)}
                                        placeholder="目标描述"
                                        className="w-full text-sm text-on-surface-variant bg-transparent border-none outline-none focus:ring-0 focus:bg-primary/5 rounded px-1 -ml-1"
                                    />
                                </div>
                                <button
                                    onClick={() => onObjectiveStatusToggle(index)}
                                    className={`px-4 py-1 rounded-full text-xs font-bold cursor-pointer shrink-0 ${styles.badgeBg}`}
                                >
                                    {styles.badgeText}
                                </button>
                                <button
                                    onClick={() => onObjectiveDelete(index)}
                                    className="text-on-surface-variant/30 hover:text-error transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                                >
                                    <MaterialIcon name="close" className="text-lg" />
                                </button>
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* Week Summary */}
            <section className="space-y-8 bg-surface-container-low p-10 rounded-2xl">
                <div className="text-center space-y-6">
                    <h2 className="text-2xl font-bold tracking-tight">本周总结</h2>
                    <div className="flex justify-center">
                        <EmojiRating value={weekRating} onChange={onWeekRatingChange} size="md" />
                    </div>
                    <p className="text-sm font-semibold text-on-surface-variant">
                        总体满意度：{weekRating ?? '-'}/5
                    </p>
                </div>
            </section>
            </div>
        </>
    )
}

export default WeeklyReview
