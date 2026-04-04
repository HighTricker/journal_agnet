import { useState } from 'react'
import PageLayout from '../components/layout/PageLayout'
import SaveButton from '../components/shared/SaveButton'
import WeeklyReview from './WeeklyReview'
import WeeklyText from './WeeklyText'
import { useWeeklyData, getISOWeekKey, shiftWeek } from '../hooks/useWeeklyData'
import type { Objective } from '../mocks/weeklyReview'
import { YEARLY_GOALS } from '../mocks/diarySchedule'
import type { YearlyGoalCategory } from '../mocks/diarySchedule'

function Weekly() {
    const [activeTab, setActiveTab] = useState<'review' | 'text'>('review')

    // 周切换
    const [weekKey, setWeekKey] = useState(() => getISOWeekKey(new Date()))

    // 从 API 加载真实数据
    const weekly = useWeeklyData(weekKey)

    /* ========== 年度目标（暂时还用 mock） ========== */
    const [yearlyGoals, setYearlyGoals] = useState<YearlyGoalCategory[]>(
        YEARLY_GOALS.map((cat) => ({ ...cat, goals: cat.goals.map((g) => ({ ...g })) }))
    )

    /* ---- handlers ---- */
    const handleHabitToggle = (habitIndex: number, dayIndex: number) => {
        weekly.setHabits(prev => prev.map((h, hi) =>
            hi === habitIndex
                ? { ...h, checks: h.checks.map((c, di) => di === dayIndex ? !c : c) }
                : h
        ))
    }

    const handleObjectiveChange = (index: number, field: 'title' | 'subtitle', value: string) => {
        weekly.setObjectives(prev => prev.map((o, i) => i === index ? { ...o, [field]: value } : o))
    }

    const handleObjectiveStatusToggle = (index: number) => {
        const statusOrder: Array<Objective['status']> = ['completed', 'in-progress', 'missed']
        weekly.setObjectives(prev => prev.map((o, i) => {
            if (i !== index) return o
            const currentIdx = statusOrder.indexOf(o.status)
            const nextStatus = statusOrder[(currentIdx + 1) % 3]
            const iconMap: Record<Objective['status'], string> = {
                'completed': 'task_alt', 'in-progress': 'pending', 'missed': 'error_outline',
            }
            return { ...o, status: nextStatus, icon: iconMap[nextStatus] }
        }))
    }

    const handleObjectiveDelete = (index: number) => {
        weekly.setObjectives(prev => prev.filter((_, i) => i !== index))
    }

    const handleObjectiveAdd = () => {
        weekly.setObjectives(prev => [...prev, {
            id: Date.now(), title: '', subtitle: '',
            status: 'in-progress' as const, icon: 'pending',
        }])
    }

    /* ========== 年度目标 Handler ========== */
    const handleYearlyGoalToggle = (categoryId: string, goalId: string) => {
        setYearlyGoals(prev => prev.map(cat =>
            cat.id === categoryId
                ? { ...cat, goals: cat.goals.map(g => g.id === goalId ? { ...g, completed: !g.completed } : g) }
                : cat
        ))
    }
    const handleYearlyGoalTextChange = (categoryId: string, goalId: string, text: string) => {
        setYearlyGoals(prev => prev.map(cat =>
            cat.id === categoryId
                ? { ...cat, goals: cat.goals.map(g => g.id === goalId ? { ...g, text } : g) }
                : cat
        ))
    }
    const handleYearlyGoalDelete = (categoryId: string, goalId: string) => {
        setYearlyGoals(prev => prev.map(cat =>
            cat.id === categoryId ? { ...cat, goals: cat.goals.filter(g => g.id !== goalId) } : cat
        ))
    }
    const handleYearlyGoalAdd = (categoryId: string) => {
        setYearlyGoals(prev => prev.map(cat =>
            cat.id === categoryId
                ? { ...cat, goals: [...cat.goals, { id: Date.now().toString(), text: '', completed: false }] }
                : cat
        ))
    }
    const handleYearlyCategoryAdd = () => {
        setYearlyGoals(prev => [...prev, { id: Date.now().toString(), name: '新分类', goals: [] }])
    }
    const handleYearlyCategoryDelete = (categoryId: string) => {
        setYearlyGoals(prev => prev.filter(cat => cat.id !== categoryId))
    }
    const handleYearlyCategoryRename = (categoryId: string, name: string) => {
        setYearlyGoals(prev => prev.map(cat => cat.id === categoryId ? { ...cat, name } : cat))
    }

    return (
        <PageLayout>
            {/* 周切换导航 + Tab 切换 */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <button onClick={() => setWeekKey(k => shiftWeek(k, -1))}
                        className="px-3 py-1 text-sm font-bold text-primary hover:bg-primary/10 rounded-lg transition-colors">◀</button>
                    <span className="text-sm font-bold text-on-surface">{weekKey} · {weekly.dateRange.label}</span>
                    <button onClick={() => setWeekKey(k => shiftWeek(k, 1))}
                        className="px-3 py-1 text-sm font-bold text-primary hover:bg-primary/10 rounded-lg transition-colors">▶</button>
                    {weekly.loading && <span className="text-sm text-primary animate-pulse">加载中...</span>}
                    {weekly.error && <span className="text-sm text-error">{weekly.error}</span>}
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setActiveTab('review')}
                        className={activeTab === 'review'
                            ? 'px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold transition-colors'
                            : 'px-4 py-2 bg-surface-container-low text-secondary rounded-lg text-sm font-bold hover:bg-surface-container transition-colors'}>
                        周度数据
                    </button>
                    <button onClick={() => setActiveTab('text')}
                        className={activeTab === 'text'
                            ? 'px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold transition-colors'
                            : 'px-4 py-2 bg-surface-container-low text-secondary rounded-lg text-sm font-bold hover:bg-surface-container transition-colors'}>
                        周记文字
                    </button>
                </div>
            </div>

            {activeTab === 'review' ? (
                <WeeklyReview
                    yearlyGoals={yearlyGoals}
                    onYearlyGoalToggle={handleYearlyGoalToggle}
                    onYearlyGoalTextChange={handleYearlyGoalTextChange}
                    onYearlyGoalDelete={handleYearlyGoalDelete}
                    onYearlyGoalAdd={handleYearlyGoalAdd}
                    onYearlyCategoryAdd={handleYearlyCategoryAdd}
                    onYearlyCategoryDelete={handleYearlyCategoryDelete}
                    onYearlyCategoryRename={handleYearlyCategoryRename}
                    weekRating={weekly.weekRating}
                    onWeekRatingChange={weekly.setWeekRating}
                    habits={weekly.habits}
                    onHabitToggle={handleHabitToggle}
                    objectives={weekly.objectives}
                    onObjectiveChange={handleObjectiveChange}
                    onObjectiveStatusToggle={handleObjectiveStatusToggle}
                    onObjectiveDelete={handleObjectiveDelete}
                    onObjectiveAdd={handleObjectiveAdd}
                    weekLabel={`${weekKey} · ${weekly.dateRange.label}`}
                    aggregation={weekly.aggregation}
                />
            ) : (
                <WeeklyText
                    textRecords={weekly.textRecords}
                    onTextRecordChange={weekly.setTextRecords}
                    inspiration={weekly.inspiration}
                    onInspirationChange={weekly.setInspiration}
                />
            )}

            <SaveButton
                label={weekly.saving ? '保存中...' : '保存周记'}
                onSave={weekly.save}
            />
        </PageLayout>
    )
}

export default Weekly
