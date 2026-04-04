import { useState, useEffect, useCallback } from 'react'
import { monthlyApi } from '../api/client'
import type { MonthlySaveRequest, MonthlyAggregation } from '../api/client'
import type { MonthlyObjective } from '../mocks/monthlyReview'

// ==================== 月号计算 ====================

function getCurrentMonthKey(): string {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function shiftMonth(monthKey: string, delta: number): string {
    const [y, m] = monthKey.split('-').map(Number)
    const d = new Date(y, m - 1 + delta, 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function getMonthLabel(monthKey: string): string {
    const [y, m] = monthKey.split('-').map(Number)
    return `${y}年${m}月`
}

// ==================== 数据转换 ====================

const STATUS_MAP_TO_FRONTEND: Record<string, MonthlyObjective['status']> = {
    '✅': 'completed',
    '⚠️': 'in-progress',
    '❌': 'missed',
}
const STATUS_MAP_TO_BACKEND: Record<string, string> = {
    'completed': '✅',
    'in-progress': '⚠️',
    'missed': '❌',
}
const ICON_MAP: Record<MonthlyObjective['status'], string> = {
    'completed': 'task_alt',
    'in-progress': 'pending',
    'missed': 'error_outline',
}

function apiTasksToObjectives(apiTasks: Array<Record<string, string>>): MonthlyObjective[] {
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

function objectivesToApiTasks(objectives: MonthlyObjective[]) {
    return objectives.map(o => ({
        分类: '',
        计划事项: o.title,
        实际完成: o.subtitle,
        状态: STATUS_MAP_TO_BACKEND[o.status] || '',
        原因分析: '',
    }))
}

// 后端月记反思字段 → 前端 textRecords key
const MONTHLY_TEXT_MAP: Record<string, string> = {
    Highlights: 'highlights',
    Challenges: 'challenges',
    Reflect_Good: 'reflect_good',
    Reflect_Improve: 'reflect_improve',
    Reflect_Cognitive: 'reflect_cognitive',
    Reflect_Next_Month: 'reflect_next_month',
    Reading_Books: 'reading_books',
    Learning_Content: 'learning_content',
    Words_To_Self: 'words_to_self',
    // 每周事项记录
    Record_Week1: 'item_第一周',
    Record_Week2: 'item_第二周',
    Record_Week3: 'item_第三周',
    Record_Week4: 'item_第四周',
    Record_Week5: 'item_第五周',
}
const MONTHLY_TEXT_MAP_REVERSE = Object.fromEntries(
    Object.entries(MONTHLY_TEXT_MAP).map(([k, v]) => [v, k])
)

// ==================== Hook ====================

export function useMonthlyData(monthKey: string) {
    const [monthRating, setMonthRating] = useState<number | null>(null)
    const [objectives, setObjectives] = useState<MonthlyObjective[]>([])
    const [textRecords, setTextRecords] = useState<Record<string, string>>({})
    const [inspiration, setInspiration] = useState('')
    const [aggregation, setAggregation] = useState<MonthlyAggregation | null>(null)

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)

    const monthLabel = getMonthLabel(monthKey)

    // 加载数据
    useEffect(() => {
        if (!monthKey) return
        let cancelled = false

        async function load() {
            setLoading(true)
            setError(null)
            try {
                const [monthlyResult, aggResult] = await Promise.allSettled([
                    monthlyApi.get(monthKey),
                    monthlyApi.aggregation(monthKey),
                ])

                if (cancelled) return

                if (monthlyResult.status === 'fulfilled') {
                    const { summary, tasks } = monthlyResult.value
                    const s = summary as Record<string, unknown>

                    setMonthRating(s.Monthly_Score ? Number(s.Monthly_Score) : null)
                    setObjectives(apiTasksToObjectives(tasks))

                    const records: Record<string, string> = {}
                    for (const [backendKey, frontendKey] of Object.entries(MONTHLY_TEXT_MAP)) {
                        const val = s[backendKey]
                        if (typeof val === 'string' && val) records[frontendKey] = val
                    }
                    setTextRecords(records)
                    setInspiration(String(s.Thoughts || ''))
                } else {
                    setMonthRating(null)
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
    }, [monthKey])

    // 保存
    const save = useCallback(async () => {
        if (!monthKey) return
        setSaving(true)
        setError(null)
        try {
            const reflectFields: Record<string, unknown> = {}
            for (const [frontendKey, backendKey] of Object.entries(MONTHLY_TEXT_MAP_REVERSE)) {
                reflectFields[backendKey] = textRecords[frontendKey] || ''
            }

            const payload: MonthlySaveRequest = {
                summary: {
                    Monthly_Score: monthRating,
                    ...aggregation,
                    ...reflectFields,
                    Thoughts: inspiration,
                },
                tasks: objectivesToApiTasks(objectives),
            }
            await monthlyApi.save(monthKey, payload)
            alert('月记保存成功！')
        } catch (e) {
            setError(e instanceof Error ? e.message : '保存失败')
            alert('保存失败：' + (e instanceof Error ? e.message : '未知错误'))
        } finally {
            setSaving(false)
        }
    }, [monthKey, monthRating, objectives, textRecords, inspiration, aggregation])

    return {
        monthKey,
        monthLabel,
        monthRating, setMonthRating,
        objectives, setObjectives,
        textRecords, setTextRecords: (key: string, value: string) =>
            setTextRecords(prev => ({ ...prev, [key]: value })),
        inspiration, setInspiration,
        aggregation,
        loading, error, saving,
        save,
    }
}

export { getCurrentMonthKey, shiftMonth, getMonthLabel }
