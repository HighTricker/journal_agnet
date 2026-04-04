import MaterialIcon from '../ui/MaterialIcon'
import type { AIInsight } from '../../mocks/diarySchedule'

interface AIInsightsProps {
    insights: AIInsight[]
}

function AIInsights({ insights }: AIInsightsProps) {
    return (
        <section className="bg-secondary-container/30 p-6 rounded-xl relative overflow-hidden group h-full">
            {/* Decorative blur circle */}
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />

            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <MaterialIcon name="auto_awesome" filled className="text-primary text-xl" />
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-on-secondary-container">
                    AI 洞察
                </h3>
            </div>

            {/* Insight Cards */}
            <div className="flex flex-col justify-between h-[calc(100%-40px)] relative z-10">
                <div className="space-y-4">
                    {insights.map((insight) => (
                        <div key={insight.title} className="p-3 bg-white/60 rounded-lg border border-white/40 shadow-sm">
                            <p className="text-xs font-bold text-primary mb-1">{insight.title}</p>
                            <p className="text-[13px] leading-relaxed">{insight.content}</p>
                        </div>
                    ))}
                </div>
                <button className="w-full py-2.5 text-[11px] font-black uppercase tracking-widest text-primary border border-primary/20 rounded-lg hover:bg-primary hover:text-white transition-all">
                    刷新洞察
                </button>
            </div>
        </section>
    )
}

export default AIInsights
