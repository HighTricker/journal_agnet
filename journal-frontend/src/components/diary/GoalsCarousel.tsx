import { useState } from 'react'
import MaterialIcon from '../ui/MaterialIcon'
import WeeklyTimeline from './WeeklyTimeline'
import type { GoalItem, YearlyGoalCategory } from '../../mocks/diarySchedule'

type Tab = 'yearly' | 'monthly' | 'weekly' | 'timeline'

interface GoalsCarouselProps {
    yearlyGoals: YearlyGoalCategory[]
    onYearlyGoalToggle: (categoryId: string, goalId: string) => void
    onYearlyGoalTextChange: (categoryId: string, goalId: string, text: string) => void
    onYearlyGoalDelete: (categoryId: string, goalId: string) => void
    onYearlyGoalAdd: (categoryId: string) => void
    onYearlyCategoryAdd: () => void
    onYearlyCategoryDelete: (categoryId: string) => void
    onYearlyCategoryRename: (categoryId: string, name: string) => void
    monthlyGoals: GoalItem[]
    onMonthlyUpdate: (newGoals: GoalItem[]) => void
    weeklyGoals: GoalItem[]
    onWeeklyUpdate: (newGoals: GoalItem[]) => void
    dateStr: string   // 需求46：时间轴按当前日期定位所在周
}

const TAB_ORDER: Tab[] = ['yearly', 'monthly', 'weekly', 'timeline']

const TAB_META: Record<Tab, { title: string; short: string; gradient: string; checkColor: string }> = {
    yearly: {
        title: '年度目标',
        short: '年',
        gradient: 'linear-gradient(90deg, #FF4D26 0%, #FF8C33 50%, #FFB84D 100%)',
        checkColor: '#FF6B35',
    },
    monthly: {
        title: '月度目标',
        short: '月',
        gradient: 'linear-gradient(90deg, #5B5FFF 0%, #7C4DFF 50%, #B388FF 100%)',
        checkColor: '#5B5FFF',
    },
    weekly: {
        title: '周度目标',
        short: '周',
        gradient: 'linear-gradient(90deg, #064E3B 0%, #047857 50%, #059669 100%)',
        checkColor: '#047857',
    },
    timeline: {
        title: '本周节点',
        short: '轴',
        gradient: 'linear-gradient(90deg, #0e7490 0%, #0891b2 50%, #06b6d4 100%)',
        checkColor: '#0e7490',
    },
}

/* 月/周固定 6 大分类（与年度初始分类对齐） */
const FIXED_CATEGORIES = ['健康', '财富', '智慧', '幸福', '关系', '旅行'] as const
const FALLBACK_CATEGORY = '未分类'

function GoalsCarousel(props: GoalsCarouselProps) {
    const [activeTab, setActiveTab] = useState<Tab>('yearly')
    const currentIndex = TAB_ORDER.indexOf(activeTab)
    const meta = TAB_META[activeTab]

    const handlePrev = () => setActiveTab(TAB_ORDER[(currentIndex - 1 + TAB_ORDER.length) % TAB_ORDER.length])
    const handleNext = () => setActiveTab(TAB_ORDER[(currentIndex + 1) % TAB_ORDER.length])

    return (
        <section
            className="rounded-2xl p-6 shadow-xl transition-all duration-500"
            style={{ background: meta.gradient }}
        >
            <div className="flex justify-between items-center mb-5">
                <h3 className="text-[48px] font-bold uppercase tracking-widest text-white/90 leading-none">
                    {meta.title}
                </h3>

                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-black/15 rounded-full p-1 gap-1">
                        {TAB_ORDER.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={
                                    activeTab === tab
                                        ? 'px-4 py-1.5 rounded-full text-sm font-bold bg-white text-on-surface shadow transition-all'
                                        : 'px-4 py-1.5 rounded-full text-sm font-bold text-white/80 hover:text-white transition-all'
                                }
                            >
                                {TAB_META[tab].short}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handlePrev}
                        className="w-9 h-9 rounded-full bg-black/15 hover:bg-black/25 text-white flex items-center justify-center transition-colors"
                        aria-label="上一页"
                    >
                        <MaterialIcon name="chevron_left" />
                    </button>
                    <button
                        onClick={handleNext}
                        className="w-9 h-9 rounded-full bg-black/15 hover:bg-black/25 text-white flex items-center justify-center transition-colors"
                        aria-label="下一页"
                    >
                        <MaterialIcon name="chevron_right" />
                    </button>
                </div>
            </div>

            {/* 内容区（固定 min-height，三个 Tab 切换时不"跳") */}
            <div className="min-h-[400px]">
                {activeTab === 'yearly' && (
                    <YearlyGoalsPanel
                        categories={props.yearlyGoals}
                        onToggle={props.onYearlyGoalToggle}
                        onTextChange={props.onYearlyGoalTextChange}
                        onDelete={props.onYearlyGoalDelete}
                        onAdd={props.onYearlyGoalAdd}
                        onCategoryAdd={props.onYearlyCategoryAdd}
                        onCategoryDelete={props.onYearlyCategoryDelete}
                        onCategoryRename={props.onYearlyCategoryRename}
                        checkColor={meta.checkColor}
                    />
                )}
                {activeTab === 'monthly' && (
                    <CategorizedGoalsPanel
                        goals={props.monthlyGoals}
                        onUpdate={props.onMonthlyUpdate}
                        checkColor={meta.checkColor}
                    />
                )}
                {activeTab === 'weekly' && (
                    <CategorizedGoalsPanel
                        goals={props.weeklyGoals}
                        onUpdate={props.onWeeklyUpdate}
                        checkColor={meta.checkColor}
                    />
                )}
                {activeTab === 'timeline' && (
                    <WeeklyTimeline dateStr={props.dateStr} />
                )}
            </div>
        </section>
    )
}

