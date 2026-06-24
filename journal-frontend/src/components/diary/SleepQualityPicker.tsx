/* 睡眠质量选择器（方案 C · 分数徽章行）
   5 档纯文字选项：左侧圆形分数徽章 + 标题 + 解释，竖向列表。
   分数越高睡得越好（5 神清气爽 … 1 像没睡过），从上到下递减。
   选中存的是真实分数（5/4/3/2/1），与后端 Sleep_Score 方向一致。 */

const SLEEP_QUALITY_OPTIONS = [
    { score: 5, title: '神清气爽', desc: '睁眼即清醒，身体轻快有劲，几乎无需缓冲' },
    { score: 4, title: '精力充沛', desc: '睡得饱，起身顺畅，疲劳已消，状态稳定' },
    { score: 3, title: '基本解乏', desc: '不算好也不算差，能正常起床，困意大致退去' },
    { score: 2, title: '昏沉发懵', desc: '醒来发沉、想再睡，要缓很久才清醒（睡眠惯性明显）' },
    { score: 1, title: '像没睡过', desc: '醒来仍旧疲惫沉重，仿佛整夜没休息' },
]

interface SleepQualityPickerProps {
    value: number | null
    onChange: (value: number) => void
}

function SleepQualityPicker({ value, onChange }: SleepQualityPickerProps) {
    return (
        <div className="flex flex-col gap-2.5">
            {SLEEP_QUALITY_OPTIONS.map((opt) => {
                const isSelected = value === opt.score
                return (
                    <button
                        key={opt.score}
                        onClick={() => onChange(opt.score)}
                        className={`scale-98-on-click flex w-full items-center gap-3 rounded-xl text-left transition-all ${
                            isSelected
                                ? 'border-2 border-primary bg-primary/5 shadow-md px-[11px] py-[9px]'
                                : 'border border-outline-variant/20 px-3 py-2.5 hover:bg-primary/5 hover:shadow-md hover:-translate-y-0.5'
                        }`}
                    >
                        {/* 分数徽章：未选灰底，选中填主色 */}
                        <span
                            className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[15px] font-extrabold transition-all ${
                                isSelected ? 'bg-primary text-on-primary' : 'bg-surface-variant text-on-surface-variant'
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

export default SleepQualityPicker
