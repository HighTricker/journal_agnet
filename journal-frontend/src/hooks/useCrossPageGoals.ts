import { useState, useEffect, useCallback } from 'react'
import { weeklyApi, monthlyApi } from '../api/client'
import type { GoalItem } from '../mocks/diarySchedule'

// ==================== 周号/月号计算 ====================

function getISOWeekKey(d: Date): string {
    const tmp = new Date(d.getTime())
    tmp.setDate(tmp.getDate() + 3 - ((tmp.getDay() + 6) % 7))
    const week1 = new Date(tmp.getFullYear(), 0, 4)
    const weekNum = 1 + Math.round(((tmp.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
    return `${tmp.getFullYear()}-W${String(weekNum).padStart(2, '0')}`
}

function getMonthKey(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

// ==================== 转换函数 ====================

const STATUS_TO_BOOL: Record<string, boolean> = { '✅': true, '⚠️': false, '❌': false }

function tasksToGoals(tasks: Array<Record<string, string>>): GoalItem[] {
    return tasks
        .filter(t => t['计划事项'] && t['计划事项'].trim() !== '')
        .map(t => ({
            text: t['计划事项'],
            completed: STATUS_TO_BOOL[t['状态']] ?? false,
            category: t['分类'] || '',
        }))
}

function goalsToTasks(goals: GoalItem[]): Array<{ 分类: string; 计划事项: string; 实际完成: string; 状态: string; 原因分析: string }> {
    if (goals.length === 0) {
        return [{ 分类: '', 计划事项: '', 实际完成: '', 状态: '', 原因分析: '' }]
    }
    return goals.map(g => ({
        分类: g.category || '',
        计划事项: g.text,
        实际完成: g.completed ? '完成' : '',
        状态: g.completed ? '✅' : '',
        原因分析: '',
    }))
}

function updateTaskStatus(tasks: Array<Record<string, string>>, goalIndex: number, completed: boolean): Array<Record<string, string>> {
    // goalIndex 对应过滤后的非空任务，需要映射回原始数组
    let count = -1
    return tasks.map(t => {
        if (t['计划事项'] && t['计划事项'].trim() !== '') {
            count++
            if (count === goalIndex) {
                return { ...t, 状态: completed ? '✅' : '', 实际完成: completed ? '完成' : '' }
            }
        }
        return t
    })
}

// ==================== Hook ====================

export function useCrossPageGoals(dateStr: string) {
    const [weeklyGoals, setWeeklyGoals] = useState<GoalItem[]>([])
    const [monthlyGoals, setMonthlyGoals] = useState<GoalItem[]>([])

    // 缓存完整的 API 响应数据，toggle 后整体回存
    const [weeklyCache, setWeeklyCache] = useState<{
        summary: Record<string, unknown>
        habits: Array<Record<string, string>>
        tasks: Array<Record<string, string>>
    } | null>(null)
    const [monthlyCache, setMonthlyCache] = useState<{
        summary: Record<string, unknown>
        tasks: Array<Record<string, string>>
    } | null>(null)

    const weekKey = getISOWeekKey(new Date(dateStr))
    const monthKey = getMonthKey(new Date(dateStr))

    // 加载周/月目标
    useEffect(() => {
        let cancelled = false

        async function load() {
            const [wResult, mResult] = await Promise.allSettled([
                weeklyApi.get(weekKey),
                monthlyApi.get(monthKey),
            ])

            if (cancelled) return

            if (wResult.status === 'fulfilled') {
                const data = wResult.value
                setWeeklyCache({
                    summary: data.summary as Record<string, unknown>,
                    habits: data.habits,
                    tasks: data.tasks,
                })
                setWeeklyGoals(tasksToGoals(data.tasks))
            } else {
                setWeeklyCache(null)
                setWeeklyGoals([])
            }

            if (mResult.status === 'fulfilled') {
                const data = mResult.value
                setMonthlyCache({
                    summary: data.summary as Record<string, unknown>,
                    tasks: data.tasks,
                })
                setMonthlyGoals(tasksToGoals(data.tasks))
            } else {
                setMonthlyCache(null)
                setMonthlyGoals([])
            }
        }

        load()
        return () => { cancelled = true }
    }, [weekKey, monthKey])

    // toggle 周目标
    const toggleWeeklyGoal = useCallback((index: number) => {
        setWeeklyGoals(prev => {
            const updated = prev.map((g, i) => i === index ? { ...g, completed: !g.completed } : g)

            // 异步保存回 API
            if (weeklyCache) {
                const newCompleted = !prev[index].completed
                const updatedTasks = updateTaskStatus(weeklyCache.tasks, index, newCompleted)
                const newCache = { ...weeklyCache, tasks: updatedTasks }
                setWeeklyCache(newCache)

                weeklyApi.save(weekKey, {
                    summary: newCache.summary as Record<string, unknown>,
                    habits: newCache.habits as Array<{ 习惯: string; Mon: string; Tue: string; Wed: string; Thu: string; Fri: string; Sat: string; Sun: string }>,
                    tasks: updatedTasks.map(t => ({
                        分类: t['分类'] || '',
                        计划事项: t['计划事项'] || '',
                        实际完成: t['实际完成'] || '',
                        状态: t['状态'] || '',
                        原因分析: t['原因分析'] || '',
                    })),
                }).catch(console.error)
            }

            return updated
        })
    }, [weeklyCache, weekKey])

    // toggle 月目标
    const toggleMonthlyGoal = useCallback((index: number) => {
        setMonthlyGoals(prev => {
            const updated = prev.map((g, i) => i === index ? { ...g, completed: !g.completed } : g)

            if (monthlyCache) {
                const newCompleted = !prev[index].completed
                const updatedTasks = updateTaskStatus(monthlyCache.tasks, index, newCompleted)
                const newCache = { ...monthlyCache, tasks: updatedTasks }
                setMonthlyCache(newCache)

                monthlyApi.save(monthKey, {
                    summary: newCache.summary as Record<string, unknown>,
                    tasks: updatedTasks.map(t => ({
                        分类: t['分类'] || '',
                        计划事项: t['计划事项'] || '',
                        实际完成: t['实际完成'] || '',
                        状态: t['状态'] || '',
                        原因分析: t['原因分析'] || '',
                    })),
                }).catch(console.error)
            }

            return updated
        })
    }, [monthlyCache, monthKey])

    /* ---- 整体替换 周目标 (add/delete/textChange/拖拽分类) ---- */
    const updateWeeklyGoals = useCallback(async (newGoals: GoalItem[]) => {
        setWeeklyGoals(newGoals)
        if (!weeklyCache) {
            // cache 未加载完时，传空 habits 会被后端覆盖为默认值——禁止
            alert('周记数据还在加载，请稍后再试')
            return
        }
        try {
            const newTasks = goalsToTasks(newGoals)
            await weeklyApi.save(weekKey, {
                summary: weeklyCache.summary as Record<string, unknown>,
                habits: weeklyCache.habits as unknown as Array<{ 习惯: string; Mon: string; Tue: string; Wed: string; Thu: string; Fri: string; Sat: string; Sun: string }>,
                tasks: newTasks,
            })
            setWeeklyCache(prev => prev ? { ...prev, tasks: newTasks as unknown as Array<Record<string, string>> } : prev)
            console.info('[周目标] 已保存', { week: weekKey, count: newGoals.length })
        } catch (err) {
            console.error('[周目标保存失败]', err)
            alert(`周目标保存失败：${err instanceof Error ? err.message : '未知错误'}`)
        }
    }, [weeklyCache, weekKey])

    /* ---- 整体替换 月目标 ---- */
    const updateMonthlyGoals = useCallback(async (newGoals: GoalItem[]) => {
        setMonthlyGoals(newGoals)
        if (!monthlyCache) {
            alert('月记数据还在加载，请稍后再试')
            return
        }
        try {
            const newTasks = goalsToTasks(newGoals)
            await monthlyApi.save(monthKey, {
                summary: monthlyCache.summary as Record<string, unknown>,
                tasks: newTasks,
            })
            setMonthlyCache(prev => prev ? { ...prev, tasks: newTasks as unknown as Array<Record<string, string>> } : prev)
            console.info('[月目标] 已保存', { month: monthKey, count: newGoals.length })
        } catch (err) {
            console.error('[月目标保存失败]', err)
            alert(`月目标保存失败：${err instanceof Error ? err.message : '未知错误'}`)
        }
    }, [monthlyCache, monthKey])

    return {
        weeklyGoals,
        monthlyGoals,
        toggleWeeklyGoal,
        toggleMonthlyGoal,
        updateWeeklyGoals,
        updateMonthlyGoals,
    }
}
