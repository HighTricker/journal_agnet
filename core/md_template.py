# md_template.py
# Markdown 日记模板，保留样本中所有原始备注

def get_template(
    diary_number, date_str, write_time, weekday_num,
    location, weather,
    mood_score, sleep_bedtime, sleep_waketime, sleep_hours, sleep_quality,
    focus_time, meditation_minutes, ai_time,masturbation_count,
    tasks_table, time_table,
    reflect_ai_usage, reflect_ai_learning, reflect_reading,
    reflect_meditation, reflect_good_actions, reflect_bad_actions,
    reflect_words_to_self, reflect_thoughts, reflect_sleep_dreams,
    reflect_deep
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
# ========== 心情评分 ==========
# 1：很差（⭐糟糕的一天，没有完成想做的事情，打了飞机，伤害了别人，做了后悔的事情）
# 2：较差（⭐⭐烦躁的一天，心情不平静，贪玩，贪看短视频）
# 3：一般（⭐⭐⭐没什么特别的心情起伏，稀松平常的一天）
# 4：较好（⭐⭐⭐⭐比较开心，和平时不太一样）
# 5：很好（⭐⭐⭐⭐⭐非常开心，很高兴，见了想见的人/完成了目标/做完了项目等）
mood_score: {mood_score}
# 入睡时间：24小时制 "HH:MM"，最后一次看见时间的时刻
sleep_bedtime: "{sleep_bedtime}"
# 起床时间：24小时制 "HH:MM"，早起后第一次看见时间的时刻
sleep_waketime: "{sleep_waketime}"
# 睡眠时长：小时数（由脚本自动计算：起床时间-入睡时间）
sleep_hours: {sleep_hours}
# ========== 睡眠质量评分 ==========
# 1：很差（⭐大于等于3次醒来/失眠/噩梦）
# 2：较差（⭐⭐起夜1-2次，睡眠浅，被吵醒）
# 3：一般（⭐⭐⭐正常睡眠，没什么特别之处）
# 4：较好（⭐⭐⭐⭐一下就睡着了，一觉到天亮，没有起夜，没有梦，没有被吵醒）
# 5：很好（⭐⭐⭐⭐⭐按时睡觉起床，起来后感觉身体恢复的很好，充满了能量）
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

## 想法
<!-- 想要做的事情，或者今天想到的想实现的梦想 -->
{reflect_thoughts}

## 睡眠状况/梦境
<!-- 回忆睡眠情况，有无起夜、醒来，有没有梦，如果有梦，梦是什么 -->
{reflect_sleep_dreams}

# 思考与感悟
<!-- 今天发生了什么事情，遇见了什么人，有什么新感悟 -->
{reflect_deep}
"""