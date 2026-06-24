/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useMemo, useRef, useEffect, type ReactNode } from 'react'
import ToastContainer from '../components/ui/Toast'

/**
 * Toast 通知系统 —— 替代 Electron 下会抢键盘焦点的 window.alert()
 *
 * 历史背景：Bug #7（2026-05-21）。Windows + Electron 调用 window.alert() 会触发
 * 系统原生 MessageBoxW，对话框关闭后键盘焦点未交还给 Chromium WebContents，
 * 导致所有 <input>/<textarea> 收不到 keydown 事件。Toast 是纯 DOM 节点，
 * 不触发任何原生模态，从机制上根除该 bug。
 *
 * Provider 必须遵循 usePageActions.tsx:41-44 的 useMemo + useCallback 模式，
 * 否则 Context value 引用不稳定会导致 Diary 中依赖该 value 的 useEffect 反复
 * 执行，重渲染雪崩→编辑卡顿。
 */

export type ToastType = 'success' | 'error' | 'warning'

export interface ToastItem {
    id: string
    message: string
    type: ToastType
    duration: number // 毫秒，0 = 持久（不自动消失）
    createdAt: number
}

export interface ToastOptions {
    duration?: number
}

const DEFAULT_DURATION: Record<ToastType, number> = {
    success: 2500,
    warning: 4000,
    error: 6000,
}

const MAX_TOASTS = 3
const DEDUP_WINDOW_MS = 1000 // 同 message+type 在此窗口内重复触发只保留 1 条

interface ToastContextValue {
    showToast: (message: string, type: ToastType, options?: ToastOptions) => void
    dismiss: (id: string) => void
    dismissAll: () => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<ToastItem[]>([])
    const timersRef = useRef<Map<string, number>>(new Map())

    const dismiss = useCallback((id: string) => {
        setItems(prev => prev.filter(item => item.id !== id))
    }, [])

    const dismissAll = useCallback(() => {
        setItems([])
    }, [])

    const showToast = useCallback((message: string, type: ToastType, options: ToastOptions = {}) => {
        const now = Date.now()
        const duration = options.duration !== undefined ? options.duration : DEFAULT_DURATION[type]
        const newId = `${now}-${Math.random().toString(36).slice(2, 8)}`

        setItems(prev => {
            // 1s 内同 message+type 去重
            const dup = prev.find(item =>
                item.message === message
                && item.type === type
                && (now - item.createdAt) < DEDUP_WINDOW_MS
            )
            if (dup) return prev
            const newItem: ToastItem = { id: newId, message, type, duration, createdAt: now }
            // 超 3 条 FIFO 移除最旧
            return [...prev, newItem].slice(-MAX_TOASTS)
        })
    }, [])

    // 用 effect 管理 timer 生命周期：纯响应 items 变化
    // —— 不在 setItems 的 updater 内做副作用（updater 必须是纯函数）
    useEffect(() => {
        const liveIds = new Set(items.map(i => i.id))

        // 给新 toast 注册自动 dismiss
        items.forEach(item => {
            if (item.duration > 0 && !timersRef.current.has(item.id)) {
                const elapsed = Date.now() - item.createdAt
                const remaining = Math.max(0, item.duration - elapsed)
                const timerId = window.setTimeout(() => dismiss(item.id), remaining)
                timersRef.current.set(item.id, timerId)
            }
        })

        // 清理已被移除项的 timer
        timersRef.current.forEach((timerId, id) => {
            if (!liveIds.has(id)) {
                clearTimeout(timerId)
                timersRef.current.delete(id)
            }
        })
    }, [items, dismiss])

    // 卸载时清所有 timer
    useEffect(() => {
        const timers = timersRef.current
        return () => {
            timers.forEach(t => clearTimeout(t))
            timers.clear()
        }
    }, [])

    const value = useMemo(() => ({ showToast, dismiss, dismissAll }), [showToast, dismiss, dismissAll])

    return (
        <ToastContext.Provider value={value}>
            {children}
            <ToastContainer items={items} onDismiss={dismiss} />
        </ToastContext.Provider>
    )
}

export function useToast() {
    const ctx = useContext(ToastContext)
    if (!ctx) throw new Error('useToast 必须在 ToastProvider 内调用')
    return ctx
}
