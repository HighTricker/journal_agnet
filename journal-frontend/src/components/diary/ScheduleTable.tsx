import { useState, useEffect, useCallback, useRef } from 'react'
import type { ScheduleRow } from '../../mocks/diarySchedule'

type CellField = 'plan' | 'actual' | 'remarks'
const FIELD_ORDER: CellField[] = ['plan', 'actual', 'remarks']

interface CellRef {
    row: number
    fieldIdx: number
}

interface ScheduleTableProps {
    data: ScheduleRow[]
    dateLabel?: string
    onCellEdit?: (rowIndex: number, field: 'plan' | 'actual' | 'remarks', value: string) => void
}

function ScheduleTable({ data, dateLabel, onCellEdit }: ScheduleTableProps) {
    const [anchor, setAnchor] = useState<CellRef | null>(null)
    const [selection, setSelection] = useState<{ start: CellRef; end: CellRef } | null>(null)
    const [editing, setEditing] = useState<CellRef | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const getCellValue = useCallback(
        (r: number, fi: number): string => {
            return data[r]?.[FIELD_ORDER[fi]] ?? ''
        },
        [data],
    )

    const setCellValue = useCallback(
        (r: number, fi: number, v: string) => {
            onCellEdit?.(r, FIELD_ORDER[fi], v)
        },
        [onCellEdit],
    )

    const isCellSelected = useCallback(
        (r: number, fi: number): boolean => {
            if (!selection) return false
            const minR = Math.min(selection.start.row, selection.end.row)
            const maxR = Math.max(selection.start.row, selection.end.row)
            const minF = Math.min(selection.start.fieldIdx, selection.end.fieldIdx)
            const maxF = Math.max(selection.start.fieldIdx, selection.end.fieldIdx)
            return r >= minR && r <= maxR && fi >= minF && fi <= maxF
        },
        [selection],
    )

    /* ========== 鼠标事件：点击 / shift+click / 拖选 ========== */
    const handleCellMouseDown = (e: React.MouseEvent, r: number, fi: number) => {
        if (editing) return
        if (e.shiftKey && anchor) {
            setSelection({ start: anchor, end: { row: r, fieldIdx: fi } })
        } else {
            setAnchor({ row: r, fieldIdx: fi })
            setSelection({ start: { row: r, fieldIdx: fi }, end: { row: r, fieldIdx: fi } })
            setIsDragging(true)
        }
    }

    const handleCellMouseEnter = (r: number, fi: number) => {
        if (!isDragging || !anchor) return
        setSelection({ start: anchor, end: { row: r, fieldIdx: fi } })
    }

    const handleMouseUp = useCallback(() => {
        setIsDragging(false)
    }, [])

    useEffect(() => {
        document.addEventListener('mouseup', handleMouseUp)
        return () => document.removeEventListener('mouseup', handleMouseUp)
    }, [handleMouseUp])

    const handleCellDoubleClick = (r: number, fi: number) => {
        if (!onCellEdit) return
        setEditing({ row: r, fieldIdx: fi })
        setAnchor({ row: r, fieldIdx: fi })
        setSelection({ start: { row: r, fieldIdx: fi }, end: { row: r, fieldIdx: fi } })
    }

    /* ========== Ctrl+C / Ctrl+V / Ctrl+D / Enter / Escape ========== */
    const handleCopy = useCallback(async () => {
        if (!selection) return
        const minR = Math.min(selection.start.row, selection.end.row)
        const maxR = Math.max(selection.start.row, selection.end.row)
        const minF = Math.min(selection.start.fieldIdx, selection.end.fieldIdx)
        const maxF = Math.max(selection.start.fieldIdx, selection.end.fieldIdx)
        const rows: string[] = []
        for (let r = minR; r <= maxR; r++) {
            const row: string[] = []
            for (let f = minF; f <= maxF; f++) row.push(getCellValue(r, f))
            rows.push(row.join('\t'))
        }
        try {
            await navigator.clipboard.writeText(rows.join('\n'))
        } catch {
            // 剪贴板权限不足时静默
        }
    }, [selection, getCellValue])

    const handlePaste = useCallback(async () => {
        if (!selection || !onCellEdit) return
        let text = ''
        try {
            text = await navigator.clipboard.readText()
        } catch {
            return
        }
        const rows = text.split(/\r?\n/).map((r) => r.split('\t'))
        const startR = Math.min(selection.start.row, selection.end.row)
        const startF = Math.min(selection.start.fieldIdx, selection.end.fieldIdx)
        for (let r = 0; r < rows.length; r++) {
            for (let f = 0; f < rows[r].length; f++) {
                const tr = startR + r
                const tf = startF + f
                if (tr < data.length && tf < FIELD_ORDER.length) {
                    setCellValue(tr, tf, rows[r][f])
                }
            }
        }
    }, [selection, data.length, setCellValue, onCellEdit])

    const handleFillDown = useCallback(() => {
        if (!selection || !onCellEdit) return
        const minR = Math.min(selection.start.row, selection.end.row)
        const maxR = Math.max(selection.start.row, selection.end.row)
        const minF = Math.min(selection.start.fieldIdx, selection.end.fieldIdx)
        const maxF = Math.max(selection.start.fieldIdx, selection.end.fieldIdx)
        for (let f = minF; f <= maxF; f++) {
            const source = getCellValue(minR, f)
            for (let r = minR + 1; r <= maxR; r++) setCellValue(r, f, source)
        }
    }, [selection, getCellValue, setCellValue, onCellEdit])

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (editing) return
            // 焦点在其它输入框 / 文本域时不劫持键盘，否则会抢走别处的 Delete/Backspace 等按键
            const active = document.activeElement
            if (
                active instanceof HTMLInputElement ||
                active instanceof HTMLTextAreaElement ||
                (active instanceof HTMLElement && active.isContentEditable)
            ) {
                return
            }
            if (!selection) return
            const key = e.key.toLowerCase()
            if (e.ctrlKey || e.metaKey) {
                if (key === 'c') {
                    handleCopy()
                } else if (key === 'v') {
                    handlePaste()
                } else if (key === 'd') {
                    e.preventDefault()
                    handleFillDown()
                }
            } else if (e.key === 'Escape') {
                setSelection(null)
            } else if (e.key === 'Enter' && selection) {
                setEditing({ row: selection.start.row, fieldIdx: selection.start.fieldIdx })
            } else if (e.key === 'Delete' || e.key === 'Backspace') {
                e.preventDefault()
                const minR = Math.min(selection.start.row, selection.end.row)
                const maxR = Math.max(selection.start.row, selection.end.row)
                const minF = Math.min(selection.start.fieldIdx, selection.end.fieldIdx)
                const maxF = Math.max(selection.start.fieldIdx, selection.end.fieldIdx)
                for (let r = minR; r <= maxR; r++) {
                    for (let f = minF; f <= maxF; f++) setCellValue(r, f, '')
                }
            }
        }
        document.addEventListener('keydown', handleKey)
        return () => document.removeEventListener('keydown', handleKey)
    }, [editing, selection, handleCopy, handlePaste, handleFillDown, setCellValue])

    return (
        <section className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_4px_30px_0_rgba(0,40,142,0.03)] border border-outline-variant/10 h-[800px] flex flex-col">
            {/* Header */}
            <div className="px-8 py-6 border-b border-outline-variant/10 flex justify-between items-center shrink-0 bg-surface-container-lowest z-10">
                <h2 className="text-2xl font-extrabold tracking-tight text-on-surface">日程安排</h2>
                {dateLabel && <p className="text-2xl font-extrabold tracking-tight text-on-surface">{dateLabel}</p>}
            </div>

            {/* Table */}
            <div ref={containerRef} className="flex-grow overflow-y-auto custom-scrollbar select-none">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-10 bg-surface-container-low">
                        <tr>
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-secondary">时间段</th>
                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-secondary">计划</th>
                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-secondary">实际</th>
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-secondary text-right">备注</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                        {data.map((row, rIdx) => {
                            const planTrim = (row.plan ?? '').trim()
                            const actualTrim = (row.actual ?? '').trim()
                            const isMismatch =
                                planTrim !== '' && actualTrim !== '' &&
                                planTrim !== '--' && actualTrim !== '--' &&
                                planTrim !== actualTrim

                            return (
                                <tr
                                    key={row.time}
                                    className={row.isHighlight ? 'bg-primary/5' : 'hover:bg-surface-container-low/30 transition-colors'}
                                >
                                    <td className="px-8 py-4 text-sm font-bold text-primary whitespace-nowrap">{row.time}</td>
                                    {FIELD_ORDER.map((field, fIdx) => {
                                        const isSelected = isCellSelected(rIdx, fIdx)
                                        const isEditing = editing?.row === rIdx && editing?.fieldIdx === fIdx
                                        const value = row[field] ?? ''
                                        const isMismatchCell = isMismatch && (field === 'plan' || field === 'actual')

                                        const isRemarks = field === 'remarks'
                                        const baseAlign = isRemarks ? 'text-right italic' : ''
                                        const textColor = field === 'actual' && !row.isHighlight ? 'text-secondary' : ''
                                        const highlight = row.isHighlight && field === 'plan' ? 'font-semibold' : (row.isHighlight && field === 'actual' ? 'text-primary font-medium' : '')

                                        return (
                                            <td
                                                key={field}
                                                className={`
                                                    px-4 py-3 text-base relative cursor-cell transition-all
                                                    ${isRemarks ? 'pr-8' : ''}
                                                    ${isMismatchCell ? 'bg-red-50' : ''}
                                                    ${isSelected ? 'bg-primary/10 ring-2 ring-primary ring-inset' : ''}
                                                `}
                                                onMouseDown={(e) => handleCellMouseDown(e, rIdx, fIdx)}
                                                onMouseEnter={() => handleCellMouseEnter(rIdx, fIdx)}
                                                onDoubleClick={() => handleCellDoubleClick(rIdx, fIdx)}
                                            >
                                                {isEditing && onCellEdit ? (
                                                    <input
                                                        type="text"
                                                        autoFocus
                                                        value={value}
                                                        onChange={(e) => onCellEdit(rIdx, field, e.target.value)}
                                                        onBlur={() => setEditing(null)}
                                                        onKeyDown={(e) => {
                                                            e.stopPropagation()
                                                            if (e.key === 'Enter' || e.key === 'Escape') {
                                                                setEditing(null)
                                                            }
                                                        }}
                                                        className={`block w-full bg-transparent border-none outline-none px-2 py-1 text-base min-h-[28px] ${baseAlign} ${textColor} ${highlight}`}
                                                    />
                                                ) : (
                                                    <span className={`block px-2 py-1 min-h-[28px] ${baseAlign} ${textColor} ${highlight}`}>
                                                        {value || <span className="text-outline-variant/40">—</span>}
                                                    </span>
                                                )}
                                            </td>
                                        )
                                    })}
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    )
}

export default ScheduleTable
