import MaterialIcon from '../components/ui/MaterialIcon'
import SleepQualityPicker from '../components/diary/SleepQualityPicker'
import RatingScale from '../components/diary/RatingScale'
import ForkPoint from '../components/diary/ForkPoint'
import GoodThings from '../components/diary/GoodThings'
import type { RatingOption } from '../components/diary/RatingScale'

/* 心情 5 档（需求 42）：纯文字，5=最好，从上到下递减，与后端 Mood 方向一致 */
const MOOD_SCALE: RatingOption[] = [
    { score: 5, title: '明亮', desc: '心里轻快、舒展，有由衷的好心情' },
    { score: 4, title: '平和', desc: '平稳里带点暖意，挺舒服，不到特别兴奋' },
    { score: 3, title: '平淡', desc: '没什么大起伏，情绪基本是平的' },
    { score: 2, title: '低落', desc: '发沉或烦躁，提不起劲，有点想躲' },
    { score: 1, title: '很糟', desc: '情绪很差，沉重、难受或发空，撑着过' },
]

/* 精力 5 档（需求 43）：带电量填充百分比，存入 Energy_Score */
const ENERGY_SCALE: RatingOption[] = [
    { score: 5, title: '充沛', desc: '精力满格，身体轻、脑子清，做事带劲不费力', fillPct: '100%' },
    { score: 4, title: '够用', desc: '有劲，推得动事，不亢奋但不缺力气', fillPct: '80%' },
    { score: 3, title: '一般', desc: '不上不下，维持日常够用，想提速有点吃力', fillPct: '60%' },
    { score: 2, title: '发虚', desc: '没劲、容易累，做事要硬推，注意力发散', fillPct: '40%' },
    { score: 1, title: '枯竭', desc: '像被抽空，身体沉、脑子发懵，维持基本运转都费劲', fillPct: '20%' },
]

/* 量化指标卡片数据 */
const METRIC_CARDS: { key: 'pomo' | 'zen' | 'ai' | 'fap'; icon: string; label: string; title: string }[] = [
    { key: 'pomo', icon: 'timer', label: 'Pomo', title: '番茄钟 (25分钟/个)' },
    { key: 'zen', icon: 'self_improvement', label: 'Zen', title: '静坐时间 (分钟)' },
    { key: 'ai', icon: 'psychology', label: 'AI', title: 'AI时间 (小时)' },
    { key: 'fap', icon: 'back_hand', label: 'Fap', title: '打飞机次数' },
]

/* 右栏文字记录卡片 */
const DAILY_TEXT_RECORDS = [
    { label: 'AI使用情况', placeholder: '今天是如何使用AI的？用了什么工具，解决了什么问题？', key: 'ai_usage' },
    { label: 'AI学习情况', placeholder: '今天从Youtube上看了哪些AI使用视频？从X上看了哪些AI文章？', key: 'ai_learning' },
    { label: '读书感受', placeholder: '今天读了什么书？有什么感悟？读了多少页？', key: 'reading' },
    { label: '静坐感受', placeholder: '今天静坐了吗？有什么感悟？心境如何？', key: 'meditation' },
    { label: '做得好的动作', placeholder: '如果今天重来一遍，你会继续做哪些动作/做的好的事情？', key: 'well_done' },
    { label: '需改进的动作', placeholder: '如果今天重来一遍，你会减少哪些动作/做的不好的事情？', key: 'improvement' },
    { label: '给自己的话', placeholder: '勉励自己的话，对自己说些什么？', key: 'to_self' },
]

interface DiaryJournalProps {
    mood: number | null
    onMoodChange: (v: number) => void
    energy: number | null
    onEnergyChange: (v: number) => void
    sleepQuality: number | null
    onSleepQualityChange: (v: number) => void
    wakeCount: number
    onWakeCountChange: (v: number) => void
    sleepTime: { hour: string; minute: string }
    onSleepTimeChange: (field: 'hour' | 'minute', value: string) => void
    wakeTime: { hour: string; minute: string }
    onWakeTimeChange: (field: 'hour' | 'minute', value: string) => void
    metrics: { pomo: number; zen: number; ai: number; fap: number }
    onMetricChange: (key: 'pomo' | 'zen' | 'ai' | 'fap', value: number) => void
    textRecords: Record<string, string>
    onTextRecordChange: (key: string, value: string) => void
    inspiration: string
    onInspirationChange: (value: string) => void
    thoughts: string
    onThoughtsChange: (value: string) => void
}

