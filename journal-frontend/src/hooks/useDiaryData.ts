import { useState, useEffect, useCallback } from 'react'
import { diaryApi } from '../api/client'
import { useToast } from './useToast'
import type { DiarySaveRequest } from '../api/client'
import type { ScheduleRow } from '../mocks/diarySchedule'
import type { GoalItem } from '../mocks/diarySchedule'

// ==================== 类型 ====================

interface DiaryState {
    mood: number | null
    energy: number | null
    sleepQuality: number | null
    wakeCount: number
    sleepTime: { hour: string; minute: string }
    wakeTime: { hour: string; minute: string }
    metrics: { pomo: number; zen: number; ai: number; fap: number }
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
    setEnergy: (v: number) => void
    setSleepQuality: (v: number) => void
    setWakeCount: (v: number) => void
    setSleepTime: (field: 'hour' | 'minute', value: string) => void
    setWakeTime: (field: 'hour' | 'minute', value: string) => void
    setMetric: (key: 'pomo' | 'zen' | 'ai' | 'fap', value: number) => void
    setTextRecord: (key: string, value: string) => void
    setInspiration: (v: string) => void
    setThoughts: (v: string) => void
    setTodayGoals: React.Dispatch<React.SetStateAction<GoalItem[]>>
    setSchedule: React.Dispatch<React.SetStateAction<ScheduleRow[]>>
    save: () => Promise<void>
}

// ==================== 转换函数 ====================

// 前端 textRecords key → 后端字段名（Reflect_* 反思 + Fork_* 分岔点 + Good_* 三件好事）
const TEXT_RECORD_MAP: Record<string, string> = {
    ai_usage: 'Reflect_AI_Usage',
    ai_learning: 'Reflect_AI_Learning',  // 新增卡片
    reading: 'Reflect_Reading',
    meditation: 'Reflect_Meditation',
    well_done: 'Reflect_Good_Actions',
    improvement: 'Reflect_Bad_Actions',
    to_self: 'Reflect_Words_To_Self',
    sleep_dreams: 'Reflect_Sleep_Dreams',
    // 今日分岔点（需求 40 单组 → 需求 45 扩展为 3 组）：第 1 组沿用原 key，第 2、3 组加 _2/_3
    fork_trigger: 'Fork_Trigger',
    fork_should: 'Fork_Should',
    fork_actual: 'Fork_Actual',
    fork_direction: 'Fork_Direction',
    fork_trigger_2: 'Fork_Trigger_2',
    fork_should_2: 'Fork_Should_2',
    fork_actual_2: 'Fork_Actual_2',
    fork_direction_2: 'Fork_Direction_2',
    fork_trigger_3: 'Fork_Trigger_3',
    fork_should_3: 'Fork_Should_3',
    fork_actual_3: 'Fork_Actual_3',
    fork_direction_3: 'Fork_Direction_3',
    // 今天的三件好事（需求 44）
    good_thing_1: 'Good_Thing_1',
    good_why_1: 'Good_Why_1',
    good_thing_2: 'Good_Thing_2',
    good_why_2: 'Good_Why_2',
    good_thing_3: 'Good_Thing_3',
    good_why_3: 'Good_Why_3',
}

