import { useRef, useState, useLayoutEffect } from 'react'
import type { CSSProperties } from 'react'
import MaterialIcon from '../ui/MaterialIcon'
import { useWeeklyTimeline, DAY_KEYS } from '../../hooks/useWeeklyTimeline'

/* 固定列宽，便于横向滚动 + JS 精确测量色带 */
const COL = 120
const LBL = 140
const ROW_H = 56
const TRACK_W = COL * 7
const DOW_ZH = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
/* 每个目标一个稳定色（按泳道序号取色） */
const PALETTE = ['#00288e', '#2e6b4f', '#5b21b6', '#b45309', '#9d174d', '#0e7490', '#92600a', '#3f6212']

const pctC = (day: number) => ((day + 0.5) / 7) * 100   // 第 day 天列中心(%)

function fmtDate(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/* 组件私有样式（甘特 + 卡片，wt- 前缀避免污染全局） */
const STYLE = `
.wt-scroll { overflow-x: auto; padding-bottom: 8px; }
.wt-scroll::-webkit-scrollbar { height: 8px; }
.wt-scroll::-webkit-scrollbar-thumb { background: #c4c4c8; border-radius: 8px; }
.wt-row { display: grid; align-items: center; }
.wt-row + .wt-row { border-top: 1px solid #ededf2; }
.wt-dh { text-align: center; padding-bottom: 12px; }
.wt-dh-dow { font-size: 12px; font-weight: 600; color: #8a8a8e; }
.wt-dh-date { font-size: 17px; font-weight: 800; color: #1c1c1e; margin-top: 1px; }
.wt-dh.today .wt-dh-dow { color: #ff3b30; }
.wt-dh.today .wt-dh-date { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; background: #ff3b30; color: #fff; font-size: 14px; }
.wt-label { display: flex; align-items: center; gap: 8px; padding: 0 10px 0 2px; min-width: 0; }
.wt-label .gdot { width: 11px; height: 11px; border-radius: 50%; flex: 0 0 auto; }
.wt-label .gname { font-size: 13px; font-weight: 700; color: #1c1c1e; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.wt-label .gname.done { color: #8a8a8e; text-decoration: line-through; }
.wt-pband, .wt-pfill { position: absolute; top: 50%; transform: translateY(-50%); height: 31px; border-radius: 9px; pointer-events: none; }
.wt-card { position: absolute; top: 50%; transform: translate(-50%, -50%); display: flex; align-items: center; gap: 7px; border-radius: 10px; padding: 6px 9px; box-shadow: 0 1px 4px rgba(0,0,0,0.10); z-index: 2; cursor: text; max-width: ${COL - 8}px; }
.wt-card .wt-txt { font-size: 12px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.wt-card .wt-txt.done { text-decoration: line-through; opacity: .65; }
.wt-card .wt-input { font-size: 12px; font-weight: 700; border: none; outline: none; background: transparent; width: 72px; font-family: inherit; }
.wt-card .wt-del { opacity: 0; margin-left: 1px; cursor: pointer; color: #8a8a8e; display: flex; }
.wt-card:hover .wt-del { opacity: 1; }
.wt-ck { width: 16px; height: 16px; border-radius: 50%; border: 1.5px solid #c4c4c8; display: flex; align-items: center; justify-content: center; cursor: pointer; flex: 0 0 auto; }
.wt-plus { position: absolute; top: 50%; transform: translate(-50%, -50%); width: 24px; height: 24px; border-radius: 50%; border: 1px dashed #c4c4c8; color: #b0b0b6; display: flex; align-items: center; justify-content: center; cursor: pointer; opacity: 0; transition: opacity .15s; background: #fff; }
.wt-track:hover .wt-plus { opacity: 1; }
.wt-plus:hover { border-color: var(--lc); color: var(--lc); }
`

interface Props {
    dateStr: string
}

function WeeklyTimeline({ dateStr }: Props) {
    const { monday, lanes, tasks, loading, addCard, editCard, toggleCard, removeCard } = useWeeklyTimeline(dateStr)
    const containerRef = useRef<HTMLDivElement>(null)

    const [adding, setAdding] = useState<{ goalId: string; day: number } | null>(null)
    const [addingText, setAddingText] = useState('')
    const [editing, setEditing] = useState<string | null>(null)
    const [editingText, setEditingText] = useState('')

    /* 列日期 + 今天定位 */
    const mondayDate = monday ? new Date(monday + 'T00:00:00') : null
    const colDates: Date[] = mondayDate
        ? Array.from({ length: 7 }, (_, i) => { const d = new Date(mondayDate); d.setDate(d.getDate() + i); return d })
        : []
    const todayStr = fmtDate(new Date())
    const todayIdx = colDates.findIndex(d => fmtDate(d) === todayStr)

    /* 实测每条泳道卡片边缘 → 色带从首卡左缘贴到末卡右缘，填充到末个已完成卡右缘 */
    useLayoutEffect(() => {
        const root = containerRef.current
        if (!root) return
        root.querySelectorAll<HTMLElement>('[data-track]').forEach(track => {
            const cards = Array.from(track.querySelectorAll<HTMLElement>('[data-card]'))
            const band = track.querySelector<HTMLElement>('[data-pband]')
            const fill = track.querySelector<HTMLElement>('[data-pfill]')
            if (!band || !fill) return
            if (!cards.length) { band.style.display = 'none'; fill.style.display = 'none'; return }
            const lefts = cards.map(c => c.offsetLeft - c.offsetWidth / 2)
            const rights = cards.map(c => c.offsetLeft + c.offsetWidth / 2)
            const firstLeft = Math.min(...lefts), lastRight = Math.max(...rights)
            band.style.display = 'block'
            band.style.left = `${firstLeft}px`
            band.style.width = `${lastRight - firstLeft}px`
            const doneR = cards.filter(c => c.getAttribute('data-done') === '1').map(c => c.offsetLeft + c.offsetWidth / 2)
            if (doneR.length) {
                fill.style.display = 'block'
                fill.style.left = `${firstLeft}px`
                fill.style.width = `${Math.max(0, Math.max(...doneR) - firstLeft)}px`
            } else {
                fill.style.display = 'none'
            }
        })
    }, [tasks, lanes, monday, editing, adding])

    const cardOf = (goalId: string, dayKey: string) =>
        tasks.find(t => t.goal_id === goalId && t.周几 === dayKey)

    const gridCols = { gridTemplateColumns: `${LBL}px repeat(7, ${COL}px)` }
    const gridlines = `repeating-linear-gradient(to right, #ededf2 0, #ededf2 1px, transparent 1px, transparent ${COL}px)`

    function startAdd(goalId: string, day: number) {
        setEditing(null)
        setAdding({ goalId, day }); setAddingText('')
    }
    function commitAdd() {
        if (adding && addingText.trim()) addCard(adding.goalId, DAY_KEYS[adding.day], addingText)
        setAdding(null); setAddingText('')
    }
    function startEdit(id: string, text: string) {
        setAdding(null)
        setEditing(id); setEditingText(text)
    }
    function commitEdit() {
        if (editing !== null) editCard(editing, editingText)
        setEditing(null); setEditingText('')
    }

    return (
        <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 1px 3px rgba(0,40,142,0.06)' }}>
            <style>{STYLE}</style>

            <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-bold text-on-surface">本周事项节点 · {monday ? `${lanes.length} 个目标` : ''}</div>
                <div className="text-[11px] text-on-surface-variant flex items-center gap-1">
                    <MaterialIcon name="swipe" className="text-[15px]" /> 悬停空位点 + 排期 · 点卡片改字 · 点圆圈完成
                </div>
            </div>

            {loading ? (
                <div className="text-sm text-on-surface-variant py-10 text-center">加载中…</div>
            ) : lanes.length === 0 ? (
                <div className="text-sm text-on-surface-variant py-10 text-center">
                    本周还没有周目标。先去「周」tab 添加目标，这里就能给它们排期了。
                </div>
            ) : (
                <div className="wt-scroll" ref={containerRef}>
                    <div style={{ minWidth: LBL + TRACK_W }}>
                        {/* 表头 */}
                        <div className="wt-row" style={gridCols}>
                            <div />
                            {colDates.map((d, i) => (
                                <div key={i} className={`wt-dh${i === todayIdx ? ' today' : ''}`}>
                                    <div className="wt-dh-dow">{DOW_ZH[i]}</div>
                                    <div className="wt-dh-date">{d.getDate()}</div>
                                </div>
                            ))}
                        </div>

                        {/* 泳道 */}
                        {lanes.map((lane, li) => {
                            const color = PALETTE[li % PALETTE.length]
                            const isDone = lane.status === '✅'
                            return (
                                <div key={lane.goal_id} className="wt-row" style={gridCols}>
                                    <div className="wt-label">
                                        <span className="gdot" style={{ background: color }} />
                                        <span className={`gname${isDone ? ' done' : ''}`} title={lane.text}>{lane.text}</span>
                                    </div>
                                    <div
                                        data-track
                                        style={{ gridColumn: '2 / -1', position: 'relative', height: ROW_H, background: gridlines, '--lc': color } as CSSProperties}
                                    >
                                        {/* 今日列高亮 */}
                                        {todayIdx >= 0 && (
                                            <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${(todayIdx / 7) * 100}%`, width: `${100 / 7}%`, background: 'rgba(255,59,48,0.05)', pointerEvents: 'none' }} />
                                        )}
                                        {/* 色带：轨道 + 进度填充（位置由 useLayoutEffect 测量写入） */}
                                        <div data-pband className="wt-pband" style={{ background: `${color}1f` }} />
                                        <div data-pfill className="wt-pfill" style={{ background: `linear-gradient(90deg, ${color}b3, ${color})` }} />

                                        {/* 每天：卡片 / 新增输入 / 加号 */}
                                        {DAY_KEYS.map((dk, day) => {
                                            const left = `${pctC(day)}%`
                                            if (adding && adding.goalId === lane.goal_id && adding.day === day) {
                                                return (
                                                    <div key={dk} data-card className="wt-card" style={{ left, background: '#fff', border: `1.5px solid ${color}` }}>
                                                        <input
                                                            className="wt-input" style={{ color }} autoFocus
                                                            value={addingText} placeholder="事项…"
                                                            onChange={e => setAddingText(e.target.value)}
                                                            onBlur={commitAdd}
                                                            onKeyDown={e => { if (e.key === 'Enter') commitAdd(); if (e.key === 'Escape') { setAdding(null); setAddingText('') } }}
                                                        />
                                                    </div>
                                                )
                                            }
                                            const card = cardOf(lane.goal_id, dk)
                                            if (card) {
                                                const done = card.完成 === '✅'
                                                return (
                                                    <div
                                                        key={dk} data-card data-done={done ? '1' : '0'} className="wt-card"
                                                        style={{ left, background: done ? `${color}14` : '#fff', border: `1.5px solid ${color}` }}
                                                    >
                                                        <span
                                                            className="wt-ck" style={done ? { background: color, borderColor: color } : undefined}
                                                            onClick={e => { e.stopPropagation(); toggleCard(card.id) }}
                                                        >
                                                            {done && <span style={{ color: '#fff' }}><MaterialIcon name="check" filled className="text-[11px]" /></span>}
                                                        </span>
                                                        {editing === card.id ? (
                                                            <input
                                                                className="wt-input" style={{ color }} autoFocus
                                                                value={editingText}
                                                                onChange={e => setEditingText(e.target.value)}
                                                                onBlur={commitEdit}
                                                                onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') { setEditing(null) } }}
                                                            />
                                                        ) : (
                                                            <span className={`wt-txt${done ? ' done' : ''}`} style={{ color }} onClick={() => startEdit(card.id, card.内容)}>
                                                                {card.内容}
                                                            </span>
                                                        )}
                                                        <span className="wt-del" onClick={e => { e.stopPropagation(); removeCard(card.id) }}>
                                                            <MaterialIcon name="close" className="text-[14px]" />
                                                        </span>
                                                    </div>
                                                )
                                            }
                                            return (
                                                <div key={dk} className="wt-plus" style={{ left }} onClick={() => startAdd(lane.goal_id, day)} title="排期">
                                                    <MaterialIcon name="add" className="text-[16px]" />
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

export default WeeklyTimeline
