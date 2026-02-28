# report_service.py
# 行为建议报告的业务编排：Gemini API 调用 + 邮件发送

import os
import re
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from . import report_config as rc
from .report_data_collector import collect_all_data


# ==================== Gemini API 调用 ====================

def generate_report():
    """
    收集日记数据 → 调用 Gemini API → 返回报告 Markdown 文本。
    异常：
    - ValueError: API Key 未配置
    - RuntimeError: API 调用失败
    """
    api_key = os.environ.get("GEMINI_API_KEY", "")
    if not api_key:
        raise ValueError(
            "未配置 GEMINI_API_KEY 环境变量。"
            "请在系统环境变量中设置你的 Gemini API Key。"
        )

    # 收集数据
    data = collect_all_data()

    # 组装提示词
    user_prompt = rc.REPORT_USER_PROMPT_TEMPLATE.format(**data)

    # 调用 Gemini API（使用 google-genai 新版 SDK）
    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model=rc.GEMINI_MODEL,
            contents=user_prompt,
            config=genai.types.GenerateContentConfig(
                system_instruction=rc.REPORT_SYSTEM_PROMPT,
            ),
        )
    except ImportError:
        raise RuntimeError(
            "未安装 google-genai 库。请运行: pip install google-genai"
        )
    except Exception as e:
        raise RuntimeError(f"Gemini API 调用失败: {e}")

    # 提取响应文本
    if not response.text:
        raise RuntimeError("Gemini API 返回了空响应，请稍后重试。")

    return response.text


# ==================== 邮件发送 ====================

def _markdown_to_simple_html(md_text):
    """将 Markdown 文本简单转换为 HTML，用于邮件显示"""
    html = md_text
    # 标题转换（### → h3, ## → h2, # → h1）
    html = re.sub(r'^### (.+)$', r'<h3>\1</h3>', html, flags=re.MULTILINE)
    html = re.sub(r'^## (.+)$', r'<h2>\1</h2>', html, flags=re.MULTILINE)
    html = re.sub(r'^# (.+)$', r'<h1>\1</h1>', html, flags=re.MULTILINE)
    # 加粗
    html = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', html)
    # 无序列表
    html = re.sub(r'^- (.+)$', r'<li>\1</li>', html, flags=re.MULTILINE)
    # 分隔线
    html = re.sub(r'^---+$', r'<hr>', html, flags=re.MULTILINE)
    # 换行
    html = html.replace('\n', '<br>\n')
    # 包裹 HTML
    return (
        '<html><head><meta charset="utf-8"></head>'
        f'<body style="font-family: sans-serif; line-height: 1.6;">{html}</body></html>'
    )


def send_email(report_content):
    """
    将报告内容通过邮件发送。
    异常：
    - ValueError: 邮箱配置缺失
    - RuntimeError: 发送失败
    """
    if not rc.SMTP_USER:
        raise ValueError(
            "未配置发件邮箱。请设置环境变量 JOURNAL_SMTP_USER。"
        )
    if not rc.SMTP_PASSWORD:
        raise ValueError(
            "未配置邮箱授权码。请设置环境变量 JOURNAL_SMTP_PASSWORD。"
        )
    if not rc.EMAIL_RECIPIENT:
        raise ValueError(
            "未配置收件邮箱。请设置环境变量 JOURNAL_EMAIL_TO。"
        )

    # 构建邮件（纯文本 + HTML 双版本）
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "量化日记 - AI 行为建议报告"
    msg["From"] = rc.SMTP_USER
    msg["To"] = rc.EMAIL_RECIPIENT

    # 纯文本版本（兜底）
    part_text = MIMEText(report_content, "plain", "utf-8")
    msg.attach(part_text)

    # HTML 版本（优先展示）
    html_content = _markdown_to_simple_html(report_content)
    part_html = MIMEText(html_content, "html", "utf-8")
    msg.attach(part_html)

    # 发送
    try:
        with smtplib.SMTP_SSL(rc.SMTP_SERVER, rc.SMTP_PORT) as server:
            server.login(rc.SMTP_USER, rc.SMTP_PASSWORD)
            server.sendmail(rc.SMTP_USER, rc.EMAIL_RECIPIENT, msg.as_string())
    except smtplib.SMTPAuthenticationError:
        raise RuntimeError(
            "邮箱认证失败。请检查 JOURNAL_SMTP_USER 和 JOURNAL_SMTP_PASSWORD 是否正确。"
            "注意：163 邮箱需要使用授权码而非登录密码。"
        )
    except Exception as e:
        raise RuntimeError(f"邮件发送失败: {e}")


# ==================== 主入口 ====================

def generate_and_send_report():
    """
    串联报告生成和邮件发送。
    返回报告文本（供 UI 展示）。
    """
    report = generate_report()
    send_email(report)
    return report
