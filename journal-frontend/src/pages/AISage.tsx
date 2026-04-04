import { useRef, useEffect } from 'react'
import PageLayout from '../components/layout/PageLayout'
import MaterialIcon from '../components/ui/MaterialIcon'
import { useChat } from '../hooks/useChat'

const QUICK_COMMANDS = [
    { icon: 'summarize', label: '分析今天', message: '请分析我今天的日记数据，给出行为建议' },
    { icon: 'schedule', label: '安排明天', message: '请帮我安排明天的日程表' },
    { icon: 'mail', label: '发送周报', message: '请生成本周的行为分析报告并发送到我的邮箱' },
    { icon: 'checklist', label: '本周习惯', message: '请分析我本周的习惯打卡数据' },
]

function AISage() {
    const chat = useChat()
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // 自动滚动到底部
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [chat.messages])

    // 回车发送
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            chat.send()
        }
    }

    // 当前选中模型的显示名
    const currentModel = chat.models.find(m => m.key === chat.selectedModel)

    return (
        <PageLayout>
            <div className="flex gap-10 min-h-[calc(100vh-200px)] -mx-16">
                {/* ========== 左侧边栏 ========== */}
                <aside className="hidden lg:flex flex-col w-80 shrink-0 gap-10">
                    {/* Model Selection */}
                    <section className="flex flex-col gap-5">
                        <h3 className="text-sm font-extrabold uppercase tracking-widest text-on-surface/40 px-2">
                            模型选择
                        </h3>
                        <div className="flex flex-col gap-2">
                            {chat.models.map((model) => (
                                <button
                                    key={model.key}
                                    onClick={() => chat.switchModel(model.key)}
                                    disabled={!model.available}
                                    className={
                                        model.key === chat.selectedModel
                                            ? 'flex items-center gap-4 p-4 rounded-xl bg-surface-container-lowest text-primary font-bold shadow-sm border-l-4 border-primary transition-all'
                                            : model.available
                                                ? 'flex items-center gap-4 p-4 rounded-xl hover:bg-surface-container-low text-on-surface/70 transition-all group'
                                                : 'flex items-center gap-4 p-4 rounded-xl text-on-surface/30 cursor-not-allowed'
                                    }
                                >
                                    <MaterialIcon
                                        name="psychology"
                                        className={model.key === chat.selectedModel ? '' : 'group-hover:text-primary transition-colors'}
                                    />
                                    <span className="text-sm">{model.display_name}</span>
                                    {!model.available && <span className="text-[10px] ml-auto opacity-50">未配置</span>}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Quick Commands */}
                    <section className="flex flex-col gap-5">
                        <h3 className="text-sm font-extrabold uppercase tracking-widest text-on-surface/40 px-2">
                            快捷指令
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                            {QUICK_COMMANDS.map((cmd) => (
                                <button
                                    key={cmd.label}
                                    onClick={() => chat.send(cmd.message)}
                                    disabled={chat.streaming}
                                    className="flex items-center gap-3 p-4 rounded-xl bg-secondary-container/30 hover:bg-secondary-container/60 text-on-secondary-container transition-all text-left disabled:opacity-50"
                                >
                                    <MaterialIcon name={cmd.icon} className="text-primary text-[20px]" />
                                    <span className="text-sm font-medium">{cmd.label}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* New Chat */}
                    <button
                        onClick={chat.newChat}
                        className="flex items-center gap-3 p-4 rounded-xl border border-outline-variant/20 hover:bg-surface-container-low transition-all text-on-surface/70"
                    >
                        <MaterialIcon name="add" className="text-primary" />
                        <span className="text-sm font-medium">新建对话</span>
                    </button>
                </aside>

                {/* ========== 右侧聊天区 ========== */}
                <section className="flex-1 flex flex-col bg-surface-container-low rounded-[2rem] overflow-hidden relative border border-outline-variant/10 shadow-xl shadow-primary/5">
                    {/* Chat Header */}
                    <div className="px-8 py-6 flex items-center justify-between glass-card border-b border-outline-variant/5">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-primary-container flex items-center justify-center text-white">
                                <MaterialIcon name="psychology" className="text-[20px]" />
                            </div>
                            <div>
                                <h2 className="font-bold text-on-surface leading-tight">
                                    {currentModel?.display_name || 'AI 导师'}
                                </h2>
                                <p className="text-xs text-on-surface/50">
                                    {chat.streaming ? '思考中...' : '在线中'} &middot; 行为科学导师
                                </p>
                            </div>
                        </div>
                        {chat.error && (
                            <span className="text-xs text-error bg-error/10 px-3 py-1 rounded-full">{chat.error}</span>
                        )}
                    </div>

                    {/* Messages Stream */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-10">
                        {/* Date Marker */}
                        <div className="flex justify-center">
                            <span className="px-4 py-1 rounded-full bg-surface-variant/30 text-[10px] font-bold uppercase tracking-widest text-on-surface/40">
                                {chat.todayLabel}
                            </span>
                        </div>

                        {/* Empty State */}
                        {chat.messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <MaterialIcon name="psychology" className="text-6xl text-primary/20 mb-4" />
                                <p className="text-on-surface/40 text-sm">开始对话，或点击左侧快捷指令</p>
                            </div>
                        )}

                        {/* Messages */}
                        {chat.messages.map((msg) =>
                            msg.role === 'ai' ? (
                                <div key={msg.id} className="flex gap-4 max-w-[85%]">
                                    <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center shrink-0 mt-1">
                                        <MaterialIcon name="auto_awesome" className="text-primary text-[18px]" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="bg-surface-container-lowest p-5 rounded-2xl rounded-tl-none shadow-sm text-on-surface/90 leading-relaxed text-sm whitespace-pre-wrap">
                                            {msg.content || (msg.streaming ? '...' : '')}
                                            {msg.streaming && (
                                                <span className="inline-block w-2 h-4 bg-primary/60 ml-0.5 animate-pulse" />
                                            )}
                                        </div>
                                        <span className="text-[10px] text-on-surface/40 ml-1">{msg.time}</span>
                                    </div>
                                </div>
                            ) : (
                                <div key={msg.id} className="flex gap-4 max-w-[85%] ml-auto flex-row-reverse">
                                    <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shrink-0 mt-1">
                                        <MaterialIcon name="person" className="text-on-primary-container text-[18px]" />
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="bg-gradient-to-br from-primary to-primary-container p-5 rounded-2xl rounded-tr-none text-white leading-relaxed text-sm shadow-md">
                                            {msg.content}
                                        </div>
                                        <span className="text-[10px] text-on-surface/40 mr-1">{msg.time}</span>
                                    </div>
                                </div>
                            )
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Bottom Input Area */}
                    <div className="p-8 pt-2">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-primary/5 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
                            <div className="relative flex items-end gap-3 p-3 bg-surface-container-lowest border border-outline-variant/20 rounded-[1.5rem] shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                                <textarea
                                    className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-sm py-2 px-1 resize-none min-h-[44px] max-h-40 placeholder:text-on-surface/30"
                                    placeholder="分享你的想法，或寻求指导……"
                                    rows={1}
                                    value={chat.input}
                                    onChange={e => chat.setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={chat.streaming}
                                />
                                <button
                                    onClick={() => chat.send()}
                                    disabled={chat.streaming || !chat.input.trim()}
                                    className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-primary-container text-white flex items-center justify-center shadow-lg shadow-primary/20 active:scale-95 transition-transform disabled:opacity-50"
                                >
                                    <MaterialIcon name={chat.streaming ? 'hourglass_top' : 'send'} filled className="text-[20px]" />
                                </button>
                            </div>
                        </div>
                        <p className="text-center text-[10px] text-on-surface/30 mt-4 tracking-wide font-medium">
                            AI 导师提供的建议仅供参考 · Powered by {currentModel?.display_name || 'AI'}
                        </p>
                    </div>
                </section>
            </div>
        </PageLayout>
    )
}

export default AISage
