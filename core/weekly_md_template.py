# weekly_md_template.py
# 周记 Markdown 模板生成器，格式对标用户的 docs/weekly_template.md

def get_template(
    week_key, year, iso_week, date_start, date_end,
    create_time, complete_time,
    habits_table,
    avg_mood, avg_sleep_hours, avg_sleep_score,
    total_focus, total_masturbation,
    best_mood_day, worst_mood_day,
    tasks_table_parts,
    weekly_score,
    highlights, challenges,
    reflect_good, reflect_improve, reflect_next_week,
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
# 周计划编号：从2025年第50周开始编号，即2025-12-08这一天开始算，第50周为第一个markdown格式的周计划 2026年1月5日16点50分：之前有一周没有写周计划和总结，所以我不知道这是该第几周了，因此新的想法是，一年就是一个，每一年52周，所以第一周从01开始计数，先不接着计数了。
week_number: {week_key}
# 年份
year: {year}
# 周次：第几周
week_of_year: {iso_week}
# 日期范围：YYYY-MM-DD 到 YYYY-MM-DD
date_range: "{date_start}到{date_end}"
# 创建时间：24小时制 "YYYY-MM-DD HH:MM"
create_time: "{create_time}"
# 完成时间：24小时制 "YYYY-MM-DD HH:MM"（周日晚上或下周一填写）
complete_time: "{complete_time}"
---

# 本周习惯养成追踪
<!--
打✅表示完成，打❌表示未完成
习惯示例：早起、跑步、阅读、冥想、不打飞机等
-->
| 习惯 | 周一 | 周二 | 周三 | 周四 | 周五 | 周六 | 周日 | 完成率 |
|------|------|------|------|------|------|------|------|------|
{habits_table}

# 本周数据统计
<!-- 周末根据每日日记汇总填写 -->
- **平均心情评分**：{avg_mood} / 5.0 ⭐
- **平均睡眠时长**：{avg_sleep_hours} 小时
- **平均睡眠质量**：{avg_sleep_score} / 5.0 ⭐
- **本周总专注时间**：{total_focus} 个番茄钟{focus_hours}
- **本周打飞机次数**：{total_masturbation} 次
- **最高心情分数日**：{best_mood_day}
- **最低心情分数日**：{worst_mood_day}

# 本周重点事项完成情况
<!-- 对照"本周重点事项"表格填写 -->
| 计划事项 | 实际完成 | 状态 | 原因分析 |
|------|------|------|------|
{tasks_sections}
**完成状态说明**：
- ✅ 完全完成且质量满意
- ⚠️ 部分完成或质量不佳
- ❌ 未完成


<!-- ========== 每周表现评分 ==========
# 评分标准（综合以下各项指标）：
# 1：很差（⭐糟糕的一周，不规律睡眠大于等于3次，打飞机次数大于等于3次，运动次数少于3次，看短视频时间大于等于3小时，目标完成度<30%）
# 2：较差（⭐⭐状态不佳的一周，不规律睡眠1-2次，打飞机1-2次，运动次数3次，看短视频时间1-2小时，目标完成度30-50%）
# 3：一般（⭐⭐⭐平稳的一周，不规律睡眠0次，打飞机0次，运动次数4-5次，看短视频时间0.5-1小时，目标完成度50-70%，有进步也有退步）
# 4：较好（⭐⭐⭐⭐充实的一周，不规律睡眠0次，打飞机0次，运动次数大于等于5次，看短视频时间小于等于0.5小时，目标完成度70-90%，保持良好习惯）
# 5：很好（⭐⭐⭐⭐⭐优秀的一周，目标完成度>90%，突破自我，建立新习惯） -->
# 本周表现自我评分：{weekly_score}

# 本周亮点时刻
<!-- 本周最值得记录的3-5个精彩瞬间 -->
{highlights}

# 本周困难与挑战
<!-- 遇到的主要问题和困难 -->
{challenges}

# 本周反思总结
## 做得好的方面
<!-- 本周值得保持和发扬的行为习惯 -->
{reflect_good}

## 需要改进的方面
<!-- 本周暴露出的问题和需要调整的地方 -->
{reflect_improve}

## 对下周的启示
<!-- 本周的经验教训对下周计划的指导意义 -->
{reflect_next_week}

# 给自己的话
<!-- 本周结束时对自己说的话，鼓励或提醒 -->
{words_to_self}

# 本周的所思所想
<!-- 这一周回望的时候在想什么，有什么新想法或者想要做的事情 -->
{thoughts}
"""
