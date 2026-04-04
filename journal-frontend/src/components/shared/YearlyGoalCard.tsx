import MaterialIcon from '../ui/MaterialIcon'
import type { YearlyGoalCategory } from '../../mocks/diarySchedule'

interface YearlyGoalCardProps {
    categories: YearlyGoalCategory[]
    onToggle: (categoryId: string, goalId: string) => void
    onTextChange: (categoryId: string, goalId: string, text: string) => void
    onDelete: (categoryId: string, goalId: string) => void
    onAdd: (categoryId: string) => void
    onCategoryAdd: () => void
    onCategoryDelete: (categoryId: string) => void
    onCategoryRename: (categoryId: string, name: string) => void
}

function YearlyGoalCard({
    categories,
    onToggle,
    onTextChange,
    onDelete,
    onAdd,
    onCategoryAdd,
    onCategoryDelete,
    onCategoryRename,
}: YearlyGoalCardProps) {
    const totalRemaining = categories.reduce(
        (sum, cat) => sum + cat.goals.filter((g) => !g.completed).length,
        0
    )

    return (
        <section
            className="rounded-2xl p-6 shadow-xl"
            style={{ background: 'linear-gradient(90deg, #FF4D26 0%, #FF8C33 50%, #FFB84D 100%)' }}
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-5">
                <h3 className="text-[64px] font-bold uppercase tracking-widest text-white/80">
                    年度目标
                </h3>
                <span className="text-[24px] px-3 py-1 font-bold rounded-full bg-black/15 text-white">
                    {totalRemaining} 个目标正在进行
                </span>
            </div>

            {/* 分类网格 */}
            <div className="grid grid-cols-3 gap-4 items-start">
                {categories.map((category) => (
                    <div
                        key={category.id}
                        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4"
                    >
                        {/* 分类标题 */}
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

                        {/* 目标列表 */}
                        <div className="space-y-2.5">
                            {category.goals.map((goal) => (
                                <div key={goal.id} className="flex items-center gap-2 group/goal">
                                    {/* 复选框 */}
                                    <div
                                        className={`w-4 h-4 rounded flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                                            goal.completed
                                                ? 'bg-white'
                                                : 'border-2 border-white/40 hover:border-white/70'
                                        }`}
                                        onClick={() => onToggle(category.id, goal.id)}
                                    >
                                        {goal.completed && (
                                            <MaterialIcon
                                                name="check"
                                                filled
                                                className="text-[15px] text-[#FF6B35]"
                                            />
                                        )}
                                    </div>

                                    {/* 可编辑文本 */}
                                    <input
                                        type="text"
                                        value={goal.text}
                                        onChange={(e) => onTextChange(category.id, goal.id, e.target.value)}
                                        placeholder="输入目标..."
                                        className={`text-xl font-medium bg-transparent border-none outline-none focus:ring-0 w-full text-white placeholder:text-white/40 ${
                                            goal.completed ? 'opacity-60 line-through' : ''
                                        }`}
                                    />

                                    {/* 删除按钮 */}
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

                {/* 新增分类按钮 */}
                <button
                    onClick={onCategoryAdd}
                    className="border-2 border-dashed border-white/30 rounded-lg p-2 flex items-center justify-center gap-1 text-white/60 hover:text-white hover:border-white/50 hover:bg-white/5 transition-colors min-h-[40px]"
                >
                    <span className="text-sm">+</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest">新增分类</span>
                </button>
            </div>
        </section>
    )
}

export default YearlyGoalCard
