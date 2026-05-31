"""
AI 브리핑 요약 모듈 v2
5-파트 구조화 브리핑: 시장요약 / 섹터 / 주목종목 / 한국영향 / 내일전망
"""

import os
import logging
import anthropic
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"), override=True)

logger = logging.getLogger(__name__)


def get_client():
    return anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))


def fmt_pct(val):
    if val is None:
        return "N/A"
    arrow = "+" if val >= 0 else ""
    return f"{arrow}{val:.2f}%"


def summarize(data: dict) -> dict:
    indices = data.get("indices", {})
    sectors = data.get("sectors", {})
    stocks  = data.get("big_stocks", {})
    fx      = data.get("fx", {})
    news    = data.get("news", [])
    fg      = data.get("fear_greed", {})
    date    = data.get("date_display", data.get("date", ""))

    idx_lines = "\n".join(
        f"  {k}: {fmt_pct(v.get('change_pct'))} (${v.get('price','N/A')})"
        for k, v in indices.items()
    )
    sec_lines = "\n".join(
        f"  {k}: {fmt_pct(v.get('change_pct'))}"
        for k, v in sectors.items()
    )
    stk_lines = "\n".join(
        f"  {k}: {fmt_pct(v.get('change_pct'))} @ ${v.get('price','N/A')}"
        for k, v in stocks.items()
    )
    krw = fx.get("USD/KRW", {}).get("price", "N/A")
    jpy = fx.get("USD/JPY", {}).get("price", "N/A")
    news_text = "\n".join(
        f"  [{n.get('sentiment','?')}] {n.get('title','')[:80]}"
        for n in news[:5]
    )
    fg_score = fg.get("score", "N/A")
    fg_label = fg.get("rating", "N/A")

    prompt = f"""You are a financial analyst writing a daily market briefing for Korean retail investors.
Date: {date}

MARKET DATA:
Indices:
{idx_lines}

Sectors (ETF change%):
{sec_lines}

Key US Stocks:
{stk_lines}

FX: USD/KRW={krw} won, USD/JPY={jpy}
Fear & Greed Index: {fg_score} ({fg_label})

News:
{news_text}

Write EXACTLY 5 Telegram messages in Korean. Each is standalone. Use emojis and actual numbers.
Separate each message with exactly: ---

[1/5] Market Summary: Indices, overall direction, Fear&Greed
[2/5] Sector Analysis: Best/worst ETF sectors, implications
[3/5] Key Stocks: Notable movers with prices and % changes
[4/5] Korea Impact: USD/KRW effect, which Korean stocks (Samsung/Hynix/etc) are affected
[5/5] Tomorrow Outlook: What to watch, specific actionable advice for Korean investors

Keep each message under 280 characters."""

    client = get_client()
    msg = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=2500,
        messages=[{"role": "user", "content": prompt}],
    )
    raw = msg.content[0].text
    tweets = [t.strip() for t in raw.split("---") if t.strip()][:5]
    while len(tweets) < 5:
        tweets.append(f"[{len(tweets)+1}/5] 분석 중...")

    return {"tweets": tweets, "raw": raw, "date": date}


if __name__ == "__main__":
    from collector import collect_all
    data = collect_all()
    result = summarize(data)
    for i, t in enumerate(result["tweets"], 1):
        print(f"\n--- {i} ---\n{t}")
