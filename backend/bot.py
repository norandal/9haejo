"""
텔레그램 봇 핸들러 v2
커맨드: /start /help /구독 /구독취소 /브리핑 /시황 /watchlist /sector
자유 텍스트: 종목명 or 티커 -> 즉시 분석
"""

import os
import sys
import logging
import httpx
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"), override=True)

_handler = logging.StreamHandler(stream=sys.stdout)
_handler.setFormatter(logging.Formatter("%(levelname)s:%(name)s:%(message)s"))
try:
    _handler.stream.reconfigure(encoding="utf-8")
except Exception:
    pass
logging.basicConfig(level=logging.INFO, handlers=[_handler], force=True)
logger = logging.getLogger(__name__)

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
BASE_URL = f"https://api.telegram.org/bot{BOT_TOKEN}"

SECTOR_MAP = {
    "반도체": "SOXX", "기술": "XLK", "it": "XLK",
    "통신": "XLC", "소비": "XLY", "에너지": "XLE", "금융": "XLF",
}


def send(chat_id: str, text: str, reply_markup: dict | None = None):
    try:
        payload = {
            "chat_id": chat_id,
            "text": text,
            "parse_mode": "HTML",
            "disable_web_page_preview": True,
        }
        if reply_markup:
            payload["reply_markup"] = reply_markup
        r = httpx.post(f"{BASE_URL}/sendMessage", json=payload, timeout=15)
        logger.info("send -> %s: %s", chat_id, r.status_code)
    except Exception as e:
        logger.error("send error: %s", e)


def answer_callback(callback_query_id: str):
    """Telegram callback_query에 답변 (스피너 제거)"""
    try:
        httpx.post(f"{BASE_URL}/answerCallbackQuery", json={"callback_query_id": callback_query_id}, timeout=5)
    except Exception:
        pass


MAIN_MENU = {
    "inline_keyboard": [[
        {"text": "📊 시황", "callback_data": "/시황"},
        {"text": "📰 뉴스", "callback_data": "/뉴스"},
    ], [
        {"text": "📈 브리핑", "callback_data": "/브리핑"},
        {"text": "✅ 구독", "callback_data": "/구독"},
    ]]
}