/* ---------- 年度目标面板（保留 YearlyGoalCard 的分类网格） ---------- */
interface YearlyGoalsPanelProps {
    categories: YearlyGoalCategory[]
    onToggle: (categoryId: string, goalId: string) => void
    onTextChange: (categoryId: string, goalId: string, text: string) => void
    onDelete: (categoryId: string, goalId: string) => void
    onAdd: (categoryId: string) => void
    onCategoryAdd: () => void
    onCategoryDelete: (categoryId: string) => void
    onCategoryRename: (categoryId: string, name: string) => void
    checkColor: string
}

function YearlyGoalsPanel({
    categories, onToggle, onTextChange, onDelete, onAdd,
    onCategoryAdd, onCategoryDelete, onCategoryRename, checkColor,
}: YearlyGoalsPanelProps) {
    return (
        <div className="grid grid-cols-3 gap-4 items-start">
            {categories.map((category) => (
                <div
                    key={category.id}
                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4"
                >
                    <div className="flex justify-between items-center mb-3 border-b border-white/20 pb-2 group/header">
                        <input
                            type="text"
                            value={category.name}
                            onChange={(e) => onCategoryRename(category.id, e.target.value)}
                            className="text-lg font-bold text-white uppercase tracking-widest bg-transparent border-none outline-none focus:ring-0 w-full"
                        />
                        <div className="flex items-center gap-1 shrink-0">
                            <button
                                onClick={() => onAdd(category.id)}
                                className="w-5 h-5 rounded-full flex items-center justify-center text-xs bg-white/20 hover:bg-white/30 text-white transition-colors"
                            >
                                +
                            </button>
                            <button
                                onClick={() => onCategoryDelete(category.id)}
                                className="w-5 h-5 rounded-full flex items-center justify-center text-xs opacity-0 group-hover/header:opacity-100 transition-opacity hover:bg-white/20 text-white/60 hover:text-white"
                            >
                                ×
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2.5">
                        {category.goals.map((goal) => (
                            <div key={goal.id} className="flex items-center gap-2 group/goal">
                                <div
                                    className={`w-4 h-4 rounded flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                                        goal.completed ? 'bg-white' : 'border-2 border-white/40 hover:border-white/70'
                                    }`}
                                    onClick={() => onToggle(category.id, goal.id)}
                                >
                                    {goal.completed && (
                                        <span style={{ color: checkColor }}>
                                            <MaterialIcon name="check" filled className="text-[15px]" />
                                        </span>
                                    )}
                                </div>
                                <input
                                    type="text"
                                    value={goal.text}
                                    onChange={(e) => onTextChange(category.id, goal.id, e.target.value)}
                                    placeholder="输入目标..."
                                    className={`text-xl font-medium bg-transparent border-none outline-none focus:ring-0 w-full text-white placeholder:text-white/40 ${
                                        goal.completed ? 'opacity-60 line-through' : ''
                                    }`}
                                />
                                <button
                                    onClick={() => onDelete(category.id, goal.id)}
                                    className="opacity-0 group-hover/goal:opacity-100 text-[15px] shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-opacity hover:bg-white/20 text-white/60 hover:text-white"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            <button
                onClick={onCategoryAdd}
                className="border-2 border-dashed border-white/30 rounded-lg p-2 flex items-center justify-center gap-1 text-white/60 hover:text-white hover:border-white/50 hover:bg-white/5 transition-colors min-h-[40px]"
            >
                <span className="text-sm">+</span>
                <span className="text-[10px] font-bold uppercase tracking-widest">新增分类</span>
            </button>
        </div>
    )
}

/* ---------- 月/周分类目标面板（6 大固定分类 + 拖拽 + 增删改） ---------- */
interface CategorizedGoalsPanelProps {
    goals: GoalItem[]
    onUpdate: (newGoals: GoalItem[]) => void
    checkColor: string
}

function CategorizedGoalsPanel({ goals, onUpdate, checkColor }: CategorizedGoalsPanelProps) {
    // 按 category 分组（保留 goals 的全局索引以方便操作）
    const groupedByCategory: Record<string, { index: number; goal: GoalItem }[]> = {}
    FIXED_CATEGORIES.forEach(name => { groupedByCategory[name] = [] })
    groupedByCategory[FALLBACK_CATEGORY] = []

    goals.forEach((goal, idx) => {
        const cat = goal.category && Object.prototype.hasOwnProperty.call(groupedByCategory, goal.category)
            ? goal.category
            : FALLBACK_CATEGORY
        groupedByCategory[cat].push({ index: idx, goal })
    })

    // "未分类" 只在有 item 时才显示
    const visibleCategories: string[] = [
        ...FIXED_CATEGORIES,
        ...(groupedByCategory[FALLBACK_CATEGORY].length > 0 ? [FALLBACK_CATEGORY] : []),
    ]

    const handleToggle = (idx: number) => {
        onUpdate(goals.map((g, i) => i === idx ? { ...g, completed: !g.completed } : g))
    }
    const handleTextChange = (idx: number, text: string) => {
        onUpdate(goals.map((g, i) => i === idx ? { ...g, text } : g))
    }
    const handleDelete = (idx: number) => {
        onUpdate(goals.filter((_, i) => i !== idx))
    }
    const handleAdd = (categoryName: string) => {
        onUpdate([...goals, { text: '', completed: false, category: categoryName }])
    }
    const handleDropGoal = (idx: number, targetCategory: string) => {
        onUpdate(goals.map((g, i) => i === idx ? { ...g, category: targetCategory } : g))
    }

    return (
        <div className="grid grid-cols-3 gap-4 items-start">
            {visibleCategories.map(categoryName => (
                <CategoryCell
                    key={categoryName}
                    name={categoryName}
                    items={groupedByCategory[categoryName]}
                    onToggle={handleToggle}
                    onTextChange={handleTextChange}
                    onDelete={handleDelete}
                    onAdd={() => handleAdd(categoryName)}
                    onDropGoal={(idx) => handleDropGoal(idx, categoryName)}
                    checkColor={checkColor}
                />
            ))}
        </div>
    )
}

interface CategoryCellProps {
    name: string
    items: { index: number; goal: GoalItem }[]
    onToggle: (idx: number) => void
    onTextChange: (idx: number, text: string) => void
    onDelete: (idx: number) => void
    onAdd: () => void
    onDropGoal: (idx: number) => void
    checkColor: string
}

function CategoryCell({ name, items, onToggle, onTextChange, onDelete, onAdd, onDropGoal, checkColor }: CategoryCellProps) {
    const [isDragOver, setIsDragOver] = useState(false)

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        if (!isDragOver) setIsDragOver(true)
    }
    const handleDragLeave = (e: React.DragEvent) => {
        // 只有真正离开 cell（不是进入子元素）时才取消高亮
        if (e.currentTarget === e.target) setIsDragOver(false)
    }
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
        const idxStr = e.dataTransfer.getData('text/plain')
        const idx = parseInt(idxStr, 10)
        if (!isNaN(idx)) onDropGoal(idx)
    }

    return (
        <div
            className={`bg-white/10 backdrop-blur-md border rounded-lg p-4 transition-colors ${
                isDragOver ? 'border-white bg-white/25 ring-2 ring-white/60' : 'border-white/20'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="flex justify-between items-center mb-3 border-b border-white/20 pb-2">
                <span className="text-lg font-bold text-white uppercase tracking-widest">{name}</span>
                <button
                    onClick={onAdd}
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs bg-white/20 hover:bg-white/30 text-white transition-colors"
                    title="新增目标"
                >
                    +
                </button>
            </div>

            <div className="space-y-2.5 min-h-[40px]">
                {items.length === 0 && (
                    <p className="text-white/40 italic text-xs py-2">拖目标到这里 / 点 + 新增</p>
                )}
                {items.map(({ index, goal }) => (
                    <div
                        key={index}
                        draggable
                        onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', String(index))
                            e.dataTransfer.effectAllowed = 'move'
                        }}
                        className="flex items-center gap-2 group/goal cursor-move"
                    >
                        <div
                            className={`w-4 h-4 rounded flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                                goal.completed ? 'bg-white' : 'border-2 border-white/40 hover:border-white/70'
                            }`}
                            onClick={() => onToggle(index)}
                        >
                            {goal.completed && (
                                <span style={{ color: checkColor }}>
                                    <MaterialIcon name="check" filled className="text-[15px]" />
                                </span>
                            )}
                        </div>
                        <input
                            type="text"
                            value={goal.text}
                            onChange={(e) => onTextChange(index, e.target.value)}
                            placeholder="输入目标..."
                            className={`text-base font-medium bg-transparent border-none outline-none focus:ring-0 w-full text-white placeholder:text-white/40 ${
                                goal.completed ? 'opacity-60 line-through' : ''
                            }`}
                        />
                        <button
                            onClick={() => onDelete(index)}
                            className="opacity-0 group-hover/goal:opacity-100 text-[15px] shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-opacity hover:bg-white/20 text-white/60 hover:text-white"
                            title="删除"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default GoalsCarousel
