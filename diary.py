import streamlit as st
import pandas as pd
import calendar as cal_module
from datetime import datetime, timedelta
from core import texts as t
from core import weekly_texts as wt
from core import monthly_texts as mt
from core.data_manager import load_data_for_date, save_all_data
from core.weekly_data_manager import get_week_info, load_weekly_data
from core.monthly_data_manager import get_month_info, load_monthly_data
from core.report_service import generate_report, send_email
from core import report_config as rc
from core.config import SIDEBAR_NAV_HTML

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
st.sidebar.markdown(SIDEBAR_NAV_HTML, unsafe_allow_html=True)
st.sidebar.title(t.SIDEBAR_TITLE)
today = datetime.now().date()

def _clear_widget_cache():
    """切换日期时清除 widget 缓存，确保新日期数据能正确加载"""
    keys_to_remove = [k for k in st.session_state
                      if k.startswith(("task_editor_", "time_editor_",
                                       "mood_", "focus_", "meditation_",
                                       "ai_time_", "masturb_", "sleep_score_",
                                       "bedtime_", "waketime_", "dreams_",
                                       "reflect_"))]
    for k in keys_to_remove:
        del st.session_state[k]

# 支持 URL 参数指定日期（从周记链接 / Ctrl+点击新标签页跳转）
if 'date' in st.query_params:
    try:
        param_date = datetime.strptime(
            st.query_params['date'], '%Y-%m-%d'
        ).date()
        if st.session_state.get('selected_date') != param_date:
            _clear_widget_cache()
        st.session_state.selected_date = param_date
        st.session_state.cal_year = param_date.year
        st.session_state.cal_month = param_date.month
        del st.query_params['date']
    except ValueError:
        pass

# session_state 初始化（首次执行时设定默认值，后续 rerun 保持用户选择）
if 'selected_date' not in st.session_state:
    st.session_state.selected_date = today
if 'cal_year' not in st.session_state:
    st.session_state.cal_year = today.year
if 'cal_month' not in st.session_state:
    st.session_state.cal_month = today.month

# 月份切换回调（on_click 在 rerun 前执行，确保状态先更新）
def _prev_month():
    if st.session_state.cal_month == 1:
        st.session_state.cal_month = 12
        st.session_state.cal_year -= 1
    else:
        st.session_state.cal_month -= 1

def _next_month():
    if st.session_state.cal_month == 12:
        st.session_state.cal_month = 1
        st.session_state.cal_year += 1
    else:
        st.session_state.cal_month += 1

# ── 月份导航栏：◀ 2026年2月 ▶ ──
nav_c1, nav_c2, nav_c3 = st.sidebar.columns([1, 3, 1])
with nav_c1:
    st.button("◀", on_click=_prev_month, key="cal_prev")
with nav_c2:
    st.markdown(
        f"<div style='text-align:center; font-weight:bold; padding:4px 0; font-size:15px;'>"
        f"{st.session_state.cal_year}年{st.session_state.cal_month}月</div>",
        unsafe_allow_html=True
    )
with nav_c3:
    st.button("▶", on_click=_next_month, key="cal_next")

# ── 星期标题行：日 一 二 三 四 五 六 ──
header_cols = st.sidebar.columns(7)
for i, name in enumerate(["日", "一", "二", "三", "四", "五", "六"]):
    with header_cols[i]:
        st.markdown(
            f"<div style='text-align:center; font-size:12px; font-weight:bold; "
            f"color:#666;'>{name}</div>",
            unsafe_allow_html=True
        )

# ── 构建日历（只显示本月日期） ──
_cal = cal_module.Calendar(firstweekday=6)  # 周日为首列
view_year = st.session_state.cal_year
view_month = st.session_state.cal_month
weeks = _cal.monthdatescalendar(view_year, view_month)

# 月份分隔行
st.sidebar.markdown(
    f"<div style='text-align:center; font-size:11px; color:#aaa; "
    f"border-bottom:1px solid #e0e0e0; margin:2px 0 1px 0; "
    f"padding-bottom:2px;'>── {view_month}月 ──</div>",
    unsafe_allow_html=True
)

# 渲染日历网格：跳过整行都不属于本月的行，非本月日期留空白
for week in weeks:
    if not any(d.month == view_month for d in week):
        continue

    cols = st.sidebar.columns(7)
    for i, day_date in enumerate(week):
        with cols[i]:
            if day_date.month != view_month:
                st.write("")  # 非本月日期留空
            else:
                is_today = (day_date == today)
                is_selected = (day_date == st.session_state.selected_date)
                label = f"⊙{day_date.day}" if is_today else str(day_date.day)
                btn_type = "primary" if is_selected else "secondary"
                st.link_button(
                    label, url=f"/?date={day_date}",
                    type=btn_type,
                    use_container_width=True,
                )

