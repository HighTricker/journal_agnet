import uuid
import streamlit as st
from agent.model_config import MODELS, DEFAULT_MODEL_KEY
from core.config import SIDEBAR_NAV_HTML

# ==========================================
# 0. 页面配置
# ==========================================
st.set_page_config(page_title="AI 导师", page_icon="🧠", layout="wide")

# 加载自定义 CSS（与其他页面统一风格）
def load_css(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        st.markdown(f'<style>{f.read()}</style>', unsafe_allow_html=True)

load_css('assets/styles.css')

# ==========================================
# 1. 页面标题
# ==========================================
st.markdown('<div class="part-title">AI 行为科学导师</div>', unsafe_allow_html=True)
st.caption("基于你的日记和量化数据，提供个性化行为分析与建议")

# ==========================================
# 2. 初始化 Agent（仅首次加载）
# ==========================================
@st.cache_resource
def get_agent(model_key: str):
    from agent.agent import build_agent
    return build_agent(model_key)

# ==========================================
# 3. 初始化聊天历史
# ==========================================
if "chat_messages" not in st.session_state:
    st.session_state.chat_messages = []

if "thread_id" not in st.session_state:
    st.session_state.thread_id = str(uuid.uuid4())

if "selected_model_key" not in st.session_state:
    st.session_state.selected_model_key = DEFAULT_MODEL_KEY

# ==========================================
# 4. 侧边栏：操作按钮
# ==========================================
st.sidebar.markdown(SIDEBAR_NAV_HTML, unsafe_allow_html=True)
st.sidebar.title("AI 导师")

# 模型选择下拉框
model_options = {cfg.display_name: key for key, cfg in MODELS.items()}
selected_display = st.sidebar.selectbox(
    "选择模型",
    list(model_options.keys()),
    index=list(model_options.values()).index(st.session_state.selected_model_key),
)
new_key = model_options[selected_display]

if new_key != st.session_state.selected_model_key:
    st.session_state.selected_model_key = new_key
    st.session_state.chat_messages = []
    st.session_state.thread_id = str(uuid.uuid4())
    get_agent.clear()
    st.rerun()

try:
    agent = get_agent(st.session_state.selected_model_key)
except ValueError as e:
    st.error(f"模型初始化失败：{e}")
    st.stop()

if st.sidebar.button("🔄 新建对话", use_container_width=True):
    st.session_state.chat_messages = []
    st.session_state.thread_id = str(uuid.uuid4())
    st.rerun()

st.sidebar.divider()
st.sidebar.markdown("**快捷指令**")

quick_prompts = {
    "📊 分析今天": "请分析我今天的日记和量化数据，给我行为建议",
    "📋 安排明天": "请根据我的目标和近期表现，帮我安排明天的日程",
    "📧 发送周报": "请分析我这周的数据，生成行为建议报告并发送到我的邮箱",
    "📈 本周习惯": "请查看我本周的习惯打卡情况，分析哪些习惯保持得好，哪些需要改进",
}

for label, prompt in quick_prompts.items():
    if st.sidebar.button(label, use_container_width=True):
        st.session_state.chat_messages.append({"role": "user", "content": prompt})
        st.rerun()

# ==========================================
# 5. 渲染聊天历史
# ==========================================
for msg in st.session_state.chat_messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

# ==========================================
# 6. 处理用户输入
# ==========================================
def process_message(user_input):
    """调用 Agent 并获取回复"""
    st.session_state.chat_messages.append({"role": "user", "content": user_input})

    with st.chat_message("user"):
        st.markdown(user_input)

    with st.chat_message("assistant"):
        with st.spinner("导师正在分析..."):
            result = agent.invoke(
                {"messages": [{"role": "user", "content": user_input}]},
                {"configurable": {"thread_id": st.session_state.thread_id}}
            )

            # 提取回复内容
            message = result["messages"][-1].content
            if isinstance(message, list):
                reply = message[0]["text"]
            else:
                reply = message

            st.markdown(reply)

    st.session_state.chat_messages.append({"role": "assistant", "content": reply})

# 检查是否有快捷指令触发的消息需要处理
if (st.session_state.chat_messages
    and st.session_state.chat_messages[-1]["role"] == "user"
    and len(st.session_state.chat_messages) > len(
        [m for m in st.session_state.chat_messages if m["role"] == "assistant"]
    ) * 2):
    # 有未处理的用户消息（来自快捷指令）
    last_user_msg = st.session_state.chat_messages.pop()
    process_message(last_user_msg["content"])

# 普通输入框
if user_input := st.chat_input("和你的 AI 导师对话..."):
    process_message(user_input)
