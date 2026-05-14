import MaterialIcon from '../ui/MaterialIcon'
import type { GoalItem } from '../../mocks/diarySchedule'

interface GoalCardProps {
    title: string
    badge: string
    variant: 'default' | 'primary'
    goals: GoalItem[]
    onToggle?: (index: number) => void
    editable?: boolean
    onTextChange?: (index: number, text: string) => void
    onDelete?: (index: number) => void
    onAdd?: () => void
    heightClass?: string
}

function GoalCard({ title, badge, variant, goals, onToggle, editable = false, onTextChange, onDelete, onAdd, heightClass = 'h-[250px]' }: GoalCardProps) {
    const isPrimary = variant === 'primary'

    return (
        <section
            className={`p-6 rounded-xl shadow-xl ${heightClass} flex flex-col ${
                isPrimary
                    ? 'bg-primary text-on-primary'
                    : 'bg-white text-on-surface border border-outline-variant/20'
            }`}
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-4 shrink-0">
                <h3 className={`text-xs font-bold uppercase tracking-widest ${isPrimary ? 'opacity-80' : 'text-secondary'}`}>
                    {title}
                </h3>
                <div className="flex items-center gap-1.5">
                    <span
                        className={`text-[10px] px-2 py-0.5 font-bold rounded-full ${
                            isPrimary ? 'bg-white/20' : 'bg-primary/10 text-primary'
                        }`}
                    >
                        {badge}
                    </span>
                    {editable && (
                        <button
                            onClick={onAdd}
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-xs leading-none transition-colors ${
                                isPrimary
                                    ? 'bg-white/20 hover:bg-white/30 text-white'
                                    : 'bg-primary/10 hover:bg-primary/20 text-primary'
                            }`}
                        >
                            +
                        </button>
                    )}
                </div>
            </div>

            {/* Goal List */}
            <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 flex-grow">
                {goals.map((goal, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-3 group"
                    >
                        {/* Checkbox */}
                        <div
                            className={`w-5 h-5 rounded flex items-center justify-center shrink-0 cursor-pointer ${
                                goal.completed
                                    ? isPrimary
                                        ? 'bg-white'
                                        : 'bg-primary'
                                    : isPrimary
                                        ? 'border-2 border-white/30 group-hover:border-white transition-colors'
                                        : 'border-2 border-outline-variant group-hover:border-primary transition-colors'
                            }`}
                            onClick={() => onToggle?.(i)}
                        >
                            {goal.completed && (
                                <MaterialIcon
                                    name="check"
                                    filled
                                    className={`text-xs ${isPrimary ? 'text-primary' : 'text-white'}`}
                                />
                            )}
                        </div>
                        {/* Text */}
                        {editable ? (
                            <input
                                type="text"
                                value={goal.text}
                                onChange={(e) => onTextChange?.(i, e.target.value)}
                                placeholder="输入目标..."
                                className={`text-sm font-medium bg-transparent border-none outline-none focus:ring-0 w-full ${
                                    goal.completed ? 'opacity-60 line-through' : ''
                                } ${isPrimary ? 'text-on-primary placeholder:text-white/40' : 'text-on-surface placeholder:text-outline-variant'}`}
                            />
                        ) : (
                            <span
                                className={`text-sm font-medium ${
                                    goal.completed ? 'opacity-60 line-through' : ''
                                }`}
                                onClick={() => onToggle?.(i)}
                            >
                                {goal.text}
                            </span>
                        )}
                        {/* Delete button */}
                        {editable && (
                            <button
                                onClick={() => onDelete?.(i)}
                                className={`opacity-0 group-hover:opacity-100 text-xs shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-opacity ${
                                    isPrimary
                                        ? 'hover:bg-white/20 text-white/60 hover:text-white'
                                        : 'hover:bg-red-50 text-outline-variant hover:text-red-500'
                                }`}
                            >
                                ×
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </section>
    )
}

export default GoalCard
