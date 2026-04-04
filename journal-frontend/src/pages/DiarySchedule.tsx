import GoalCard from '../components/diary/GoalCard'
import ScheduleTable from '../components/diary/ScheduleTable'
import MiniCalendar from '../components/diary/MiniCalendar'
import AIInsights from '../components/diary/AIInsights'
import YearlyGoalCard from '../components/shared/YearlyGoalCard'
import { AI_INSIGHTS } from '../mocks/diarySchedule'
import type { GoalItem, ScheduleRow, YearlyGoalCategory } from '../mocks/diarySchedule'

interface DiaryScheduleProps {
    yearlyGoals: YearlyGoalCategory[]
    onYearlyGoalToggle: (categoryId: string, goalId: string) => void
    onYearlyGoalTextChange: (categoryId: string, goalId: string, text: string) => void
    onYearlyGoalDelete: (categoryId: string, goalId: string) => void
    onYearlyGoalAdd: (categoryId: string) => void
    onYearlyCategoryAdd: () => void
    onYearlyCategoryDelete: (categoryId: string) => void
    onYearlyCategoryRename: (categoryId: string, name: string) => void
    goals: { monthly: GoalItem[]; weekly: GoalItem[]; today: GoalItem[] }
    onGoalToggle: (group: 'monthly' | 'weekly' | 'today', index: number) => void
    schedule: ScheduleRow[]
    onCellEdit: (rowIndex: number, field: 'plan' | 'actual' | 'remarks', value: string) => void
    onTodayGoalTextChange: (index: number, text: string) => void
    onTodayGoalDelete: (index: number) => void
    onTodayGoalAdd: () => void
    // 日历相关
    dateLabel: string
    calendarYear: number
    calendarMonth: number
    selectedDateStr: string
    calendarDots: string[]
    onSelectDate: (dateStr: string) => void
    onPrevMonth: () => void
    onNextMonth: () => void
}

function DiarySchedule({
    yearlyGoals, onYearlyGoalToggle, onYearlyGoalTextChange, onYearlyGoalDelete, onYearlyGoalAdd,
    onYearlyCategoryAdd, onYearlyCategoryDelete, onYearlyCategoryRename,
    goals, onGoalToggle, schedule, onCellEdit,
    onTodayGoalTextChange, onTodayGoalDelete, onTodayGoalAdd,
    dateLabel, calendarYear, calendarMonth, selectedDateStr, calendarDots,
    onSelectDate, onPrevMonth, onNextMonth,
}: DiaryScheduleProps) {
    return (
        <>
            {/* ========== 年度目标卡片 ========== */}
            <div className="-mx-16 mb-6">
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

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start -mx-16">
            {/* ========== 左栏：目标卡片 ========== */}
            <div className="md:col-span-3 space-y-8">
                <GoalCard
                    title="月目标"
                    badge={`${goals.monthly.filter((g) => !g.completed).length} 未完成`}
                    variant="default"
                    goals={goals.monthly}
                    onToggle={(i) => onGoalToggle('monthly', i)}
                />
                <GoalCard
                    title="周目标"
                    badge={`${goals.weekly.filter((g) => !g.completed).length} 未完成`}
                    variant="default"
                    goals={goals.weekly}
                    onToggle={(i) => onGoalToggle('weekly', i)}
                />
                <GoalCard
                    title="今日目标"
                    badge={`${goals.today.filter((g) => !g.completed).length} 未完成`}
                    variant="primary"
                    goals={goals.today}
                    onToggle={(i) => onGoalToggle('today', i)}
                    editable={true}
                    onTextChange={onTodayGoalTextChange}
                    onDelete={onTodayGoalDelete}
                    onAdd={onTodayGoalAdd}
                />
            </div>

            {/* ========== 中栏：日程表 ========== */}
            <div className="md:col-span-6 h-full flex flex-col">
                <ScheduleTable data={schedule} dateLabel={dateLabel} onCellEdit={onCellEdit} />
            </div>

            {/* ========== 右栏：日历 + AI 建议 ========== */}
            <div className="md:col-span-3 flex flex-col gap-8 h-[814px]">
                <MiniCalendar
                    year={calendarYear}
                    month={calendarMonth}
                    selectedDate={selectedDateStr}
                    dots={calendarDots}
                    onSelectDate={onSelectDate}
                    onPrevMonth={onPrevMonth}
                    onNextMonth={onNextMonth}
                />
                <div className="flex-grow">
                    <AIInsights insights={AI_INSIGHTS} />
                </div>
            </div>
            </div>
        </>
    )
}

export default DiarySchedule
