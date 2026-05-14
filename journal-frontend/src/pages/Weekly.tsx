import { useState, useEffect } from 'react'
import PageLayout from '../components/layout/PageLayout'
import WeeklyReview from './WeeklyReview'
import WeeklyText from './WeeklyText'
import { useWeeklyData, getISOWeekKey, shiftWeek } from '../hooks/useWeeklyData'
import { usePageActions } from '../hooks/usePageActions'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import type { Objective } from '../mocks/weeklyReview'
import { YEARLY_GOALS } from '../mocks/diarySchedule'
import type { YearlyGoalCategory } from '../mocks/diarySchedule'

function Weekly() {
    const [activeTab, setActiveTab] = useState<'review' | 'text'>('review')

    const tabLabel = activeTab === 'review' ? '周度数据' : '周记文字'
    useDocumentTitle(`周记-${tabLabel}`)

    // 周切换
    const [weekKey, setWeekKey] = useState(() => getISOWeekKey(new Date()))

    // 从 API 加载真实数据
    const weekly = useWeeklyData(weekKey)

    /* ========== 注册顶栏 actions ========== */
    const { setState: setPageActions, reset: resetPageActions } = usePageActions()
    useEffect(() => {
        setPageActions({
            subTabs: [
                { key: 'review', label: '周度数据' },
                { key: 'text', label: '周记文字' },
            ],
            activeSubTab: activeTab,
            onSubTabChange: (k) => setActiveTab(k as 'review' | 'text'),
            saveLabel: weekly.saving ? '保存中...' : '保存周记',
            onSave: weekly.save,
            isSaving: weekly.saving,
            statusText: weekly.loading ? '加载中...' : weekly.error,
            statusType: weekly.loading ? 'loading' : (weekly.error ? 'error' : null),
        })
        return resetPageActions
    }, [activeTab, weekly.saving, weekly.loading, weekly.error, weekly.save, setPageActions, resetPageActions])

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
            {/* 周切换导航 */}
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setWeekKey(k => shiftWeek(k, -1))}
                    className="px-3 py-1 text-sm font-bold text-primary hover:bg-primary/10 rounded-lg transition-colors">◀</button>
                <span className="text-sm font-bold text-on-surface">{weekKey} · {weekly.dateRange.label}</span>
                <button onClick={() => setWeekKey(k => shiftWeek(k, 1))}
                    className="px-3 py-1 text-sm font-bold text-primary hover:bg-primary/10 rounded-lg transition-colors">▶</button>
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
        </PageLayout>
    )
}

export default Weekly