# "回到今天" 快捷按钮
st.sidebar.link_button(
    "📍 回到今天", url=f"/?date={today}",
    use_container_width=True,
)

# ── 行为建议报告按钮 ──
st.sidebar.divider()
if st.sidebar.button("📊 发送行为建议报告", key="send_report", use_container_width=True):
    with st.sidebar:
        status = st.status("正在生成报告...", expanded=True)
        try:
            status.write("📂 正在收集日记数据...")
            status.write("🤖 正在让 AI 分析行为数据...")
            report_text = generate_report()
            status.write("📧 正在发送邮件...")
            send_email(report_text)
            status.update(label="报告已成功发送!", state="complete")
            st.sidebar.success(f"✅ 报告已发送至 {rc.EMAIL_RECIPIENT}")
        except ValueError as e:
            status.update(label="配置错误", state="error")
            st.sidebar.error(f"⚠️ 配置错误：{e}")
        except RuntimeError as e:
            status.update(label="发送失败", state="error")
            st.sidebar.error(f"❌ {e}")

# 最终日期（后续所有代码直接使用 current_date，无需任何改动）
current_date = st.session_state.selected_date

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
    mood_score = st.radio("Mood", t.MOOD_SCORE.keys(), index=default_mood-1, format_func=lambda x: t.MOOD_SCORE[x], label_visibility="collapsed", key=f"mood_{current_date}")
    
    st.markdown(f'<div class="question-text">{t.FOCUS_TIME}</div>', unsafe_allow_html=True)
    try:
        default_focus = int(float(summary_data.get("Focus_Count", 0)))
    except (ValueError, TypeError):
        default_focus = 0
    focus_count = st.number_input("番茄钟", min_value=0, value=default_focus, label_visibility="collapsed", key=f"focus_{current_date}")
    
    st.markdown(f'<div class="question-text">{t.MEDITATION_TIME}</div>', unsafe_allow_html=True)
    try:
        default_meditation = int(float(summary_data.get("Meditation_Minutes", 0)))
    except (ValueError, TypeError):
        default_meditation = 0
    meditation_minutes = st.number_input("静坐分钟", min_value=0, value=default_meditation, label_visibility="collapsed", key=f"meditation_{current_date}")
    
    st.markdown(f'<div class="question-text">{t.AI_TIME}</div>', unsafe_allow_html=True)
    try:
        default_ai_time = int(float(summary_data.get("AI_time", 0)))
    except (ValueError, TypeError):
        default_ai_time = 0
    ai_time = st.number_input("AI时间小时", min_value=0, value=default_ai_time, label_visibility="collapsed", key=f"ai_time_{current_date}")
    
    st.markdown(f'<div class="question-text">{t.MASTURBATION_COUNT}</div>', unsafe_allow_html=True)
    try:
        default_masturb = int(float(summary_data.get("Masturbation_Count", 0)))
    except (ValueError, TypeError):
        default_masturb = 0
    masturbation_count = st.number_input("打飞机次数", min_value=0, value=default_masturb, label_visibility="collapsed", key=f"masturb_{current_date}")

with col2:
    st.markdown(f'<div class="question-text">{t.SLEEP_INQUIRY}</div>', unsafe_allow_html=True)
    try:
        default_sleep = int(float(summary_data.get("Sleep_Score", 4)))
    except (ValueError, TypeError):
        default_sleep = 4
    sleep_score = st.radio("Sleep", t.SLEEP_SCORE.keys(), index=default_sleep-1, format_func=lambda x: t.SLEEP_SCORE[x], label_visibility="collapsed", key=f"sleep_score_{current_date}")
    
    c_s1, c_s2 = st.columns(2)
    with c_s1:
        st.markdown(f'<div class="question-text">{t.BEDTIME}</div>', unsafe_allow_html=True)
        bedtime = st.text_input("入睡", value=str(summary_data.get("Sleep_Bedtime", "22:00")), label_visibility="collapsed", key=f"bedtime_{current_date}")
    with c_s2:
        st.markdown(f'<div class="question-text">{t.WAKE_UP_TIME}</div>', unsafe_allow_html=True)
        waketime = st.text_input("起床", value=str(summary_data.get("Sleep_Waketime", "06:00")), label_visibility="collapsed", key=f"waketime_{current_date}")
    
    try:
        t1 = datetime.strptime(str(bedtime), "%H:%M")
        t2 = datetime.strptime(str(waketime), "%H:%M")
        if t2 < t1: t2 += timedelta(days=1)
        duration = round((t2 - t1).seconds / 3600, 2)
    except (ValueError, TypeError):
        duration = 0.0
    st.markdown(f'<div class="result-text">✅ 睡眠时长: {duration} 小时</div>', unsafe_allow_html=True)

    st.markdown('<div class="question-text">睡眠状况/梦境</div>', unsafe_allow_html=True)
    sleep_dreams = st.text_area(
        "睡眠状况/梦境",
        value=str(summary_data.get("Reflect_Sleep_Dreams", "")),
        height=100,
        placeholder="回忆睡眠情况，有无起夜、醒来，有没有梦，如果有梦，梦是什么",
        label_visibility="collapsed",
        key=f"dreams_{current_date}"
    )

