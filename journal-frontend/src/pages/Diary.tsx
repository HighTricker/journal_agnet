import { useState, useEffect, useCallback, useRef } from 'react'
import PageLayout from '../components/layout/PageLayout'
import DiarySchedule from './DiarySchedule'
import DiaryJournal from './DiaryJournal'
import { useDiaryData } from '../hooks/useDiaryData'
import { useCrossPageGoals } from '../hooks/useCrossPageGoals'
import { usePageActions } from '../hooks/usePageActions'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import {
    YEARLY_GOALS,
} from '../mocks/diarySchedule'
import type { YearlyGoalCategory } from '../mocks/diarySchedule'

// 获取今天的日期字符串
function getTodayStr(): string {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// 从 URL ?date= 参数读取初始日期，无效则回退到今天
function getInitialDate(): string {
    const params = new URLSearchParams(window.location.search)
    const dateParam = params.get('date')
    if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
        return dateParam
    }
    return getTodayStr()
}

function Diary() {
    const [activeTab, setActiveTab] = useState<'schedule' | 'journal'>('schedule')

    const tabLabel = activeTab === 'schedule' ? '每日日程' : '生活记录'
    useDocumentTitle(`日记-${tabLabel}`)

    // 当前选中的日期（完整格式 YYYY-MM-DD，优先从 URL 读取）
    const [selectedDateStr, setSelectedDateStr] = useState(getInitialDate)

    // 日历显示的年月（跟随初始日期）
    const initialDate = getInitialDate()
    const [calendarYear, setCalendarYear] = useState(parseInt(initialDate.split('-')[0]))
    const [calendarMonth, setCalendarMonth] = useState(parseInt(initialDate.split('-')[1]))

    // 从 API 加载真实数据（日历打点跟随日历显示月份）
    const calendarMonthStr = `${calendarYear}-${String(calendarMonth).padStart(2, '0')}`
    const diary = useDiaryData(selectedDateStr, calendarMonthStr)

    // 跨页目标同步：加载周/月目标，toggle 时立即保存回对应 API
    const crossGoals = useCrossPageGoals(selectedDateStr)

    /* ========== 年度目标（暂时还用 mock，后端没有此数据） ========== */
    const [yearlyGoals, setYearlyGoals] = useState<YearlyGoalCategory[]>(
        YEARLY_GOALS.map((cat) => ({ ...cat, goals: cat.goals.map((g) => ({ ...g })) }))
    )

    /* ========== 日历联动：监听 WeekStrip 的 datechange 事件 ========== */
    const applyDate = useCallback((dateStr: string) => {
        setSelectedDateStr(dateStr)
        const [y, m] = dateStr.split('-')
        setCalendarYear(parseInt(y))
        setCalendarMonth(parseInt(m))
        const url = new URL(window.location.href)
        url.searchParams.set('date', dateStr)
        window.history.replaceState({}, '', url.toString())
    }, [])

    useEffect(() => {
        const handler = (e: Event) => {
            const detail = (e as CustomEvent).detail
            if (detail?.date && detail?.source === 'weekstrip') {
                applyDate(detail.date)
            }
        }
        window.addEventListener('datechange', handler)
        return () => window.removeEventListener('datechange', handler)
    }, [applyDate])

    /* ========== 日历：点击日期 + 月份切换 ========== */
    const handleSelectDate = (dateStr: string) => {
        applyDate(dateStr)
        // 广播事件，让 WeekStrip 联动
        window.dispatchEvent(new CustomEvent('datechange', { detail: { date: dateStr, source: 'minicalendar' } }))
    }

    const handlePrevMonth = () => {
        setCalendarMonth((prev) => {
            if (prev === 1) {
                setCalendarYear((y) => y - 1)
                return 12
            }
            return prev - 1
        })
    }

    const handleNextMonth = () => {
        setCalendarMonth((prev) => {
            if (prev === 12) {
                setCalendarYear((y) => y + 1)
                return 1
            }
            return prev + 1
        })
    }

    /* ========== 年度目标 Handler（不变） ========== */
    const handleYearlyGoalToggle = (categoryId: string, goalId: string) => {
        setYearlyGoals((prev) =>
            prev.map((cat) =>
                cat.id === categoryId
                    ? { ...cat, goals: cat.goals.map((g) => (g.id === goalId ? { ...g, completed: !g.completed } : g)) }
                    : cat
            )
        )
    }

    const handleYearlyGoalTextChange = (categoryId: string, goalId: string, text: string) => {
        setYearlyGoals((prev) =>
            prev.map((cat) =>
                cat.id === categoryId
                    ? { ...cat, goals: cat.goals.map((g) => (g.id === goalId ? { ...g, text } : g)) }
                    : cat
            )
        )
    }

    const handleYearlyGoalDelete = (categoryId: string, goalId: string) => {
        setYearlyGoals((prev) =>
            prev.map((cat) =>
                cat.id === categoryId
                    ? { ...cat, goals: cat.goals.filter((g) => g.id !== goalId) }
                    : cat
            )
        )
    }

    const handleYearlyGoalAdd = (categoryId: string) => {
        setYearlyGoals((prev) =>
            prev.map((cat) =>
                cat.id === categoryId
                    ? { ...cat, goals: [...cat.goals, { id: Date.now().toString(), text: '', completed: false }] }
                    : cat
            )
        )
    }

    const handleYearlyCategoryAdd = () => {
        setYearlyGoals((prev) => [
            ...prev,
            { id: Date.now().toString(), name: '新分类', goals: [] },
        ])
    }

    const handleYearlyCategoryDelete = (categoryId: string) => {
        setYearlyGoals((prev) => prev.filter((cat) => cat.id !== categoryId))
    }

    const handleYearlyCategoryRename = (categoryId: string, name: string) => {
        setYearlyGoals((prev) =>
            prev.map((cat) => (cat.id === categoryId ? { ...cat, name } : cat))
        )
    }

    /* ========== 日程表编辑 ========== */
    const handleCellEdit = (rowIndex: number, field: 'plan' | 'actual' | 'remarks', value: string) => {
        diary.setSchedule((prev) =>
            prev.map((row, i) => (i === rowIndex ? { ...row, [field]: value } : row))
        )
    }

    /* ========== 今日目标 Toggle ========== */
    const handleTodayToggle = (index: number) => {
        diary.setTodayGoals((prev) =>
            prev.map((g, i) => (i === index ? { ...g, completed: !g.completed } : g))
        )
    }

    const handleTodayGoalTextChange = (index: number, text: string) => {
        diary.setTodayGoals((prev) =>
            prev.map((g, i) => (i === index ? { ...g, text } : g))
        )
    }

    const handleTodayGoalDelete = (index: number) => {
        diary.setTodayGoals((prev) => prev.filter((_, i) => i !== index))
    }

    const handleTodayGoalAdd = () => {
        diary.setTodayGoals((prev) => [...prev, { text: '', completed: false }])
    }

    /* ========== 注册顶栏 actions（子 Tab + 保存按钮 + 状态） ========== */
    const { setState: setPageActions, reset: resetPageActions } = usePageActions()
    // diary.save 每次按键都会变（它依赖了 schedule 等表单状态）。用 ref 包一层得到引用稳定的
    // stableSave，避免下面的 useEffect 每次按键都重新执行 setPageActions → 触发重渲染雪崩。
    const saveRef = useRef(diary.save)
    saveRef.current = diary.save
    const stableSave = useCallback(() => { saveRef.current() }, [])
    useEffect(() => {
        setPageActions({
            subTabs: [
                { key: 'schedule', label: '每日日程' },
                { key: 'journal', label: '生活记录' },
            ],
            activeSubTab: activeTab,
            onSubTabChange: (k) => setActiveTab(k as 'schedule' | 'journal'),
            saveLabel: diary.saving ? '保存中...' : '保存日记',
            onSave: stableSave,
            isSaving: diary.saving,
            statusText: diary.loading ? '加载中...' : diary.error,
            statusType: diary.loading ? 'loading' : (diary.error ? 'error' : null),
        })
        return resetPageActions
    }, [activeTab, diary.saving, diary.loading, diary.error, stableSave, setPageActions, resetPageActions])

    return (
        <PageLayout>
            {/* 条件渲染子页面 */}
            {activeTab === 'schedule' ? (
                <DiarySchedule
                    yearlyGoals={yearlyGoals}
                    onYearlyGoalToggle={handleYearlyGoalToggle}
                    onYearlyGoalTextChange={handleYearlyGoalTextChange}
                    onYearlyGoalDelete={handleYearlyGoalDelete}
                    onYearlyGoalAdd={handleYearlyGoalAdd}
                    onYearlyCategoryAdd={handleYearlyCategoryAdd}
                    onYearlyCategoryDelete={handleYearlyCategoryDelete}
                    onYearlyCategoryRename={handleYearlyCategoryRename}
                    goals={{
                        monthly: crossGoals.monthlyGoals,
                        weekly: crossGoals.weeklyGoals,
                        today: diary.data.todayGoals,
                    }}
                    onMonthlyUpdate={crossGoals.updateMonthlyGoals}
                    onWeeklyUpdate={crossGoals.updateWeeklyGoals}
                    onTodayToggle={handleTodayToggle}
                    schedule={diary.data.schedule}
                    onCellEdit={handleCellEdit}
                    onTodayGoalTextChange={handleTodayGoalTextChange}
                    onTodayGoalDelete={handleTodayGoalDelete}
                    onTodayGoalAdd={handleTodayGoalAdd}
                    dateLabel={(() => {
                        const [y, m, d] = selectedDateStr.split('-')
                        const base = `${y}年${parseInt(m)}月${parseInt(d)}日`
                        return diary.data.diaryNo
                            ? `${base} · ${diary.data.weekdayName} · No.${diary.data.diaryNo}`
                            : base
                    })()}
                    calendarYear={calendarYear}
                    calendarMonth={calendarMonth}
                    selectedDateStr={selectedDateStr}
                    calendarDots={diary.calendarDots}
                    onSelectDate={handleSelectDate}
                    onPrevMonth={handlePrevMonth}
                    onNextMonth={handleNextMonth}
                />
            ) : (
                <DiaryJournal
                    mood={diary.data.mood}
                    onMoodChange={diary.setMood}
                    sleepQuality={diary.data.sleepQuality}
                    onSleepQualityChange={diary.setSleepQuality}
                    sleepTime={diary.data.sleepTime}
                    onSleepTimeChange={diary.setSleepTime}
                    wakeTime={diary.data.wakeTime}
                    onWakeTimeChange={diary.setWakeTime}
                    metrics={diary.data.metrics}
                    onMetricChange={diary.setMetric}
                    textRecords={diary.data.textRecords}
                    onTextRecordChange={diary.setTextRecord}
                    inspiration={diary.data.inspiration}
                    onInspirationChange={diary.setInspiration}
                    thoughts={diary.data.thoughts}
                    onThoughtsChange={diary.setThoughts}
                />
            )}
        </PageLayout>
    )
}

export default Diary
