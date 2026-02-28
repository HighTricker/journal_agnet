"""行为建议报告功能的单元测试"""
import os
import pytest
import pandas as pd
from datetime import datetime, date
from unittest.mock import patch, MagicMock, mock_open


# ==========================================
# 1. 配置测试
# ==========================================

class TestReportConfig:
    """报告配置验证"""

    def test_gemini_model_not_empty(self):
        """模型名称不应为空"""
        from core.report_config import GEMINI_MODEL
        assert GEMINI_MODEL
        assert isinstance(GEMINI_MODEL, str)

    def test_prompt_template_has_all_placeholders(self):
        """提示词模板应包含所有 6 个数据占位符"""
        from core.report_config import REPORT_USER_PROMPT_TEMPLATE
        required_keys = [
            "daily_summary", "tasks_data", "time_data",
            "weekly_data", "monthly_data", "reflections_summary"
        ]
        for key in required_keys:
            assert f"{{{key}}}" in REPORT_USER_PROMPT_TEMPLATE, \
                f"模板缺少占位符: {{{key}}}"

    def test_smtp_defaults(self):
        """SMTP 默认配置应指向 163 邮箱"""
        from core.report_config import SMTP_SERVER, SMTP_PORT
        assert SMTP_SERVER == os.environ.get("JOURNAL_SMTP_SERVER", "smtp.163.com")
        assert isinstance(SMTP_PORT, int)


# ==========================================
# 2. 数据收集测试
# ==========================================

class TestDataCollector:
    """数据收集模块测试"""

    def test_read_csv_safe_nonexistent(self):
        """不存在的文件应返回 None"""
        from core.report_data_collector import _read_csv_safe
        result = _read_csv_safe("/nonexistent/path/file.csv")
        assert result is None

    def test_read_csv_safe_existing(self, tmp_path):
        """存在的 CSV 文件应返回 DataFrame"""
        from core.report_data_collector import _read_csv_safe
        csv_file = tmp_path / "test.csv"
        df = pd.DataFrame({"A": [1, 2], "B": [3, 4]})
        df.to_csv(csv_file, index=False, encoding='utf-8-sig')
        result = _read_csv_safe(str(csv_file))
        assert result is not None
        assert len(result) == 2

    def test_df_to_text_none(self):
        """None 输入应返回暂无数据"""
        from core.report_data_collector import _df_to_text
        assert _df_to_text(None) == "暂无数据"

    def test_df_to_text_empty(self):
        """空 DataFrame 应返回暂无数据"""
        from core.report_data_collector import _df_to_text
        assert _df_to_text(pd.DataFrame()) == "暂无数据"

    def test_df_to_text_with_data(self):
        """有数据的 DataFrame 应返回文本"""
        from core.report_data_collector import _df_to_text
        df = pd.DataFrame({"Date": ["2026-02-28"], "Mood": [4]})
        result = _df_to_text(df)
        assert "2026-02-28" in result
        assert "4" in result

    @patch("core.report_data_collector._read_csv_safe")
    def test_collect_time_log_filters_recent(self, mock_read):
        """时间日志应只返回近 N 天的数据"""
        from core.report_data_collector import collect_time_log
        today = datetime.now().date().isoformat()
        old_date = "2020-01-01"
        df = pd.DataFrame({
            "Date": [old_date, today],
            "时间段": ["00:00-00:30", "00:00-00:30"],
            "计划": ["睡觉", "工作"],
        })
        mock_read.return_value = df
        result = collect_time_log(2026, recent_days=7)
        assert old_date not in result
        assert today in result

    @patch("core.report_data_collector._read_csv_safe")
    def test_collect_reflections_filters_empty(self, mock_read):
        """反思收集应过滤掉全空行"""
        from core.report_data_collector import collect_reflections
        df = pd.DataFrame({
            "Date": ["2026-02-27", "2026-02-28"],
            "Reflect_AI_Usage": ["", "用了 Claude"],
            "Reflect_Reading": ["", ""],
        })
        mock_read.return_value = df
        result = collect_reflections(2026)
        # 第一行两个反思列都为空，应被过滤
        assert "2026-02-27" not in result
        assert "2026-02-28" in result

    @patch("core.report_data_collector.collect_daily_summary", return_value="summary")
    @patch("core.report_data_collector.collect_tasks", return_value="tasks")
    @patch("core.report_data_collector.collect_time_log", return_value="time")
    @patch("core.report_data_collector.collect_weekly_data", return_value="weekly")
    @patch("core.report_data_collector.collect_monthly_data", return_value="monthly")
    @patch("core.report_data_collector.collect_reflections", return_value="reflections")
    def test_collect_all_data_returns_complete_dict(self, *mocks):
        """collect_all_data 应返回包含所有 6 个 key 的字典"""
        from core.report_data_collector import collect_all_data
        result = collect_all_data()
        assert isinstance(result, dict)
        expected_keys = [
            "daily_summary", "tasks_data", "time_data",
            "weekly_data", "monthly_data", "reflections_summary"
        ]
        for key in expected_keys:
            assert key in result, f"缺少 key: {key}"


