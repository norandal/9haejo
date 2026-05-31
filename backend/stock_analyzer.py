"""
종목 분석 모듈
회사명 또는 티커 입력 → Claude AI 분석 리포트 생성
yfinance 429 대응: yf.download() 우선 사용, 실패 시 Claude 단독 분석
"""

import os
import time
import logging
import yfinance as yf
import anthropic
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"), override=True)

logger = logging.getLogger(__name__)

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
    "팔란티어": "PLTR", "암": "ARM", "브로드컴": "AVGO",
}


def resolve_ticker(query: str) -> str:
    q = query.strip().lower()
    for kr, ticker in KR_TO_TICKER.items():
        if kr in q:
            return ticker
    upper = query.strip().upper()
    # 영문 티커 (최대 6자 — .KS 등 포함)
    if all(c.isalpha() or c == "." for c in upper) and len(upper) <= 10:
        return upper
    return None


def get_stock_data(ticker: str) -> dict | None:
    """
    yf.download()로 가격 데이터 수집 (429에 강함).
    stock.info는 선택적으로 시도.
    """
    for attempt in range(3):
        try:
            df = yf.download(ticker, period="5d", progress=False, auto_adjust=True)
            if df.empty:
                return None

            close = df["Close"]
            curr = float(close.iloc[-1])
            prev = float(close.iloc[-2]) if len(close) > 1 else curr
            change_pct = (curr - prev) / prev * 100

            # info는 실패해도 괜찮음
            info = {}
            try:
                info = yf.Ticker(ticker).fast_info  # fast_info는 429가 적음
                info = {
                    "longName": getattr(info, "name", ticker),
                    "fiftyTwoWeekHigh": getattr(info, "fifty_two_week_high", None),
                    "fiftyTwoWeekLow": getattr(info, "fifty_two_week_low", None),
                }
            except Exception:
                pass

            return {
                "ticker": ticker,
                "name": info.get("longName") or ticker,
                "price": round(curr, 2),
                "change_pct": round(change_pct, 2),
                "52w_high": info.get("fiftyTwoWeekHigh"),
                "52w_low": info.get("fiftyTwoWeekLow"),
            }

        except Exception as e:
            logger.warning(f"get_stock_data attempt {attempt+1} failed: {e}")
            if attempt < 2:
                time.sleep(4)
    return None


def analyze_stock(query: str) -> str:
    ticker = resolve_ticker(query)
    if not ticker:
        return f"❌ '{query}'에 해당하는 종목을 찾을 수 없어요.\n\n예시: NVDA, 삼성전자, 테슬라"

    data = get_stock_data(ticker)
    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

    if data:
        arrow = "▲" if data["change_pct"] >= 0 else "▼"
        prompt = f"""한국 개인 투자자를 위한 종목 분석 리포트를 텔레그램 메시지 형식으로 작성하세요.
이모지 활용, 300자 이내, 투자 권유 아님 명시.

종목 데이터:
- 종목: {data['name']} ({data['ticker']})
- 현재가: ${data['price']} ({arrow}{abs(data['change_pct']):.2f}%)
- 52주 고가: {data['52w_high']}
- 52주 저가: {data['52w_low']}

형식:
⚡ [종목명] ([티커]) 분석
(현재 주가 현황 1~2줄)
(핵심 투자 포인트 1~2줄)
⚠️ 본 정보는 투자 권유가 아닙니다."""
    else:
        # 실시간 데이터 없이 Claude 지식 기반 분석
        logger.warning(f"실시간 데이터 없음 — Claude 지식 기반 분석: {ticker}")
        prompt = f"""한국 개인 투자자를 위해 {ticker} 종목에 대한 분석 리포트를 작성하세요.
실시간 데이터는 없지만 알려진 정보와 최근 동향을 바탕으로 작성하세요.
텔레그램 메시지 형식, 이모지 활용, 300자 이내, 투자 권유 아님 명시.

형식:
⚡ [종목명] ([티커]) 분석
(회사 개요 및 최근 동향 2줄)
(핵심 투자 포인트 1~2줄)
⚠️ 본 정보는 투자 권유가 아닙니다. (실시간 데이터 미반영)"""

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
