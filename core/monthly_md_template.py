# monthly_md_template.py
# 月记 Markdown 模板生成器，格式对标 docs/monthly_template.md

def get_template(
    month_key, year, month, date_start, date_end,
    create_time, complete_time,
    weeks_count, weeks_list,
    tasks_table_parts,
    monthly_score,
    no_masturbation_days,
    avg_mood, avg_sleep_hours, avg_sleep_score,
    total_focus, total_masturbation,
    best_mood_day, worst_mood_day,
    highlights, challenges,
    reflect_good, reflect_improve,
    reflect_cognitive, reflect_next_month,
    reading_books, learning_content,
    words_to_self, thoughts,
):
    # 构建分类任务表格
    tasks_sections = ""
    for part in tasks_table_parts:
        tasks_sections += f"""## {part["category"]}
{part["rows"]}
"""

    # 番茄钟转小时
    focus_hours = ""
    if total_focus not in (None, ""):
        try:
            focus_hours = f"（{round(int(total_focus) * 25 / 60, 1)} 小时）"
        except (ValueError, TypeError):
            pass

    return f"""---
# 月度复盘编号：从2026年1月开始编号，每年12个月，第一个月从01开始计数
month_number: {month_key}
# 年份
year: {year}
# 月份：第几月
month_of_year: {month}
# 日期范围：YYYY-MM-DD 到 YYYY-MM-DD
date_range: "{date_start} 到 {date_end}"
# 创建时间：24小时制 "YYYY-MM-DD HH:MM"（月末或下月初填写）
create_time: "{create_time}"
# 完成时间：24小时制 "YYYY-MM-DD HH:MM"
complete_time: "{complete_time}"
# 本月周数：本月包含的完整周数
weeks_count: {weeks_count}
# 本月周次列表
weeks_list: "{weeks_list}"
---

# 本月数据统计
<!-- 根据每日日记汇总填写 -->
- **平均心情评分**：{avg_mood} / 5.0 ⭐
- **平均睡眠时长**：{avg_sleep_hours} 小时
- **平均睡眠质量**：{avg_sleep_score} / 5.0 ⭐
- **本月总专注时间**：{total_focus} 个番茄钟{focus_hours}
- **本月打飞机次数**：{total_masturbation} 次
- **最高心情分数日**：{best_mood_day}
- **最低心情分数日**：{worst_mood_day}

# 本月重点事项完成情况
<!-- 对照月初计划填写 -->
| 计划事项 | 实际完成 | 状态 | 原因分析 |
|----------|----------|------|----------|
{tasks_sections}
**完成状态说明**：
- ✅ 完全完成且质量满意
- ⚠️ 部分完成或质量不佳
- ❌ 未完成


<!-- ========== 每月表现评分 ==========
# 评分标准（综合以下各项指标）：
# 1：很差（⭐糟糕的一个月，习惯完成率<30%，打飞机次数≥10次，运动次数<8次，目标完成度<30%）
# 2：较差（⭐⭐状态不佳的一个月，习惯完成率30-50%，打飞机5-9次，运动次数8-12次，目标完成度30-50%）
# 3：一般（⭐⭐⭐平稳的一个月，习惯完成率50-70%，打飞机0-4次，运动次数13-18次，目标完成度50-70%）
# 4：较好（⭐⭐⭐⭐充实的一个月，习惯完成率70-90%，打飞机0次，运动次数≥19次，目标完成度70-90%）
# 5：很好（⭐⭐⭐⭐⭐优秀的一个月，习惯完成率>90%，目标完成度>90%，有重大突破或成就） -->
# 本月表现自我评分：{monthly_score} / 5.0 ⭐

# 不打飞机的日子数：{no_masturbation_days}

# 本月亮点时刻
<!-- 本月最值得记录的5-10个精彩瞬间 -->
{highlights}

# 本月困难与挑战
<!-- 本月遇到的主要问题和困难 -->
{challenges}

# 本月反思总结
## 做得好的方面
<!-- 本月值得保持和发扬的行为习惯 -->
{reflect_good}

## 需要改进的方面
<!-- 本月暴露出的问题和需要调整的地方 -->
{reflect_improve}

## 重要认知升级
<!-- 本月在认知、思维方式上的重要收获 -->
{reflect_cognitive}

## 对下月的启示
<!-- 本月的经验教训对下月计划的指导意义 -->
{reflect_next_month}

# 本月阅读总结
<!-- 如果本月有阅读 -->
{reading_books}

# 本月学习成果
<!-- 如果本月有学习新技能 -->
{learning_content}

# 给自己的话
<!-- 本月结束时对自己说的话，鼓励或提醒 -->
{words_to_self}

# 本月的所思所想
<!-- 这一个月回望的时候在想什么，有什么新想法或者想要做的事情 -->
{thoughts}
"""
