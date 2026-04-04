const BASE_URL = 'http://127.0.0.1:8000/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    })

    if (!res.ok) {
        const body = await res.json().catch(() => ({ detail: res.statusText }))
        throw new Error(body.detail || `请求失败: ${res.status}`)
    }

    return res.json()
}

// ==================== 日记 ====================

export const diaryApi = {
    get: (date: string) =>
        request<DiaryResponse>(`/diary/${date}`),

    save: (date: string, data: DiarySaveRequest) =>
        request<{ message: string }>(`/diary/${date}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    metadata: (date: string) =>
        request<MetadataResponse>(`/diary/${date}/metadata`),

    calendar: (month: string) =>
        request<{ dates: string[] }>(`/calendar/${month}`),
}

// ==================== 周记 ====================

export const weeklyApi = {
    get: (week: string) =>
        request<WeeklyResponse>(`/weekly/${week}`),

    save: (week: string, data: WeeklySaveRequest) =>
        request<{ message: string }>(`/weekly/${week}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    aggregation: (week: string) =>
        request<WeeklyAggregation>(`/weekly/${week}/aggregation`),
}

// ==================== 月记 ====================

export const monthlyApi = {
    get: (month: string) =>
        request<MonthlyResponse>(`/monthly/${month}`),

    save: (month: string, data: MonthlySaveRequest) =>
        request<{ message: string }>(`/monthly/${month}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    aggregation: (month: string) =>
        request<MonthlyAggregation>(`/monthly/${month}/aggregation`),
}

// ==================== 报告 ====================

export const reportApi = {
    send: () =>
        request<{ message: string }>('/report/send', { method: 'POST' }),
}

// ==================== AI 对话 ====================

export const chatApi = {
    models: () =>
        request<ChatModelsResponse>('/chat/models'),

    newChat: () =>
        request<{ thread_id: string }>('/chat/new', { method: 'POST' }),

    deleteChat: (threadId: string) =>
        request<{ message: string }>(`/chat/${threadId}`, { method: 'DELETE' }),

    // SSE 流式，不走通用 request
    stream: (message: string, model: string, threadId: string) => {
        return fetch(`${BASE_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, model, thread_id: threadId }),
        })
    },
}

// ==================== 类型定义 ====================

// --- 日记 ---
export interface DiaryResponse {
    summary: Record<string, unknown>
    tasks: Array<Record<string, string>>
    time_slots: Array<Record<string, string>>
}

export interface DiarySaveRequest {
    summary: {
        Mood?: number | null
        Sleep_Score?: number | null
        Sleep_Bedtime?: string
        Sleep_Waketime?: string
        Sleep_Hours?: number | null
        Focus_Count?: number | null
        Meditation_Minutes?: number | null
        AI_Time?: number | null
        Masturbation_Count?: number | null
        Reflect_AI_Usage?: string
        Reflect_AI_Learning?: string
        Reflect_Reading?: string
        Reflect_Meditation?: string
        Reflect_Good_Actions?: string
        Reflect_Bad_Actions?: string
        Reflect_Words_To_Self?: string
        Reflect_Thoughts?: string
        Reflect_Deep_Reflections?: string
        Reflect_Sleep_Dreams?: string
    }
    tasks: Array<{
        计划事项: string
        实际完成: string
        状态: string
        原因分析: string
    }>
    time_slots: Array<{
        时间段: string
        计划: string
        实际: string
        状态: string
        备注: string
    }>
}

export interface MetadataResponse {
    diary_no: number
    weekday: number
    weekday_name: string
    date: string
}

// --- 周记 ---
export interface WeeklyResponse {
    summary: Record<string, unknown>
    habits: Array<Record<string, string>>
    tasks: Array<Record<string, string>>
}

export interface WeeklySaveRequest {
    summary: Record<string, unknown>
    habits: Array<{
        习惯: string
        Mon: string; Tue: string; Wed: string; Thu: string
        Fri: string; Sat: string; Sun: string
    }>
    tasks: Array<{
        分类: string
        计划事项: string
        实际完成: string
        状态: string
        原因分析: string
    }>
}

export interface WeeklyAggregation {
    Avg_Mood: number | null
    Avg_Sleep_Hours: number | null
    Avg_Sleep_Score: number | null
    Total_Focus: number | null
    Total_Masturbation: number | null
    Best_Mood_Day: string
    Worst_Mood_Day: string
}

// --- 月记 ---
export interface MonthlyResponse {
    summary: Record<string, unknown>
    tasks: Array<Record<string, string>>
}

export interface MonthlySaveRequest {
    summary: Record<string, unknown>
    tasks: Array<{
        分类: string
        计划事项: string
        实际完成: string
        状态: string
        原因分析: string
    }>
}

export interface MonthlyAggregation {
    Avg_Mood: number | null
    Avg_Sleep_Hours: number | null
    Avg_Sleep_Score: number | null
    Total_Focus: number | null
    Total_Masturbation: number | null
    No_Masturbation_Days: number | null
    Best_Mood_Day: string
    Worst_Mood_Day: string
}

// --- AI 对话 ---
export interface ChatModelsResponse {
    models: Array<{
        key: string
        display_name: string
        available: boolean
    }>
    default: string
}
