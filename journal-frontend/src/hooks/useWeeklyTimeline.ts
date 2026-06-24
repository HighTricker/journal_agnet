import { useState, useEffect, useCallback, useRef } from 'react'
import { weeklyApi } from '../api/client'
import { useToast } from './useToast'
import type { TimelineLane, TimelineTask } from '../api/client'

// 与 useCrossPageGoals 一致的 ISO 周号计算
function getISOWeekKey(d: Date): string {
    const tmp = new Date(d.getTime())
    tmp.setDate(tmp.getDate() + 3 - ((tmp.getDay() + 6) % 7))
    const week1 = new Date(tmp.getFullYear(), 0, 4)
    const weekNum = 1 + Math.round(((tmp.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
    return `${tmp.getFullYear()}-W${String(weekNum).padStart(2, '0')}`
}

export const DAY_KEYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

/**
 * 每周事项时间轴数据 hook。
 * 泳道(lanes) = 当周周目标（含 goal_id）；卡片(tasks) = 挂在某目标某天的事项。
 * 所有编辑走「改本地 state + 整周 PUT」，后端回传最新 lanes（目标完成状态）后同步。
 */
export function useWeeklyTimeline(dateStr: string) {
    const { showToast } = useToast()
    const weekKey = getISOWeekKey(new Date(dateStr))

    const [lanes, setLanes] = useState<TimelineLane[]>([])
    const [tasks, setTasks] = useState<TimelineTask[]>([])
    const [monday, setMonday] = useState<string>('')
    const [loading, setLoading] = useState(true)

    // 最新 tasks 的引用，供 persist 读取，避免闭包拿到旧值
    const tasksRef = useRef<TimelineTask[]>([])
    useEffect(() => { tasksRef.current = tasks }, [tasks])

    useEffect(() => {
        let cancelled = false
        async function load() {
            setLoading(true)
            try {
                const data = await weeklyApi.getTimeline(weekKey)
                if (cancelled) return
                setLanes(data.lanes)
                setTasks(data.tasks)
                setMonday(data.monday)
            } catch (err) {
                if (cancelled) return
                setLanes([]); setTasks([])
                console.error('[时间轴加载失败]', err)
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        load()
        return () => { cancelled = true }
    }, [weekKey])

    // 整周保存：发当前 tasks，后端去空、补 id、回写目标完成，再用返回值同步
    const persist = useCallback(async (next: TimelineTask[]) => {
        setTasks(next)
        try {
            const resp = await weeklyApi.saveTimeline(weekKey, { tasks: next })
            setTasks(resp.tasks)
            setLanes(resp.lanes)
        } catch (err) {
            console.error('[时间轴保存失败]', err)
            showToast(`时间轴保存失败：${err instanceof Error ? err.message : '未知错误'}`, 'error')
        }
    }, [weekKey, showToast])

    // 新增一张卡片（已带文字）
    const addCard = useCallback((goalId: string, dayKey: string, text: string) => {
        const t = text.trim()
        if (!t) return
        const card: TimelineTask = { id: '', goal_id: goalId, 周几: dayKey, 内容: t, 完成: '' }
        persist([...tasksRef.current, card])
    }, [persist])

    // 编辑已有卡片文字（清空则删除）
    const editCard = useCallback((id: string, text: string) => {
        const t = text.trim()
        const next = t
            ? tasksRef.current.map(c => c.id === id ? { ...c, 内容: t } : c)
            : tasksRef.current.filter(c => c.id !== id)
        persist(next)
    }, [persist])

    const toggleCard = useCallback((id: string) => {
        persist(tasksRef.current.map(c => c.id === id ? { ...c, 完成: c.完成 === '✅' ? '' : '✅' } : c))
    }, [persist])

    const removeCard = useCallback((id: string) => {
        persist(tasksRef.current.filter(c => c.id !== id))
    }, [persist])

    return { weekKey, monday, lanes, tasks, loading, addCard, editCard, toggleCard, removeCard }
}
