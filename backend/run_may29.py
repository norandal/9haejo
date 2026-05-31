"""
5월 29일(금) 기준 데이터로 X 스레드 포스팅 테스트
"""

import os
import json
import yfinance as yf
from datetime import datetime
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"), override=True)

from summarizer import summarize
from telegram_poster import post_summary


def get_change_on_date(ticker_symbol: str, date: str) -> dict:
    """특정 날짜 기준 등락률 (5/28 종가 → 5/29 종가)"""
    try:
        ticker = yf.Ticker(ticker_symbol)
        hist = ticker.history(start="2025-05-27", end="2025-05-30")
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


def collect_may29():
    INDICES = {"S&P500": "^GSPC", "나스닥": "^IXIC", "다우": "^DJI", "VIX": "^VIX"}
    SECTORS = {
        "💾 반도체": "SOXX", "🖥 IT·기술": "XLK", "📱 통신·미디어": "XLC",
        "🚗 자동차·소비": "XLY", "⛽ 에너지·정유": "XLE", "🏦 금융·은행": "XLF",
    }
    BIG_STOCKS = {
        "엔비디아": "NVDA", "애플": "AAPL", "마이크로소프트": "MSFT",
        "테슬라": "TSLA", "아마존": "AMZN", "메타": "META", "알파벳": "GOOGL",
    }
    FX = {"달러/원": "KRW=X", "달러/엔": "JPY=X"}

    print("📡 5/29 데이터 수집 중...")
    data = {
        "timestamp": "2025-05-30T08:00:00",
        "date": "05/29",
        "indices": {k: get_change_on_date(v, "2025-05-29") for k, v in INDICES.items()},
        "sectors": {k: get_change_on_date(v, "2025-05-29") for k, v in SECTORS.items()},
        "big_stocks": {k: get_change_on_date(v, "2025-05-29") for k, v in BIG_STOCKS.items()},
        "fx": {k: get_change_on_date(v, "2025-05-29") for k, v in FX.items()},
        "news": [],
    }
    print("✅ 데이터 수집 완료")
    return data


if __name__ == "__main__":
    # 1. 데이터 수집
    data = collect_may29()
    print(json.dumps(data, ensure_ascii=False, indent=2))

    # 2. Claude 요약
    print("\n🤖 Claude 요약 생성 중...")
    result = summarize(data)

    print("\n=== 생성된 X 스레드 ===\n")
    for i, tweet in enumerate(result["tweets"], 1):
        print(f"--- 트윗 {i} ({len(tweet)}자) ---")
        print(tweet)
        print()

    # 3. 텔레그램 포스팅
    print("\n📨 텔레그램에 발송 중...")
    url = post_summary(result["tweets"])
    print(f"\n🔗 텔레그램 봇: {url}")
