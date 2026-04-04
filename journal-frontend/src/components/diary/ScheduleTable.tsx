import type { ScheduleRow } from '../../mocks/diarySchedule'

interface ScheduleTableProps {
    data: ScheduleRow[]
    dateLabel?: string
    onCellEdit?: (rowIndex: number, field: 'plan' | 'actual' | 'remarks', value: string) => void
}

function ScheduleTable({ data, dateLabel, onCellEdit }: ScheduleTableProps) {
    return (
        <section className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_4px_30px_0_rgba(0,40,142,0.03)] border border-outline-variant/10 h-[800px] flex flex-col">
            {/* Header */}
            <div className="px-8 py-6 border-b border-outline-variant/10 flex justify-between items-center shrink-0 bg-surface-container-lowest z-10">
                <h2 className="text-2xl font-extrabold tracking-tight text-on-surface">日程安排</h2>
                {dateLabel && <p className="text-2xl font-extrabold tracking-tight text-on-surface">{dateLabel}</p>}
            </div>

            {/* Table */}
            <div className="flex-grow overflow-y-auto custom-scrollbar">
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
                        {data.map((row, index) => (
                            <tr
                                key={row.time}
                                className={row.isHighlight ? 'bg-primary/5' : 'hover:bg-surface-container-low transition-colors'}
                            >
                                {/* Time 列：不可编辑 */}
                                <td className="px-8 py-5 text-sm font-bold text-primary">{row.time}</td>

                                {/* Plan 列 */}
                                <td className={`px-4 py-5 text-sm ${row.isHighlight ? 'font-semibold' : ''}`}>
                                    <input
                                        type="text"
                                        value={row.plan}
                                        readOnly={!onCellEdit}
                                        onChange={e => onCellEdit?.(index, 'plan', e.target.value)}
                                        className={`w-full bg-transparent border-none focus:ring-0 focus:outline-none focus:bg-primary/5 rounded px-2 py-1 text-base ${
                                            row.isHighlight ? 'font-semibold' : ''
                                        } ${!onCellEdit ? 'cursor-default' : ''}`}
                                    />
                                </td>

                                {/* Actual 列 */}
                                <td className={`px-4 py-5 text-sm ${row.isHighlight ? 'text-primary font-medium' : 'text-secondary'}`}>
                                    <input
                                        type="text"
                                        value={row.actual}
                                        readOnly={!onCellEdit}
                                        onChange={e => onCellEdit?.(index, 'actual', e.target.value)}
                                        className={`w-full bg-transparent border-none focus:ring-0 focus:outline-none focus:bg-primary/5 rounded px-2 py-1 text-base ${
                                            row.isHighlight ? 'text-primary font-medium' : 'text-secondary'
                                        } ${!onCellEdit ? 'cursor-default' : ''}`}
                                    />
                                </td>

                                {/* Remarks 列 */}
                                <td className="px-8 py-5 text-xs italic text-secondary text-right">
                                    <input
                                        type="text"
                                        value={row.remarks}
                                        readOnly={!onCellEdit}
                                        onChange={e => onCellEdit?.(index, 'remarks', e.target.value)}
                                        className={`w-full bg-transparent border-none focus:ring-0 focus:outline-none focus:bg-primary/5 rounded px-2 py-1 text-base italic text-secondary text-right ${
                                            !onCellEdit ? 'cursor-default' : ''
                                        }`}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    )
}

export default ScheduleTable
