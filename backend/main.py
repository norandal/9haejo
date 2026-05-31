import os
import sys

if sys.stdout.encoding != "utf-8":
    try: sys.stdout.reconfigure(encoding="utf-8")
    except: pass
if sys.stderr.encoding != "utf-8":
    try: sys.stderr.reconfigure(encoding="utf-8")
    except: pass

import json
import logging
from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
import pytz

logger = logging.getLogger(__name__)

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"), override=True)

from collector import collect_all
from summarizer import summarize
from telegram_poster import post_summary
from bot import router as bot_router
from subscribers import subscribe, unsubscribe, get_all, count

app = FastAPI(title="9haejo API", version="3.0.0")
app.include_router(bot_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_last_summary = {}


def run_summary_job():
    global _last_summary
    data = collect_all()
    result = summarize(data)
    # 전체 구독자에게 발송
    from bot import send as tg_send
    subscribers = get_all()
    for tweet in result["tweets"]:
        for chat_id in subscribers:
            tg_send(chat_id, tweet)
    # 메인 채널에도 발송
    url = post_summary(result["tweets"])
    _last_summary = {
        "date": data["date"],
        "tweets": result["tweets"],
        "telegram_url": url,
        "subscriber_count": len(subscribers),
    }
    return _last_summary


# ── APScheduler: 매일 KST 08:00 브리핑 자동 발송 ────────────────────────
_scheduler = BackgroundScheduler(timezone=pytz.utc)


@app.on_event("startup")
def startup_scheduler():
    from alerts import check_and_fire_alerts
    from apscheduler.triggers.interval import IntervalTrigger
    # KST 08:00 = UTC 23:00
    _scheduler.add_job(
        run_summary_job,
        CronTrigger(hour=23, minute=0, timezone=pytz.utc),
        id="daily_briefing",
        replace_existing=True,
        misfire_grace_time=300,
    )
    # 가격 알림 체크: 매 5분
    _scheduler.add_job(
        check_and_fire_alerts,
        IntervalTrigger(minutes=5),
        id="price_alerts",
        replace_existing=True,
    )
    _scheduler.start()
    logger.info("Scheduler started: daily_briefing + price_alerts every 5min")


@app.on_event("shutdown")
def shutdown_scheduler():
    _scheduler.shutdown(wait=False)


@app.get("/")
def root():
    return {"status": "ok", "service": "9haejo", "version": "3.0.0", "subscribers": count()}


@app.get("/health")
def health():
    from datetime import datetime
    next_job = None
    try:
        job = _scheduler.get_job("daily_briefing")
        if job and job.next_run_time:
            next_job = job.next_run_time.isoformat()
    except Exception:
        pass
    return {
        "status": "healthy",
        "version": "3.0.0",
        "subscribers": count(),
        "scheduler_running": _scheduler.running,
        "next_briefing_utc": next_job,
        "last_briefing_date": _last_summary.get("date"),
        "uptime_check": datetime.utcnow().isoformat(),
    }


@app.post("/subscribe")
def api_subscribe(body: dict):
    """웹 구독 폼에서 호출"""
    chat_id = str(body.get("chat_id", "")).strip()
    if not chat_id:
        return {"success": False, "message": "chat_id가 필요합니다."}
    is_new = subscribe(chat_id)
    return {
        "success": True,
        "is_new": is_new,
        "message": "구독 완료!" if is_new else "이미 구독 중입니다.",
        "total_subscribers": count(),
    }


@app.delete("/subscribe/{chat_id}")
def api_unsubscribe(chat_id: str):
    removed = unsubscribe(chat_id)
    return {"success": removed, "message": "구독 해제" if removed else "구독 중이 아님"}


@app.get("/subscribers/count")
def subscriber_count():
    return {"count": count()}


@app.get("/summary/latest")
def get_latest_summary():
    if not _last_summary:
        return {"message": "아직 생성된 요약이 없습니다."}
    return _last_summary


@app.post("/summary/run")
def run_summary(background_tasks: BackgroundTasks):
    background_tasks.add_task(run_summary_job)
    return {"message": "브리핑 생성 시작. /summary/latest 에서 확인하세요."}


@app.get("/summary/preview")
def preview_summary():
    data = collect_all()
    result = summarize(data)
    return {"date": data["date"], "tweets": result["tweets"], "fear_greed": data.get("fear_greed")}


@app.get("/market/live")
def market_live():
    """실시간 시장 데이터 (지수·환율·공포탐욕) — 프론트 위젯용"""
    from collector import yf_quote, collect_fear_greed
    indices = {
        "S&P500": yf_quote("^GSPC"),
        "NASDAQ": yf_quote("^IXIC"),
        "DOW": yf_quote("^DJI"),
        "VIX": yf_quote("^VIX"),
    }
    fx = {
        "USD/KRW": yf_quote("KRW=X"),
        "USD/JPY": yf_quote("JPY=X"),
    }
    fear_greed = collect_fear_greed()
    return {"indices": indices, "fx": fx, "fear_greed": fear_greed}
