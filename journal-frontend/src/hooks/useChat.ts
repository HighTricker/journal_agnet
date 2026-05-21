import { useState, useEffect, useCallback, useRef } from 'react'
import { chatApi, BASE_URL } from '../api/client'
import type { ChatModelsResponse } from '../api/client'

export interface ChatMessage {
    id: string
    role: 'ai' | 'user'
    content: string
    time: string
    streaming?: boolean
}

function nowTimeStr(): string {
    const d = new Date()
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

function todayLabel(): string {
    const d = new Date()
    return `今天，${d.getMonth() + 1}月${d.getDate()}日`
}

export function useChat() {
    const [models, setModels] = useState<ChatModelsResponse['models']>([])
    const [selectedModel, setSelectedModel] = useState('')
    const [threadId, setThreadId] = useState('')
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [input, setInput] = useState('')
    const [streaming, setStreaming] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const abortRef = useRef<AbortController | null>(null)

    // 加载模型列表
    useEffect(() => {
        chatApi.models().then(res => {
            setModels(res.models)
            setSelectedModel(res.default)
        }).catch(e => setError(e.message))
    }, [])

    // 初始化会话
    useEffect(() => {
        chatApi.newChat().then(res => {
            setThreadId(res.thread_id)
        }).catch(e => setError(e.message))
    }, [])

    // 切换模型：清空对话 + 新建会话
    const switchModel = useCallback((modelKey: string) => {
        setSelectedModel(modelKey)
        setMessages([])
        setError(null)
        chatApi.newChat().then(res => setThreadId(res.thread_id)).catch(console.error)
    }, [])

    // 新建对话
    const newChat = useCallback(() => {
        setMessages([])
        setError(null)
        chatApi.newChat().then(res => setThreadId(res.thread_id)).catch(console.error)
    }, [])

    // 发送消息
    const send = useCallback(async (text?: string) => {
        const msgText = (text || input).trim()
        if (!msgText || streaming || !threadId) return

        setInput('')
        setError(null)

        // 添加用户消息
        const userMsg: ChatMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: msgText,
            time: nowTimeStr(),
        }

        // 添加 AI 占位消息
        const aiMsgId = `ai-${Date.now()}`
        const aiMsg: ChatMessage = {
            id: aiMsgId,
            role: 'ai',
            content: '',
            time: nowTimeStr(),
            streaming: true,
        }

        setMessages(prev => [...prev, userMsg, aiMsg])
        setStreaming(true)

        try {
            const controller = new AbortController()
            abortRef.current = controller

            const res = await fetch(`${BASE_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: msgText,
                    model: selectedModel,
                    thread_id: threadId,
                }),
                signal: controller.signal,
            })

            if (!res.ok) {
                const body = await res.json().catch(() => ({ detail: res.statusText }))
                throw new Error(body.detail || `请求失败: ${res.status}`)
            }

            const reader = res.body?.getReader()
            if (!reader) throw new Error('无法读取响应流')

            const decoder = new TextDecoder()
            let buffer = ''

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                buffer += decoder.decode(value, { stream: true })

                // 按行解析 SSE 事件
                const lines = buffer.split('\n')
                buffer = lines.pop() || '' // 最后一行可能不完整，留着

                for (const line of lines) {
                    if (line.startsWith('data: [DONE]')) {
                        // 流结束
                    } else if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6))
                            if (data.content) {
                                setMessages(prev => prev.map(m =>
                                    m.id === aiMsgId
                                        ? { ...m, content: m.content + data.content }
                                        : m
                                ))
                            }
                        } catch {
                            // 忽略解析错误
                        }
                    } else if (line.startsWith('event: error')) {
                        // 下一行是 data
                    } else if (line.startsWith('data: {') && line.includes('"detail"')) {
                        try {
                            const errData = JSON.parse(line.slice(6))
                            throw new Error(errData.detail)
                        } catch (e) {
                            if (e instanceof Error && e.message !== line.slice(6)) throw e
                        }
                    }
                }
            }

            // 标记流结束
            setMessages(prev => prev.map(m =>
                m.id === aiMsgId ? { ...m, streaming: false } : m
            ))
        } catch (e) {
            if ((e as Error).name === 'AbortError') return
            const errMsg = e instanceof Error ? e.message : '对话出错'
            setError(errMsg)
            // 更新 AI 消息为错误状态
            setMessages(prev => prev.map(m =>
                m.id === aiMsgId
                    ? { ...m, content: m.content || `出错了：${errMsg}`, streaming: false }
                    : m
            ))
        } finally {
            setStreaming(false)
            abortRef.current = null
        }
    }, [input, streaming, threadId, selectedModel])

    return {
        models,
        selectedModel,
        switchModel,
        messages,
        input,
        setInput,
        streaming,
        error,
        send,
        newChat,
        todayLabel: todayLabel(),
    }
}
