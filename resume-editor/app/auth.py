"""Who is calling.

Two ways in:
- VizuCode users send their VizuCode JWT as `Authorization: Bearer <token>`. It is checked
  with the same secret the VizuCode API signs with (HS256), and each user sees only their
  own resumes.
- The standalone page uses a single account (email + password from the environment),
  remembered with a signed cookie.
"""
import base64
import hashlib
import hmac
import json
import time

from .config import APP_EMAIL, APP_PASSWORD, LOGIN_DAYS, VIZUCODE_JWT_SECRET

COOKIE = "resume_login"
MAX_FAILURES = 5  # per IP
MAX_TOTAL_FAILURES = 50  # across all IPs, since a client can fake its IP behind a proxy
LOCKOUT_SECONDS = 15 * 60

# Changing APP_EMAIL or APP_PASSWORD changes this key, which signs everyone out.
_KEY = hashlib.sha256(f"{APP_EMAIL}\0{APP_PASSWORD}".encode()).digest()
_failures: dict[str, list[float]] = {}


def enabled() -> bool:
    return bool(APP_PASSWORD)


def _sign(expires: int) -> str:
    return hmac.new(_KEY, f"login:{expires}".encode(), hashlib.sha256).hexdigest()


def make_token() -> str:
    expires = int(time.time()) + LOGIN_DAYS * 86400
    return f"{expires}.{_sign(expires)}"


def token_valid(token: str | None) -> bool:
    if not enabled():
        return True
    try:
        expires_s, sig = (token or "").split(".", 1)
        expires = int(expires_s)
    except ValueError:
        return False
    return expires > time.time() and hmac.compare_digest(sig, _sign(expires))


def locked_out(ip: str) -> bool:
    now = time.time()
    for key in list(_failures):
        _failures[key] = [t for t in _failures[key] if now - t < LOCKOUT_SECONDS]
        if not _failures[key]:
            del _failures[key]
    total = sum(len(v) for v in _failures.values())
    return len(_failures.get(ip, [])) >= MAX_FAILURES or total >= MAX_TOTAL_FAILURES


def check_credentials(ip: str, email: str, password: str) -> bool:
    ok = hmac.compare_digest(email.strip().lower().encode(), APP_EMAIL.encode()) & hmac.compare_digest(
        password.encode(), APP_PASSWORD.encode()
    )
    if ok:
        _failures.pop(ip, None)
    else:
        _failures.setdefault(ip, []).append(time.time())
    return ok


def _b64url(part: str) -> bytes:
    return base64.urlsafe_b64decode(part + "=" * (-len(part) % 4))


def vizucode_user(token: str | None) -> str | None:
    """Return the VizuCode user id from a valid HS256 JWT, else None."""
    if not VIZUCODE_JWT_SECRET or not token:
        return None
    try:
        header_b64, payload_b64, sig_b64 = token.split(".")
        header = json.loads(_b64url(header_b64))
        if header.get("alg") != "HS256":
            return None
        expected = hmac.new(VIZUCODE_JWT_SECRET.encode(), f"{header_b64}.{payload_b64}".encode(), hashlib.sha256).digest()
        if not hmac.compare_digest(expected, _b64url(sig_b64)):
            return None
        payload = json.loads(_b64url(payload_b64))
    except (ValueError, json.JSONDecodeError):
        return None
    if not isinstance(payload, dict) or float(payload.get("exp") or 0) < time.time():
        return None
    sub = str(payload.get("sub") or "")
    return sub or None


LOCAL_OWNER = "local"


def request_owner(authorization: str | None, cookie: str | None) -> str | None:
    """Owner key for this request's resumes, or None if not signed in."""
    if authorization and authorization.startswith("Bearer "):
        user = vizucode_user(authorization[len("Bearer "):].strip())
        return f"vz:{user}" if user else None
    return LOCAL_OWNER if token_valid(cookie) else None
