/* 通用评分选择器（心情/精力共用，需求 42/43）
   竖向 5 行：左侧圆形分数徽章 + 标题 + 解释，分数越高越好，从上到下递减。
   带 fillPct 的选项（精力）会渲染"电量填充"背景：背景从左往右铺到对应百分比。
   选中存真实分数（5/4/3/2/1），与后端 Mood / Energy_Score 方向一致。 */

export interface RatingOption {
    score: number
    title: string
    desc: string
    fillPct?: string    // 如 '80%'，仅精力使用；不传则为纯白底（心情）
}

interface RatingScaleProps {
    value: number | null
    onChange: (value: number) => void
    options: RatingOption[]
}

/* 电量填充背景：基于主题主色 #00288e 的透明度变体（对应 primary/10、primary/20、primary/5） */
function fillBackground(pct: string, isSelected: boolean): string {
    const fill = isSelected ? 'rgba(0, 40, 142, 0.20)' : 'rgba(0, 40, 142, 0.10)'
    const rest = isSelected ? 'rgba(0, 40, 142, 0.05)' : '#ffffff'
    return `linear-gradient(to right, ${fill} ${pct}, ${rest} ${pct})`
}

function RatingScale({ value, onChange, options }: RatingScaleProps) {
    return (
        <div className="flex flex-col gap-2.5">
            {options.map((opt) => {
                const isSelected = value === opt.score
                return (
                    <button
                        key={opt.score}
                        onClick={() => onChange(opt.score)}
                        style={opt.fillPct ? { background: fillBackground(opt.fillPct, isSelected) } : undefined}
                        className={`scale-98-on-click flex w-full items-center gap-3 rounded-xl text-left transition-all ${
                            isSelected
                                ? 'border-2 border-primary shadow-md px-[11px] py-[9px]'
                                : 'border border-outline-variant/20 px-3 py-2.5 hover:shadow-md hover:-translate-y-0.5'
                        } ${opt.fillPct ? '' : isSelected ? 'bg-primary/5' : 'bg-surface-container-lowest hover:bg-primary/5'}`}
                    >
                        {/* 分数徽章：未选灰底（填充行用半透明白底），选中填主色 */}
                        <span
                            className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[15px] font-extrabold transition-all ${
                                isSelected
                                    ? 'bg-primary text-on-primary'
                                    : opt.fillPct
                                        ? 'bg-white/85 text-primary'
                                        : 'bg-surface-variant text-on-surface-variant'
                            }`}
                        >
                            {opt.score}
                        </span>
                        {/* 标题 + 解释 */}
                        <span className="min-w-0">
                            <span className={`block text-sm font-bold ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
                                {opt.title}
                            </span>
                            <span className="mt-0.5 block text-xs leading-snug text-on-surface-variant">
                                {opt.desc}
                            </span>
                        </span>
                    </button>
                )
            })}
        </div>
    )
}

export default RatingScale
