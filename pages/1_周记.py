import streamlit as st
import pandas as pd
from datetime import datetime, timedelta
from core import weekly_texts as wt
from core.config import SIDEBAR_NAV_HTML
from core.weekly_data_manager import (
    get_week_info, load_weekly_data, save_weekly_data, aggregate_daily_data,
)

# ==========================================
# 0. 页面配置
# ==========================================
st.set_page_config(page_title=wt.PAGE_TITLE, page_icon=wt.PAGE_ICON, layout="wide")

# 加载自定义 CSS
def load_css(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        st.markdown(f'<style>{f.read()}</style>', unsafe_allow_html=True)

load_css('assets/styles.css')

# ==========================================
# 1. Session State 初始化
# ==========================================
today = datetime.now().date()

if 'weekly_ref_date' not in st.session_state:
    st.session_state.weekly_ref_date = today

# ==========================================
# 2. 侧边栏导航
# ==========================================
st.sidebar.markdown(SIDEBAR_NAV_HTML, unsafe_allow_html=True)
st.sidebar.title(wt.SIDEBAR_TITLE)

# 周切换回调
def _prev_week():
    st.session_state.weekly_ref_date -= timedelta(days=7)

def _next_week():
    st.session_state.weekly_ref_date += timedelta(days=7)

def _go_this_week():
    st.session_state.weekly_ref_date = today

# 计算当前选中周的信息
week_key, iso_year, iso_week, monday, sunday = get_week_info(st.session_state.weekly_ref_date)

# 周导航栏
nav_c1, nav_c2, nav_c3 = st.sidebar.columns([1, 3, 1])
with nav_c1:
    st.button("◀", on_click=_prev_week, key="week_prev")
with nav_c2:
    st.markdown(
        f"<div style='text-align:center; font-weight:bold; padding:4px 0; font-size:14px;'>"
        f"{monday.month:02d}月{monday.day:02d}日(周一)<br>—<br>"
        f"{sunday.month:02d}月{sunday.day:02d}日(周日)</div>",
        unsafe_allow_html=True
    )
with nav_c3:
    st.button("▶", on_click=_next_week, key="week_next")

# "回到本周" 按钮
st.sidebar.button("📍 回到本周", on_click=_go_this_week,
                  key="go_this_week", use_container_width=True)

# 本周 7 天列表（点击跳转日记页 / Ctrl+点击在新标签页打开）
st.sidebar.markdown("---")
st.sidebar.markdown("**本周日期**（点击查看日记）")
weekday_names = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
for i in range(7):
    day = monday + timedelta(days=i)
    marker = " ← 今天" if day == today else ""
    date_str = day.strftime('%Y-%m-%d')
    st.sidebar.markdown(
        f'- {weekday_names[i]} <a href="/?date={date_str}" target="_self">'
        f'{day.month}/{day.day}</a>{marker}',
        unsafe_allow_html=True
    )

# ==========================================
# 3. 数据加载
# ==========================================
summary_data, habits_df, tasks_df = load_weekly_data(week_key, iso_year)

# 聚合缓存初始化
if 'weekly_agg_cache' not in st.session_state:
    st.session_state.weekly_agg_cache = {}
if 'weekly_agg_week' not in st.session_state:
    st.session_state.weekly_agg_week = None

# 如果切换了周，清除聚合缓存
if st.session_state.weekly_agg_week != week_key:
    st.session_state.weekly_agg_cache = {}
    st.session_state.weekly_agg_week = week_key

# 优先使用已保存的聚合数据，其次是缓存，最后是 summary_data 中的
def _get_agg(field):
    """按优先级获取聚合字段值：缓存 > summary_data > 空"""
    if field in st.session_state.weekly_agg_cache:
        return st.session_state.weekly_agg_cache[field]
    return summary_data.get(field, "")

# ==========================================
# 4. 主内容区
# ==========================================
# 标题
st.markdown(
    f'<div class="part-title">周记 · {iso_year}年第{iso_week}周</div>',
    unsafe_allow_html=True
)

# 元数据行
meta_c1, meta_c2, meta_c3 = st.columns(3)
with meta_c1:
    st.markdown(f'<div class="normal-text"><b>周编号:</b> {week_key}</div>',
                unsafe_allow_html=True)
with meta_c2:
    st.markdown(
        f'<div class="normal-text"><b>日期范围:</b> {monday.strftime("%Y-%m-%d")} ~ {sunday.strftime("%Y-%m-%d")}</div>',
        unsafe_allow_html=True
    )
with meta_c3:
    st.markdown(f'<div class="normal-text"><b>年份:</b> {iso_year}</div>',
                unsafe_allow_html=True)

# ==========================================
# 5. 数据统计区
# ==========================================
st.markdown('<div class="part-title">本周数据统计</div>', unsafe_allow_html=True)

def _refresh_stats():
    """刷新统计按钮的回调"""
    agg = aggregate_daily_data(monday)
    st.session_state.weekly_agg_cache = agg
    st.session_state.weekly_agg_week = week_key

st.button("🔄 从日记刷新统计数据", on_click=_refresh_stats, key="refresh_stats")

# 展示统计卡片
stat_c1, stat_c2, stat_c3, stat_c4, stat_c5 = st.columns(5)
with stat_c1:
    val = _get_agg("Avg_Mood")
    st.metric("平均心情", f"{val}/5" if val not in (None, "") else "—")
with stat_c2:
    val = _get_agg("Avg_Sleep_Hours")
    st.metric("平均睡眠", f"{val}h" if val not in (None, "") else "—")
with stat_c3:
    val = _get_agg("Avg_Sleep_Score")
    st.metric("睡眠质量", f"{val}/5" if val not in (None, "") else "—")
with stat_c4:
    val = _get_agg("Total_Focus")
    st.metric("总番茄钟", f"{val}个" if val not in (None, "") else "—")
with stat_c5:
    val = _get_agg("Total_Masturbation")
    st.metric("打飞机次数", f"{val}次" if val not in (None, "") else "—")

# 最高/最低心情日
mood_c1, mood_c2 = st.columns(2)
with mood_c1:
    best = _get_agg("Best_Mood_Day")
    st.markdown(f'<div class="result-text">😊 最高心情日: {best if best else "—"}</div>',
                unsafe_allow_html=True)
with mood_c2:
    worst = _get_agg("Worst_Mood_Day")
    st.markdown(f'<div class="result-text">😔 最低心情日: {worst if worst else "—"}</div>',
                unsafe_allow_html=True)

# ==========================================
# 6. 习惯追踪 + 周任务（Tab 切换）
# ==========================================
tab_habits, tab_tasks = st.tabs(["🎯 习惯追踪", "📋 周任务"])

with tab_habits:
    st.caption("记录每天的习惯完成情况，✅ 完成、❌ 未完成")

    # 构建列配置
    habit_col_config = {
        "Week": st.column_config.TextColumn("周", disabled=True),
        wt.COL_HABIT_NAME: st.column_config.TextColumn("习惯"),
    }
    for day_col in wt.DAY_COLUMNS:
        habit_col_config[day_col] = st.column_config.SelectboxColumn(
            wt.DAY_DISPLAY[day_col],
            options=wt.HABIT_OPTIONS,
            width="small",
        )

    edited_habits = st.data_editor(
        habits_df,
        num_rows="dynamic",
        use_container_width=True,
        column_config=habit_col_config,
        hide_index=True,
        key="habit_editor",
    )

with tab_tasks:
    st.caption("按分类管理本周重点事项")

    task_col_config = {
        "Week": st.column_config.TextColumn("周", disabled=True),
        wt.COL_WT_CATEGORY: st.column_config.SelectboxColumn(
            "分类", options=wt.TASK_CATEGORIES,
        ),
        wt.COL_WT_PLAN: st.column_config.TextColumn("计划事项"),
        wt.COL_WT_ACTUAL: st.column_config.TextColumn("实际完成"),
        wt.COL_WT_STATUS: st.column_config.SelectboxColumn(
            "状态", options=["None", "✅", "❌", "⚠️"],
        ),
        wt.COL_WT_REASON: st.column_config.TextColumn("原因分析", width="large"),
    }

    edited_tasks = st.data_editor(
        tasks_df,
        num_rows="dynamic",
        use_container_width=True,
        column_config=task_col_config,
        hide_index=True,
        key="weekly_task_editor",
    )

# ==========================================
# 7. 自评分
# ==========================================
st.markdown('<div class="part-title">本周表现自我评分</div>', unsafe_allow_html=True)
try:
    default_score = int(float(summary_data.get("Weekly_Score", 3)))
except (ValueError, TypeError):
    default_score = 3
weekly_score = st.radio(
    "评分", wt.WEEKLY_SCORE.keys(),
    index=default_score - 1,
    format_func=lambda x: wt.WEEKLY_SCORE[x],
    label_visibility="collapsed",
)

# ==========================================
# 8. 反思区域
# ==========================================
st.markdown('<div class="part-title">本周反思总结</div>', unsafe_allow_html=True)
reflection_inputs = {}
for key, meta in wt.WEEKLY_REFLECTIONS.items():
    st.markdown(f'<div class="question-text">{meta["title"]}</div>', unsafe_allow_html=True)
    reflection_inputs[key] = st.text_area(
        meta["title"],
        value=str(summary_data.get(key, "")),
        height=meta.get("height", 120),
        placeholder=meta["ph"],
        label_visibility="collapsed",
    )

# ==========================================
# 9. 保存逻辑
# ==========================================
st.divider()
if st.button("💾 保存并生成周记 (Save & Generate)", type="primary", use_container_width=True):

    now = datetime.now()

    # 构建 summary_dict
    final_summary = {
        "Weekly_Score": weekly_score,
        # 聚合数据
        "Avg_Mood": _get_agg("Avg_Mood"),
        "Avg_Sleep_Hours": _get_agg("Avg_Sleep_Hours"),
        "Avg_Sleep_Score": _get_agg("Avg_Sleep_Score"),
        "Total_Focus": _get_agg("Total_Focus"),
        "Total_Masturbation": _get_agg("Total_Masturbation"),
        "Best_Mood_Day": _get_agg("Best_Mood_Day"),
        "Worst_Mood_Day": _get_agg("Worst_Mood_Day"),
        # 时间戳
        "Create_Time": summary_data.get("Create_Time", now.strftime("%Y-%m-%d %H:%M")),
        "Complete_Time": now.strftime("%Y-%m-%d %H:%M"),
        # 反思
        **reflection_inputs,
    }

    try:
        save_weekly_data(week_key, iso_year, iso_week, monday, sunday,
                         final_summary, edited_habits, edited_tasks)
        st.success(f"✅ 成功！{week_key} 周记已保存。")
        st.toast("保存成功！")
    except Exception as e:
        st.error(f"保存失败: {e}")