# ==========================================
# 3. Gemini API 测试
# ==========================================

class TestGeminiAPI:
    """Gemini API 调用测试（全部 mock）"""

    @patch("core.report_service.collect_all_data")
    def test_generate_report_no_api_key(self, mock_collect):
        """未配置 API Key 应抛出 ValueError"""
        from core.report_service import generate_report
        with patch.dict(os.environ, {}, clear=True):
            # 确保环境变量中没有 GEMINI_API_KEY
            os.environ.pop("GEMINI_API_KEY", None)
            with pytest.raises(ValueError, match="GEMINI_API_KEY"):
                generate_report()

    @patch("core.report_service.collect_all_data")
    @patch.dict(os.environ, {"GEMINI_API_KEY": "test-key"})
    def test_generate_report_success(self, mock_collect):
        """正常调用应返回报告文本"""
        mock_collect.return_value = {
            "daily_summary": "test", "tasks_data": "test",
            "time_data": "test", "weekly_data": "test",
            "monthly_data": "test", "reflections_summary": "test",
        }
        mock_response = MagicMock()
        mock_response.text = "# 行为分析报告\n这是测试报告内容。"

        mock_client_instance = MagicMock()
        mock_client_instance.models.generate_content.return_value = mock_response

        # 构建 mock genai 模块，并正确设置 google.genai 关系
        mock_genai = MagicMock()
        mock_genai.Client.return_value = mock_client_instance

        mock_google = MagicMock()
        mock_google.genai = mock_genai

        import sys
        saved_google = sys.modules.get("google")
        saved_google_genai = sys.modules.get("google.genai")
        sys.modules["google"] = mock_google
        sys.modules["google.genai"] = mock_genai

        try:
            import importlib
            import core.report_service as rs
            importlib.reload(rs)
            result = rs.generate_report()
            assert "行为分析报告" in result
        finally:
            # 恢复原始状态
            if saved_google is not None:
                sys.modules["google"] = saved_google
            else:
                sys.modules.pop("google", None)
            if saved_google_genai is not None:
                sys.modules["google.genai"] = saved_google_genai
            else:
                sys.modules.pop("google.genai", None)
            importlib.reload(rs)

    @patch("core.report_service.collect_all_data")
    @patch.dict(os.environ, {"GEMINI_API_KEY": "test-key"})
    def test_generate_report_empty_response(self, mock_collect):
        """API 返回空响应应抛出 RuntimeError"""
        mock_collect.return_value = {
            "daily_summary": "test", "tasks_data": "test",
            "time_data": "test", "weekly_data": "test",
            "monthly_data": "test", "reflections_summary": "test",
        }
        mock_response = MagicMock()
        mock_response.text = ""

        mock_client_instance = MagicMock()
        mock_client_instance.models.generate_content.return_value = mock_response

        mock_genai = MagicMock()
        mock_genai.Client.return_value = mock_client_instance

        mock_google = MagicMock()
        mock_google.genai = mock_genai

        import sys
        saved_google = sys.modules.get("google")
        saved_google_genai = sys.modules.get("google.genai")
        sys.modules["google"] = mock_google
        sys.modules["google.genai"] = mock_genai

        try:
            import importlib
            import core.report_service as rs
            importlib.reload(rs)
            with pytest.raises(RuntimeError, match="空响应"):
                rs.generate_report()
        finally:
            if saved_google is not None:
                sys.modules["google"] = saved_google
            else:
                sys.modules.pop("google", None)
            if saved_google_genai is not None:
                sys.modules["google.genai"] = saved_google_genai
            else:
                sys.modules.pop("google.genai", None)
            importlib.reload(rs)


