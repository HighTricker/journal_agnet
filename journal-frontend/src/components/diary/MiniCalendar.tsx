import MaterialIcon from '../ui/MaterialIcon'

interface MiniCalendarProps {
    year: number
    month: number           // 1-12
    selectedDate: string    // "YYYY-MM-DD"
    dots?: string[]         // 有数据的日期列表 ["2026-04-01", ...]
    onSelectDate: (dateStr: string) => void
    onPrevMonth: () => void
    onNextMonth: () => void
}

const WEEKDAY_HEADERS = ['日', '一', '二', '三', '四', '五', '六']

function MiniCalendar({ year, month, selectedDate, dots = [], onSelectDate, onPrevMonth, onNextMonth }: MiniCalendarProps) {
    // 计算本月天数和第一天是星期几
    const firstDay = new Date(year, month - 1, 1)
    const daysInMonth = new Date(year, month, 0).getDate()
    const startWeekday = firstDay.getDay() // 0=周日

    // 上月填充天数
    const daysInPrevMonth = new Date(year, month - 1, 0).getDate()
    const prevMonthDays: number[] = []
    for (let i = startWeekday - 1; i >= 0; i--) {
        prevMonthDays.push(daysInPrevMonth - i)
    }

    // 本月所有天
    const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1)

    // 今天
    const now = new Date()
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

    // 有数据的日期 Set（快速查找）
    const dotSet = new Set(dots)

    const title = `${year}年${month}月`

    return (
        <section className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_4px_20px_0_rgba(25,28,30,0.02)]">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-secondary">{title}</h3>
                <div className="flex gap-2">
                    <button type="button" onClick={onPrevMonth}>
                        <MaterialIcon name="chevron_left" className="text-sm cursor-pointer hover:text-primary" />
                    </button>
                    <button type="button" onClick={onNextMonth}>
                        <MaterialIcon name="chevron_right" className="text-sm cursor-pointer hover:text-primary" />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-y-3 text-center">
                {/* Weekday headers */}
                {WEEKDAY_HEADERS.map((day, i) => (
                    <span key={i} className="text-[10px] font-black text-secondary">{day}</span>
                ))}

                {/* Previous month days (grayed out, not clickable) */}
                {prevMonthDays.map((day) => (
                    <span key={`prev-${day}`} className="text-xs text-outline opacity-40">{day}</span>
                ))}

                {/* Current month days */}
                {currentMonthDays.map((day) => {
                    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                    const isToday = dateStr === todayStr
                    const isSelected = dateStr === selectedDate && !isToday
                    const hasDot = dotSet.has(dateStr)

                    let className: string
                    if (isToday) {
                        className = 'text-xs font-bold text-white bg-primary rounded-full w-6 h-6 flex items-center justify-center mx-auto hover:bg-primary/80 transition-colors'
                    } else if (isSelected) {
                        className = 'text-xs font-bold text-primary bg-primary/20 rounded-full w-6 h-6 flex items-center justify-center mx-auto hover:bg-primary/30 transition-colors'
                    } else {
                        className = 'text-xs font-semibold hover:bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center mx-auto transition-colors'
                    }

                    return (
                        <div key={day} className="flex flex-col items-center">
                            <a
                                href={`/diary?date=${dateStr}`}
                                className={`${className} no-underline`}
                                onClick={(e) => {
                                    // Ctrl/Meta+点击：让浏览器在新标签页打开
                                    if (e.ctrlKey || e.metaKey) return
                                    // 普通点击：SPA 内导航，不刷新页面
                                    e.preventDefault()
                                    onSelectDate(dateStr)
                                }}
                            >
                                {day}
                            </a>
                            {/* 有数据的日期显示小圆点 */}
                            {hasDot && !isToday && (
                                <span className="w-1 h-1 rounded-full bg-primary mt-0.5" />
                            )}
                        </div>
                    )
                })}
            </div>
        </section>
    )
}

export default MiniCalendar
