"""
텔레그램 봇 핸들러
- /start : 봇 소개 + Chat ID 안내
- /브리핑 : 즉시 시장 브리핑 요청
- 텍스트 입력 : 종목 분석
"""

import os
import httpx
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"), override=True)

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
BASE_URL = f"https://api.telegram.org/bot{BOT_TOKEN}"


def send(chat_id: str, text: str):
    httpx.post(f"{BASE_URL}/sendMessage", json={
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML",
    }, timeout=10)


def handle_update(update: dict):
    msg = update.get("message") or update.get("edited_message")
    if not msg:
        return

    chat_id = str(msg["chat"]["id"])
    text = msg.get("text", "").strip()

    if not text:
        return

    if text == "/start":
        send(chat_id, (
            "👋 안녕하세요! <b>구해조(9haejo)</b> 브리핑 봇입니다.\n\n"
            "📊 매일 오전 8시, 미국 시장 마감 분석을 전달해드려요.\n\n"
            "🔍 <b>종목 분석</b> 기능도 있어요!\n"
            "아래처럼 입력해보세요:\n"
            "• <code>NVDA</code>\n"
            "• <code>삼성전자</code>\n"
            "• <code>테슬라 분석</code>\n\n"
            f"📌 내 Chat ID: <code>{chat_id}</code>\n"
            "구독 신청 시 이 ID를 사이트에 입력하세요!\n\n"
            "🌐 <a href='https://9haejo.vercel.app'>구독 신청 →</a>"
        ))

    elif text in ["/브리핑", "/briefing"]:
        send(chat_id, "⏳ 시장 데이터 분석 중... 잠시만 기다려주세요!")
        from collector import collect_all
        from summarizer import summarize
        from telegram_poster import post_summary
        data = collect_all()
        result = summarize(data)
        # 해당 유저에게만 발송
        from telegram_poster import send_message as _send
        for tweet in result["tweets"]:
            _send_to(chat_id, tweet)

    else:
        # 종목 분석
        send(chat_id, f"🔍 <b>{text}</b> 분석 중...")
        from stock_analyzer import analyze_stock
        result = analyze_stock(text)
        send(chat_id, result)


def _send_to(chat_id: str, text: str):
    httpx.post(f"{BASE_URL}/sendMessage", json={
        "chat_id": chat_id,
        "text": text,
    }, timeout=10)


# Webhook 수신용 FastAPI 라우터
from fastapi import APIRouter, Request

router = APIRouter()

@router.post("/webhook/telegram")
async def webhook(request: Request):
    update = await request.json()
    handle_update(update)
    return {"ok": True}
