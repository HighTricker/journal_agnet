import { useLocation } from 'react-router-dom'
import WeekStrip from './WeekStrip'
import { usePageActions } from '../../hooks/usePageActions'

const NAV_ITEMS = [
    { path: '/diary', label: '日记' },
    { path: '/weekly', label: '周记' },
    { path: '/monthly', label: '月记' },
    { path: '/ai', label: 'AI导师' },
]

function TopAppBar() {
    const location = useLocation()
    const { state } = usePageActions()

    return (
        <header className="fixed top-0 w-full z-50 bg-surface border-b border-outline-variant/10">
            <div className="flex items-center px-8 h-15 max-w-7xl mx-auto gap-6">
                {/* 左：主导航 */}
                <nav className="flex items-center gap-[40px] shrink-0">
                    {NAV_ITEMS.map((item) => (
                        <a
                            key={item.path}
                            href={item.path}
                            onClick={(e) => {
                                // React Router 7 + React 19 + Vite 8 prod build 下
                                // Link 内部 navigate 不触发 Routes 重渲染（bug），
                                // 改用全页面跳转：浏览器实跳，backend SPA fallback 返回
                                // index.html，React 重新 mount，BrowserRouter 首次匹配
                                // 路径，渲染对应 page。代价是切换有 1s 加载，但 100% 工作。
                                if (e.ctrlKey || e.metaKey) return
                                e.preventDefault()
                                window.location.href = item.path
                            }}
                            className={
                                location.pathname.startsWith(item.path)
                                    ? 'text-[21px] text-primary font-bold border-b-2 border-primary pb-1 no-underline'
                                    : 'text-[21px] text-on-surface opacity-70 hover:opacity-100 hover:text-primary transition-all no-underline'
                            }
                        >
                            {item.label}
                        </a>
                    ))}
                </nav>

                {/* 中：子 Tab + 状态 */}
                <div className="flex items-center gap-2 flex-1 justify-center">
                    {state.subTabs?.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => state.onSubTabChange?.(tab.key)}
                            className={
                                state.activeSubTab === tab.key
                                    ? 'px-4 py-1.5 bg-primary text-on-primary rounded-lg text-sm font-bold transition-colors'
                                    : 'px-4 py-1.5 bg-surface-container-low text-secondary rounded-lg text-sm font-bold hover:bg-surface-container transition-colors'
                            }
                        >
                            {tab.label}
                        </button>
                    ))}
                    {state.statusText && (
                        <span
                            className={
                                state.statusType === 'error'
                                    ? 'text-xs text-error ml-2'
                                    : 'text-xs text-primary animate-pulse ml-2'
                            }
                        >
                            {state.statusText}
                        </span>
                    )}
                </div>

                {/* 右：WeekStrip + 保存按钮 */}
                <div className="flex items-center gap-4 shrink-0">
                    <WeekStrip />
                    {state.onSave && (
                        <button
                            onClick={state.onSave}
                            disabled={state.isSaving}
                            className="bg-primary text-on-primary px-5 py-1.5 rounded-lg text-sm font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
                        >
                            {state.saveLabel ?? '保存'}
                        </button>
                    )}
                </div>
            </div>
        </header>
    )
}

export default TopAppBar
