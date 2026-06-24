# md_template.py
# Markdown 日记模板，保留样本中所有原始备注

def get_template(
    diary_number, date_str, write_time, weekday_num,
    location, weather,
    mood_score, energy_score,
    sleep_bedtime, sleep_waketime, sleep_hours, sleep_wake_count, sleep_quality,
    focus_time, meditation_minutes, ai_time,masturbation_count,
    tasks_table, time_table,
    reflect_ai_usage, reflect_ai_learning, reflect_reading,
    reflect_meditation, reflect_good_actions, reflect_bad_actions,
    reflect_words_to_self, reflect_thoughts, reflect_sleep_dreams,
    reflect_deep,
    fork_trigger, fork_should, fork_actual, fork_direction,
    good_thing_1, good_why_1, good_thing_2, good_why_2, good_thing_3, good_why_3,
    fork_trigger_2="", fork_should_2="", fork_actual_2="", fork_direction_2="",
    fork_trigger_3="", fork_should_3="", fork_actual_3="", fork_direction_3=""
):
    return f"""---
# 日记编号：继承最早的#50字写作挑战 wlog 965中的编号，从2025年10月6日开始继承，2025年10月6日为966号。
diary_number: {diary_number}
# 日期：ISO 8601格式 YYYY-MM-DD
date: {date_str}
# 书写时间：24小时制 "HH:MM"，建立这个文件的时间，之后用Python脚本自己填写
write_time: "{write_time}"
# 星期：数字编码（1=周一, 7=周日），之后用Python脚本自己填写
weekday: {weekday_num}
# 地点：所在城市，之后用Python脚本自动填写
location: {location}
# 天气：之后用Python脚本接入天气api自动填写
weather: {weather}  °C
# ========== 心情评分（分数越高心情越好） ==========
# 5：明亮（心里轻快、舒展，有由衷的好心情）
# 4：平和（平稳里带点暖意，挺舒服，不到特别兴奋）
# 3：平淡（没什么大起伏，情绪基本是平的）
# 2：低落（发沉或烦躁，提不起劲，有点想躲）
# 1：很糟（情绪很差，沉重、难受或发空，撑着过）
mood_score: {mood_score}
# ========== 精力评分（只看电量，和心情分开看） ==========
# 5：充沛（精力满格，身体轻、脑子清，做事带劲不费力）
# 4：够用（有劲，推得动事，不亢奋但不缺力气）
# 3：一般（不上不下，维持日常够用，想提速有点吃力）
# 2：发虚（没劲、容易累，做事要硬推，注意力发散）
# 1：枯竭（像被抽空，身体沉、脑子发懵，维持基本运转都费劲）
energy_score: {energy_score}
# 入睡时间：24小时制 "HH:MM"，最后一次看见时间的时刻
sleep_bedtime: "{sleep_bedtime}"
# 起床时间：24小时制 "HH:MM"，早起后第一次看见时间的时刻
sleep_waketime: "{sleep_waketime}"
# 睡眠时长：小时数（由脚本自动计算：起床时间-入睡时间）
sleep_hours: {sleep_hours}
# 起夜/醒来次数：夜间醒来几次
sleep_wake_count: {sleep_wake_count}
# ========== 睡眠质量评分（分数越高睡得越好） ==========
# 5：神清气爽（睁眼即清醒，身体轻快有劲，几乎无需缓冲）
# 4：精力充沛（睡得饱，起身顺畅，疲劳已消，状态稳定）
# 3：基本解乏（不算好也不算差，能正常起床，困意大致退去）
# 2：昏沉发懵（醒来发沉、想再睡，要缓很久才清醒，睡眠惯性明显）
# 1：像没睡过（醒来仍旧疲惫沉重，仿佛整夜没休息）
sleep_quality: {sleep_quality}
# 专注时间：番茄钟一个是25分钟，个数表示多少个番茄钟时间
focus_time: {focus_time}
# 静坐时间：单位是分钟
meditation_time: {meditation_minutes}
# 使用AI时间：单位是小时
AI_Time: {ai_time}
# 打飞机次数：数字表示今天打了几次飞机
masturbation_count: {masturbation_count}
---

# 今日计划、时间安排与执行情况
## 今日计划
<!-- 
计划事项：计划做的事情。
实际完成：实际完成情况。
状态：✅ 完成/成功 ❌ 失败/未完成 ⚠️ 部分完成
原因分析：为什么没有达到计划，实际执行和计划有出入的原因是什么？
-->
| 计划事项 | 实际完成 | 状态 | 原因分析 |
|------|------|------|------|
{tasks_table}

## 今日时间安排与执行情况
<!-- 
计划：这个时间段计划做的事情。
实际：这个时间段实际做的事情。
状态：✅ 完成/成功 ❌ 失败/未完成 ⚠️ 部分完成
备注：为什么这个时间段没有做到计划应该做的事情，实际执行和计划有出入的原因是什么？
如果计划栏目没有内容，则视为当时没有安排这一时间段要做的事情，以实际栏目做的事情为当日这个时间段所做的事情。
-->
| 时间 | 计划 | 实际 | 状态 | 备注 |
|------|------|------|------|------|
{time_table}

# 今日反思
## AI使用情况
<!-- 今天是如何使用AI的?用了多久? -->
{reflect_ai_usage}

## AI学习情况
<!-- 今天从Youtube上看了哪些AI使用视频?从X上看了哪些AI文章? -->
{reflect_ai_learning}

## 读书情况
<!-- 今天读了什么书?读了多少页?有什么感悟? -->
{reflect_reading}

## 静坐情况
<!-- 今天静坐了没有?静坐了多久?有什么感悟? -->
{reflect_meditation}

## 做得好的动作
<!-- 如果今天重来一遍，你会继续做哪些动作/做的好的事情 -->
{reflect_good_actions}

## 需改进的动作
<!-- 如果今天重来一遍，你会减少哪些动作/做的不好的事情 -->
{reflect_bad_actions}

## 给自己的话
<!-- 勉励自己的话 -->
{reflect_words_to_self}

## 今日分岔点
<!-- 今天想偷懒、或该做正事的关键时刻（最多三个）：情景是什么，本该做什么，实际做了什么。方向：引起坏行为/中性/引起良好行为；未填写的格子为"无" -->
1. 情景：{fork_trigger}｜该做：{fork_should}｜实际：{fork_actual}｜方向：{fork_direction}
2. 情景：{fork_trigger_2}｜该做：{fork_should_2}｜实际：{fork_actual_2}｜方向：{fork_direction_2}
3. 情景：{fork_trigger_3}｜该做：{fork_should_3}｜实际：{fork_actual_3}｜方向：{fork_direction_3}

## 想法
<!-- 想要做的事情，或者今天想到的想实现的梦想 -->
{reflect_thoughts}

## 今天的三件好事
<!-- 当天发生的顺心小事（不限于自己做成的），写下它为什么发生/为什么是好的；未填写的格子为"无" -->
1. {good_thing_1}（为什么：{good_why_1}）
2. {good_thing_2}（为什么：{good_why_2}）
3. {good_thing_3}（为什么：{good_why_3}）

## 睡眠状况/梦境
<!-- 回忆睡眠情况，有无起夜、醒来，有没有梦，如果有梦，梦是什么 -->
{reflect_sleep_dreams}

# 思考与感悟
<!-- 今天发生了什么事情，遇见了什么人，有什么新感悟 -->
{reflect_deep}
"""