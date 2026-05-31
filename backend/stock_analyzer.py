"""
종목 분석 모듈
회사명 또는 티커 입력 → Claude AI 분석 리포트 생성
"""

import os
import yfinance as yf
import anthropic
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"), override=True)

# 한국어 회사명 → 티커 매핑
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
}

def resolve_ticker(query: str) -> str:
    """쿼리에서 티커 추출"""
    q = query.strip().lower()
    # 한국어 매핑
    for kr, ticker in KR_TO_TICKER.items():
        if kr in q:
            return ticker
    # 대문자 티커 직접 입력 (NVDA, AAPL 등)
    upper = query.strip().upper()
    if upper.isalpha() and len(upper) <= 5:
        return upper
    return None


def get_stock_data(ticker: str) -> dict:
    """yfinance로 종목 데이터 수집"""
    try:
        stock = yf.Ticker(ticker)
        info = stock.info
        hist = stock.history(period="5d")

        if hist.empty:
            return None

        curr = hist["Close"].iloc[-1]
        prev = hist["Close"].iloc[-2] if len(hist) > 1 else curr
        change_pct = ((curr - prev) / prev) * 100

        return {
            "ticker": ticker,
            "name": info.get("longName") or info.get("shortName", ticker),
            "price": round(curr, 2),
            "change_pct": round(change_pct, 2),
            "market_cap": info.get("marketCap"),
            "pe_ratio": info.get("trailingPE"),
            "52w_high": info.get("fiftyTwoWeekHigh"),
            "52w_low": info.get("fiftyTwoWeekLow"),
            "sector": info.get("sector", "N/A"),
            "summary": info.get("longBusinessSummary", "")[:300],
        }
    except Exception as e:
        return None


def analyze_stock(query: str) -> str:
    """종목 분석 리포트 생성"""
    ticker = resolve_ticker(query)
    if not ticker:
        return f"❌ '{query}'에 해당하는 종목을 찾을 수 없어요.\n\n예시: NVDA, 삼성전자, 테슬라"

    data = get_stock_data(ticker)
    if not data:
        return f"❌ {ticker} 데이터를 가져올 수 없어요. 티커를 확인해주세요."

    change_arrow = "▲" if data["change_pct"] >= 0 else "▼"
    change_color_word = "상승" if data["change_pct"] >= 0 else "하락"

    # Claude로 분석
    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    prompt = f"""
아래 종목 데이터를 바탕으로 한국 개인 투자자를 위한 간결한 분석 리포트를 작성하세요.
텔레그램 메시지 형식으로, 280자 이내로, 이모지를 활용해 가독성 있게 작성하세요.
투자 권유가 아닌 정보 제공임을 명시하세요.

종목 데이터:
- 이름: {data['name']} ({data['ticker']})
- 현재가: {data['price']} ({change_arrow}{abs(data['change_pct'])}% {change_color_word})
- 52주 고가: {data['52w_high']}
- 52주 저가: {data['52w_low']}
- PER: {data['pe_ratio']}
- 섹터: {data['sector']}
- 사업요약: {data['summary']}

형식:
⚡ [종목명] ([티커]) 분석
(핵심 현황 2~3줄)
(투자 포인트 1~2줄)
⚠️ 본 정보는 투자 권유가 아닙니다.
"""
    msg = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=400,
        messages=[{"role": "user", "content": prompt}],
    )
    return msg.content[0].text


if __name__ == "__main__":
    queries = ["NVDA", "삼성전자", "테슬라"]
    for q in queries:
        print(f"\n=== {q} ===")
        print(analyze_stock(q))
