import GoalCard from '../components/diary/GoalCard'
import ScheduleTable from '../components/diary/ScheduleTable'
import MiniCalendar from '../components/diary/MiniCalendar'
import AIInsights from '../components/diary/AIInsights'
import GoalsCarousel from '../components/diary/GoalsCarousel'
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
    onMonthlyUpdate: (newGoals: GoalItem[]) => void
    onWeeklyUpdate: (newGoals: GoalItem[]) => void
    onTodayToggle: (index: number) => void
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
    goals, onMonthlyUpdate, onWeeklyUpdate, onTodayToggle, schedule, onCellEdit,
    onTodayGoalTextChange, onTodayGoalDelete, onTodayGoalAdd,
    dateLabel, calendarYear, calendarMonth, selectedDateStr, calendarDots,
    onSelectDate, onPrevMonth, onNextMonth,
}: DiaryScheduleProps) {
    return (
        <>
            {/* ========== 年/月/周 目标轮播卡片 ========== */}
            <div className="-mx-24 mb-6">
                <GoalsCarousel
                    yearlyGoals={yearlyGoals}
                    onYearlyGoalToggle={onYearlyGoalToggle}
                    onYearlyGoalTextChange={onYearlyGoalTextChange}
                    onYearlyGoalDelete={onYearlyGoalDelete}
                    onYearlyGoalAdd={onYearlyGoalAdd}
                    onYearlyCategoryAdd={onYearlyCategoryAdd}
                    onYearlyCategoryDelete={onYearlyCategoryDelete}
                    onYearlyCategoryRename={onYearlyCategoryRename}
                    monthlyGoals={goals.monthly}
                    onMonthlyUpdate={onMonthlyUpdate}
                    weeklyGoals={goals.weekly}
                    onWeeklyUpdate={onWeeklyUpdate}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start -mx-24">
                {/* ========== 左栏：今日目标（提升高度） ========== */}
                <div className="md:col-span-3">
                    <GoalCard
                        title="今日目标"
                        badge={`${goals.today.filter((g) => !g.completed).length} 未完成`}
                        variant="primary"
                        goals={goals.today}
                        onToggle={onTodayToggle}
                        editable={true}
                        onTextChange={onTodayGoalTextChange}
                        onDelete={onTodayGoalDelete}
                        onAdd={onTodayGoalAdd}
                        heightClass="h-[814px]"
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
