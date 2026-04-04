import logging
from fastapi import APIRouter, BackgroundTasks

from core.report_service import generate_and_send_report

router = APIRouter(prefix="/api", tags=["报告"])
logger = logging.getLogger(__name__)


def _run_report_task():
    """后台执行报告生成+发送"""
    try:
        generate_and_send_report()
        logger.info("行为建议报告生成并发送成功")
    except Exception as e:
        logger.error(f"报告生成/发送失败: {e}")


@router.post("/report/send", status_code=202)
def send_report(background_tasks: BackgroundTasks):
    background_tasks.add_task(_run_report_task)
    return {"message": "报告生成中，完成后将发送至邮箱"}
