import { useState, useEffect, useCallback } from 'react'
import { diaryApi } from '../api/client'
import type { DiarySaveRequest } from '../api/client'
import type { ScheduleRow } from '../mocks/diarySchedule'
import type { GoalItem } from '../mocks/diarySchedule'

// ==================== 类型 ====================

interface DiaryState {
    mood: number | null
    sleepQuality: number | null
    sleepTime: { hour: string; minute: string }
    wakeTime: { hour: string; minute: string }
    metrics: { pomo: number; zen: number; ai: number }
    textRecords: Record<string, string>
    inspiration: string
    thoughts: string
    todayGoals: GoalItem[]
    schedule: ScheduleRow[]
    diaryNo: number | null
    weekdayName: string
}

interface UseDiaryDataReturn {
    data: DiaryState
    loading: boolean
    error: string | null
    saving: boolean
    calendarDots: string[]
    setMood: (v: number) => void
    setSleepQuality: (v: number) => void
    setSleepTime: (field: 'hour' | 'minute', value: string) => void
    setWakeTime: (field: 'hour' | 'minute', value: string) => void
    setMetric: (key: 'pomo' | 'zen' | 'ai', value: number) => void
    setTextRecord: (key: string, value: string) => void
    setInspiration: (v: string) => void
    setThoughts: (v: string) => void
    setTodayGoals: React.Dispatch<React.SetStateAction<GoalItem[]>>
    setSchedule: React.Dispatch<React.SetStateAction<ScheduleRow[]>>
    save: () => Promise<void>
}

// ==================== 转换函数 ====================

// 前端 textRecords key → 后端 Reflect_* 字段名
const TEXT_RECORD_MAP: Record<string, string> = {
    ai_usage: 'Reflect_AI_Usage',
    ai_learning: 'Reflect_AI_Learning',  // 新增卡片
    reading: 'Reflect_Reading',
    meditation: 'Reflect_Meditation',
    well_done: 'Reflect_Good_Actions',
    improvement: 'Reflect_Bad_Actions',
    to_self: 'Reflect_Words_To_Self',
    sleep_dreams: 'Reflect_Sleep_Dreams',
}

// 反向映射
const REFLECT_TO_TEXT: Record<string, string> = Object.fromEntries(
    Object.entries(TEXT_RECORD_MAP).map(([k, v]) => [v, k])
)

function parseTime(timeStr: unknown): { hour: string; minute: string } {
    if (typeof timeStr === 'string' && timeStr.includes(':')) {
        const [h, m] = timeStr.split(':')
        return { hour: h.padStart(2, '0'), minute: m.padStart(2, '0') }
    }
    return { hour: '00', minute: '00' }
}

function timeSlotToScheduleRow(slot: Record<string, string>): ScheduleRow {
    // 后端 "00:00-00:30" → 前端 "00:00 - 00:30"
    const rawTime = slot['时间段'] || ''
    const time = rawTime.replace('-', ' - ')
    return {
        time,
        plan: slot['计划'] || '',
        actual: slot['实际'] || '',
        remarks: slot['备注'] || '',
    }
}

function scheduleRowToTimeSlot(row: ScheduleRow) {
    // 前端 "00:00 - 00:30" → 后端 "00:00-00:30"
    const timeSlot = row.time.replace(' - ', '-')
    // 判断状态：如果 actual 非空且不是 '--'，标记为完成
    const status = row.actual && row.actual !== '--' && row.actual !== '' ? '✅' : ''
    return {
        时间段: timeSlot,
        计划: row.plan,
        实际: row.actual === '--' ? '' : row.actual,
        状态: status,
        备注: row.remarks === '--' ? '' : row.remarks,
    }
}

function cleanTaskText(raw: string): string {
    // 修复 CSV 中被存成 "['文字']" 格式的数据
    let text = raw || ''
    if (text.startsWith("['") && text.endsWith("']")) {
        text = text.slice(2, -2)
    } else if (text.startsWith("[\"") && text.endsWith("\"]")) {
        text = text.slice(2, -2)
    }
    return text
}

