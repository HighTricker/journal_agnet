import MaterialIcon from '../components/ui/MaterialIcon'
import EmojiRating from '../components/ui/EmojiRating'
import YearlyGoalCard from '../components/shared/YearlyGoalCard'
import { MONTHLY_STATUS_STYLES } from '../mocks/monthlyReview'
import type { MonthlyObjective } from '../mocks/monthlyReview'
import type { MonthlyAggregation } from '../api/client'
import type { YearlyGoalCategory } from '../mocks/diarySchedule'

interface MonthlyReviewProps {
    yearlyGoals: YearlyGoalCategory[]
    onYearlyGoalToggle: (categoryId: string, goalId: string) => void
    onYearlyGoalTextChange: (categoryId: string, goalId: string, text: string) => void
    onYearlyGoalDelete: (categoryId: string, goalId: string) => void
    onYearlyGoalAdd: (categoryId: string) => void
    onYearlyCategoryAdd: () => void
    onYearlyCategoryDelete: (categoryId: string) => void
    onYearlyCategoryRename: (categoryId: string, name: string) => void
    monthRating: number | null
    onMonthRatingChange: (v: number) => void
    objectives: MonthlyObjective[]
    onObjectiveChange: (index: number, field: 'title' | 'subtitle', value: string) => void
    onObjectiveStatusToggle: (index: number) => void
    onObjectiveDelete: (index: number) => void
    onObjectiveAdd: () => void
    monthLabel?: string
    aggregation?: MonthlyAggregation | null
}

function MonthlyReview({
    yearlyGoals, onYearlyGoalToggle, onYearlyGoalTextChange, onYearlyGoalDelete, onYearlyGoalAdd,
    onYearlyCategoryAdd, onYearlyCategoryDelete, onYearlyCategoryRename,
    monthRating, onMonthRatingChange,
    objectives, onObjectiveChange, onObjectiveStatusToggle, onObjectiveDelete, onObjectiveAdd,
    monthLabel, aggregation,
}: MonthlyReviewProps) {
    // 心情描述映射
    const moodText = (() => {
        const avg = aggregation?.Avg_Mood
        if (avg == null) return '暂无数据'
        if (avg >= 4.5) return '非常愉快'
        if (avg >= 3.5) return '心情不错'
        if (avg >= 2.5) return '平淡平静'
        if (avg >= 1.5) return '情绪低落'
        return '状态很差'
    })()

    // 习惯数据（从 aggregation.habits 获取）
    const habits = (aggregation as unknown as Record<string, unknown>)?.habits as Array<{
        name: string; done: number; total: number; progress: number
    }> | undefined

    // 总坚持率
    const totalDone = habits?.reduce((s, h) => s + h.done, 0) ?? 0
    const totalAll = habits?.reduce((s, h) => s + h.total, 0) ?? 0
    const overallRate = totalAll > 0 ? Math.round(totalDone / totalAll * 100) : 0

    return (
        <>
            {/* Header */}
            <section className="max-w-4xl mx-auto mb-14 text-left">
                <h1 className="text-5xl font-extrabold tracking-tight text-on-surface mb-3">
                    月记：{monthLabel || '加载中...'}
                </h1>
                <p className="text-lg text-on-secondary-container font-medium max-w-2xl leading-relaxed">
                    停下来观察你旅途中的规律。回顾过去一个月的轨迹，有助于看清前方的路。
                </p>
            </section>

            {/* 年度目标 */}
            <div className="mb-14">
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

            <div className="max-w-4xl mx-auto">
            {/* Data Dashboard (Bento Grid) */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-14">
                {/* Monthly Mood - 占两列 */}
                <div className="md:col-span-2 bg-surface-container-lowest p-8 rounded-xl shadow-sm flex flex-col justify-between">
                    <div>
                        <span className="text-sm font-bold uppercase tracking-widest text-primary mb-2 block">本月心情</span>
                        <h2 className="text-4xl font-bold text-on-surface">{moodText}</h2>
                    </div>
                    <div className="mt-4 space-y-1">
                        <p className="text-sm text-on-surface-variant">
                            平均心情 <span className="font-bold text-primary">{aggregation?.Avg_Mood ?? '--'}</span> / 5
                        </p>
                        {aggregation?.Best_Mood_Day && (
                            <p className="text-xs text-primary">最佳 {aggregation.Best_Mood_Day}</p>
                        )}
                        {aggregation?.Worst_Mood_Day && (
                            <p className="text-xs text-error">最差 {aggregation.Worst_Mood_Day}</p>
                        )}
                    </div>
                </div>
                {/* Focus */}
                <div className="bg-surface-container-low p-8 rounded-xl flex flex-col items-center justify-center text-center">
                    <MaterialIcon name="timer" className="text-primary text-4xl mb-4" />
                    <div className="text-3xl font-extrabold text-on-surface">{aggregation?.Total_Focus ?? '--'}</div>
                    <div className="text-sm font-semibold text-on-secondary-container">番茄钟</div>
                </div>
                {/* Avg. Sleep */}
                <div className="bg-surface-container-low p-8 rounded-xl flex flex-col items-center justify-center text-center">
                    <MaterialIcon name="bedtime" className="text-primary text-4xl mb-4" />
                    <div className="text-3xl font-extrabold text-on-surface">{aggregation?.Avg_Sleep_Hours ?? '--'}h</div>
                    <div className="text-sm font-semibold text-on-secondary-container">平均睡眠</div>
                </div>
            </section>

            {/* Habit Tracking */}
            <section className="mb-14">
                <div className="flex justify-between items-end mb-6">
                    <h3 className="text-2xl font-bold text-on-surface">习惯追踪</h3>
                    <span className="text-sm font-bold text-primary">{overallRate}% 坚持率</span>
                </div>
                <div className="bg-surface-container-lowest p-8 rounded-xl">
                    {habits && habits.length > 0 ? (
                        <div className="space-y-8">
                            {habits.map((habit) => (
                                <div key={habit.name}>
                                    <div className="flex justify-between mb-3 items-center">
                                        <span className="font-bold text-on-surface">{habit.name}</span>
                                        <span className="text-xs font-bold text-on-secondary-container">{habit.done}/{habit.total} 天</span>
                                    </div>
                                    <div className="h-4 rounded-full bg-secondary-container/30 relative overflow-hidden">
                                        <div
                                            className="absolute inset-0 bg-primary rounded-full transition-all"
                                            style={{ width: `${habit.progress}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-on-surface-variant text-center py-8">本月暂无习惯打卡数据，请先在周记中记录习惯</p>
                    )}
                </div>
            </section>

            {/* 目标达成 */}
            <section className="mb-14">
                <div className="flex justify-between items-end mb-6">
                    <h3 className="text-2xl font-bold text-on-surface">目标达成</h3>
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
                        const styles = MONTHLY_STATUS_STYLES[obj.status]
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

            {/* 总体满意度 */}
            <section className="space-y-8 bg-white p-10 rounded-2xl">
                <div className="text-center space-y-6">
                    <h2 className="text-2xl font-bold tracking-tight">总体满意度</h2>
                    <div className="flex justify-center">
                        <EmojiRating value={monthRating} onChange={onMonthRatingChange} size="md" />
                    </div>
                    <p className="text-sm font-semibold text-on-surface-variant">
                        总体满意度：{monthRating ?? '-'}/5
                    </p>
                </div>
            </section>
            </div>
        </>
    )
}

export default MonthlyReview
