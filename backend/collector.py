"""
데이터 수집 모듈
- 미국 주요 지수 (S&P500, 나스닥, 다우)
- 섹터별 ETF 등락
- 대형주 등락
- 환율 (달러/원)
- 주요 뉴스 (NewsAPI)
- 오늘의 경제 지표 일정
"""

import os
import httpx
import yfinance as yf
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"), override=True)

NEWS_API_KEY = os.getenv("NEWS_API_KEY")

# 미국 주요 지수
INDICES = {
    "S&P500": "^GSPC",
    "나스닥": "^IXIC",
    "다우": "^DJI",
    "VIX": "^VIX",
}

# 섹터 ETF
SECTORS = {
    "💾 반도체": "SOXX",
    "🖥 IT·기술": "XLK",
    "📱 통신·미디어": "XLC",
    "🚗 자동차·소비": "XLY",
    "⛽ 에너지·정유": "XLE",
    "🏦 금융·은행": "XLF",
}

# 미국 대형주
BIG_STOCKS = {
    "엔비디아": "NVDA",
    "애플": "AAPL",
    "마이크로소프트": "MSFT",
    "테슬라": "TSLA",
    "아마존": "AMZN",
    "메타": "META",
    "알파벳": "GOOGL",
}

# 환율
FX = {
    "달러/원": "KRW=X",
    "달러/엔": "JPY=X",
}


def get_change(ticker_symbol: str) -> dict:
    """전일 대비 등락률 계산"""
    try:
        ticker = yf.Ticker(ticker_symbol)
        hist = ticker.history(period="2d")
        if len(hist) < 2:
            return {"price": None, "change_pct": None}
        prev_close = hist["Close"].iloc[-2]
        curr_close = hist["Close"].iloc[-1]
        change_pct = ((curr_close - prev_close) / prev_close) * 100
        return {
            "price": round(curr_close, 2),
            "change_pct": round(change_pct, 2),
        }
    except Exception as e:
        return {"price": None, "change_pct": None, "error": str(e)}


def collect_indices() -> dict:
    """미국 주요 지수 수집"""
    result = {}
    for name, symbol in INDICES.items():
        result[name] = get_change(symbol)
    return result


def collect_sectors() -> dict:
    """섹터별 ETF 수집"""
    result = {}
    for name, symbol in SECTORS.items():
        result[name] = get_change(symbol)
    return result


def collect_big_stocks() -> dict:
    """대형주 수집"""
    result = {}
    for name, symbol in BIG_STOCKS.items():
        result[name] = get_change(symbol)
    return result


def collect_fx() -> dict:
    """환율 수집"""
    result = {}
    for name, symbol in FX.items():
        result[name] = get_change(symbol)
    return result


def collect_news() -> list:
    """주요 뉴스 수집 (NewsAPI)"""
    if not NEWS_API_KEY:
        return []
    try:
        url = "https://newsapi.org/v2/top-headlines"
        params = {
            "category": "business",
            "language": "en",
            "pageSize": 5,
            "apiKey": NEWS_API_KEY,
        }
        resp = httpx.get(url, params=params, timeout=10)
        articles = resp.json().get("articles", [])
        return [
            {
                "title": a["title"],
                "url": a["url"],
                "source": a["source"]["name"],
            }
            for a in articles[:5]
        ]
    except Exception as e:
        return []


def collect_all() -> dict:
    """전체 데이터 수집"""
    print("📡 데이터 수집 시작...")
    data = {
        "timestamp": datetime.now().isoformat(),
        "date": datetime.now().strftime("%m/%d"),
        "indices": collect_indices(),
        "sectors": collect_sectors(),
        "big_stocks": collect_big_stocks(),
        "fx": collect_fx(),
        "news": collect_news(),
    }
    print("✅ 데이터 수집 완료")
    return data


if __name__ == "__main__":
    import json
    data = collect_all()
    print(json.dumps(data, ensure_ascii=False, indent=2))
