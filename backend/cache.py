"""
Simple in-memory TTL cache for API responses.
"""
import time
from typing import Any, Optional


class TTLCache:
    def __init__(self, ttl: int = 60):
        self._store: dict[str, tuple[float, Any]] = {}
        self._ttl = ttl

    def get(self, key: str) -> Optional[Any]:
        entry = self._store.get(key)
        if entry is None:
            return None
        ts, val = entry
        if time.time() - ts > self._ttl:
            del self._store[key]
            return None
        return val

    def set(self, key: str, val: Any):
        self._store[key] = (time.time(), val)

    def clear(self):
        self._store.clear()


# shared instances
quote_cache = TTLCache(ttl=60)   # 1 min for stock quotes
news_cache  = TTLCache(ttl=300)  # 5 min for news
