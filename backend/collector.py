"""
데이터 수집 모듈 v2
- 미국 주요 지수 / 섹터 ETF / 대형주 / 환율
- Alpha Vantage 뉴스 감성 분석
- Fear & Greed Index
"""

import os
import httpx
import logging
import time
from datetime import datetime
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"), override=True)

logger = logging.getLogger(__name__)

AV_KEY = os.getenv("ALPHA_VANTAGE_KEY", "")
AV_BASE = "https://www.alphavantage.co/query"

AV_HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; 9haejo/1.0)",
}

INDICES  = {"S&P500": "^GSPC", "NASDAQ": "^IXIC", "DOW": "^DJI", "VIX": "^VIX"}
SECTORS  = {"SOXX": "SOXX", "XLK": "XLK", "XLC": "XLC", "XLY": "XLY", "XLE": "XLE", "XLF": "XLF"}
BIG_STOCKS = {"NVDA": "NVDA", "AAPL": "AAPL", "MSFT": "MSFT", "TSLA": "TSLA",
              "AMZN": "AMZN", "META": "META", "GOOGL": "GOOGL"}
FX = {"USDKRW": "USD/KRW", "USDJPY": "USD/JPY"}


def av_quote(symbol: str) -> dict:
    """Alpha Vantage GLOBAL_QUOTE"""
    try:
        r = httpx.get(AV_BASE, params={"function": "GLOBAL_QUOTE", "symbol": symbol, "apikey": AV_KEY}, timeout=12)
        q = r.json().get("Global Quote", {})
        if not q or not q.get("05. price"):
            return {}
        return {
            "price": float(q["05. price"]),
            "change_pct": float(q["10. change percent"].replace("%", "")),
            "change": float(q["09. change"]),
            "volume": q.get("06. volume", ""),
            "latest_day": q.get("07. latest trading day", ""),
        }
    except Exception as e:
        logger.warning("av_quote %s error: %s", symbol, e)
        return {}


def av_fx(from_currency: str, to_currency: str) -> dict:
    """Alpha Vantage 환율"""
    try:
        r = httpx.get(AV_BASE, params={
            "function": "CURRENCY_EXCHANGE_RATE",
            "from_currency": from_currency,
            "to_currency": to_currency,
            "apikey": AV_KEY,
        }, timeout=12)
        d = r.json().get("Realtime Currency Exchange Rate", {})
        if not d:
            return {}
        rate = float(d.get("5. Exchange Rate", 0))
        return {"price": round(rate, 2), "change_pct": None}
    except Exception as e:
        logger.warning("av_fx error: %s", e)
        return {}


def collect_news_sentiment() -> list:
    """Alpha Vantage NEWS_SENTIMENT — 미국 증시 관련 뉴스"""
    try:
        r = httpx.get(AV_BASE, params={
            "function": "NEWS_SENTIMENT",
            "topics": "financial_markets,earnings",
            "sort": "LATEST",
            "limit": 8,
            "apikey": AV_KEY,
        }, timeout=15)
        items = r.json().get("feed", [])
        results = []
        for item in items[:6]:
            results.append({
                "title": item.get("title", ""),
                "source": item.get("source", ""),
                "sentiment": item.get("overall_sentiment_label", "Neutral"),
                "score": item.get("overall_sentiment_score", 0),
                "summary": item.get("summary", "")[:200],
                "url": item.get("url", ""),
                "time": item.get("time_published", ""),
            })
        return results
    except Exception as e:
        logger.warning("news_sentiment error: %s", e)
        return []


def collect_fear_greed() -> dict:
    """CNN Fear & Greed Index (공개 API)"""
    try:
        r = httpx.get(
            "https://production.dataviz.cnn.io/index/fearandgreed/graphdata",
            headers={"User-Agent": "Mozilla/5.0", "Referer": "https://edition.cnn.com"},
            timeout=10,
        )
        data = r.json()
        current = data.get("fear_and_greed", {})
        score = current.get("score", 50)
        rating = current.get("rating", "Neutral")
        return {"score": round(score, 1), "rating": rating}
    except Exception as e:
        logger.warning("fear_greed error: %s", e)
        return {"score": None, "rating": "N/A"}


def collect_batch(symbols: dict) -> dict:
    """여러 심볼 순차 수집 (rate limit 방지)"""
    result = {}
    for name, symbol in symbols.items():
        result[name] = av_quote(symbol)
        time.sleep(0.5)  # 분당 5회 제한 대응
    return result


def collect_all() -> dict:
    logger.info("Data collection started")

    indices = collect_batch(INDICES)
    time.sleep(1)
    sectors = collect_batch(SECTORS)
    time.sleep(1)
    big_stocks = collect_batch(BIG_STOCKS)
    time.sleep(1)

    krw = av_fx("USD", "KRW")
    jpy = av_fx("USD", "JPY")
    fx = {"USD/KRW": krw, "USD/JPY": jpy}

    news = collect_news_sentiment()
    fear_greed = collect_fear_greed()

    data = {
        "timestamp": datetime.now().isoformat(),
        "date": datetime.now().strftime("%Y-%m-%d"),
        "date_display": datetime.now().strftime("%m/%d"),
        "indices": indices,
        "sectors": sectors,
        "big_stocks": big_stocks,
        "fx": fx,
        "news": news,
        "fear_greed": fear_greed,
    }
    logger.info("Data collection complete")
    return data


if __name__ == "__main__":
    import json
    d = collect_all()
    print(json.dumps(d, ensure_ascii=False, indent=2))
