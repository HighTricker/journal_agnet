import { useState, useRef } from 'react'
import MaterialIcon from './MaterialIcon'
import type { ToastItem, ToastType } from '../../hooks/useToast'

const TYPE_STYLE: Record<ToastType, {
    icon: string
    container: string
    iconColor: string
    showClose: boolean
}> = {
    success: {
        icon: 'check_circle',
        container: 'bg-inverse-surface text-inverse-on-surface',
        iconColor: 'text-inverse-primary',
        showClose: false,
    },
    error: {
        icon: 'error',
        container: 'bg-error-container text-on-error-container',
        iconColor: 'text-error',
        showClose: true,
    },
    warning: {
        icon: 'warning',
        container: 'bg-tertiary-fixed text-on-tertiary-fixed',
        iconColor: 'text-tertiary',
        showClose: true,
    },
}

interface ToastItemViewProps {
    item: ToastItem
    onDismiss: (id: string) => void
}

function ToastItemView({ item, onDismiss }: ToastItemViewProps) {
    const [leaving, setLeaving] = useState(false)
    const leavingRef = useRef(false)

    function handleDismiss() {
        if (leavingRef.current) return
        leavingRef.current = true
        setLeaving(true)
        // 等 fade-out 动画结束再真正移除
        window.setTimeout(() => onDismiss(item.id), 180)
    }

    const style = TYPE_STYLE[item.type]

    // 整张 toast 设 pointer-events-none，让下层 input/button 的点击穿透；
    // 只有右上角的 X 按钮单独 pointer-events-auto，可手动关闭。
    // 历史教训：之前整张 pointer-events-auto + onClick={dismiss}，导致 toast 显示期间
    // 顶部居中区域的点击被 toast 截获（第一下关 toast、第二下才落到 input 上）。
    return (
        <div
            role="status"
            aria-live="polite"
            className={`pointer-events-none min-w-[280px] max-w-[480px] rounded-xl px-4 py-3 shadow-lg
                flex items-center gap-3 select-none
                transition-all duration-200
                ${style.container}
                ${leaving
                    ? 'opacity-0 -translate-y-2'
                    : 'opacity-100 translate-y-0 animate-[slideInDown_0.2s_ease-out]'
                }`}
        >
            <MaterialIcon name={style.icon} filled className={`text-[20px] shrink-0 ${style.iconColor}`} />
            <span className="flex-1 text-sm font-medium leading-snug break-words">{item.message}</span>
            {style.showClose && (
                <button
                    type="button"
                    tabIndex={-1}
                    onClick={handleDismiss}
                    className="pointer-events-auto ml-1 cursor-pointer opacity-70 hover:opacity-100 transition-opacity shrink-0"
                    aria-label="关闭"
                >
                    <MaterialIcon name="close" className="text-[18px]" />
                </button>
            )}
        </div>
    )
}

interface ToastContainerProps {
    items: ToastItem[]
    onDismiss: (id: string) => void
}

function ToastContainer({ items, onDismiss }: ToastContainerProps) {
    if (items.length === 0) return null
    return (
        <div className="fixed top-[68px] left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 pointer-events-none">
            {items.map(item => (
                <ToastItemView key={item.id} item={item} onDismiss={onDismiss} />
            ))}
        </div>
    )
}

export default ToastContainer