# ==========================================
# 4. 邮件发送测试
# ==========================================

class TestEmailSending:
    """邮件发送测试（全部 mock）"""

    def test_send_email_no_smtp_user(self):
        """未配置发件邮箱应抛出 ValueError"""
        from core.report_service import send_email
        with patch("core.report_config.SMTP_USER", ""):
            with pytest.raises(ValueError, match="发件邮箱"):
                send_email("test report")

    def test_send_email_no_smtp_password(self):
        """未配置授权码应抛出 ValueError"""
        from core.report_service import send_email
        with patch("core.report_config.SMTP_USER", "test@163.com"), \
             patch("core.report_config.SMTP_PASSWORD", ""):
            with pytest.raises(ValueError, match="授权码"):
                send_email("test report")

    def test_send_email_no_recipient(self):
        """未配置收件邮箱应抛出 ValueError"""
        from core.report_service import send_email
        with patch("core.report_config.SMTP_USER", "test@163.com"), \
             patch("core.report_config.SMTP_PASSWORD", "abc123"), \
             patch("core.report_config.EMAIL_RECIPIENT", ""):
            with pytest.raises(ValueError, match="收件邮箱"):
                send_email("test report")

    @patch("core.report_service.smtplib.SMTP_SSL")
    def test_send_email_success(self, mock_smtp_cls):
        """配置完整时应成功发送"""
        from core.report_service import send_email
        mock_server = MagicMock()
        mock_smtp_cls.return_value.__enter__ = MagicMock(return_value=mock_server)
        mock_smtp_cls.return_value.__exit__ = MagicMock(return_value=False)

        with patch("core.report_config.SMTP_USER", "test@163.com"), \
             patch("core.report_config.SMTP_PASSWORD", "abc123"), \
             patch("core.report_config.EMAIL_RECIPIENT", "recv@example.com"):
            send_email("# 测试报告\n这是内容。")

        mock_server.login.assert_called_once_with("test@163.com", "abc123")
        mock_server.sendmail.assert_called_once()

    @patch("core.report_service.smtplib.SMTP_SSL")
    def test_send_email_auth_failure(self, mock_smtp_cls):
        """认证失败应抛出 RuntimeError"""
        import smtplib
        from core.report_service import send_email
        mock_server = MagicMock()
        mock_server.login.side_effect = smtplib.SMTPAuthenticationError(535, b"auth failed")
        mock_smtp_cls.return_value.__enter__ = MagicMock(return_value=mock_server)
        mock_smtp_cls.return_value.__exit__ = MagicMock(return_value=False)

        with patch("core.report_config.SMTP_USER", "test@163.com"), \
             patch("core.report_config.SMTP_PASSWORD", "wrong"), \
             patch("core.report_config.EMAIL_RECIPIENT", "recv@example.com"):
            with pytest.raises(RuntimeError, match="认证失败"):
                send_email("报告内容")


# ==========================================
# 5. HTML 转换测试
# ==========================================

class TestMarkdownToHtml:
    """Markdown → HTML 简单转换"""

    def test_heading_conversion(self):
        """标题应转换为 HTML 标签"""
        from core.report_service import _markdown_to_simple_html
        result = _markdown_to_simple_html("### 分析结果")
        assert "<h3>分析结果</h3>" in result

    def test_bold_conversion(self):
        """加粗应转换为 strong 标签"""
        from core.report_service import _markdown_to_simple_html
        result = _markdown_to_simple_html("这是**重点**内容")
        assert "<strong>重点</strong>" in result

    def test_list_conversion(self):
        """无序列表应转换为 li 标签"""
        from core.report_service import _markdown_to_simple_html
        result = _markdown_to_simple_html("- 第一项\n- 第二项")
        assert "<li>第一项</li>" in result
        assert "<li>第二项</li>" in result

    def test_charset_utf8(self):
        """HTML 应包含 UTF-8 字符集声明"""
        from core.report_service import _markdown_to_simple_html
        result = _markdown_to_simple_html("测试")
        assert 'charset="utf-8"' in result
