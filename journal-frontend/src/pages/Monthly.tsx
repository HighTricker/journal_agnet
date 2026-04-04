import { useState } from 'react'
import PageLayout from '../components/layout/PageLayout'
import SaveButton from '../components/shared/SaveButton'
import MonthlyReview from './MonthlyReview'
import MonthlyText from './MonthlyText'
import { useMonthlyData, getCurrentMonthKey, shiftMonth } from '../hooks/useMonthlyData'
import type { MonthlyObjective } from '../mocks/monthlyReview'
import { YEARLY_GOALS } from '../mocks/diarySchedule'
import type { YearlyGoalCategory } from '../mocks/diarySchedule'

function Monthly() {
    const [activeTab, setActiveTab] = useState<'review' | 'text'>('review')

    // 月切换
    const [monthKey, setMonthKey] = useState(getCurrentMonthKey)

    // 从 API 加载真实数据
    const monthly = useMonthlyData(monthKey)

    /* ========== 年度目标（暂时还用 mock） ========== */
    const [yearlyGoals, setYearlyGoals] = useState<YearlyGoalCategory[]>(
        YEARLY_GOALS.map((cat) => ({ ...cat, goals: cat.goals.map((g) => ({ ...g })) }))
    )

    /* ---- handlers ---- */
    const handleObjectiveChange = (index: number, field: 'title' | 'subtitle', value: string) => {
        monthly.setObjectives(prev => prev.map((o, i) => i === index ? { ...o, [field]: value } : o))
    }

    const handleObjectiveStatusToggle = (index: number) => {
        const statusOrder: Array<MonthlyObjective['status']> = ['completed', 'in-progress', 'missed']
        monthly.setObjectives(prev => prev.map((o, i) => {
            if (i !== index) return o
            const currentIdx = statusOrder.indexOf(o.status)
            const nextStatus = statusOrder[(currentIdx + 1) % 3]
            const iconMap: Record<MonthlyObjective['status'], string> = {
                'completed': 'task_alt', 'in-progress': 'pending', 'missed': 'error_outline',
            }
            return { ...o, status: nextStatus, icon: iconMap[nextStatus] }
        }))
    }

    const handleObjectiveDelete = (index: number) => {
        monthly.setObjectives(prev => prev.filter((_, i) => i !== index))
    }

    const handleObjectiveAdd = () => {
        monthly.setObjectives(prev => [...prev, {
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
            {/* 月切换导航 + Tab 切换 */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <button onClick={() => setMonthKey(k => shiftMonth(k, -1))}
                        className="px-3 py-1 text-sm font-bold text-primary hover:bg-primary/10 rounded-lg transition-colors">◀</button>
                    <span className="text-sm font-bold text-on-surface">{monthly.monthLabel}</span>
                    <button onClick={() => setMonthKey(k => shiftMonth(k, 1))}
                        className="px-3 py-1 text-sm font-bold text-primary hover:bg-primary/10 rounded-lg transition-colors">▶</button>
                    {monthly.loading && <span className="text-sm text-primary animate-pulse">加载中...</span>}
                    {monthly.error && <span className="text-sm text-error">{monthly.error}</span>}
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setActiveTab('review')}
                        className={activeTab === 'review'
                            ? 'px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold transition-colors'
                            : 'px-4 py-2 bg-surface-container-low text-secondary rounded-lg text-sm font-bold hover:bg-surface-container transition-colors'}>
                        月度数据
                    </button>
                    <button onClick={() => setActiveTab('text')}
                        className={activeTab === 'text'
                            ? 'px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold transition-colors'
                            : 'px-4 py-2 bg-surface-container-low text-secondary rounded-lg text-sm font-bold hover:bg-surface-container transition-colors'}>
                        月记文字
                    </button>
                </div>
            </div>

            {activeTab === 'review' ? (
                <MonthlyReview
                    yearlyGoals={yearlyGoals}
                    onYearlyGoalToggle={handleYearlyGoalToggle}
                    onYearlyGoalTextChange={handleYearlyGoalTextChange}
                    onYearlyGoalDelete={handleYearlyGoalDelete}
                    onYearlyGoalAdd={handleYearlyGoalAdd}
                    onYearlyCategoryAdd={handleYearlyCategoryAdd}
                    onYearlyCategoryDelete={handleYearlyCategoryDelete}
                    onYearlyCategoryRename={handleYearlyCategoryRename}
                    monthRating={monthly.monthRating}
                    onMonthRatingChange={monthly.setMonthRating}
                    objectives={monthly.objectives}
                    onObjectiveChange={handleObjectiveChange}
                    onObjectiveStatusToggle={handleObjectiveStatusToggle}
                    onObjectiveDelete={handleObjectiveDelete}
                    onObjectiveAdd={handleObjectiveAdd}
                    monthLabel={monthly.monthLabel}
                    aggregation={monthly.aggregation}
                />
            ) : (
                <MonthlyText
                    textRecords={monthly.textRecords}
                    onTextRecordChange={monthly.setTextRecords}
                    inspiration={monthly.inspiration}
                    onInspirationChange={monthly.setInspiration}
                />
            )}

            <SaveButton
                label={monthly.saving ? '保存中...' : '保存月记'}
                onSave={monthly.save}
            />
        </PageLayout>
    )
}

export default Monthly