def handle_update(update: dict):
    try:
        # callback_query (inline keyboard button)
        cb = update.get("callback_query")
        if cb:
            answer_callback(cb["id"])
            chat_id = str(cb["message"]["chat"]["id"])
            text = cb.get("data", "").strip()
            if text:
                handle_update({"message": {"chat": {"id": chat_id}, "text": text}})
            return

        msg = update.get("message") or update.get("edited_message")
        if not msg:
            return

        chat_id = str(msg["chat"]["id"])
        text = msg.get("text", "").strip()
        if not text:
            return

        logger.info("[%s] recv: %r", chat_id, text)
        cmd = text.split()[0].lower()

        # ── /start ──────────────────────────────────
        if cmd == "/start":
            send(chat_id, (
                "👋 <b>구해조(9haejo)</b>에 오신 걸 환영합니다!\n\n"
                "🇺🇸 미국 증시 AI 브리핑 서비스\n"
                "매일 오전 8시, 월가 마감 분석을 받아보세요.\n\n"
                f"📌 내 Chat ID: <code>{chat_id}</code>\n"
                "🌐 <a href='https://9haejo.vercel.app'>구독 신청 사이트</a>\n\n"
                "아래 버튼으로 바로 시작하세요:"
            ), reply_markup=MAIN_MENU)

        # ── /help ────────────────────────────────────
        elif cmd == "/help":
            send(chat_id, (
                "📖 <b>구해조 커맨드 목록</b>\n\n"
                "<b>브리핑</b>\n"
                "/구독 — 매일 8시 자동 브리핑 구독\n"
                "/구독취소 — 구독 해제\n"
                "/브리핑 — 전체 AI 브리핑 (5개 메시지)\n"
                "/시황 — 빠른 지수 현황\n"
                "/뉴스 — 오늘의 월가 뉴스 한국어 요약\n\n"
                "<b>종목 분석</b>\n"
                "NVDA, 테슬라, 삼성전자 등 입력\n\n"
                "<b>관심종목</b>\n"
                "/watchlist — 관심종목 현황\n"
                "/watchlist add NVDA — 추가\n"
                "/watchlist remove NVDA — 삭제\n\n"
                "<b>섹터</b>\n"
                "/sector 반도체 — 섹터 분석\n"
                "(반도체/기술/에너지/금융/소비/통신)"
            ))

        # ── /구독 ────────────────────────────────────
        elif cmd in ["/구독", "/subscribe"]:
            from subscribers import subscribe
            is_new = subscribe(chat_id)
            if is_new:
                send(chat_id, (
                    "✅ <b>구독 완료!</b>\n\n"
                    "매일 오전 8시에 미국 증시 AI 브리핑을 보내드립니다.\n"
                    "/구독취소 로 언제든지 해제할 수 있어요."
                ))
            else:
                send(chat_id, "이미 구독 중입니다! 매일 8시에 브리핑을 보내드리고 있어요.")

        # ── /구독취소 ─────────────────────────────────
        elif cmd in ["/구독취소", "/unsubscribe"]:
            from subscribers import unsubscribe
            removed = unsubscribe(chat_id)
            if removed:
                send(chat_id, "구독이 해제되었습니다. 언제든지 /구독 으로 다시 시작하세요!")
            else:
                send(chat_id, "현재 구독 중이 아닙니다.")

        # ── /브리핑 ──────────────────────────────────
        elif cmd in ["/브리핑", "/briefing"]:
            send(chat_id, "⏳ AI가 시장을 분석 중입니다... (30초 정도 소요됩니다)")
            try:
                from collector import collect_all
                from summarizer import summarize
                data = collect_all()
                result = summarize(data)
                for tweet in result["tweets"]:
                    send(chat_id, tweet)
            except Exception as e:
                logger.error("briefing error: %s", e)
                send(chat_id, f"브리핑 생성 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.")

        # ── /시황 ────────────────────────────────────
        elif cmd in ["/시황", "/market"]:
            send(chat_id, "⏳ 시장 현황 조회 중...")
            try:
                from collector import yf_quote, collect_fear_greed
                lines = ["<b>📊 미국 시장 현황</b>\n"]
                for name, sym in [("S&P500", "^GSPC"), ("NASDAQ", "^IXIC"), ("DOW", "^DJI"), ("VIX", "^VIX")]:
                    q = yf_quote(sym)
                    if q:
                        arrow = "▲" if q["change_pct"] >= 0 else "▼"
                        sign = "+" if q["change_pct"] >= 0 else ""
                        lines.append(f"{name}: {q['price']:,.2f} {arrow}{sign}{q['change_pct']:.2f}%")
                lines.append("")
                lines.append("<b>환율</b>")
                for name, sym in [("USD/KRW", "KRW=X"), ("USD/JPY", "JPY=X")]:
                    q = yf_quote(sym)
                    if q:
                        arrow = "▲" if q["change_pct"] >= 0 else "▼"
                        sign = "+" if q["change_pct"] >= 0 else ""
                        lines.append(f"{name}: {q['price']:,.2f} {arrow}{sign}{q['change_pct']:.2f}%")
                fg = collect_fear_greed()
                lines.append(f"\n<b>공포탐욕지수</b>: {fg['score']} ({fg['label_kr']})")
                send(chat_id, "\n".join(lines))
            except Exception as e:
                logger.error("market error: %s", e)
                send(chat_id, "시장 데이터 조회 중 오류가 발생했어요.")

        # ── /watchlist ────────────────────────────────
        elif cmd == "/watchlist":
            parts = text.split()
            _handle_watchlist(chat_id, parts)

        # ── /compare ─────────────────────────────────
        elif cmd == "/compare":
            parts = text.split()
            if len(parts) < 3:
                send(chat_id, "두 종목을 입력해주세요.\n예: /compare NVDA TSLA\n예: /compare 엔비디아 테슬라")
            else:
                query = " ".join(parts[1:])
                send(chat_id, f"⚖️ {query} 비교 분석 중...")
                try:
                    from stock_analyzer import compare_stocks
                    result = compare_stocks(query)
                    send(chat_id, result)
                except Exception as e:
                    logger.error("compare error: %s", e)
                    send(chat_id, "비교 분석 중 오류가 발생했어요.")

        # ── /뉴스 ────────────────────────────────────
        elif cmd in ["/뉴스", "/news"]:
            send(chat_id, "📰 오늘의 월가 뉴스 분석 중...")
            try:
                from stock_analyzer import summarize_news
                result = summarize_news()
                send(chat_id, result)
            except Exception as e:
                logger.error("news error: %s", e)
                send(chat_id, "뉴스 조회 중 오류가 발생했어요.")

        # ── /sector ──────────────────────────────────
        elif cmd == "/sector":
            parts = text.split()
            sector_query = " ".join(parts[1:]).lower() if len(parts) > 1 else ""
            ticker = SECTOR_MAP.get(sector_query)
            if not ticker:
                send(chat_id, "섹터를 입력해주세요.\n예: /sector 반도체\n(반도체/기술/에너지/금융/소비/통신)")
            else:
                send(chat_id, f"⏳ {sector_query} 섹터 분석 중...")
                try:
                    from stock_analyzer import analyze_stock
                    result = analyze_stock(ticker)
                    send(chat_id, result)
                except Exception as e:
                    send(chat_id, "섹터 분석 중 오류가 발생했어요.")

        # ── 종목 분석 (자유 텍스트) ──────────────────
        else:
            send(chat_id, f"🔍 <b>{text}</b> 분석 중...")
            try:
                from stock_analyzer import analyze_stock
                result = analyze_stock(text)
                send(chat_id, result)
            except Exception as e:
                logger.error("stock analysis error: %s", e)
                send(chat_id, "분석 중 오류가 발생했어요. 티커(예: NVDA)나 회사명(예: 삼성전자)을 입력해주세요.")

    except Exception as e:
        logger.error("handle_update error: %s", e)


