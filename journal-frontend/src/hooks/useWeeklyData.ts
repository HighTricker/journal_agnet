import { useState, useEffect, useCallback } from 'react'
import { weeklyApi } from '../api/client'
import type { WeeklySaveRequest, WeeklyAggregation } from '../api/client'
import type { HabitRow, Objective } from '../mocks/weeklyReview'

// ==================== 周号计算 ====================

function getISOWeekKey(d: Date): string {
    // ISO 周号计算
    const tmp = new Date(d.getTime())
    tmp.setDate(tmp.getDate() + 3 - ((tmp.getDay() + 6) % 7))
    const week1 = new Date(tmp.getFullYear(), 0, 4)
    const weekNum = 1 + Math.round(((tmp.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
    return `${tmp.getFullYear()}-W${String(weekNum).padStart(2, '0')}`
}

function getWeekMonday(weekKey: string): Date {
    const [yearStr, weekStr] = weekKey.split('-W')
    const year = parseInt(yearStr)
    const week = parseInt(weekStr)
    // ISO: week 1 contains Jan 4
    const jan4 = new Date(year, 0, 4)
    const dayOfWeek = jan4.getDay() || 7 // 1=Mon..7=Sun
    const monday = new Date(jan4)
    monday.setDate(jan4.getDate() - dayOfWeek + 1 + (week - 1) * 7)
    return monday
}

function getWeekDateRange(weekKey: string): { start: string; end: string; label: string } {
    const monday = getWeekMonday(weekKey)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    const fmt = (d: Date) => `${d.getMonth() + 1}月${d.getDate()}日`
    return {
        start: monday.toISOString().slice(0, 10),
        end: sunday.toISOString().slice(0, 10),
        label: `${fmt(monday)} - ${fmt(sunday)}`,
    }
}

function shiftWeek(weekKey: string, delta: number): string {
    const monday = getWeekMonday(weekKey)
    monday.setDate(monday.getDate() + delta * 7)
    return getISOWeekKey(monday)
}

// ==================== 数据转换 ====================

const DAY_KEYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

function apiHabitsToFrontend(apiHabits: Array<Record<string, string>>): HabitRow[] {
    return apiHabits.map(h => ({
        name: h['习惯'] || '',
        checks: DAY_KEYS.map(day => h[day] === '✅'),
    }))
}

function frontendHabitsToApi(habits: HabitRow[]) {
    return habits.map(h => {
        const row: Record<string, string> = { 习惯: h.name }
        DAY_KEYS.forEach((day, i) => {
            row[day] = h.checks[i] ? '✅' : ''
        })
        return row as { 习惯: string; Mon: string; Tue: string; Wed: string; Thu: string; Fri: string; Sat: string; Sun: string }
    })
}

const STATUS_MAP_TO_FRONTEND: Record<string, Objective['status']> = {
    '✅': 'completed',
    '⚠️': 'in-progress',
    '❌': 'missed',
}
const STATUS_MAP_TO_BACKEND: Record<string, string> = {
    'completed': '✅',
    'in-progress': '⚠️',
    'missed': '❌',
}
const ICON_MAP: Record<Objective['status'], string> = {
    'completed': 'task_alt',
    'in-progress': 'pending',
    'missed': 'error_outline',
}

function apiTasksToObjectives(apiTasks: Array<Record<string, string>>): Objective[] {
    return apiTasks.map((t, i) => {
        const status = STATUS_MAP_TO_FRONTEND[t['状态']] || 'in-progress'
        return {
            id: i + 1,
            title: t['计划事项'] || '',
            subtitle: t['实际完成'] || '',
            status,
            icon: ICON_MAP[status],
        }
    })
}

function objectivesToApiTasks(objectives: Objective[]) {
    return objectives.map(o => ({
        分类: '',
        计划事项: o.title,
        实际完成: o.subtitle,
        状态: STATUS_MAP_TO_BACKEND[o.status] || '',
        原因分析: '',
    }))
}

// 后端周记反思字段 → 前端 textRecords key
const WEEKLY_TEXT_MAP: Record<string, string> = {
    Highlights: 'highlights',
    Challenges: 'challenges',
    Reflect_Good: 'reflect_good',
    Reflect_Improve: 'reflect_improve',
    Reflect_Next_Week: 'reflect_next_week',
    Words_To_Self: 'words_to_self',
    // 每日事项记录
    Record_Mon: 'item_周一',
    Record_Tue: 'item_周二',
    Record_Wed: 'item_周三',
    Record_Thu: 'item_周四',
    Record_Fri: 'item_周五',
    Record_Sat: 'item_周六',
    Record_Sun: 'item_周日',
}
const WEEKLY_TEXT_MAP_REVERSE = Object.fromEntries(
    Object.entries(WEEKLY_TEXT_MAP).map(([k, v]) => [v, k])
)

// ==================== Hook ====================

export function useWeeklyData(weekKey: string) {
    const [weekRating, setWeekRating] = useState<number | null>(null)
    const [habits, setHabits] = useState<HabitRow[]>([])
    const [objectives, setObjectives] = useState<Objective[]>([])
    const [textRecords, setTextRecords] = useState<Record<string, string>>({})
    const [inspiration, setInspiration] = useState('')
    const [aggregation, setAggregation] = useState<WeeklyAggregation | null>(null)

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)

    const dateRange = getWeekDateRange(weekKey)

    // 加载数据
    useEffect(() => {
        if (!weekKey) return
        let cancelled = false

        async function load() {
            setLoading(true)
            setError(null)
            try {
                const [weeklyResult, aggResult] = await Promise.allSettled([
                    weeklyApi.get(weekKey),
                    weeklyApi.aggregation(weekKey),
                ])

                if (cancelled) return

                if (weeklyResult.status === 'fulfilled') {
                    const { summary, habits: apiHabits, tasks } = weeklyResult.value
                    const s = summary as Record<string, unknown>

                    setWeekRating(s.Weekly_Score ? Number(s.Weekly_Score) : null)
                    setHabits(apiHabitsToFrontend(apiHabits))
                    setObjectives(apiTasksToObjectives(tasks))

                    // 反思文字
                    const records: Record<string, string> = {}
                    for (const [backendKey, frontendKey] of Object.entries(WEEKLY_TEXT_MAP)) {
                        const val = s[backendKey]
                        if (typeof val === 'string' && val) records[frontendKey] = val
                    }
                    setTextRecords(records)
                    setInspiration(String(s.Thoughts || ''))
                } else {
                    // 没有数据，重置
                    setWeekRating(null)
                    setHabits([])
                    setObjectives([])
                    setTextRecords({})
                    setInspiration('')
                }

                if (aggResult.status === 'fulfilled') {
                    setAggregation(aggResult.value)
                } else {
                    setAggregation(null)
                }
            } catch (e) {
                if (!cancelled) setError(e instanceof Error ? e.message : '加载失败')
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        load()
        return () => { cancelled = true }
    }, [weekKey])

    // 保存
    const save = useCallback(async () => {
        if (!weekKey) return
        setSaving(true)
        setError(null)
        try {
            const reflectFields: Record<string, unknown> = {}
            for (const [frontendKey, backendKey] of Object.entries(WEEKLY_TEXT_MAP_REVERSE)) {
                reflectFields[backendKey] = textRecords[frontendKey] || ''
            }

            const payload: WeeklySaveRequest = {
                summary: {
                    Weekly_Score: weekRating,
                    ...aggregation,
                    ...reflectFields,
                    Thoughts: inspiration,
                },
                habits: frontendHabitsToApi(habits),
                tasks: objectivesToApiTasks(objectives),
            }
            await weeklyApi.save(weekKey, payload)
            alert('周记保存成功！')
        } catch (e) {
            setError(e instanceof Error ? e.message : '保存失败')
            alert('保存失败：' + (e instanceof Error ? e.message : '未知错误'))
        } finally {
            setSaving(false)
        }
    }, [weekKey, weekRating, habits, objectives, textRecords, inspiration, aggregation])

    return {
        weekKey,
        dateRange,
        weekRating, setWeekRating,
        habits, setHabits,
        objectives, setObjectives,
        textRecords, setTextRecords: (key: string, value: string) =>
            setTextRecords(prev => ({ ...prev, [key]: value })),
        inspiration, setInspiration,
        aggregation,
        loading, error, saving,
        save,
    }
}

export { getISOWeekKey, shiftWeek, getWeekDateRange }