function taskToGoal(task: Record<string, string>): GoalItem {
    return {
        text: cleanTaskText(task['计划事项']),
        completed: task['状态'] === '✅',
    }
}

function goalToTask(goal: GoalItem) {
    return {
        计划事项: String(goal.text || ''),
        实际完成: goal.completed ? '完成' : '',
        状态: goal.completed ? '✅' : '',
        原因分析: '',
    }
}

// ==================== Hook ====================

export function useDiaryData(dateStr: string, calendarMonth?: string): UseDiaryDataReturn {
    const [mood, setMood] = useState<number | null>(null)
    const [sleepQuality, setSleepQuality] = useState<number | null>(null)
    const [sleepTime, setSleepTimeState] = useState({ hour: '22', minute: '00' })
    const [wakeTime, setWakeTimeState] = useState({ hour: '06', minute: '00' })
    const [metrics, setMetrics] = useState({ pomo: 0, zen: 0, ai: 0 })
    const [textRecords, setTextRecords] = useState<Record<string, string>>({})
    const [inspiration, setInspiration] = useState('')
    const [thoughts, setThoughts] = useState('')
    const [todayGoals, setTodayGoals] = useState<GoalItem[]>([])
    const [schedule, setSchedule] = useState<ScheduleRow[]>([])
    const [diaryNo, setDiaryNo] = useState<number | null>(null)
    const [weekdayName, setWeekdayName] = useState('')

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [calendarDots, setCalendarDots] = useState<string[]>([])

    // 加载日记数据
    useEffect(() => {
        if (!dateStr) return
        let cancelled = false

        async function load() {
            setLoading(true)
            setError(null)
            try {
                // 并行请求日记数据和元数据
                const [diaryResult, metaResult] = await Promise.allSettled([
                    diaryApi.get(dateStr),
                    diaryApi.metadata(dateStr),
                ])

                if (cancelled) return

                // 元数据（总是有的）
                if (metaResult.status === 'fulfilled') {
                    setDiaryNo(metaResult.value.diary_no)
                    setWeekdayName(metaResult.value.weekday_name)
                }

                // 日记数据（总是 200，空日期时 summary 为空但 time_slots 有默认模板）
                if (diaryResult.status === 'fulfilled') {
                    const { summary, tasks, time_slots } = diaryResult.value
                    const s = summary as Record<string, unknown>
                    const hasData = Object.keys(s).length > 0

                    // 量化数据（有数据时填充，无数据时重置）
                    setMood(hasData && s.Mood ? Number(s.Mood) : null)
                    setSleepQuality(hasData && s.Sleep_Score ? Number(s.Sleep_Score) : null)
                    setSleepTimeState(hasData ? parseTime(s.Sleep_Bedtime) : { hour: '22', minute: '00' })
                    setWakeTimeState(hasData ? parseTime(s.Sleep_Waketime) : { hour: '06', minute: '00' })
                    setMetrics({
                        pomo: Number(s.Focus_Count) || 0,
                        zen: Number(s.Meditation_Minutes) || 0,
                        ai: Number(s.AI_Time) || 0,
                    })

                    // 反思文字
                    const records: Record<string, string> = {}
                    for (const [reflectKey, textKey] of Object.entries(REFLECT_TO_TEXT)) {
                        const val = s[reflectKey]
                        if (typeof val === 'string' && val) {
                            records[textKey] = val
                        }
                    }
                    setTextRecords(records)

                    // 灵感与启发 → Reflect_Thoughts，感悟与思考 → Reflect_Deep_Reflections
                    setInspiration(String(s.Reflect_Thoughts || ''))
                    setThoughts(String(s.Reflect_Deep_Reflections || ''))

                    // 任务 → 今日目标
                    const goals = tasks
                        .filter(t => t['计划事项'] && t['计划事项'] !== '此日未作安排')
                        .map(taskToGoal)
                    setTodayGoals(goals.length > 0 ? goals : [])

                    // 时间表（总是有值：有数据返回真实数据，无数据返回默认模板）
                    setSchedule(time_slots.map(timeSlotToScheduleRow))
                } else {
                    // API 调用失败（网络错误等）：重置所有数据
                    setMood(null)
                    setSleepQuality(null)
                    setSleepTimeState({ hour: '22', minute: '00' })
                    setWakeTimeState({ hour: '06', minute: '00' })
                    setMetrics({ pomo: 0, zen: 0, ai: 0 })
                    setTextRecords({})
                    setInspiration('')
                    setThoughts('')
                    setTodayGoals([])
                    setSchedule([])
                }
            } catch (e) {
                if (!cancelled) setError(e instanceof Error ? e.message : '加载失败')
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        load()
        return () => { cancelled = true }
    }, [dateStr])

    // 加载日历打点（跟随日历显示月份，不是选中日期）
    const effectiveMonth = calendarMonth || dateStr.slice(0, 7)
    useEffect(() => {
        if (!effectiveMonth) return
        diaryApi.calendar(effectiveMonth)
            .then(res => setCalendarDots(res.dates))
            .catch(() => setCalendarDots([]))
    }, [effectiveMonth])

    // 保存日记
    const save = useCallback(async () => {
        if (!dateStr) return
        setSaving(true)
        setError(null)

        try {
            // 计算睡眠时长
            const bedHour = parseInt(sleepTime.hour)
            const bedMin = parseInt(sleepTime.minute)
            const wakeHour = parseInt(wakeTime.hour)
            const wakeMin = parseInt(wakeTime.minute)
            let sleepHours = (wakeHour + wakeMin / 60) - (bedHour + bedMin / 60)
            if (sleepHours < 0) sleepHours += 24
            sleepHours = Math.round(sleepHours * 100) / 100

            // 构建反思字段
            const reflectFields: Record<string, string> = {}
            for (const [textKey, reflectKey] of Object.entries(TEXT_RECORD_MAP)) {
                reflectFields[reflectKey] = textRecords[textKey] || ''
            }

            const payload: DiarySaveRequest = {
                summary: {
                    Mood: mood,
                    Sleep_Score: sleepQuality,
                    Sleep_Bedtime: `${sleepTime.hour}:${sleepTime.minute}`,
                    Sleep_Waketime: `${wakeTime.hour}:${wakeTime.minute}`,
                    Sleep_Hours: sleepHours,
                    Focus_Count: metrics.pomo,
                    Meditation_Minutes: metrics.zen,
                    AI_Time: metrics.ai,
                    Masturbation_Count: 0,
                    ...reflectFields,
                    Reflect_Thoughts: inspiration,
                    Reflect_Deep_Reflections: thoughts,
                },
                tasks: todayGoals.length > 0
                    ? todayGoals.map(goalToTask)
                    : [{ 计划事项: '此日未作安排', 实际完成: '', 状态: '', 原因分析: '' }],
                time_slots: schedule.map(scheduleRowToTimeSlot),
            }

            await diaryApi.save(dateStr, payload)
            alert('日记保存成功！')
        } catch (e) {
            setError(e instanceof Error ? e.message : '保存失败')
            alert('保存失败：' + (e instanceof Error ? e.message : '未知错误'))
        } finally {
            setSaving(false)
        }
    }, [dateStr, mood, sleepQuality, sleepTime, wakeTime, metrics, textRecords, inspiration, thoughts, todayGoals, schedule])

    return {
        data: {
            mood, sleepQuality, sleepTime, wakeTime, metrics,
            textRecords, inspiration, thoughts, todayGoals, schedule,
            diaryNo, weekdayName,
        },
        loading,
        error,
        saving,
        calendarDots,
        setMood,
        setSleepQuality,
        setSleepTime: (field: 'hour' | 'minute', value: string) =>
            setSleepTimeState(prev => ({ ...prev, [field]: value })),
        setWakeTime: (field: 'hour' | 'minute', value: string) =>
            setWakeTimeState(prev => ({ ...prev, [field]: value })),
        setMetric: (key: 'pomo' | 'zen' | 'ai', value: number) =>
            setMetrics(prev => ({ ...prev, [key]: value })),
        setTextRecord: (key: string, value: string) =>
            setTextRecords(prev => ({ ...prev, [key]: value })),
        setInspiration,
        setThoughts,
        setTodayGoals,
        setSchedule,
        save,
    }
}
