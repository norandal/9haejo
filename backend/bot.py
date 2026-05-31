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
    ], [
        {"text": "🔔 알림 설정", "callback_data": "/알림"},
        {"text": "📋 관심종목", "callback_data": "/watchlist"},
    ]]
}

HELP_MENU = {
    "inline_keyboard": [[
        {"text": "📈 브리핑 커맨드", "callback_data": "__help_briefing"},
        {"text": "🔍 종목 분석", "callback_data": "__help_stock"},
    ], [
        {"text": "📋 관심종목", "callback_data": "__help_watchlist"},
        {"text": "🔔 알림", "callback_data": "__help_alert"},
    ]]
}

HELP_TEXTS = {
    "__help_briefing": (
        "📈 <b>브리핑 커맨드</b>\n\n"
        "/구독 — 매일 8시 자동 브리핑 구독\n"
        "/구독취소 — 구독 해제\n"
        "/브리핑 — 지금 즉시 AI 브리핑 (30초)\n"
        "/시황 — 빠른 지수+환율+공포탐욕 현황\n"
        "/뉴스 — 오늘의 월가 뉴스 한국어 요약"
    ),
    "__help_stock": (
        "🔍 <b>종목 분석</b>\n\n"
        "티커 입력: <code>NVDA</code> <code>TSLA</code> <code>AAPL</code>\n"
        "한국어 입력: <code>엔비디아</code> <code>테슬라</code> <code>삼성전자</code>\n\n"
        "/compare NVDA TSLA — 두 종목 비교\n"
        "/sector 반도체 — 섹터 분석\n"
        "(반도체/기술/에너지/금융/소비/통신)"
    ),
    "__help_watchlist": (
        "📋 <b>관심종목</b>\n\n"
        "/watchlist — 관심종목 현황 및 시세\n"
        "/watchlist add NVDA — 추가\n"
        "/watchlist remove NVDA — 삭제\n"
        "/포트폴리오 — 관심종목 AI 진단\n\n"
        "매일 아침 브리핑과 함께 관심종목 현황도 발송됩니다."
    ),
    "__help_alert": (
        "🔔 <b>가격 알림</b>\n\n"
        "/알림 NVDA 200 — NVDA $200 이상 시 알림\n"
        "/알림 TSLA 150 하락 — TSLA $150 이하 시 알림\n"
        "/알림 삭제 NVDA — 알림 삭제\n"
        "/알림 — 현재 알림 목록\n\n"
        "5분마다 가격 체크, 최대 5개 등록 가능"
    ),
}


