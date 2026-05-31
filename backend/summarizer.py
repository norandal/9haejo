"""
Claude AI 요약 모듈
수집된 시장 데이터를 X 스레드 포맷으로 요약
"""

import os
import anthropic
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"), override=True)

def get_client():
    return anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))


def format_change(change_pct: float) -> str:
    if change_pct is None:
        return "N/A"
    arrow = "▲" if change_pct >= 0 else "▼"
    return f"{arrow}{abs(change_pct):.2f}%"


def build_data_summary(data: dict) -> str:
    """Claude에 넘길 데이터 요약 텍스트 생성"""
    lines = []

    # 지수
    lines.append("=== 미국 주요 지수 ===")
    for name, d in data["indices"].items():
        if name == "VIX":
            continue
        lines.append(f"{name}: {format_change(d.get('change_pct'))} ({d.get('price', 'N/A')})")
    vix = data["indices"].get("VIX", {})
    lines.append(f"VIX(공포지수): {vix.get('price', 'N/A')} ({format_change(vix.get('change_pct'))})")

    # 섹터
    lines.append("\n=== 섹터별 등락 ===")
    for name, d in data["sectors"].items():
        lines.append(f"{name}: {format_change(d.get('change_pct'))}")

    # 대형주
    lines.append("\n=== 미국 대형주 ===")
    for name, d in data["big_stocks"].items():
        lines.append(f"{name}({d.get('price', 'N/A')}달러): {format_change(d.get('change_pct'))}")

    # 환율
    lines.append("\n=== 환율 ===")
    for name, d in data["fx"].items():
        lines.append(f"{name}: {d.get('price', 'N/A')} ({format_change(d.get('change_pct'))})")

    # 뉴스
    if data.get("news"):
        lines.append("\n=== 주요 뉴스 ===")
        for n in data["news"]:
            lines.append(f"- {n['title']} ({n['source']}) | {n['url']}")

    return "\n".join(lines)


def summarize(data: dict) -> dict:
    """Claude로 시장 요약 생성 → X 스레드 4개 반환"""

    data_text = build_data_summary(data)
    date = data.get("date", "")

    prompt = f"""
당신은 금융 시장 분석 전문가입니다. 아래 미국 시장 데이터를 바탕으로 한국 투자자를 위한 X(트위터) 스레드를 작성해주세요.

[시장 데이터]
{data_text}

[작성 규칙]
- 총 4개의 트윗으로 구성된 스레드
- 각 트윗은 280자(한글 기준 140자) 이내
- 이모지 적극 활용
- 한국어로 작성
- 뉴스에 링크가 있으면 반드시 포함
- 숫자는 정확하게 데이터 그대로 사용

[스레드 구성]
트윗1: 제목 + 지수 + 환율 + 한국 시장 영향 한줄 요약
트윗2: 섹터별 등락 + 주목할 섹터 코멘트
트윗3: 주요 대형주 등락 + 간밤 핵심 이슈/뉴스 (링크 포함)
트윗4: 오늘 주목할 포인트 + 한국 투자자를 위한 한줄 결론

[출력 형식] 반드시 아래 형식으로만 출력하세요:
TWEET1:
(내용)

TWEET2:
(내용)

TWEET3:
(내용)

TWEET4:
(내용)
"""

    message = get_client().messages.create(
        model="claude-opus-4-5",
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}],
    )

    raw = message.content[0].text
    tweets = parse_tweets(raw)

    return {
        "tweets": tweets,
        "raw": raw,
        "date": date,
    }


def parse_tweets(raw: str) -> list:
    """Claude 응답에서 트윗 4개 파싱"""
    tweets = []
    for i in range(1, 5):
        marker = f"TWEET{i}:"
        next_marker = f"TWEET{i+1}:"
        start = raw.find(marker)
        if start == -1:
            continue
        start += len(marker)
        end = raw.find(next_marker) if i < 4 else len(raw)
        tweet = raw[start:end].strip()
        tweets.append(tweet)
    return tweets


if __name__ == "__main__":
    import json
    from collector import collect_all

    data = collect_all()
    result = summarize(data)

    print("\n=== 생성된 X 스레드 ===\n")
    for i, tweet in enumerate(result["tweets"], 1):
        print(f"--- 트윗 {i} ---")
        print(tweet)
        print(f"(길이: {len(tweet)}자)\n")
