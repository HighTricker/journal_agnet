const DEFAULT_OPTIONS = [
    { value: 1, emoji: '😊', label: '超赞' },
    { value: 2, emoji: '🙂', label: '开心' },
    { value: 3, emoji: '😐', label: '一般' },
    { value: 4, emoji: '🙁', label: '低落' },
    { value: 5, emoji: '😫', label: '极差' },
]

interface EmojiOption {
    value: number
    emoji: string
    label: string
}

interface EmojiRatingProps {
    value: number | null
    onChange: (value: number) => void
    options?: EmojiOption[]
    columns?: number
    size?: 'sm' | 'md'
}

function EmojiRating({
    value,
    onChange,
    options = DEFAULT_OPTIONS,
    columns,
    size = 'md',
}: EmojiRatingProps) {
    const sizeClasses = size === 'sm' ? 'p-2' : 'p-3'
    const emojiSize = size === 'sm' ? 'text-xl' : 'text-2xl'

    const containerClass = columns
        ? `grid gap-3`
        : 'flex gap-3'

    const containerStyle = columns
        ? { gridTemplateColumns: `repeat(${columns}, 1fr)` }
        : undefined

    return (
        <div className={containerClass} style={containerStyle}>
            {options.map((option) => {
                const isSelected = value === option.value
                return (
                    <button
                        key={option.value}
                        onClick={() => onChange(option.value)}
                        className={`flex flex-col items-center gap-1 ${sizeClasses} rounded-xl transition-all ${
                            isSelected
                                ? 'border-2 border-primary bg-primary/5 shadow-md'
                                : 'border border-outline-variant/20 hover:bg-primary/5 hover:shadow-md hover:-translate-y-0.5'
                        }`}
                    >
                        <span className={emojiSize}>{option.emoji}</span>
                        <span className="text-[11px] text-secondary">{option.label}</span>
                    </button>
                )
            })}
        </div>
    )
}

export default EmojiRating
