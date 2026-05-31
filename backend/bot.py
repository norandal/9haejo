"""
텔레그램 봇 핸들러
- /start : 봇 소개 + Chat ID 안내
- /브리핑 : 즉시 시장 브리핑 요청
- 텍스트 입력 : 종목 분석
"""

import os
import logging
import httpx
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"), override=True)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
BASE_URL = f"https://api.telegram.org/bot{BOT_TOKEN}"


def send(chat_id: str, text: str, parse_mode: str = "HTML"):
    try:
        r = httpx.post(f"{BASE_URL}/sendMessage", json={
            "chat_id": chat_id,
            "text": text,
            "parse_mode": parse_mode,
        }, timeout=15)
        logger.info(f"send → {chat_id}: {r.status_code}")
    except Exception as e:
        logger.error(f"send failed: {e}")


def handle_update(update: dict):
    try:
        msg = update.get("message") or update.get("edited_message")
        if not msg:
            return

        chat_id = str(msg["chat"]["id"])
        text = msg.get("text", "").strip()

        if not text:
            return

        logger.info(f"[{chat_id}] 수신: {text!r}")

        if text == "/start":
            send(chat_id, (
                "👋 안녕하세요! <b>구해조(9haejo)</b> 브리핑 봇입니다.\n\n"
                "📊 매일 오전 8시, 미국 시장 마감 분석을 전달해드려요.\n\n"
                "🔍 <b>종목 분석</b>도 됩니다!\n"
                "• <code>NVDA</code>\n"
                "• <code>삼성전자</code>\n"
                "• <code>테슬라 분석해줘</code>\n\n"
                f"📌 내 Chat ID: <code>{chat_id}</code>\n\n"
                "🌐 <a href='https://9haejo.vercel.app'>구독 신청 →</a>"
            ))

        elif text in ["/브리핑", "/briefing"]:
            send(chat_id, "⏳ 시장 데이터 분석 중... 잠시만 기다려주세요!")
            try:
                from collector import collect_all
                from summarizer import summarize
                data = collect_all()
                result = summarize(data)
                for tweet in result.get("tweets", []):
                    send(chat_id, tweet, parse_mode="")
            except Exception as e:
                logger.error(f"브리핑 오류: {e}")
                send(chat_id, f"⚠️ 브리핑 생성 중 오류가 발생했습니다: {e}")

        else:
            send(chat_id, f"🔍 <b>{text}</b> 분석 중...")
            try:
                from stock_analyzer import analyze_stock
                result = analyze_stock(text)
                send(chat_id, result, parse_mode="")
            except Exception as e:
                logger.error(f"종목 분석 오류: {e}")
                send(chat_id, f"⚠️ 분석 중 오류: {e}")

    except Exception as e:
        logger.error(f"handle_update 오류: {e}")


# Webhook 수신용 FastAPI 라우터
from fastapi import APIRouter, Request, BackgroundTasks

router = APIRouter()

@router.post("/webhook/telegram")
async def webhook(request: Request, background_tasks: BackgroundTasks):
    update = await request.json()
    logger.info(f"webhook 수신: {update}")
    # Telegram 타임아웃 방지: 백그라운드에서 처리
    background_tasks.add_task(handle_update, update)
    return {"ok": True}
