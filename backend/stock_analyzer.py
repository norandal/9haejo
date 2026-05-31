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
    """Alpha Vantage GLOBAL_QUOTE — 현재가, 등락률, 거래량 (60s TTL cached)"""
    from cache import quote_cache
    cached = quote_cache.get(ticker)
    if cached is not None:
        return cached
    import time
    for attempt in range(3):
        try:
            r = httpx.get(AV_BASE, params={
                "function": "GLOBAL_QUOTE",
                "symbol": ticker,
                "apikey": AV_KEY,
            }, timeout=15)
            body = r.json()
            logger.info("AV GLOBAL_QUOTE ok: symbol=%s", ticker)

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

            result = {
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
            quote_cache.set(ticker, result)
            return result
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

    lines = [
        "Write a Korean stock analysis report for individual Korean investors.",
        "Use Telegram message format, emojis, under 350 chars, note it is not investment advice.",
        "",
        f"=== Real-time Data ({quote['latest_day']}) ===",
        f"Stock: {name} ({ticker})",
        f"Price: ${quote['price']:.2f} ({arrow}{abs(quote['change_pct']):.2f}% {direction})",
        f"Change: ${quote['change']:+.2f} vs prev close ${quote['prev_close']:.2f}",
        f"Day range: ${quote['low']:.2f} ~ ${quote['high']:.2f}",
        f"Volume: {quote['volume']}",
        f"Market Cap: {fmt_market_cap(overview.get('market_cap'))}",
        f"52W High: ${overview.get('52w_high', 'N/A')} / Low: ${overview.get('52w_low', 'N/A')}",
        f"PER: {overview.get('pe_ratio', 'N/A')} / EPS: {overview.get('eps', 'N/A')}",
        f"Sector: {overview.get('sector', 'N/A')}",
        f"Description: {overview.get('description', '')}",
        "",
        "Output format (Korean):",
        f"<emoji> {name} ({ticker}) analysis",
        "(current price and change 1-2 lines)",
        "(52W position and valuation 1 line)",
        "(key investment points 1-2 lines)",
        "Warning: not investment advice.",
    ]
    prompt = "\n".join(lines)

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


def compare_stocks(query: str) -> str:
    """두 종목 비교: /compare NVDA TSLA"""
    parts = query.strip().split()
    tickers = [resolve_ticker(p) for p in parts if resolve_ticker(p)]
    tickers = list(dict.fromkeys(tickers))[:2]  # 중복 제거, 최대 2개

    if len(tickers) < 2:
        return "비교할 종목 2개를 입력해주세요.\n예시: /compare NVDA TSLA\n예시: /compare 엔비디아 테슬라"

    t1, t2 = tickers[0], tickers[1]
    q1, q2 = fetch_quote(t1), fetch_quote(t2)

    if not q1 or not q2:
        return f"데이터 조회 실패: {t1 if not q1 else t2}\n잠시 후 다시 시도해주세요."

    ov1 = fetch_overview(t1)
    ov2 = fetch_overview(t2)

    def pct_bar(pct):
        if pct is None: return "N/A"
        arrow = "▲" if pct >= 0 else "▼"
        return f"{arrow}{abs(pct):.2f}%"

    n1 = ov1.get("name") or t1
    n2 = ov2.get("name") or t2

    prompt = f"""Compare two stocks for Korean retail investors. Write in Korean, concise, use emojis.
MAX 350 characters.

Stock A: {n1} ({t1})
  Price: ${q1['price']:.2f} | Change: {pct_bar(q1['change_pct'])}
  52W High: ${ov1.get('52w_high','N/A')} | Low: ${ov1.get('52w_low','N/A')}
  PER: {ov1.get('pe_ratio','N/A')} | Market Cap: {fmt_market_cap(ov1.get('market_cap'))}
  Sector: {ov1.get('sector','N/A')}

Stock B: {n2} ({t2})
  Price: ${q2['price']:.2f} | Change: {pct_bar(q2['change_pct'])}
  52W High: ${ov2.get('52w_high','N/A')} | Low: ${ov2.get('52w_low','N/A')}
  PER: {ov2.get('pe_ratio','N/A')} | Market Cap: {fmt_market_cap(ov2.get('market_cap'))}
  Sector: {ov2.get('sector','N/A')}

Format:
[title line with both ticker names]
[today's performance comparison]
[valuation comparison: PER, 52W position]
[one clear winner statement with reasoning]
[risk disclaimer]"""

    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    msg = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=600,
        messages=[{"role": "user", "content": prompt}],
    )
    return msg.content[0].text


def summarize_news() -> str:
    """Alpha Vantage 뉴스를 Claude로 한국어 요약 (5분 캐싱)"""
    from cache import news_cache
    cached = news_cache.get("news_summary")
    if cached:
        return cached

    from collector import av_news_sentiment
    news = av_news_sentiment()
    if not news:
        return "뉴스 데이터를 가져올 수 없습니다. 잠시 후 다시 시도해주세요."

    news_text = "\n".join([
        f"- [{item['sentiment']}] {item['title']} ({item['source']})"
        for item in news[:6]
    ])

    prompt = f"""You are a Korean financial news summarizer for retail investors.
Summarize these Wall Street news headlines in Korean for Korean retail investors.
Use emojis. Keep each summary to 1-2 sentences. Include sentiment label.
Write in friendly, clear Korean. MAX 600 chars total.

Format:
[header with date/market context]
[5 news items with emoji + one-line Korean summary + sentiment icon]
[overall market mood in 1 line]

News headlines:
{news_text}"""

    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    msg = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=700,
        messages=[{"role": "user", "content": prompt}],
    )
    result = msg.content[0].text
    news_cache.set("news_summary", result)
    return result


def analyze_portfolio(tickers: list[str]) -> str:
    """관심종목 포트폴리오 AI 진단"""
    if not tickers:
        return "관심종목이 없습니다. /watchlist add NVDA 로 추가해주세요."

    quotes = []
    for t in tickers[:8]:  # max 8
        q = fetch_quote(t)
        if q:
            quotes.append(q)

    if not quotes:
        return "종목 데이터 조회에 실패했습니다. 잠시 후 다시 시도해주세요."

    lines = []
    for q in quotes:
        lines.append(
            f"- {q['ticker']}: ${q['price']:.2f} ({'+' if q['change_pct']>=0 else ''}{q['change_pct']:.2f}%)"
        )
    portfolio_text = "\n".join(lines)

    prompt = f"""You are a portfolio advisor for Korean retail investors.
Analyze this watchlist portfolio and give actionable Korean-language advice.
Be concise, friendly, use emojis. MAX 500 chars.

Watchlist holdings:
{portfolio_text}

Format:
[portfolio summary line]
[overall performance assessment]
[1-2 standout observations: best/worst performer, concentration risk]
[1 actionable tip]
[disclaimer in 1 line]"""

    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    msg = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=700,
        messages=[{"role": "user", "content": prompt}],
    )
    return msg.content[0].text
