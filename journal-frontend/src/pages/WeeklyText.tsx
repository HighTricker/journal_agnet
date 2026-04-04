import MaterialIcon from '../components/ui/MaterialIcon'
import ItemRecordCards from '../components/shared/ItemRecordCards'

/* 文字记录卡片 — key 对齐后端 weekly_summary 字段 */
const TEXT_RECORDS = [
    { key: 'highlights', icon: 'stars', title: '亮点时刻', placeholder: '这周最值得记住的瞬间是什么？' },
    { key: 'challenges', icon: 'warning', title: '困难与挑战', placeholder: '这周遇到了什么困难？怎么应对的？' },
    { key: 'reflect_good', icon: 'done_all', title: '做得好的方面', placeholder: '这周哪些习惯/行为值得继续保持？' },
    { key: 'reflect_improve', icon: 'trending_up', title: '需改进的方面', placeholder: '这周哪些行为需要调整？' },
    { key: 'reflect_next_week', icon: 'next_plan', title: '对下周启示', placeholder: '下周最重要的一件事是什么？' },
    { key: 'words_to_self', icon: 'favorite', title: '给自己的话', placeholder: '对这周的自己说点什么？' },
]

interface WeeklyTextProps {
    textRecords: Record<string, string>
    onTextRecordChange: (key: string, value: string) => void
    inspiration: string
    onInspirationChange: (value: string) => void
}

function WeeklyText({
    textRecords,
    onTextRecordChange,
    inspiration,
    onInspirationChange,
}: WeeklyTextProps) {
    // 从 textRecords 中提取 item_ 前缀的数据作为每日事项
    const itemValues: Record<string, string> = {}
    for (const day of ['周一', '周二', '周三', '周四', '周五', '周六', '周日']) {
        itemValues[day] = textRecords[`item_${day}`] ?? ''
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="space-y-12">
                <ItemRecordCards
                    title="每日事项记录"
                    items={[
                        { label: '周一', placeholder: '描述一下这一天上午、下午、晚上分别做了什么' },
                        { label: '周二', placeholder: '描述一下这一天上午、下午、晚上分别做了什么' },
                        { label: '周三', placeholder: '描述一下这一天上午、下午、晚上分别做了什么' },
                        { label: '周四', placeholder: '描述一下这一天上午、下午、晚上分别做了什么' },
                        { label: '周五', placeholder: '描述一下这一天上午、下午、晚上分别做了什么' },
                        { label: '周六', placeholder: '描述一下这一天上午、下午、晚上分别做了什么' },
                        { label: '周日', placeholder: '描述一下这一天上午、下午、晚上分别做了什么' },
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

                {/* 本周所思所想 */}
                <section>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-6 opacity-80">
                        本周所思所想
                    </h2>
                    <div className="relative">
                        <textarea
                            className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-8 text-on-surface placeholder:text-outline/40 focus:ring-2 focus:ring-primary/20 focus:outline-none min-h-[400px] text-lg leading-relaxed shadow-sm transition-shadow hover:shadow-md"
                            placeholder="这周发生了什么，想到了什么，有什么感悟......"
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

export default WeeklyText
