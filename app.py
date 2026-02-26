import streamlit as st
import pandas as pd
from datetime import datetime, timedelta
from core import texts as t
from core.data_manager import load_data_for_date, save_all_data

# ==========================================
# 0. 基础页面配置
# ==========================================
st.set_page_config(page_title=t.APP_TITLE, page_icon="📝", layout="wide")

# 加载自定义 CSS 样式
def load_css(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        st.markdown(f'<style>{f.read()}</style>', unsafe_allow_html=True)

load_css('assets/styles.css')

# ==========================================
# 1. 核心逻辑函数：负责日记编号与星期计算
# ==========================================
def get_diary_metadata(target_date):
    """
    根据用户 Kingsley 的逻辑计算编号
    锚定 2026-02-18 为 No.1100
    """
    anchor_date = datetime(2026, 2, 18).date()
    # 编号逻辑：基于日期差值的绝对时间轴
    diary_no = 1100 + (target_date - anchor_date).days
    
    # 星期逻辑：转换为 1-7 的数字
    weekday_num = target_date.weekday() + 1
    # 界面显示的中文映射
    week_map = {1: "星期一", 2: "星期二", 3: "星期三", 4: "星期四", 5: "星期五", 6: "星期六", 7: "星期日"}
    weekday_zh = week_map[weekday_num]
    
    return diary_no, weekday_num, weekday_zh

# ==========================================
# 2. 侧边栏导航：选择日期
# ==========================================
st.sidebar.title(t.SIDEBAR_TITLE)

date_options = {}
today = datetime.now().date()

# 生成日期选项：明天、今天、过去6天
tmr = today + timedelta(days=1)
date_options[f"🔮 明天 ({tmr})"] = tmr
date_options[f"🌟 今天 ({today})"] = today
for i in range(1, 7):
    past_date = today - timedelta(days=i)
    date_options[f"📅 {past_date}"] = past_date

selected_label = st.sidebar.radio("选择日期", list(date_options.keys()), index=1)
current_date = date_options[selected_label]

# ==========================================
# 3. 数据加载：从 CSV 读取历史数据
# ==========================================
summary_data, tasks_df, time_df = load_data_for_date(current_date)

# ==========================================
# 4. 页面渲染：元数据展示 (编号/日期/星期/阿克苏所在地)
# ==========================================
current_no, weekday_digit, weekday_name = get_diary_metadata(current_date)

st.markdown(f'<div class="part-title">{t.METADATA}</div>', unsafe_allow_html=True)

# 第一排布局
col_row1_1, col_row1_2, col_row1_3, col_row1_4 = st.columns(4)
with col_row1_1: 
    st.markdown(f'<div class="normal-text"><b>{t.DIARY_NUMBER}:</b> {current_no}</div>', unsafe_allow_html=True)
with col_row1_2: 
    st.markdown(f'<div class="normal-text"><b>{t.DATE}:</b> {current_date}</div>', unsafe_allow_html=True)
with col_row1_3: 
    st.markdown(f'<div class="normal-text"><b>{t.WEEKDAY}:</b> {weekday_name}</div>', unsafe_allow_html=True)
with col_row1_4: 
    st.markdown(f'<div class="normal-text"><b>{t.WEATHER}</b></div>', unsafe_allow_html=True)

# 第二排布局：所在地对齐
col_row2_1, col_row2_empty = st.columns([1, 3])
with col_row2_1:
    st.markdown(f'<div class="normal-text"><b>{t.LOCATION}</b></div>', unsafe_allow_html=True)

# ==========================================
# 5. 量化数据输入区域 (心情/睡眠/专注力)
# ==========================================
st.markdown(f'<div class="part-title">{t.LIFE_DATA}</div>', unsafe_allow_html=True)
col1, col2 = st.columns(2)

with col1:
    st.markdown(f'<div class="question-text">{t.MOOD_INQUIRY}</div>', unsafe_allow_html=True)
    try:
        default_mood = int(float(summary_data.get("Mood", 4)))
    except (ValueError, TypeError):
        default_mood = 4
    mood_score = st.radio("Mood", t.MOOD_SCORE.keys(), index=default_mood-1, format_func=lambda x: t.MOOD_SCORE[x], label_visibility="collapsed")
    
    st.markdown(f'<div class="question-text">{t.FOCUS_TIME}</div>', unsafe_allow_html=True)
    try:
        default_focus = int(float(summary_data.get("Focus_Count", 0)))
    except (ValueError, TypeError):
        default_focus = 0
    focus_count = st.number_input("番茄钟", min_value=0, value=default_focus, label_visibility="collapsed")
    
    st.markdown(f'<div class="question-text">{t.MEDITATION_TIME}</div>', unsafe_allow_html=True)
    try:
        default_meditation = int(float(summary_data.get("Meditation_Minutes", 0)))
    except (ValueError, TypeError):
        default_meditation = 0
    meditation_minutes = st.number_input("静坐分钟", min_value=0, value=default_meditation, label_visibility="collapsed")
    
    st.markdown(f'<div class="question-text">{t.AI_TIME}</div>', unsafe_allow_html=True)
    try:
        default_ai_time = int(float(summary_data.get("AI_time", 0)))
    except (ValueError, TypeError):
        default_ai_time = 0
    ai_time = st.number_input("AI时间小时", min_value=0, value=default_ai_time, label_visibility="collapsed")
    
    st.markdown(f'<div class="question-text">{t.MASTURBATION_COUNT}</div>', unsafe_allow_html=True)
    try:
        default_masturb = int(float(summary_data.get("Masturbation_Count", 0)))
    except (ValueError, TypeError):
        default_masturb = 0
    masturbation_count = st.number_input("打飞机次数", min_value=0, value=default_masturb, label_visibility="collapsed")

with col2:
    st.markdown(f'<div class="question-text">{t.SLEEP_INQUIRY}</div>', unsafe_allow_html=True)
    try:
        default_sleep = int(float(summary_data.get("Sleep_Score", 4)))
    except (ValueError, TypeError):
        default_sleep = 4
    sleep_score = st.radio("Sleep", t.SLEEP_SCORE.keys(), index=default_sleep-1, format_func=lambda x: t.SLEEP_SCORE[x], label_visibility="collapsed")
    
    c_s1, c_s2 = st.columns(2)
    with c_s1:
        st.markdown(f'<div class="question-text">{t.BEDTIME}</div>', unsafe_allow_html=True)
        bedtime = st.text_input("入睡", value=str(summary_data.get("Sleep_Bedtime", "23:00")), label_visibility="collapsed")
    with c_s2:
        st.markdown(f'<div class="question-text">{t.WAKE_UP_TIME}</div>', unsafe_allow_html=True)
        waketime = st.text_input("起床", value=str(summary_data.get("Sleep_Waketime", "08:00")), label_visibility="collapsed")
    
    try:
        t1 = datetime.strptime(str(bedtime), "%H:%M")
        t2 = datetime.strptime(str(waketime), "%H:%M")
        if t2 < t1: t2 += timedelta(days=1)
        duration = round((t2 - t1).seconds / 3600, 2)
    except (ValueError, TypeError):
        duration = 0.0
    st.markdown(f'<div class="result-text">✅ 睡眠时长: {duration} 小时</div>', unsafe_allow_html=True)

# ==========================================
# 6. 核心看板：任务与时间 (这里定义了出错的变量)
# ==========================================
st.markdown(f'<div class="part-title">{t.TODAY_PLANS_IMPLEMENTATION}</div>', unsafe_allow_html=True)

tab_task, tab_time = st.tabs(["📋 任务清单", "⏱️ 30分钟时间流"])

with tab_task:
    st.caption("直接编辑下方表格内容")
    # 定义 edited_tasks 变量
    edited_tasks = st.data_editor(
        tasks_df,
        num_rows="dynamic",
        use_container_width=True,
        column_config={
            "Date": st.column_config.TextColumn(
                "日期", disabled=True, default=str(current_date)
            ),
            t.COL_TASK_NAME: st.column_config.TextColumn("计划事项"),
            t.COL_TASK_ACTUAL: st.column_config.TextColumn("实际完成"),
            t.COL_TASK_STATUS: st.column_config.SelectboxColumn("状态", options=["None", "✅", "❌", "⚠️"]),
            t.COL_TASK_REASON: st.column_config.TextColumn("原因/备注", width="large")
        },
        hide_index=True,
        key="task_editor"
    )
    
    reasons = " ".join(edited_tasks[t.COL_TASK_REASON].astype(str).tolist())
    bad_habits_found = [h for h in t.BAD_HABITS if h in reasons]
    if bad_habits_found:
        st.error(f"⚠️ 警报：检测到 {bad_habits_found}！")

with tab_time:
    st.caption("记录每30分钟的实际开销")
    # 定义 edited_time 变量
    edited_time = st.data_editor(
        time_df,
        height=600,
        use_container_width=True,
        hide_index=True,
        column_config={
            t.COL_TIME_SLOT: st.column_config.TextColumn("⏰ 时间段", disabled=True),
            t.COL_TIME_STATUS: st.column_config.SelectboxColumn("状态", options=["None", "✅", "❌", "⚠️"]),
        },
        key="time_editor"
    )

# ==========================================
# 7. 反思部分
# ==========================================
st.markdown(f'<div class="part-title">{t.TITLE_TODAY_REFLECTIONS}</div>', unsafe_allow_html=True)
reflection_inputs = {}
for key, meta in t.REFLECTIONS_MAP.items():
    st.markdown(f'<div class="question-text">{meta["title"]}</div>', unsafe_allow_html=True)
    reflection_inputs[f"Reflect_{key}"] = st.text_area(
        meta["title"], 
        value=str(summary_data.get(f"Reflect_{key}", "")), 
        height=100 if key != "Deep_Reflections" else 200, 
        placeholder=meta["ph"], 
        label_visibility="collapsed"
    )

# ==========================================
# 8. 保存逻辑 (现在变量都有定义了)
# ==========================================
st.divider()
if st.button("💾 保存并生成日记 (Save & Generate)", type="primary", use_container_width=True):
        
    # 第一步：清理空行（去除 data_editor dynamic 模式产生的幽灵行）
    edited_tasks = edited_tasks[
        edited_tasks[t.COL_TASK_NAME].fillna("").astype(str).str.strip() != ""
    ]

    # 第二步：如果清理后没有有效任务，插入占位行
    if edited_tasks.empty:
        edited_tasks = pd.DataFrame([{
            "Date": str(current_date),
            t.COL_TASK_NAME: "此日未作安排",
            t.COL_TASK_ACTUAL: "",
            t.COL_TASK_STATUS: "",
            t.COL_TASK_REASON: ""
        }])
    
    final_summary = {
        "Diary_No": current_no,
        "Weekday": weekday_digit,
        "Mood": mood_score,
        "Sleep_Score": sleep_score,
        "Sleep_Bedtime": bedtime,
        "Sleep_Waketime": waketime,
        "Sleep_Hours": duration,
        "Focus_Count": focus_count,
        "Meditation_Minutes": meditation_minutes,
        "AI_Time": ai_time,
        "Masturbation_Count": masturbation_count,
        **reflection_inputs
    }
    
    try:
        # 使用定义的 edited_tasks 和 edited_time 进行保存
        save_all_data(current_date, final_summary, edited_tasks, edited_time)
        st.success(f"✅ 成功！{current_no} 日记已保存。")
        st.toast("保存成功！")
    except Exception as e:
        st.error(f"保存失败: {e}")