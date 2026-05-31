"""
스케줄러 - 매일 오전 8시 자동 실행
미국 장 마감(한국 오전 6시) 후 8시에 요약 발송
"""

import os
import logging
from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"), override=True)

from collector import collect_all
from summarizer import summarize
from telegram_poster import post_summary

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(message)s")
logger = logging.getLogger(__name__)


def run_daily_summary():
    """매일 오전 8시 실행: 수집 → 요약 → 텔레그램 발송"""
    logger.info("🚀 일일 시장 요약 시작")
    try:
        data = collect_all()
        result = summarize(data)
        url = post_summary(result["tweets"])
        logger.info(f"✅ 발송 완료: {url}")
    except Exception as e:
        logger.error(f"❌ 오류 발생: {e}")


if __name__ == "__main__":
    scheduler = BlockingScheduler(timezone="Asia/Seoul")

    # 매일 오전 8시 (한국 시간)
    scheduler.add_job(
        run_daily_summary,
        CronTrigger(hour=8, minute=0, timezone="Asia/Seoul"),
        id="daily_summary",
        name="일일 시장 요약",
    )

    logger.info("⏰ 스케줄러 시작 - 매일 오전 8시(KST) 자동 실행")
    logger.info("테스트: 지금 바로 실행하려면 Ctrl+C 후 run_daily_summary() 직접 호출")

    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        logger.info("스케줄러 종료")