def handle_update(update: dict):
    try:
        # callback_query (inline keyboard button)
        cb = update.get("callback_query")
        if cb:
            answer_callback(cb["id"])
            chat_id = str(cb["message"]["chat"]["id"])
            cb_data = cb.get("data", "").strip()
            if cb_data in HELP_TEXTS:
                send(chat_id, HELP_TEXTS[cb_data])
            elif cb_data:
                handle_update({"message": {"chat": {"id": chat_id}, "text": cb_data}})
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
            send(chat_id,
                "📖 <b>구해조 커맨드</b>\n\n카테고리를 선택해 자세한 사용법을 확인하세요:",
                reply_markup=HELP_MENU
            )

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
                lines.append("<b>한국 시장</b>")
                for name, sym in [("KOSPI", "^KS11"), ("KOSDAQ", "^KQ11")]:
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

        # ── /알림 ────────────────────────────────────────
        elif cmd in ["/알림", "/alert"]:
            parts = text.split()
            from alerts import add_alert, remove_alert, get_alerts
            from stock_analyzer import resolve_ticker

            if len(parts) == 1:
                # 현재 알림 목록
                user_alerts = get_alerts(chat_id)
                if not user_alerts:
                    send(chat_id, (
                        "📭 등록된 가격 알림이 없습니다.\n\n"
                        "<b>알림 등록 방법:</b>\n"
                        "/알림 NVDA 200 — NVDA가 $200 이상이 되면 알림\n"
                        "/알림 TSLA 150 하락 — TSLA가 $150 이하 시 알림\n"
                        "/알림 삭제 NVDA — NVDA 알림 삭제\n"
                        "(최대 5개)"
                    ))
                else:
                    lines = [f"🔔 <b>내 가격 알림</b> ({len(user_alerts)}개)\n"]
                    for a in user_alerts:
                        arrow = ">=" if a["direction"] == "above" else "<="
                        lines.append(f"{a['ticker']} {arrow} ${a['target']:,.0f}")
                    send(chat_id, "\n".join(lines))

            elif len(parts) >= 3 and parts[1].lower() in ["삭제", "delete", "remove"]:
                ticker = resolve_ticker(parts[2]) or parts[2].upper()
                n = remove_alert(chat_id, ticker)
                if n:
                    send(chat_id, f"✅ {ticker} 알림을 삭제했습니다.")
                else:
                    send(chat_id, f"{ticker} 알림이 없습니다.")

            elif len(parts) >= 3:
                # /알림 NVDA 200 [하락]
                ticker = resolve_ticker(parts[1]) or parts[1].upper()
                try:
                    target = float(parts[2].replace(",", ""))
                except ValueError:
                    send(chat_id, "가격을 숫자로 입력해주세요.\n예: /알림 NVDA 200")
                    return
                direction = "below" if len(parts) >= 4 and "하락" in parts[3] else "above"
                ok = add_alert(chat_id, ticker, target, direction)
                if ok:
                    dir_text = "이하" if direction == "below" else "이상"
                    send(chat_id, (
                        f"✅ <b>알림 등록 완료!</b>\n\n"
                        f"{ticker}이(가) ${target:,.0f} {dir_text}이 되면\n"
                        f"즉시 텔레그램으로 알려드립니다.\n"
                        f"(5분마다 체크)"
                    ))
                else:
                    send(chat_id, "알림은 최대 5개까지 등록할 수 있습니다.\n/알림 삭제 NVDA 로 기존 알림을 삭제해주세요.")
            else:
                send(chat_id, "사용법: /알림 NVDA 200\n하락 알림: /알림 TSLA 150 하락")




        # ── /지난브리핑 ──────────────────────────────────
        elif cmd in ["/지난브리핑", "/yesterday"]:
            try:
                from briefing_history import get_yesterday_briefing, get_latest_briefing
                date, tweets = get_yesterday_briefing()
                if not tweets:
                    # 어제 없으면 가장 최근 것
                    date, tweets = get_latest_briefing()
                if not tweets:
                    send(chat_id, "아직 저장된 브리핑이 없어요.
/브리핑 으로 지금 브리핑을 받아보세요!")
                else:
                    send(chat_id, f"📅 <b>{date} 브리핑</b>")
                    for tweet in tweets:
                        send(chat_id, tweet)
            except Exception as e:
                logger.error("yesterday error: %s", e)
                send(chat_id, "브리핑 히스토리 조회 중 오류가 발생했어요.")

        # ── /환율 ────────────────────────────────────────
        elif cmd in ["/환율", "/fx"]:
            send(chat_id, "⏳ 환율 현황 조회 중...")
            try:
                from collector import yf_quote
                import anthropic, os
                lines = ["<b>💱 실시간 환율</b>
"]
                fx_pairs = [("USD/KRW", "KRW=X"), ("USD/JPY", "JPY=X"), ("USD/CNY", "CNY=X"), ("USD/EUR", "EURUSD=X")]
                fx_data = {}
                for name, sym in fx_pairs:
                    q = yf_quote(sym)
                    if q:
                        arrow = "▲" if q["change_pct"] >= 0 else "▼"
                        sign = "+" if q["change_pct"] >= 0 else ""
                        lines.append(f"{name}: {q['price']:,.2f} {arrow}{sign}{q['change_pct']:.2f}%")
                        fx_data[name] = q
                send(chat_id, "
".join(lines))
                # AI 환율 전망
                krw = fx_data.get("USD/KRW", {}).get("price", "N/A")
                krw_pct = fx_data.get("USD/KRW", {}).get("change_pct", 0)
                client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
                msg = client.messages.create(
                    model="claude-haiku-4-5",
                    max_tokens=300,
                    messages=[{"role": "user", "content": f"USD/KRW is {krw} ({krw_pct:+.2f}%). Write a 2-3 sentence Korean-language FX impact analysis for Korean stock investors. Focus on KOSPI impact, import/export companies. Use emojis. MAX 200 chars."}],
                )
                send(chat_id, msg.content[0].text)
            except Exception as e:
                logger.error("fx error: %s", e)
                send(chat_id, "환율 조회 중 오류가 발생했어요.")

        # ── /설정 ────────────────────────────────────────
        elif cmd in ["/설정", "/settings"]:
            from user_settings import get_settings, update_setting
            parts = text.split()
            if len(parts) == 1:
                s = get_settings(chat_id)
                wl = "켜짐" if s.get("watchlist_briefing") else "꺼짐"
                send(chat_id, (
                    f"<b>내 설정</b>

"
                    f"관심종목 브리핑 포함: {wl}

"
                    "<b>변경하기:</b>
"
                    "/설정 관심종목 켜기
"
                    "/설정 관심종목 끄기"
                ))
            elif len(parts) >= 3 and "관심종목" in parts[1]:
                on = parts[2] in ["켜기", "on", "true"]
                update_setting(chat_id, "watchlist_briefing", on)
                send(chat_id, f"관심종목 브리핑 포함: {'켜짐' if on else '꺼짐'} ✅")
            else:
                send(chat_id, "사용법: /설정 관심종목 켜기/끄기")

        # ── /포트폴리오 ──────────────────────────────────
        elif cmd in ["/포트폴리오", "/portfolio"]:
            try:
                import json
                from pathlib import Path
                wl_path = Path(__file__).parent / "watchlists.json"
                wl_db = json.loads(wl_path.read_text(encoding="utf-8")) if wl_path.exists() else {}
                user_wl = wl_db.get(chat_id, [])
                if not user_wl:
                    send(chat_id, "관심종목이 없어요.\n/watchlist add NVDA 로 먼저 추가해주세요!")
                else:
                    send(chat_id, f"🧠 {len(user_wl)}개 종목 포트폴리오 AI 진단 중...")
                    from stock_analyzer import analyze_portfolio
                    result = analyze_portfolio(user_wl)
                    send(chat_id, result)
            except Exception as e:
                logger.error("portfolio error: %s", e)
                send(chat_id, "포트폴리오 분석 중 오류가 발생했어요.")

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
            parts = text.split()
            stock_query = " ".join(parts[1:]) if len(parts) > 1 else ""
            if stock_query:
                from stock_analyzer import resolve_ticker, summarize_news
                ticker = resolve_ticker(stock_query) or stock_query.upper()
                send(chat_id, f"📰 {ticker} 관련 뉴스 분석 중...")
                try:
                    result = summarize_news(ticker)
                    send(chat_id, result)
                except Exception as e:
                    logger.error("news error: %s", e)
                    send(chat_id, "뉴스 조회 중 오류가 발생했어요.")
            else:
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

        # ── /종목전망 ─────────────────────────────────────
        elif cmd in ["/종목전망", "/outlook"]:
            parts = text.split()
            if len(parts) < 2:
                send(chat_id, "사용법: /종목전망 NVDA\n예: /종목전망 삼성전자")
            else:
                query = " ".join(parts[1:])
                from stock_analyzer import resolve_ticker, analyze_outlook
                ticker = resolve_ticker(query) or query.upper()
                send(chat_id, f"🔭 {ticker} 주간 전망 분석 중...")
                try:
                    result = analyze_outlook(ticker)
                    send(chat_id, result)
                except Exception as e:
                    logger.error("outlook error: %s", e)
                    send(chat_id, "전망 분석 중 오류가 발생했어요.")

        # ── /상승 /하락 ──────────────────────────────────
        elif cmd in ["/상승", "/gainers", "/하락", "/losers"]:
            is_up = cmd in ["/상승", "/gainers"]
            parts = text.split()
            sector_filter = " ".join(parts[1:]).lower() if len(parts) > 1 else ""
            SECTOR_STOCKS = {
                "tech": ["AAPL","MSFT","GOOGL","META","NVDA","AMD","INTC","QCOM","AVGO","TSM"],
                "기술": ["AAPL","MSFT","GOOGL","META","NVDA","AMD","INTC","QCOM","AVGO","TSM"],
                "반도체": ["NVDA","AMD","INTC","QCOM","AVGO","TSM","ASML","MU","AMAT","KLAC"],
                "ai": ["NVDA","MSFT","GOOGL","META","AAPL","AMZN","CRM","PLTR","AI","SOUN"],
                "ev": ["TSLA","RIVN","LCID","NIO","LI","XPEV","F","GM","STLA"],
                "전기차": ["TSLA","RIVN","LCID","NIO","LI","XPEV","F","GM"],
                "finance": ["JPM","GS","BAC","WFC","MS","BRK-B","V","MA","PYPL","SQ"],
                "금융": ["JPM","GS","BAC","WFC","MS","BRK-B","V","MA","PYPL","SQ"],
                "energy": ["XOM","CVX","COP","EOG","SLB","OXY","PSX","VLO","MPC","HAL"],
                "에너지": ["XOM","CVX","COP","EOG","SLB","OXY"],
                "crypto": ["COIN","MSTR","MARA","RIOT","CLSK","BTBT","HUT","IREN"],
                "크립토": ["COIN","MSTR","MARA","RIOT","CLSK"],
                "health": ["JNJ","UNH","PFE","ABBV","MRK","LLY","BMY","AMGN","GILD","ISRG"],
                "바이오": ["LLY","ABBV","MRK","AMGN","GILD","ISRG","REGN","BIIB","MRNA"],
            }
            from collector import yf_quote, BIG_STOCKS
            if sector_filter and sector_filter in SECTOR_STOCKS:
                syms = SECTOR_STOCKS[sector_filter]
                label = sector_filter.upper()
                symbol_map = {s: s for s in syms}
            else:
                symbol_map = BIG_STOCKS
                label = "빅테크"
            emoji = "📈" if is_up else "📉"
            send(chat_id, f"{emoji} {label} {'상승' if is_up else '하락'} 종목 조회 중...")
            try:
                items = [(name, yf_quote(sym)) for name, sym in symbol_map.items()]
                items = [(n, q) for n, q in items if q]
                items.sort(key=lambda x: x[1]["change_pct"], reverse=is_up)
                only_direction = [x for x in items if (x[1]["change_pct"] >= 0) == is_up]
                show = (only_direction or items)[:5]
                arrow_label = "상승 TOP 5" if is_up else "하락 TOP 5"
                lines = [f"<b>{emoji} {label} {arrow_label}</b>\n"]
                for name, q in show:
                    sign = "+" if q["change_pct"] >= 0 else ""
                    lines.append(f"{name}: ${q['price']:,.2f} {sign}{q['change_pct']:.2f}%")
                if sector_filter and sector_filter not in SECTOR_STOCKS:
                    lines.append(f"\n<i>섹터 예시: /{'상승' if is_up else '하락'} 반도체 | tech | ai | ev | 금융 | 에너지</i>")
                send(chat_id, "\n".join(lines))
            except Exception as e:
                logger.error("gainers/losers error: %s", e)
                send(chat_id, "조회 중 오류가 발생했어요.")

        # ── 종목 분석 (자유 텍스트) ──────────────────
        else:
            send(chat_id, f"🔍 <b>{text}</b> 분석 중... (10~20초 소요)")
            try:
                from stock_analyzer import analyze_stock
                result = analyze_stock(text)
                send(chat_id, result)
            except Exception as e:
                logger.error("stock analysis error: %s", e)
                send(chat_id, (
                    "❌ 분석 중 오류가 발생했어요.\n\n"
                    "<b>사용 가능한 입력 예시:</b>\n"
                    "티커: <code>NVDA</code> <code>TSLA</code> <code>AAPL</code>\n"
                    "한국어: <code>엔비디아</code> <code>테슬라</code> <code>삼성전자</code>\n\n"
                    "잠시 후 다시 시도해주세요."
                ))

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

