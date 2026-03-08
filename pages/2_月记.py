import streamlit as st
import pandas as pd
from datetime import datetime, date
from dateutil.relativedelta import relativedelta
from core import monthly_texts as mt
from core.config import SIDEBAR_NAV_HTML
from core.monthly_data_manager import (
    get_month_info, load_monthly_data, save_monthly_data, aggregate_monthly_data,
)

# ==========================================
# 0. 页面配置
# ==========================================
st.set_page_config(page_title=mt.PAGE_TITLE, page_icon=mt.PAGE_ICON, layout="wide")

# 加载自定义 CSS
def load_css(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        st.markdown(f'<style>{f.read()}</style>', unsafe_allow_html=True)

load_css('assets/styles.css')

# ==========================================
# 1. Session State 初始化
# ==========================================
today = datetime.now().date()

if 'monthly_ref_date' not in st.session_state:
    st.session_state.monthly_ref_date = today

# ==========================================
# 2. 侧边栏导航
# ==========================================
st.sidebar.markdown(SIDEBAR_NAV_HTML, unsafe_allow_html=True)
st.sidebar.title(mt.SIDEBAR_TITLE)

# 月切换回调
def _prev_month():
    d = st.session_state.monthly_ref_date
    st.session_state.monthly_ref_date = d - relativedelta(months=1)

def _next_month():
    d = st.session_state.monthly_ref_date
    st.session_state.monthly_ref_date = d + relativedelta(months=1)

def _go_this_month():
    st.session_state.monthly_ref_date = today

# 计算当前选中月的信息
month_key, cur_year, cur_month, first_day, last_day = get_month_info(
    st.session_state.monthly_ref_date
)

# 月导航栏
nav_c1, nav_c2, nav_c3 = st.sidebar.columns([1, 3, 1])
with nav_c1:
    st.button("◀", on_click=_prev_month, key="month_prev")
with nav_c2:
    st.markdown(
        f"<div style='text-align:center; font-weight:bold; padding:4px 0; font-size:14px;'>"
        f"{cur_year}年{cur_month}月</div>",
        unsafe_allow_html=True
    )
with nav_c3:
    st.button("▶", on_click=_next_month, key="month_next")

# "回到本月" 按钮
st.sidebar.button("📍 回到本月", on_click=_go_this_month,
                  key="go_this_month", use_container_width=True)

# 月份日期范围
st.sidebar.markdown("---")
st.sidebar.markdown(
    f"**日期范围**: {first_day.strftime('%Y-%m-%d')} ~ {last_day.strftime('%Y-%m-%d')}"
)

# ==========================================
# 3. 数据加载
# ==========================================
summary_data, tasks_df = load_monthly_data(month_key, cur_year)

# 聚合缓存初始化
if 'monthly_agg_cache' not in st.session_state:
    st.session_state.monthly_agg_cache = {}
if 'monthly_agg_month' not in st.session_state:
    st.session_state.monthly_agg_month = None

# 如果切换了月，清除聚合缓存
if st.session_state.monthly_agg_month != month_key:
    st.session_state.monthly_agg_cache = {}
    st.session_state.monthly_agg_month = month_key

# 优先使用缓存，其次是 summary_data
def _get_agg(field):
    """按优先级获取聚合字段值：缓存 > summary_data > 空"""
    if field in st.session_state.monthly_agg_cache:
        return st.session_state.monthly_agg_cache[field]
    return summary_data.get(field, "")

# ==========================================
# 4. 主内容区
# ==========================================
st.markdown(
    f'<div class="part-title">月记 · {cur_year}年{cur_month}月</div>',
    unsafe_allow_html=True
)

# 元数据行
meta_c1, meta_c2, meta_c3 = st.columns(3)
with meta_c1:
    st.markdown(f'<div class="normal-text"><b>月编号:</b> {month_key}</div>',
                unsafe_allow_html=True)
with meta_c2:
    st.markdown(
        f'<div class="normal-text"><b>日期范围:</b> {first_day.strftime("%Y-%m-%d")} ~ {last_day.strftime("%Y-%m-%d")}</div>',
        unsafe_allow_html=True
    )
with meta_c3:
    st.markdown(f'<div class="normal-text"><b>年份:</b> {cur_year}</div>',
                unsafe_allow_html=True)

# ==========================================
# 5. 数据统计区
# ==========================================
st.markdown('<div class="part-title">本月数据统计</div>', unsafe_allow_html=True)

def _refresh_stats():
    """刷新统计按钮的回调"""
    agg = aggregate_monthly_data(cur_year, cur_month)
    st.session_state.monthly_agg_cache = agg
    st.session_state.monthly_agg_month = month_key

st.button("🔄 从日记刷新统计数据", on_click=_refresh_stats, key="refresh_monthly_stats")

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

# 最高/最低心情日 + 不打飞机天数
mood_c1, mood_c2, mood_c3 = st.columns(3)
with mood_c1:
    best = _get_agg("Best_Mood_Day")
    st.markdown(f'<div class="result-text">😊 最高心情日: {best if best else "—"}</div>',
                unsafe_allow_html=True)
with mood_c2:
    worst = _get_agg("Worst_Mood_Day")
    st.markdown(f'<div class="result-text">😔 最低心情日: {worst if worst else "—"}</div>',
                unsafe_allow_html=True)
with mood_c3:
    no_m = _get_agg("No_Masturbation_Days")
    st.markdown(f'<div class="result-text">🎯 不打飞机天数: {no_m if no_m not in (None, "") else "—"}</div>',
                unsafe_allow_html=True)

# ==========================================
# 6. 月任务表
# ==========================================
st.markdown('<div class="part-title">本月重点事项</div>', unsafe_allow_html=True)
st.caption("按分类管理本月重点事项")

task_col_config = {
    "Month": st.column_config.TextColumn("月", disabled=True),
    mt.COL_MT_CATEGORY: st.column_config.SelectboxColumn(
        "分类", options=mt.TASK_CATEGORIES,
    ),
    mt.COL_MT_PLAN: st.column_config.TextColumn("计划事项"),
    mt.COL_MT_ACTUAL: st.column_config.TextColumn("实际完成"),
    mt.COL_MT_STATUS: st.column_config.SelectboxColumn(
        "状态", options=["None", "✅", "❌", "⚠️"],
    ),
    mt.COL_MT_REASON: st.column_config.TextColumn("原因分析", width="large"),
}

edited_tasks = st.data_editor(
    tasks_df,
    num_rows="dynamic",
    use_container_width=True,
    column_config=task_col_config,
    hide_index=True,
    key="monthly_task_editor",
)

# ==========================================
# 7. 自评分
# ==========================================
st.markdown('<div class="part-title">本月表现自我评分</div>', unsafe_allow_html=True)
try:
    default_score = int(float(summary_data.get("Monthly_Score", 3)))
except (ValueError, TypeError):
    default_score = 3
monthly_score = st.radio(
    "评分", mt.MONTHLY_SCORE.keys(),
    index=default_score - 1,
    format_func=lambda x: mt.MONTHLY_SCORE[x],
    label_visibility="collapsed",
)

# ==========================================
# 8. 反思区域
# ==========================================
st.markdown('<div class="part-title">本月反思总结</div>', unsafe_allow_html=True)
reflection_inputs = {}
for key, meta in mt.MONTHLY_REFLECTIONS.items():
    st.markdown(f'<div class="question-text">{meta["title"]}</div>', unsafe_allow_html=True)
    reflection_inputs[key] = st.text_area(
        meta["title"],
        value=str(summary_data.get(key, "")),
        height=120,
        placeholder=meta["ph"],
        label_visibility="collapsed",
    )

# ==========================================
# 9. 保存逻辑
# ==========================================
st.divider()
if st.button("💾 保存并生成月记 (Save & Generate)", type="primary", use_container_width=True):

    now = datetime.now()

    # 构建 summary_dict
    final_summary = {
        "Monthly_Score": monthly_score,
        # 聚合数据
        "Avg_Mood": _get_agg("Avg_Mood"),
        "Avg_Sleep_Hours": _get_agg("Avg_Sleep_Hours"),
        "Avg_Sleep_Score": _get_agg("Avg_Sleep_Score"),
        "Total_Focus": _get_agg("Total_Focus"),
        "Total_Masturbation": _get_agg("Total_Masturbation"),
        "No_Masturbation_Days": _get_agg("No_Masturbation_Days"),
        "Best_Mood_Day": _get_agg("Best_Mood_Day"),
        "Worst_Mood_Day": _get_agg("Worst_Mood_Day"),
        # 时间戳
        "Create_Time": summary_data.get("Create_Time", now.strftime("%Y-%m-%d %H:%M")),
        "Complete_Time": now.strftime("%Y-%m-%d %H:%M"),
        # 反思
        **reflection_inputs,
    }

    try:
        save_monthly_data(month_key, cur_year, cur_month, first_day, last_day,
                          final_summary, edited_tasks)
        st.success(f"✅ 成功！{month_key} 月记已保存。")
        st.toast("保存成功！")
    except Exception as e:
        st.error(f"保存失败: {e}")
