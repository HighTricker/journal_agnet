/* ========== 模型列表 ========== */
export interface AIModel {
    icon: string
    name: string
    selected: boolean
}

export const AI_MODELS: AIModel[] = [
    { icon: 'psychology', name: 'GPT-4 Sage', selected: true },
    { icon: 'auto_awesome', name: 'Claude Creative', selected: false },
]

/* ========== 快捷指令 ========== */
export interface QuickCommand {
    icon: string
    label: string
}

export const QUICK_COMMANDS: QuickCommand[] = [
    { icon: 'summarize', label: '总结今天' },
    { icon: 'mood', label: '情绪分析' },
    { icon: 'lightbulb', label: '灵感生成' },
]

/* ========== 聊天消息 ========== */
export interface ChatMessage {
    id: number
    role: 'ai' | 'user'
    content: string
    time: string
    structured?: {
        title: string
        icon: string
        items: string[]
    }
}

export const CHAT_MESSAGES: ChatMessage[] = [
    {
        id: 1,
        role: 'ai',
        content: '早上好。我回顾了你昨晚关于新项目的日记，看起来你在兴奋和些许不安之间寻找平衡。今天对第一个里程碑感觉如何？',
        time: '9:41 AM',
    },
    {
        id: 2,
        role: 'user',
        content: '今天早上其实感觉更专注了。我觉得写下来帮我理清了思绪。我想把第一个里程碑拆分成更小、更容易执行的任务，你能帮我拆一下吗？',
        time: '9:43 AM',
    },
    {
        id: 3,
        role: 'ai',
        content: '当然可以。根据你之前的目标，以下是今天的建议安排。记得在每个专注时段之间安排短暂休息，保持头脑清醒。',
        time: '9:44 AM',
        structured: {
            title: '任务拆解',
            icon: 'checklist',
            items: [
                '审查现有文档中的技术缺口（45 分钟）',
                '绘制初版架构图（60 分钟）',
                '约设计团队同步会议（15 分钟）',
            ],
        },
    },
]
