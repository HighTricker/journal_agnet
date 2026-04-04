import MaterialIcon from '../components/ui/MaterialIcon'
import ItemRecordCards from '../components/shared/ItemRecordCards'

/* 文字记录卡片 — key 对齐后端 monthly_summary 字段 */
const TEXT_RECORDS = [
    { key: 'highlights', icon: 'stars', title: '月度亮点', placeholder: '这个月最值得记住的成就或瞬间？' },
    { key: 'challenges', icon: 'warning', title: '困难与挑战', placeholder: '这个月遇到了什么困难？' },
    { key: 'reflect_good', icon: 'done_all', title: '做得好的方面', placeholder: '哪些习惯/行为值得继续？' },
    { key: 'reflect_improve', icon: 'trending_up', title: '需改进的方面', placeholder: '哪些行为需要调整？' },
    { key: 'reflect_cognitive', icon: 'psychology', title: '认知升级', placeholder: '这个月有什么认知上的突破？' },
    { key: 'reflect_next_month', icon: 'next_plan', title: '对下月启示', placeholder: '下个月最重要的事是什么？' },
    { key: 'reading_books', icon: 'auto_stories', title: '阅读总结', placeholder: '这个月读了什么书？有什么收获？' },
    { key: 'learning_content', icon: 'school', title: '学习成果', placeholder: '这个月学到了什么新技能/知识？' },
    { key: 'words_to_self', icon: 'favorite', title: '给自己的话', placeholder: '对这个月的自己说点什么？' },
]

interface MonthlyTextProps {
    textRecords: Record<string, string>
    onTextRecordChange: (key: string, value: string) => void
    inspiration: string
    onInspirationChange: (value: string) => void
}

function MonthlyText({
    textRecords,
    onTextRecordChange,
    inspiration,
    onInspirationChange,
}: MonthlyTextProps) {
    const itemValues: Record<string, string> = {}
    for (const week of ['第一周', '第二周', '第三周', '第四周', '第五周']) {
        itemValues[week] = textRecords[`item_${week}`] ?? ''
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="space-y-12">
                <ItemRecordCards
                    title="每周事项记录"
                    items={[
                        { label: '第一周', placeholder: '这周主要做了什么？有什么进展？' },
                        { label: '第二周', placeholder: '这周主要做了什么？有什么进展？' },
                        { label: '第三周', placeholder: '这周主要做了什么？有什么进展？' },
                        { label: '第四周', placeholder: '这周主要做了什么？有什么进展？' },
                        { label: '第五周', placeholder: '这周主要做了什么？有什么进展？' },
                    ]}
                    values={itemValues}
                    onChange={(label, value) => onTextRecordChange(`item_${label}`, value)}
                />

                {/* Text Records Grid */}
                <section>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-6 opacity-80">
                        文字记录
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {TEXT_RECORDS.map((record) => (
                            <div
                                key={record.key}
                                className="bg-surface-container-lowest p-6 min-h-[180px] rounded-xl border border-outline-variant/10 hover:border-primary/20 transition-all"
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <MaterialIcon name={record.icon} className="text-primary text-lg" />
                                    <h3 className="font-bold text-on-surface text-sm">{record.title}</h3>
                                </div>
                                <textarea
                                    className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-sm text-on-surface-variant leading-relaxed resize-none min-h-[80px] p-0"
                                    placeholder={record.placeholder}
                                    value={textRecords[record.key] ?? ''}
                                    onChange={e => onTextRecordChange(record.key, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                </section>

                {/* 本月所思所想 */}
                <section>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-6 opacity-80">
                        本月所思所想
                    </h2>
                    <div className="relative">
                        <textarea
                            className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-8 text-on-surface placeholder:text-outline/40 focus:ring-2 focus:ring-primary/20 focus:outline-none min-h-[400px] text-lg leading-relaxed shadow-sm transition-shadow hover:shadow-md"
                            placeholder="这个月发生了什么，有什么感悟......"
                            value={inspiration}
                            onChange={e => onInspirationChange(e.target.value)}
                        />
                        <div className="absolute bottom-6 right-6 flex gap-2">
                            <MaterialIcon name="lightbulb" className="text-outline/30" />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}

export default MonthlyText