function DiaryJournal({
    mood,
    onMoodChange,
    energy,
    onEnergyChange,
    sleepQuality,
    onSleepQualityChange,
    wakeCount,
    onWakeCountChange,
    sleepTime,
    onSleepTimeChange,
    wakeTime,
    onWakeTimeChange,
    metrics,
    onMetricChange,
    textRecords,
    onTextRecordChange,
    inspiration,
    onInspirationChange,
    thoughts,
    onThoughtsChange,
}: DiaryJournalProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* ========== 左栏：量化数据 ========== */}
            <div className="lg:col-span-4 flex flex-col gap-8">
                {/* Life Data Records */}
                <section>
                    <h2 className="text-xl font-bold mb-6 tracking-tight text-on-surface">生活量化数据</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {/* 心情卡片（占两列，需求 42：5 档纯文字） */}
                        <div className="bg-surface-container-lowest p-6 rounded-2xl flex flex-col h-auto group border border-outline-variant/10 col-span-2 shadow-sm">
                            <div className="flex justify-between items-start mb-6">
                                <MaterialIcon name="sentiment_satisfied" className="text-primary text-3xl" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-outline">心情</span>
                            </div>
                            <RatingScale
                                value={mood}
                                onChange={onMoodChange}
                                options={MOOD_SCALE}
                            />
                        </div>

                        {/* 精力卡片（占两列，需求 43：带电量填充） */}
                        <div className="bg-surface-container-lowest p-6 rounded-2xl flex flex-col h-auto group border border-outline-variant/10 col-span-2 shadow-sm">
                            <div className="flex justify-between items-start mb-6">
                                <MaterialIcon name="bolt" className="text-primary text-3xl" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-outline">精力</span>
                            </div>
                            <RatingScale
                                value={energy}
                                onChange={onEnergyChange}
                                options={ENERGY_SCALE}
                            />
                        </div>

                        {/* 三个量化指标卡片 */}
                        {METRIC_CARDS.map((card) => (
                            <div
                                key={card.key}
                                className="bg-surface-container-lowest p-5 rounded-xl flex flex-col justify-between h-40 group hover:shadow-lg transition-all border border-outline-variant/10"
                            >
                                <div className="flex justify-between items-start">
                                    <MaterialIcon name={card.icon} className="text-primary text-3xl" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-outline">{card.label}</span>
                                </div>
                                <div>
                                    <p className="text-sm text-on-surface-variant text-center">{card.title}</p>
                                    <div className="flex items-center justify-center mt-1">
                                        <input
                                            type="number"
                                            value={metrics[card.key]}
                                            onChange={(e) => onMetricChange(card.key, parseFloat(e.target.value) || 0)}
                                            step={card.key === 'ai' ? 0.5 : 1}
                                            className="w-20 text-center text-2xl font-bold text-primary bg-transparent border-b-2 border-primary/30 focus:border-primary focus:ring-0 focus:outline-none p-0"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Sleep Section */}
                <section className="bg-primary-container/10 p-6 rounded-2xl border border-primary/5">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold tracking-tight text-primary">睡眠记录</h2>
                        <MaterialIcon name="bedtime" filled className="text-primary" />
                    </div>
                    <div className="space-y-6">
                        {/* 入睡/起床时间 */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-2">入睡时间</span>
                                <div className="flex items-center gap-1 bg-surface-container-lowest px-4 py-2 rounded-lg border border-primary/10 w-full justify-center">
                                    <input
                                        type="text"
                                        value={sleepTime.hour}
                                        onChange={(e) => onSleepTimeChange('hour', e.target.value)}
                                        className="w-10 text-center text-xl font-bold text-primary bg-transparent border-none focus:ring-0 p-0"
                                    />
                                    <span className="text-lg font-bold text-primary">:</span>
                                    <input
                                        type="text"
                                        value={sleepTime.minute}
                                        onChange={(e) => onSleepTimeChange('minute', e.target.value)}
                                        className="w-10 text-center text-xl font-bold text-primary bg-transparent border-none focus:ring-0 p-0"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-2">起床时间</span>
                                <div className="flex items-center gap-1 bg-surface-container-lowest px-4 py-2 rounded-lg border border-primary/10 w-full justify-center">
                                    <input
                                        type="text"
                                        value={wakeTime.hour}
                                        onChange={(e) => onWakeTimeChange('hour', e.target.value)}
                                        className="w-10 text-center text-xl font-bold text-primary bg-transparent border-none focus:ring-0 p-0"
                                    />
                                    <span className="text-lg font-bold text-primary">:</span>
                                    <input
                                        type="text"
                                        value={wakeTime.minute}
                                        onChange={(e) => onWakeTimeChange('minute', e.target.value)}
                                        className="w-10 text-center text-xl font-bold text-primary bg-transparent border-none focus:ring-0 p-0"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 睡眠时长 */}
                        <div className="pt-4 border-t border-primary/10 text-center">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70">睡眠时长</span>
                            <p className="text-2xl font-bold text-primary mt-1">
                                {(() => {
                                    const bed = parseInt(sleepTime.hour) + parseInt(sleepTime.minute) / 60
                                    const wake = parseInt(wakeTime.hour) + parseInt(wakeTime.minute) / 60
                                    let hours = wake - bed
                                    if (hours < 0) hours += 24
                                    return `${Math.round(hours * 100) / 100} 小时`
                                })()}
                            </p>
                        </div>

                        {/* 睡眠质量 */}
                        <div className="pt-4 border-t border-primary/10">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-4 block text-center">睡眠质量</span>
                            <SleepQualityPicker
                                value={sleepQuality}
                                onChange={onSleepQualityChange}
                            />
                        </div>

                        {/* 起夜/醒来次数（需求 41：番茄钟同款卡片） */}
                        <div className="pt-4 border-t border-primary/10">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-4 block text-center">起夜 / 醒来次数</span>
                            <div className="bg-surface-container-lowest p-5 rounded-xl flex flex-col justify-between border border-outline-variant/10">
                                <div className="flex justify-between items-start">
                                    <MaterialIcon name="nights_stay" className="text-primary text-3xl" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-outline">Wake</span>
                                </div>
                                <div>
                                    <p className="text-sm text-on-surface-variant text-center">夜间醒来（次）</p>
                                    <div className="flex items-center justify-center mt-1">
                                        <input
                                            type="number"
                                            min={0}
                                            step={1}
                                            value={wakeCount}
                                            onChange={(e) => onWakeCountChange(Math.max(0, parseInt(e.target.value) || 0))}
                                            className="w-20 text-center text-2xl font-bold text-primary bg-transparent border-b-2 border-primary/30 focus:border-primary focus:ring-0 focus:outline-none p-0"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 睡眠情况 */}
                        <div className="pt-4 border-t border-primary/10">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-2 block text-center">睡眠情况</span>
                            <textarea
                                value={textRecords['sleep_dreams'] ?? ''}
                                onChange={(e) => onTextRecordChange('sleep_dreams', e.target.value)}
                                placeholder="回忆睡眠情况，有无起夜，有无做梦，梦是什么？"
                                className="w-full text-[14px] bg-surface-container-lowest p-3 rounded-lg border border-primary/10 text-on-surface-variant leading-relaxed min-h-[100px] resize-none focus:ring-0 focus:outline-none placeholder:text-on-surface-variant/40"
                            />
                        </div>
                    </div>
                </section>
            </div>

            {/* ========== 右栏：文字记录 ========== */}
            <div className="lg:col-span-8 flex flex-col gap-8">
                <section className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm border border-outline-variant/10 flex flex-col">
                    <div className="flex items-center gap-3 mb-8">
                        <MaterialIcon name="edit_note" className="text-primary-container text-3xl" />
                        <h2 className="text-2xl font-extrabold tracking-tight text-on-surface">文字记录</h2>
                    </div>

                    {/* 6 个文字记录小卡片 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {DAILY_TEXT_RECORDS.map((record) => (
                            <div
                                key={record.key}
                                className="p-9 rounded-xl bg-surface-container-low border border-transparent hover:border-primary/20 transition-all flex flex-col min-h-[210px]"
                            >
                                <p className="text-[24px] font-bold text-primary mb-2 tracking-widest">{record.label}</p>
                                <textarea
                                    value={textRecords[record.key] ?? ''}
                                    onChange={(e) => onTextRecordChange(record.key, e.target.value)}
                                    placeholder={record.placeholder}
                                    className="flex-grow text-[20px] text-on-surface leading-loose bg-transparent border-none focus:ring-0 focus:outline-none resize-none p-0 w-full placeholder:text-on-surface-variant/40"
                                />
                            </div>
                        ))}
                    </div>

                    {/* 今日分岔点（需求 40） */}
                    <ForkPoint values={textRecords} onChange={onTextRecordChange} />

                    {/* Ideas & Inspiration */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <MaterialIcon name="lightbulb" className="text-primary-container" />
                            <h3 className="font-bold text-on-surface uppercase text-[24px] tracking-[0.2em]">灵感与启发</h3>
                        </div>
                        <textarea
                            value={inspiration}
                            onChange={(e) => onInspirationChange(e.target.value)}
                            placeholder="想要做的事情，或者今天想到想实现的梦想"
                            className="w-full text-[20px] bg-surface p-6 rounded-2xl border-l-4 border-primary shadow-inner text-on-surface-variant leading-loose min-h-[180px] resize-none focus:ring-0 focus:outline-none placeholder:text-on-surface-variant/40"
                        />
                    </div>

                    {/* 今天的三件好事（需求 44） */}
                    <GoodThings values={textRecords} onChange={onTextRecordChange} />

                    {/* Thoughts & Insights */}
                    <div className="flex-grow flex flex-col">
                        <div className="flex items-center gap-2 mb-4">
                            <MaterialIcon name="auto_awesome" className="text-primary-container" />
                            <h3 className="font-bold text-on-surface uppercase text-[24px] tracking-[0.2em]">感悟与思考</h3>
                        </div>
                        <textarea
                            value={thoughts}
                            onChange={(e) => onThoughtsChange(e.target.value)}
                            placeholder="今天发生了什么事情，遇见了什么人，有什么新的感悟？"
                            className="w-full text-[20px] bg-surface p-8 rounded-2xl border-t border-outline-variant/20 text-on-surface leading-loose h-[500px] resize-none focus:ring-0 focus:outline-none placeholder:text-on-surface-variant/40"
                        />
                    </div>
                </section>
            </div>

        </div>
    )
}

export default DiaryJournal
