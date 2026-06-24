/* 今天的三件好事（需求 44）
   3 组「好事 + 为什么」双栏（窄屏自动堆叠），记录当天发生的顺心小事（不限于自己做成的）。
   6 个字段走 textRecords 管道：good_thing_1/good_why_1 … good_thing_3/good_why_3。
   未填写的格子由 useDiaryData 在保存时写为"无"（加载时"无"还原为空框）。 */
import MaterialIcon from '../ui/MaterialIcon'

const ROWS = [
    { thing: 'good_thing_1', why: 'good_why_1', thingPh: '一件顺心的小事', whyPh: '它为什么发生 / 为什么是好的' },
    { thing: 'good_thing_2', why: 'good_why_2', thingPh: '如：丁丁炒面意外地好吃', whyPh: '如：凉皮没开门，换一家反而踩到宝' },
    { thing: 'good_thing_3', why: 'good_why_3', thingPh: '再小都算', whyPh: '它为什么发生 / 为什么是好的' },
]

interface GoodThingsProps {
    values: Record<string, string>
    onChange: (key: string, value: string) => void
}

function GoodThings({ values, onChange }: GoodThingsProps) {
    const fieldClass =
        'w-full text-[16px] bg-surface-container-low p-3 rounded-xl border border-transparent ' +
        'text-on-surface leading-relaxed min-h-[64px] resize-none focus:ring-0 focus:outline-none ' +
        'focus:border-primary/30 focus:bg-surface-container-lowest placeholder:text-on-surface-variant/40 transition-all'

    return (
        <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
                <MaterialIcon name="favorite" className="text-primary-container" />
                <h3 className="font-bold text-on-surface uppercase text-[24px] tracking-[0.2em]">今天的三件好事</h3>
            </div>

            <div className="flex flex-col gap-4">
                {ROWS.map((row, i) => (
                    <div key={row.thing} className="flex items-start gap-3">
                        {/* 序号徽章 */}
                        <span className="mt-7 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-primary/10 bg-primary/5 text-[13px] font-extrabold text-primary">
                            {i + 1}
                        </span>
                        {/* 好事 + 为什么 双栏（窄屏堆叠） */}
                        <div className="grid flex-1 grid-cols-1 md:grid-cols-[1.25fr_1fr] gap-3 min-w-0">
                            <div>
                                <p className="text-[12px] font-bold uppercase tracking-widest text-primary/70 mb-1.5 pl-0.5">好事</p>
                                <textarea
                                    value={values[row.thing] ?? ''}
                                    onChange={(e) => onChange(row.thing, e.target.value)}
                                    placeholder={row.thingPh}
                                    className={fieldClass}
                                />
                            </div>
                            <div>
                                <p className="text-[12px] font-bold uppercase tracking-widest text-primary/70 mb-1.5 pl-0.5">为什么</p>
                                <textarea
                                    value={values[row.why] ?? ''}
                                    onChange={(e) => onChange(row.why, e.target.value)}
                                    placeholder={row.whyPh}
                                    className={fieldClass}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <p className="mt-4 rounded-xl bg-surface-container-low px-4 py-3 text-[13px] leading-relaxed text-on-surface-variant">
                写不满三件也没关系，<span className="font-bold">一件小事也算</span>；今天很糟的话，这不是要你假装它好，只是帮你把容易被盖过去的那点好捞回来。空着的格子会记为"无"（单独写一个"无"字也视为未填）。
            </p>
        </div>
    )
}

export default GoodThings
