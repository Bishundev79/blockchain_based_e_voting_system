from __future__ import annotations

from collections import defaultdict, deque
from threading import Lock
from time import time

from fastapi import HTTPException, Request, status


class InMemoryRateLimiter:
    """Simple per-key fixed-window rate limiter for low-scale API protection.

    This limiter is process-local and intended for development / single-instance
    deployments. For multi-instance production, replace with Redis-backed limits.
    """

    def __init__(self) -> None:
        self._hits: dict[str, deque[float]] = defaultdict(deque)
        self._lock = Lock()

    def check(self, key: str, *, max_requests: int, window_seconds: int) -> None:
        now = time()
        window_start = now - window_seconds

        with self._lock:
            queue = self._hits[key]
            while queue and queue[0] < window_start:
                queue.popleft()

            if len(queue) >= max_requests:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many requests. Please try again later.",
                )

            queue.append(now)


_rate_limiter = InMemoryRateLimiter()


def limit_by_ip(*, max_requests: int, window_seconds: int):
    def dependency(request: Request) -> None:
        host = request.client.host if request.client else "unknown"
        key = f"{request.url.path}:{host}"
        _rate_limiter.check(key, max_requests=max_requests, window_seconds=window_seconds)

    return dependency
