"""Browser-compatible Basic authentication; remote access requires HTTPS."""
import base64
import hashlib
import hmac
import os

from fastapi.responses import JSONResponse

USERNAME = os.environ.get("PANEL_USERNAME", "")
PASSWORD_HASH = os.environ.get("PANEL_PASSWORD_HASH", "")
ALLOW_HTTP = os.environ.get("PANEL_ALLOW_HTTP", "false") == "true"
if not USERNAME or not PASSWORD_HASH:
    raise RuntimeError("PANEL_USERNAME and PANEL_PASSWORD_HASH are required")
try:
    algorithm, salt_hex, digest_hex = PASSWORD_HASH.split(":")
    SALT, DIGEST = bytes.fromhex(salt_hex), bytes.fromhex(digest_hex)
    if algorithm != "scrypt" or len(SALT) != 16 or len(DIGEST) != 32:
        raise ValueError()
except ValueError as exc:
    raise RuntimeError("Invalid PANEL_PASSWORD_HASH; use deploy/password_hash.py") from exc


async def protect(request, call_next):
    if request.url.scheme != "https" and not ALLOW_HTTP:
        return JSONResponse({"error": "HTTPS required"}, status_code=403)
    authenticated = False
    try:
        scheme, token = request.headers.get("authorization", "").split(" ", 1)
        if scheme.lower() == "basic":
            user, password = base64.b64decode(token, validate=True).decode().split(":", 1)
            digest = hashlib.scrypt(password.encode(), salt=SALT, n=16384, r=8, p=1, dklen=32)
            authenticated = hmac.compare_digest(user.encode(), USERNAME.encode()) & hmac.compare_digest(digest, DIGEST)
    except (ValueError, UnicodeError):
        pass
    if not authenticated:
        return JSONResponse({"error": "Authentication required"}, status_code=401,
                            headers={"WWW-Authenticate": 'Basic realm="WAC", charset="UTF-8"'})
    if request.method not in {"GET", "HEAD", "OPTIONS"}:
        origin = request.headers.get("origin")
        # Browser requests must be same-origin JSON; CLI clients can omit Origin.
        if (origin and origin != f"{request.url.scheme}://{request.url.netloc}") or request.headers.get("sec-fetch-site") == "cross-site":
            return JSONResponse({"error": "Cross-origin request rejected"}, status_code=403)
        if request.headers.get("content-type", "").split(";")[0].strip() != "application/json":
            return JSONResponse({"error": "JSON required"}, status_code=415)
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-store"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    return response
