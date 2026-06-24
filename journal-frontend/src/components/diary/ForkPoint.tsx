/* 今日分岔点（需求 40 单组 → 需求 45 扩展为 3 组）
   3 组「情景 → 该做的/实际做的 → 方向」，与三件好事一致：固定 3 组、铺开显示、写不满留空。
   12 个字段走 textRecords 管道：第 1 组沿用 fork_trigger/should/actual/direction（不带后缀，老数据零迁移），
   第 2、3 组为 *_2 / *_3。未填的文本格子由 useDiaryData 在保存时写为"无"（加载时还原空框）；
   每组「方向」各自独立，是白名单 pill（未选存空串，不写"无"）。 */
import MaterialIcon from '../ui/MaterialIcon'

const DIRECTIONS = [
    /* 配色：引起坏行为=主题 tertiary 棕橙（警示）；中性=secondary 灰蓝；引起良好行为=去饱和绿（主题无绿色 token，用就近色值） */
    { key: '引起坏行为', selectedClass: 'bg-tertiary-fixed border-tertiary-container text-on-tertiary-fixed-variant' },
    { key: '中性', selectedClass: 'bg-secondary-container border-secondary text-on-secondary-container' },
    { key: '引起良好行为', selectedClass: 'bg-[#e3efe8] border-[#2e6b4f] text-[#2e6b4f]' },
]

/* 3 组分岔点的字段 key：第 1 组不带后缀（沿用需求 40），第 2、3 组 *_2 / *_3 */
const SLOTS = [
    { trigger: 'fork_trigger', should: 'fork_should', actual: 'fork_actual', direction: 'fork_direction' },
    { trigger: 'fork_trigger_2', should: 'fork_should_2', actual: 'fork_actual_2', direction: 'fork_direction_2' },
    { trigger: 'fork_trigger_3', should: 'fork_should_3', actual: 'fork_actual_3', direction: 'fork_direction_3' },
]

interface ForkPointProps {
    values: Record<string, string>
    onChange: (key: string, value: string) => void
}

function ForkPoint({ values, onChange }: ForkPointProps) {
    const slotClass =
        'w-full text-[16px] bg-surface-container-low p-3 rounded-xl border border-transparent ' +
        'text-on-surface leading-relaxed min-h-[64px] resize-none focus:ring-0 focus:outline-none ' +
        'focus:border-primary/30 focus:bg-surface-container-lowest placeholder:text-on-surface-variant/40 transition-all'

    return (
        <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
                <MaterialIcon name="alt_route" className="text-primary-container" />
                <h3 className="font-bold text-on-surface uppercase text-[24px] tracking-[0.2em]">今日分岔点</h3>
            </div>

            <div className="flex flex-col gap-5">
                {SLOTS.map((slot, i) => {
                    const direction = values[slot.direction] ?? ''
                    return (
                        <div key={slot.trigger} className="flex items-start gap-3">
                            {/* 序号徽章 */}
                            <span className="mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-primary/10 bg-primary/5 text-[13px] font-extrabold text-primary">
                                {i + 1}
                            </span>

                            <div className="flex-1 min-w-0">
                                {/* 情景 / 触发 */}
                                <div className="mb-3">
                                    <p className="text-[12px] font-bold uppercase tracking-widest text-primary/70 mb-1.5 pl-0.5">情景 / 触发</p>
                                    <textarea
                                        value={values[slot.trigger] ?? ''}
                                        onChange={(e) => onChange(slot.trigger, e.target.value)}
                                        placeholder="如：下午躺床上，手机在手边"
                                        className={slotClass}
                                    />
                                </div>

                                {/* 该做的 → 实际做的：拢进暖色落差框 */}
                                <div className="rounded-2xl border border-tertiary-container/20 bg-tertiary-fixed/15 p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-stretch">
                                        <div>
                                            <p className="text-[12px] font-bold uppercase tracking-widest text-primary/70 mb-1.5 pl-0.5">该做的</p>
                                            <textarea
                                                value={values[slot.should] ?? ''}
                                                onChange={(e) => onChange(slot.should, e.target.value)}
                                                placeholder="如：去把日记写完"
                                                className={slotClass}
                                            />
                                        </div>
                                        <div className="hidden md:flex items-center text-on-tertiary-fixed-variant font-bold text-lg" aria-hidden="true">→</div>
                                        <div>
                                            <p className="text-[12px] font-bold uppercase tracking-widest text-primary/70 mb-1.5 pl-0.5">实际做的</p>
                                            <textarea
                                                value={values[slot.actual] ?? ''}
                                                onChange={(e) => onChange(slot.actual, e.target.value)}
                                                placeholder="如：刷了半小时抖音"
                                                className={slotClass}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* 方向 pill：每组独立，可选可取消 */}
                                <div className="flex items-center gap-3 mt-3 flex-wrap">
                                    <span className="text-[12px] font-bold uppercase tracking-widest text-primary/70">方向</span>
                                    <span className="text-[11px] text-on-surface-variant/50">（可选，再点一下取消）</span>
                                    <div className="flex gap-2 flex-wrap">
                                        {DIRECTIONS.map((d) => {
                                            const isSelected = direction === d.key
                                            return (
                                                <button
                                                    key={d.key}
                                                    onClick={() => onChange(slot.direction, isSelected ? '' : d.key)}
                                                    className={`scale-98-on-click rounded-full border px-4 py-1.5 text-[13px] font-bold transition-all ${
                                                        isSelected
                                                            ? d.selectedClass
                                                            : 'border-outline-variant/30 bg-surface-container-lowest text-on-surface-variant hover:bg-primary/5'
                                                    }`}
                                                >
                                                    {d.key}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <p className="mt-4 rounded-xl bg-surface-container-low px-4 py-3 text-[13px] leading-relaxed text-on-surface-variant">
                一天里想偷懒、或该做正事的关键时刻，<span className="font-bold">最多记三个</span>；写不满也没关系，空着的格子会记为"无"。
            </p>
        </div>
    )
}

export default ForkPoint
