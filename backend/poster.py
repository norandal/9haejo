"""
X(Twitter) 스레드 포스팅 모듈
"""

import os
import tweepy
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"), override=True)


def get_client():
    return tweepy.Client(
        consumer_key=os.getenv("X_API_KEY"),
        consumer_secret=os.getenv("X_API_SECRET"),
        access_token=os.getenv("X_ACCESS_TOKEN"),
        access_token_secret=os.getenv("X_ACCESS_TOKEN_SECRET"),
    )


def post_thread(tweets: list) -> list:
    """트윗 리스트를 스레드로 포스팅, 트윗 ID 리스트 반환"""
    client = get_client()
    tweet_ids = []
    reply_to = None

    for i, text in enumerate(tweets):
        try:
            if reply_to:
                resp = client.create_tweet(text=text, in_reply_to_tweet_id=reply_to)
            else:
                resp = client.create_tweet(text=text)
            tweet_id = resp.data["id"]
            tweet_ids.append(tweet_id)
            reply_to = tweet_id
            print(f"✅ 트윗 {i+1} 발행 완료 (ID: {tweet_id})")
        except Exception as e:
            print(f"❌ 트윗 {i+1} 발행 실패: {e}")

    return tweet_ids


def get_thread_url(tweet_ids: list) -> str:
    """첫 번째 트윗 URL 반환"""
    if not tweet_ids:
        return ""
    return f"https://x.com/i/web/status/{tweet_ids[0]}"


if __name__ == "__main__":
    # 테스트용 더미 트윗
    test_tweets = [
        "🧪 테스트 트윗입니다. (1/2)",
        "🧪 테스트 스레드 연결 확인용입니다. (2/2)",
    ]
    ids = post_thread(test_tweets)
    print("스레드 URL:", get_thread_url(ids))
