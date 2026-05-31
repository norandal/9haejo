"""
종목 분석 모듈
Alpha Vantage API로 실시간 주가 데이터 수집
"""

import os
import logging
import httpx
import anthropic
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"), override=True)

logger = logging.getLogger(__name__)

AV_KEY = os.getenv("ALPHA_VANTAGE_KEY", "")
AV_BASE = "https://www.alphavantage.co/query"

KR_TO_TICKER = {
    "삼성전자": "005930.KS", "sk하이닉스": "000660.KS", "하이닉스": "000660.KS",
    "lg에너지솔루션": "373220.KS", "삼성바이오로직스": "207940.KS",
    "현대차": "005380.KS", "현대자동차": "005380.KS",
    "기아": "000270.KS", "기아차": "000270.KS",
    "카카오": "035720.KS", "네이버": "035420.KS",
    "셀트리온": "068270.KS", "포스코": "005490.KS",
    "엔비디아": "NVDA", "애플": "AAPL", "마이크로소프트": "MSFT",
    "테슬라": "TSLA", "아마존": "AMZN", "메타": "META",
    "알파벳": "GOOGL", "구글": "GOOGL", "넷플릭스": "NFLX",
    "팔란티어": "PLTR", "브로드컴": "AVGO", "암": "ARM",
}


def resolve_ticker(query: str) -> str:
    q = query.strip().lower()
    for kr, ticker in KR_TO_TICKER.items():
        if kr in q:
            return ticker
    upper = query.strip().upper()
    if all(c.isalpha() or c in (".", "-") for c in upper) and len(upper) <= 10:
        return upper
    return None


def fetch_quote(ticker: str) -> dict | None:
    """Alpha Vantage GLOBAL_QUOTE — 현재가, 등락률, 거래량"""
    import time
    for attempt in range(3):
        try:
            r = httpx.get(AV_BASE, params={
                "function": "GLOBAL_QUOTE",
                "symbol": ticker,
                "apikey": AV_KEY,
            }, timeout=15)
            body = r.json()
            logger.info(f"AV GLOBAL_QUOTE: {body}")

            # Rate limit 메시지 감지 → 재시도
            if "Note" in body or "Information" in body:
                logger.warning(f"AV rate limit attempt {attempt+1}")
                if attempt < 2:
                    time.sleep(15)
                    continue
                return None

            q = body.get("Global Quote", {})
            if not q or not q.get("05. price"):
                return None

            return {
                "ticker": ticker,
                "price": float(q["05. price"]),
                "change": float(q["09. change"]),
                "change_pct": float(q["10. change percent"].replace("%", "")),
                "high": float(q["03. high"]),
                "low": float(q["04. low"]),
                "prev_close": float(q["08. previous close"]),
                "volume": q["06. volume"],
                "latest_day": q["07. latest trading day"],
            }
        except Exception as e:
            logger.error(f"fetch_quote error: {e}")
            return None
    return None


def fetch_overview(ticker: str) -> dict:
    """Alpha Vantage OVERVIEW — 회사명, PER, 52주 고저, 섹터 등"""
    try:
        r = httpx.get(AV_BASE, params={
            "function": "OVERVIEW",
            "symbol": ticker,
            "apikey": AV_KEY,
        }, timeout=15)
        d = r.json()
        if not d or "Symbol" not in d:
            return {}
        return {
            "name": d.get("Name", ticker),
            "sector": d.get("Sector", "N/A"),
            "pe_ratio": d.get("TrailingPE", "N/A"),
            "market_cap": d.get("MarketCapitalization"),
            "52w_high": d.get("52WeekHigh"),
            "52w_low": d.get("52WeekLow"),
            "description": d.get("Description", "")[:250],
            "eps": d.get("EPS", "N/A"),
        }
    except Exception as e:
        logger.warning(f"fetch_overview error: {e}")
        return {}


def fmt_market_cap(val: str | None) -> str:
    if not val or val == "None":
        return "N/A"
    try:
        v = int(val)
        if v >= 1_000_000_000_000:
            return f"${v/1_000_000_000_000:.1f}T"
        if v >= 1_000_000_000:
            return f"${v/1_000_000_000:.1f}B"
        return f"${v/1_000_000:.1f}M"
    except Exception:
        return val


def analyze_stock(query: str) -> str:
    ticker = resolve_ticker(query)
    if not ticker:
        return f"❌ '{query}'에 해당하는 종목을 찾을 수 없어요.\n\n예시: NVDA, 삼성전자, 테슬라"

    if not AV_KEY:
        return "⚠️ 종목 분석 API 키가 설정되지 않았습니다. 관리자에게 문의하세요."

    quote = fetch_quote(ticker)
    if not quote:
        return f"❌ {ticker} 데이터를 가져올 수 없어요. 잠시 후 다시 시도해주세요."

    overview = fetch_overview(ticker)

    arrow = "▲" if quote["change_pct"] >= 0 else "▼"
    direction = "상승" if quote["change_pct"] >= 0 else "하락"
    name = overview.get("name") or ticker

    prompt = f"""아래 실시간 데이터를 바탕으로 한국 개인 투자자를 위한 종목 분석 리포트를 작성하세요.
텔레그램 메시지 형식, 이모지 활용, 350자 이내, 투자 권유 아님 명시.

【실시간 데이터 — {quote['latest_day']} 기준】
- 종목: {name} ({ticker})
- 현재가: ${quote['price']:.2f} ({arrow}{abs(quote['change_pct']):.2f}% {direction})
- 전일 대비: ${quote['change']:+.2f}
- 당일 고가: ${quote['high']:.2f} / 저가: ${quote['low']:.2f}
- 거래량: {quote['volume']}
- 시가총액: {fmt_market_cap(overview.get('market_cap'))}
- 52주 고가: ${overview.get('52w_high', 'N/A')} / 저가: ${overview.get('52w_low', 'N/A')}
- PER: {overview.get('pe_ratio', 'N/A')} / EPS: {overview.get('eps', 'N/A')}
- 섹터: {overview.get('sector', 'N/A')}
- 사업요약: {overview.get('description', '')}

출력 형식:
⚡ {name} ({ticker}) 분석
(현재가 및 등락 설명 1~2줄)
(52주 위치 및 밸류에이션 1줄)
(핵심 투자 포인트 1~2줄)
⚠️ 본 정보는 투자 권유가 아닙니다."""

    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    msg = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=500,
        messages=[{"role": "user", "content": prompt}],
    )
    return msg.content[0].text


if __name__ == "__main__":
    for q in ["NVDA", "삼성전자", "테슬라"]:
        print(f"\n=== {q} ===")
        print(analyze_stock(q))
