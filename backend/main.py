import os
import json
import threading
from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"), override=True)

from collector import collect_all
from summarizer import summarize
from telegram_poster import post_summary
from bot import router as bot_router

app = FastAPI(title="9haejo API", version="0.1.0")

app.include_router(bot_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 마지막 요약 결과 캐시
_last_summary = {}


def run_summary_job():
    global _last_summary
    data = collect_all()
    result = summarize(data)
    url = post_summary(result["tweets"])
    _last_summary = {
        "date": data["date"],
        "tweets": result["tweets"],
        "telegram_url": url,
        "data": data,
    }
    return _last_summary


@app.get("/")
def root():
    return {"status": "ok", "service": "9haejo"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.get("/summary/latest")
def get_latest_summary():
    """마지막 요약 결과 반환"""
    if not _last_summary:
        return {"message": "아직 생성된 요약이 없습니다. /summary/run을 먼저 실행하세요."}
    return _last_summary


@app.post("/summary/run")
def run_summary(background_tasks: BackgroundTasks):
    """수동으로 요약 생성 및 텔레그램 발송 트리거"""
    background_tasks.add_task(run_summary_job)
    return {"message": "요약 생성 시작됨. /summary/latest에서 결과를 확인하세요."}


@app.get("/summary/preview")
def preview_summary():
    """발송 없이 요약만 생성해서 반환"""
    data = collect_all()
    result = summarize(data)
    return {
        "date": data["date"],
        "tweets": result["tweets"],
        "data": data,
    }