# ==========================================
# 5.5 周目标 & 月目标展示区
# ==========================================

def _render_goals(tasks_df, category_col, plan_col, status_col):
    """将任务 DataFrame 按分类分组，渲染为 Markdown 字符串"""
    # 过滤掉计划事项为空的行
    valid = tasks_df[tasks_df[plan_col].astype(str).str.strip() != ""].copy()
    if valid.empty:
        return None

    lines = []
    for category in valid[category_col].unique():
        cat_df = valid[valid[category_col] == category]
        lines.append(f"**{category}**")
        for _, row in cat_df.iterrows():
            plan = str(row[plan_col]).strip()
            status = str(row[status_col]).strip()
            # 状态 emoji：有效值直接显示，空值或 None 不显示
            if status in ("✅", "❌", "⚠️"):
                lines.append(f"&nbsp;&nbsp;· {plan} &ensp;{status}")
            else:
                lines.append(f"&nbsp;&nbsp;· {plan}")
        lines.append("")  # 分类间空行
    return "\n".join(lines)

# 获取当前周和月的 key
_wk_key, _wk_year, _wk_num, _, _ = get_week_info(current_date)
_mk_key, _mk_year, _mk_month, _, _ = get_month_info(current_date)

# 加载周记和月记的任务数据
_, _, weekly_tasks_df = load_weekly_data(_wk_key, _wk_year)
_, monthly_tasks_df = load_monthly_data(_mk_key, _mk_year)

# 渲染目标 Markdown
_weekly_goals_md = _render_goals(weekly_tasks_df, wt.COL_WT_CATEGORY, wt.COL_WT_PLAN, wt.COL_WT_STATUS)
_monthly_goals_md = _render_goals(monthly_tasks_df, mt.COL_MT_CATEGORY, mt.COL_MT_PLAN, mt.COL_MT_STATUS)

goal_left, goal_right = st.columns(2)
with goal_left:
    st.markdown(f'<div class="goal-section">', unsafe_allow_html=True)
    st.markdown(f"📋 **本周目标 · {_wk_key}**")
    if _weekly_goals_md:
        st.markdown(_weekly_goals_md, unsafe_allow_html=True)
    else:
        st.caption("暂无周目标，去周记页面添加")
    st.markdown('</div>', unsafe_allow_html=True)

with goal_right:
    st.markdown(f'<div class="goal-section">', unsafe_allow_html=True)
    st.markdown(f"📅 **本月目标 · {_mk_month}月**")
    if _monthly_goals_md:
        st.markdown(_monthly_goals_md, unsafe_allow_html=True)
    else:
        st.caption("暂无月目标，去月记页面添加")
    st.markdown('</div>', unsafe_allow_html=True)

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
        key=f"task_editor_{current_date}"
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
            "Date": st.column_config.TextColumn("📅 日期", disabled=True),
            t.COL_TIME_SLOT: st.column_config.TextColumn("⏰ 时间段", disabled=True),
            t.COL_TIME_STATUS: st.column_config.SelectboxColumn("状态", options=["None", "✅", "❌", "⚠️"]),
        },
        key=f"time_editor_{current_date}"
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
        label_visibility="collapsed",
        key=f"reflect_{key}_{current_date}"
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
        "Reflect_Sleep_Dreams": sleep_dreams,
        **reflection_inputs
    }
    
    try:
        # 使用定义的 edited_tasks 和 edited_time 进行保存
        save_all_data(current_date, final_summary, edited_tasks, edited_time)
        st.success(f"✅ 成功！{current_no} 日记已保存。")
        st.toast("保存成功！")
    except Exception as e:
        st.error(f"保存失败: {e}")