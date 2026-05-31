"""
텔레그램 봇 포스팅 모듈
"""

import os
import httpx
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"), override=True)

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")


def send_message(text: str, parse_mode: str = "HTML") -> dict:
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    resp = httpx.post(url, json={
        "chat_id": CHAT_ID,
        "text": text,
        "parse_mode": parse_mode,
        "disable_web_page_preview": False,
    }, timeout=10)
    return resp.json()


def post_summary(tweets: list) -> str:
    """트윗 리스트를 텔레그램에 순서대로 발송, 첫 메시지 link 반환"""
    msg_ids = []
    for i, text in enumerate(tweets, 1):
        result = send_message(text)
        if result.get("ok"):
            msg_id = result["result"]["message_id"]
            msg_ids.append(msg_id)
            print(f"✅ 메시지 {i} 발송 완료 (ID: {msg_id})")
        else:
            print(f"❌ 메시지 {i} 발송 실패: {result}")

    if msg_ids:
        # 텔레그램 채널/그룹이면 링크 생성, DM이면 앱 링크
        return f"https://t.me/goohaejo_bot"
    return ""


if __name__ == "__main__":
    result = send_message("🧪 9haejo 봇 테스트 메시지입니다!")
    print("발송 결과:", result)