def _handle_watchlist(chat_id: str, parts: list):
    """관심종목 관리 (파일 기반)"""
    import json
    from pathlib import Path

    wl_path = Path(__file__).parent / "watchlists.json"
    try:
        wl_db = json.loads(wl_path.read_text(encoding="utf-8")) if wl_path.exists() else {}
    except Exception:
        wl_db = {}

    user_wl = wl_db.get(chat_id, [])

    if len(parts) >= 3 and parts[1].lower() == "add":
        ticker = parts[2].upper()
        if ticker not in user_wl:
            user_wl.append(ticker)
            wl_db[chat_id] = user_wl
            wl_path.write_text(json.dumps(wl_db, ensure_ascii=False, indent=2), encoding="utf-8")
            send(chat_id, f"✅ {ticker} 관심종목에 추가했습니다.\n현재 목록: {', '.join(user_wl)}")
        else:
            send(chat_id, f"{ticker}은 이미 관심종목에 있습니다.")

    elif len(parts) >= 3 and parts[1].lower() == "remove":
        ticker = parts[2].upper()
        if ticker in user_wl:
            user_wl.remove(ticker)
            wl_db[chat_id] = user_wl
            wl_path.write_text(json.dumps(wl_db, ensure_ascii=False, indent=2), encoding="utf-8")
            send(chat_id, f"삭제했습니다. 현재 목록: {', '.join(user_wl) if user_wl else '없음'}")
        else:
            send(chat_id, f"{ticker}은 관심종목에 없습니다.")

    else:
        if not user_wl:
            send(chat_id, "관심종목이 없습니다.\n추가: /watchlist add NVDA")
            return
        send(chat_id, "⏳ 관심종목 현황 조회 중...")
        from stock_analyzer import fetch_quote
        lines = [f"<b>내 관심종목</b> ({len(user_wl)}개)\n"]
        for sym in user_wl:
            q = fetch_quote(sym)
            if q:
                arrow = "▲" if q["change_pct"] >= 0 else "▼"
                lines.append(f"{sym}: ${q['price']:.2f} {arrow}{q['change_pct']:+.2f}%")
            else:
                lines.append(f"{sym}: 조회 실패")
        send(chat_id, "\n".join(lines))


# Webhook 라우터
from fastapi import APIRouter, Request, BackgroundTasks

router = APIRouter()


@router.post("/webhook/telegram")
async def webhook(request: Request, background_tasks: BackgroundTasks):
    update = await request.json()
    logger.info("webhook recv: update_id=%s", update.get("update_id"))
    background_tasks.add_task(handle_update, update)
    return {"ok": True}
