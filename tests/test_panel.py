import base64
import hashlib
import os
import unittest
from unittest.mock import patch

salt = bytes(range(16))
os.environ.update(PANEL_USERNAME="tester", PANEL_PASSWORD_HASH="scrypt:" + salt.hex() + ":" + hashlib.scrypt(b"test-password-long", salt=salt, n=16384, r=8, p=1, dklen=32).hex())
from fastapi.testclient import TestClient
import httpx
from panel.main import app

class PanelTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app, base_url="https://testserver")
        self.auth = {"Authorization": "Basic " + base64.b64encode(b"tester:test-password-long").decode()}

    def test_all_routes_protected(self):
        for path in ["/", "/static/js/app.js", "/api/status", "/docs", "/media/test"]:
            self.assertEqual(self.client.get(path).status_code, 401)

    def test_https_and_bad_password(self):
        self.assertEqual(TestClient(app).get("/", headers=self.auth).status_code, 403)
        self.assertEqual(self.client.get("/", auth=("tester", "wrong")).status_code, 401)

    def test_design_and_assets(self):
        self.assertEqual(self.client.get("/", headers=self.auth).status_code, 200)
        self.assertEqual(self.client.get("/static/js/app.js", headers=self.auth).status_code, 200)

    def test_csrf(self):
        self.assertEqual(self.client.post("/api/send-message", headers={**self.auth, "Origin": "https://evil.test"}, json={}).status_code, 403)
        self.assertEqual(self.client.post("/api/send-file", headers=self.auth, content="x").status_code, 415)

    def test_proxy_routes_and_status(self):
        seen = []
        def handler(request):
            seen.append(request)
            if "/media/" in request.url.path:
                return httpx.Response(200, content=b"fake-media", headers={"content-type": "image/png"})
            return httpx.Response(409, json={"success": False})
        original = httpx.AsyncClient
        with patch("panel.main.httpx.AsyncClient", side_effect=lambda **kw: original(transport=httpx.MockTransport(handler), **kw)):
            for path in ["status", "chats", "messages/chat%40c.us"]:
                self.assertEqual(self.client.get("/api/" + path, headers=self.auth).status_code, 409)
            for path in ["send-message", "send-file"]:
                self.assertEqual(self.client.post("/api/" + path, headers=self.auth, json={"chatId": "fake"}).status_code, 409)
            response = self.client.get("/api/media/fake", headers=self.auth)
            self.assertEqual(response.content, b"fake-media")
            self.assertEqual(response.headers["content-type"], "image/png")
        self.assertTrue(all(r.url.host == "127.0.0.1" for r in seen))

if __name__ == "__main__":
    unittest.main()
