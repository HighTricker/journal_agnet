/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react'

export interface SubTab {
    key: string
    label: string
}

export interface PageActionsState {
    subTabs: SubTab[] | null
    activeSubTab: string | null
    onSubTabChange: ((key: string) => void) | null
    saveLabel: string | null
    onSave: (() => void) | null
    isSaving: boolean
    statusText: string | null
    statusType: 'loading' | 'error' | null
}

const EMPTY_STATE: PageActionsState = {
    subTabs: null,
    activeSubTab: null,
    onSubTabChange: null,
    saveLabel: null,
    onSave: null,
    isSaving: false,
    statusText: null,
    statusType: null,
}

interface PageActionsContextValue {
    state: PageActionsState
    setState: (s: PageActionsState) => void
    reset: () => void
}

const PageActionsContext = createContext<PageActionsContextValue | null>(null)

export function PageActionsProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<PageActionsState>(EMPTY_STATE)
    // reset / value 用 useCallback + useMemo 稳定引用：否则每次 Provider 重渲染都生成新对象，
    // 触发所有 consumer 无谓重渲染，并让 Diary 中依赖 reset 的 useEffect 反复执行 → 重渲染雪崩 → 编辑卡顿。
    const reset = useCallback(() => setState(EMPTY_STATE), [])
    const value = useMemo(() => ({ state, setState, reset }), [state, setState, reset])
    return (
        <PageActionsContext.Provider value={value}>
            {children}
        </PageActionsContext.Provider>
    )
}

export function usePageActions() {
    const ctx = useContext(PageActionsContext)
    if (!ctx) throw new Error('usePageActions 必须在 PageActionsProvider 内调用')
    return ctx
}
