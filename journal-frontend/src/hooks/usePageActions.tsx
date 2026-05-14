/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from 'react'

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
    const reset = () => setState(EMPTY_STATE)
    return (
        <PageActionsContext.Provider value={{ state, setState, reset }}>
            {children}
        </PageActionsContext.Provider>
    )
}

export function usePageActions() {
    const ctx = useContext(PageActionsContext)
    if (!ctx) throw new Error('usePageActions 必须在 PageActionsProvider 内调用')
    return ctx
}
