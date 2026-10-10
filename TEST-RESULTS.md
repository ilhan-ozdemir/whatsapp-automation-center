# Yerel test sonuçları

- Yapılandırma: 2 Node testi geçti (localhost varsayılanları, ortam değişkenleri).
- Panel: 5 test geçti (tüm yolların korunması, HTTPS, yanlış parola, tasarım/statik dosyalar, CSRF, taklit bot API ve medya yanıtları/durum kodları).
- SQLite: Python sqlite3 ile mevcut şemanın kurulumu, tekrar uygulanması, WAL ve dosyanın yeniden açılmasında veri kalıcılığı testi geçti.
- Tüm uygulama JavaScript dosyaları node --check, Python compileall ve git diff --check geçti.
- systemd-analyze verify: panelin hedef /home/wac/.../.venv/bin/python dosyası bu çalışma makinesinde bulunmadığı için hata verdi. Hedef VM kurulumundan sonra tekrar doğrulanmalıdır.
- Botun better-sqlite3 yerel modülü doğrulanamadı: bu ortamda npm native kurulum scriptlerini engelliyor. Python SQLite testi Node bağlayıcısının çalışma testinin yerine geçmez.
- Test ortamı Node 26.11.1 / Python 3.14.8; hedef Node 22 / Python 3.12 üzerinde kurulum ve native bağlayıcı kontrolü ayrıca gereklidir.
- npm ci --ignore-scripts mevcut kilit dosyasında 16 güvenlik bulgusu bildirdi (3 orta, 12 yüksek, 1 kritik). Bağımlılık güncellemesi yapılmadı.
- Starlette TestClient, httpx için kullanımdan kaldırma uyarısı verdi; testler başarılı.

Canlı WhatsApp, Chromium, mesaj gönderimi, SSH, servis başlatma ve GitHub push yapılmadı. HTTP istekleri TestClient ve MockTransport içinde kaldı.