// 未填写时保存为"无"、加载时"无"还原为空框的文本 key：
//   三件好事 6 格 + 分岔点 3 组各自的「情景/该做/实际」9 格（共 15 个）。
//   分岔点的「方向」是白名单 pill（未选存空串，"无"会被后端校验拒绝），故不在此列。
const GOOD_KEYS = ['good_thing_1', 'good_why_1', 'good_thing_2', 'good_why_2', 'good_thing_3', 'good_why_3']
const FORK_TEXT_KEYS = [
    'fork_trigger', 'fork_should', 'fork_actual',
    'fork_trigger_2', 'fork_should_2', 'fork_actual_2',
    'fork_trigger_3', 'fork_should_3', 'fork_actual_3',
]
const PLACEHOLDER_KEYS = [...GOOD_KEYS, ...FORK_TEXT_KEYS]
const EMPTY_PLACEHOLDER = '无'

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
    const { showToast } = useToast()
    const [mood, setMood] = useState<number | null>(null)
    const [energy, setEnergy] = useState<number | null>(null)
    const [sleepQuality, setSleepQuality] = useState<number | null>(null)
    const [wakeCount, setWakeCount] = useState(0)
    const [sleepTime, setSleepTimeState] = useState({ hour: '22', minute: '00' })
    const [wakeTime, setWakeTimeState] = useState({ hour: '06', minute: '00' })
    const [metrics, setMetrics] = useState({ pomo: 0, zen: 0, ai: 0, fap: 0 })
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
                    setEnergy(hasData && s.Energy_Score ? Number(s.Energy_Score) : null)
                    setSleepQuality(hasData && s.Sleep_Score ? Number(s.Sleep_Score) : null)
                    setWakeCount(hasData ? Number(s.Sleep_Wake_Count) || 0 : 0)
                    setSleepTimeState(hasData ? parseTime(s.Sleep_Bedtime) : { hour: '22', minute: '00' })
                    setWakeTimeState(hasData ? parseTime(s.Sleep_Waketime) : { hour: '06', minute: '00' })
                    setMetrics({
                        pomo: Number(s.Focus_Count) || 0,
                        zen: Number(s.Meditation_Minutes) || 0,
                        ai: Number(s.AI_Time) || 0,
                        fap: Number(s.Masturbation_Count) || 0,
                    })

                    // 反思文字（含分岔点/三件好事）
                    const records: Record<string, string> = {}
                    for (const [reflectKey, textKey] of Object.entries(REFLECT_TO_TEXT)) {
                        const val = s[reflectKey]
                        if (typeof val === 'string' && val) {
                            // 三件好事 / 分岔点文本的"无"是未填写占位，加载时还原为空框（trim 与保存端判空对称）
                            if (PLACEHOLDER_KEYS.includes(textKey) && val.trim() === EMPTY_PLACEHOLDER) continue
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
                    setEnergy(null)
                    setSleepQuality(null)
                    setWakeCount(0)
                    setSleepTimeState({ hour: '22', minute: '00' })
                    setWakeTimeState({ hour: '06', minute: '00' })
                    setMetrics({ pomo: 0, zen: 0, ai: 0, fap: 0 })
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

            // 构建反思字段（含分岔点/三件好事）
            const reflectFields: Record<string, string> = {}
            for (const [textKey, reflectKey] of Object.entries(TEXT_RECORD_MAP)) {
                reflectFields[reflectKey] = textRecords[textKey] || ''
            }
            // 三件好事 + 分岔点文本格子：未填写的保存为"无"（方向 pill 不在此列，未选存空串）
            for (const k of PLACEHOLDER_KEYS) {
                if (!(textRecords[k] || '').trim()) {
                    reflectFields[TEXT_RECORD_MAP[k]] = EMPTY_PLACEHOLDER
                }
            }

            const payload: DiarySaveRequest = {
                summary: {
                    Mood: mood,
                    Energy_Score: energy,
                    Sleep_Score: sleepQuality,
                    Sleep_Bedtime: `${sleepTime.hour}:${sleepTime.minute}`,
                    Sleep_Waketime: `${wakeTime.hour}:${wakeTime.minute}`,
                    Sleep_Hours: sleepHours,
                    Sleep_Wake_Count: wakeCount,
                    Focus_Count: metrics.pomo,
                    Meditation_Minutes: metrics.zen,
                    AI_Time: metrics.ai,
                    Masturbation_Count: metrics.fap,
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
            showToast('日记保存成功！', 'success')
        } catch (e) {
            const msg = e instanceof Error ? e.message : '未知错误'
            console.error('[日记保存失败]', e)
            setError(msg)
            showToast('保存失败：' + msg, 'error')
        } finally {
            setSaving(false)
        }
    }, [dateStr, mood, energy, sleepQuality, wakeCount, sleepTime, wakeTime, metrics, textRecords, inspiration, thoughts, todayGoals, schedule, showToast])

    return {
        data: {
            mood, energy, sleepQuality, wakeCount, sleepTime, wakeTime, metrics,
            textRecords, inspiration, thoughts, todayGoals, schedule,
            diaryNo, weekdayName,
        },
        loading,
        error,
        saving,
        calendarDots,
        setMood,
        setEnergy,
        setSleepQuality,
        setWakeCount,
        setSleepTime: (field: 'hour' | 'minute', value: string) =>
            setSleepTimeState(prev => ({ ...prev, [field]: value })),
        setWakeTime: (field: 'hour' | 'minute', value: string) =>
            setWakeTimeState(prev => ({ ...prev, [field]: value })),
        setMetric: (key: 'pomo' | 'zen' | 'ai' | 'fap', value: number) =>
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
