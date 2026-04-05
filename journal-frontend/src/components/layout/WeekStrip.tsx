import { useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import MaterialIcon from '../ui/MaterialIcon'

// 获取某日期所在周的周一
function getMonday(date: Date): Date {
    const d = new Date(date)
    const day = d.getDay() // 0=周日
    const diff = day === 0 ? -6 : 1 - day
    d.setDate(d.getDate() + diff)
    return d
}

// 格式化日期为 YYYY-MM-DD
function formatDate(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// 获取今天字符串
function getTodayStr(): string {
    return formatDate(new Date())
}

// 从 URL ?date= 读取选中日期
function getDateFromUrl(): string {
    const params = new URLSearchParams(window.location.search)
    const d = params.get('date')
    if (d && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d
    return getTodayStr()
}

// 获取某月内第一个"周四在该月"的周一（用 4 号保证周四落在目标月）
function getMondayOfMonth(year: number, month: number): Date {
    return getMonday(new Date(year, month - 1, 4))
}

const WEEKDAY_LABELS = ['一', '二', '三', '四', '五', '六', '日']

function WeekStrip() {
    const location = useLocation()
    const isDiaryPage = location.pathname.startsWith('/diary')

    // 当前显示周的周一
    const [weekMonday, setWeekMonday] = useState(() => getMonday(new Date(getDateFromUrl())))
    // 选中日期
    const [selectedDate, setSelectedDate] = useState(getDateFromUrl)

    // 生成本周 7 天
    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekMonday)
        d.setDate(weekMonday.getDate() + i)
        return d
    })

    // 显示月份（取本周中间日期的月份，即周四）
    const displayMonth = weekDays[3].getMonth() + 1

    const todayStr = getTodayStr()

    // 监听来自 MiniCalendar 的 datechange 事件
    useEffect(() => {
        const handler = (e: Event) => {
            const detail = (e as CustomEvent).detail
            if (detail?.date && detail?.source !== 'weekstrip') {
                setSelectedDate(detail.date)
                setWeekMonday(getMonday(new Date(detail.date)))
            }
        }
        window.addEventListener('datechange', handler)
        return () => window.removeEventListener('datechange', handler)
    }, [])

    // URL 变化时同步（其他页面跳转过来时���
    useEffect(() => {
        const dateFromUrl = getDateFromUrl()
        setSelectedDate(dateFromUrl)
        setWeekMonday(getMonday(new Date(dateFromUrl)))
    }, [location.search])

    // 选择日期
    const handleSelect = useCallback((dateStr: string) => {
        setSelectedDate(dateStr)
        setWeekMonday(getMonday(new Date(dateStr)))
        // 广播事件，让 MiniCalendar 联动
        window.dispatchEvent(new CustomEvent('datechange', { detail: { date: dateStr, source: 'weekstrip' } }))
        // 如果在日记页面，更新 URL
        if (isDiaryPage) {
            const url = new URL(window.location.href)
            url.searchParams.set('date', dateStr)
            window.history.replaceState({}, '', url.toString())
        }
    }, [isDiaryPage])

    // 切换周
    const prevWeek = () => {
        setWeekMonday((prev) => {
            const d = new Date(prev)
            d.setDate(d.getDate() - 7)
            return d
        })
    }
    const nextWeek = () => {
        setWeekMonday((prev) => {
            const d = new Date(prev)
            d.setDate(d.getDate() + 7)
            return d
        })
    }

    // 月份滚轮切换
    const handleMonthWheel = (e: React.WheelEvent) => {
        e.preventDefault()
        const currentMonth = weekDays[3].getMonth() + 1
        const currentYear = weekDays[3].getFullYear()
        if (e.deltaY < 0) {
            // 向上滚 → 上个月
            const newMonth = currentMonth === 1 ? 12 : currentMonth - 1
            const newYear = currentMonth === 1 ? currentYear - 1 : currentYear
            setWeekMonday(getMondayOfMonth(newYear, newMonth))
        } else {
            // 向下滚 → 下个月
            const newMonth = currentMonth === 12 ? 1 : currentMonth + 1
            const newYear = currentMonth === 12 ? currentYear + 1 : currentYear
            setWeekMonday(getMondayOfMonth(newYear, newMonth))
        }
    }

    return (
        <div className="flex items-center gap-3 select-none">
            {/* 月份（大字，占两行高度，可滚轮切换） */}
            <span
                className="text-2xl font-extrabold text-primary cursor-ns-resize leading-none"
                onWheel={handleMonthWheel}
                title="滚轮切换月份"
            >
                {displayMonth}月
            </span>

            {/* 左箭头 */}
            <button
                type="button"
                onClick={prevWeek}
                className="text-on-surface-variant hover:text-primary transition-colors"
            >
                <MaterialIcon name="chevron_left" className="text-2xl" />
            </button>

            {/* 星期 + 日号 两行网格 */}
            <div className="grid grid-cols-7 gap-x-1 text-center">
                {/* 第一行：星期 */}
                {WEEKDAY_LABELS.map((label, i) => (
                    <span key={`w-${i}`} className="text-[10px] font-bold text-on-surface-variant w-8">
                        {label}
                    </span>
                ))}
                {/* ��二行：日号 */}
                {weekDays.map((day) => {
                    const dateStr = formatDate(day)
                    const isToday = dateStr === todayStr
                    const isSelected = dateStr === selectedDate && !isToday

                    let dayClass = 'w-8 h-6 flex items-center justify-center rounded-full text-xs font-semibold transition-colors '
                    if (isToday) {
                        dayClass += 'bg-primary text-white'
                    } else if (isSelected) {
                        dayClass += 'bg-primary/20 text-primary font-bold'
                    } else {
                        dayClass += 'hover:bg-primary/10 text-on-surface'
                    }

                    const href = `/diary?date=${dateStr}`

                    return (
                        <a
                            key={dateStr}
                            href={href}
                            className={`${dayClass} no-underline`}
                            onClick={(e) => {
                                if (e.ctrlKey || e.metaKey) return
                                if (isDiaryPage) {
                                    e.preventDefault()
                                    handleSelect(dateStr)
                                }
                                // 非日记页面：正常导航到 /diary?date=...
                            }}
                        >
                            {day.getDate()}
                        </a>
                    )
                })}
            </div>

            {/* 右箭头 */}
            <button
                type="button"
                onClick={nextWeek}
                className="text-on-surface-variant hover:text-primary transition-colors"
            >
                <MaterialIcon name="chevron_right" className="text-2xl" />
            </button>
        </div>
    )
}

export default WeekStrip
