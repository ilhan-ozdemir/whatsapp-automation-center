# Ubuntu 24.04: Docker olmadan kurulum

Hedef: 192.168.122.6; Node.js 22, Python 3.12, Chromium Snap 155.
Bu dosyadaki komutlar VM üzerinde yönetici tarafından uygulanır. Hazırlık sırasında
bot servisini başlatmayın: başlatmak canlı WhatsApp istemcisini açar.

## Hazırlık

```sh
sudo apt install python3.12-venv build-essential python3-dev openssl
sudo adduser --disabled-password --gecos '' wac
```
Projenin tamamını `/home/wac/whatsapp-automation-center` dizinine yerleştirin.
Mevcut verileri silmeyin. Servislerde `/usr/bin/node` kullanılır; Node 22 başka
konumdaysa ExecStart yolunu düzeltin (NVM shell başlangıcı systemd'de çalışmaz).

```sh
sudo chown -R wac:wac /home/wac/whatsapp-automation-center
sudo -u wac -H sh -c 'cd /home/wac/whatsapp-automation-center/bot && PUPPETEER_SKIP_DOWNLOAD=true npm ci'
sudo -u wac -H python3.12 -m venv /home/wac/whatsapp-automation-center/.venv
sudo -u wac -H /home/wac/whatsapp-automation-center/.venv/bin/pip install -r /home/wac/whatsapp-automation-center/panel/requirements.txt
sudo -u wac mkdir -p /home/wac/snap/chromium/common/wac-session
sudo install -d -m 750 -o root -g wac /etc/wac
sudo install -m 640 -o root -g wac deploy/wac.env.example /etc/wac/wac.env
python3 deploy/password_hash.py
sudoedit /etc/wac/wac.env
```
Son komutun ürettiği `scrypt:...` değerini PANEL_PASSWORD_HASH alanına yazın;
PANEL_USERNAME değerini belirleyin. Parola düz metin saklanmaz, varsayılan parola
ve anonim erişim yoktur. Tarayıcı kendi giriş penceresini gösterir; tasarım korunur.
Basic kimlik doğrulama her istekte parola taşıdığından HTTPS zorunludur.
PANEL_ALLOW_HTTP yalnızca yerel geliştirmede bilinçli olarak `true` yapılabilir.

## Chromium ve kalıcı veriler

Varsayılan yollar proje köküne göredir ve çalışma dizininden etkilenmez.
WAC_ROOT, DATABASE_PATH (dosya), SESSION_PATH, UPLOADS_PATH, CACHE_PATH ile değiştirilebilir.
Chromium CHROMIUM_PATH ile seçilir; örnek `/snap/bin/chromium` kullanır.
Snap için oturum `/home/wac/snap/chromium/common/wac-session` altında kalır.
Snap'in ev dizini erişim kısıtları nedeniyle gizli veya `/opt` altındaki bir
profil yolunu kullanmayın. Bkz. https://ubuntu.com/blog/hey-snap-wheres-my-data

Mevcut Docker oturumunu taşırken servisler durmuş olmalıdır: eski
`storage/session/` içeriğini (özellikle `session-default` alt dizinini) SESSION_PATH
altına kopyalayın ve wac kullanıcısına verin. Eski `bot/database/app.db` dosyası varsa
DATABASE_PATH konumuna taşıyın; ana `database/app.db` varsa hangi dosyanın gerçek
veriyi içerdiğini kontrol edin, birinin üzerine diğerini yazmayın. WAL/SHM dosyalarını
aktif veritabanından ayırmayın; durmuş servislerden tam dizin yedeği alın.
Eski storage/uploads içeriğini koruyun. Oturum ve DB servis yeniden başlatmalarında
silinmez; aynı profil ile iki Chromium/bot süreci çalıştırmayın.

Chromium sandbox varsayılan olarak açıktır. Snap servisinde ProtectHome,
PrivateTmp veya NoNewPrivileges eklemeyin; Snap'in namespace/sandbox başlatmasını
engelleyebilir. CHROMIUM_NO_SANDBOX=true sadece sandbox sorunu teşhis edilip
risk kabul edilirse kullanılmalıdır. Chromium 155/whatsapp-web.js eşleşmesi canlı
oturum açılmadan doğrulanamaz; kurulum testleri bu uyumluluğu garanti etmez.

## HTTPS ve systemd

Kurumsal CA tarafından imzalanmış, IP SAN `192.168.122.6` içeren sertifikayı tercih
edin. Yerel laboratuvar için aşağıdaki sertifika oluşturulabilir; istemcide güvenilir
olarak yükleyin, tarayıcı sertifika uyarısını kalıcı çözüm olarak geçmeyin.

```sh
sudo openssl req -x509 -newkey rsa:3072 -sha256 -days 365 -nodes -keyout /etc/wac/tls.key -out /etc/wac/tls.crt -subj '/CN=192.168.122.6' -addext 'subjectAltName=IP:192.168.122.6'
sudo chown root:wac /etc/wac/tls.key /etc/wac/tls.crt
sudo chmod 640 /etc/wac/tls.key /etc/wac/tls.crt
sudo install -m 644 deploy/systemd/wac-bot.service deploy/systemd/wac-panel.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemd-analyze verify /etc/systemd/system/wac-bot.service /etc/systemd/system/wac-panel.service
```
Servis dosyalarını farklı kullanıcı/dizin için uyarlayın. Bot yalnızca
127.0.0.1:3001 dinler; panel bu adrese bağlanır. Yerel makine kullanıcıları bot
API'sine ulaşabildiğinden VM hesabı güvenilir kullanıcılara ayrılmalıdır.
Panel HTTPS ile 0.0.0.0:8090 dinler. Firewall'da 8090 erişimini güvenilir yönetici
IP'leriyle sınırlayın; 3001 portunu açmayın. Harici proxy kullanılmadığı için
forwarded header'lar güvenilmez. `/static`, `/docs`, API ve medya da giriş gerektirir;
yazma istekleri same-origin JSON ile sınırlıdır.

Yalnızca paneli kontrol etmek canlı oturum açmaz:

```sh
sudo systemctl start wac-panel
sudo journalctl -u wac-panel -n 50
```
Adres: `https://192.168.122.6:8090`. Bot kapalıyken panelin bot verisi sorguları hata
verebilir. Canlı kullanım ayrıca onaylandıktan sonra yönetici
`sudo systemctl enable --now wac-bot wac-panel` komutunu çalıştırabilir;
QR kod journalctl -u wac-bot çıktısında görülür. Bu hazırlıkta çalıştırılmamıştır.
Durdurma: `sudo systemctl stop wac-bot wac-panel`.
Yedek: her iki servisi durdurun, DB dizini, SESSION_PATH, UPLOADS_PATH ve
/etc/wac dosyalarını izinleri korunarak güvenli bir konuma kopyalayın; sonra
önceden çalışan servisleri başlatın. Oturum yedeklerini gizli tutun.

## Bağımsız doğrulama

```sh
node tests/config.test.mjs
.venv/bin/python -m unittest discover -s tests -p 'test_*.py' -v
python3.12 -m compileall -q panel deploy tests
find bot -path '*/node_modules' -prune -o -name '*.js' -exec node --check {} \;
git diff --check
```
Panel testleri HTTPS TestClient ve taklit bot yanıtları kullanır. WhatsApp
istemcisi import edilmez, Chromium açılmaz, mesaj gönderilmez. Mevcut sohbet,
mesaj ve dosya API'leri korunur; bot HTTP durum kodları panelden aktarılır ve
medya için `/api/media/{id}` ile `/media/{id}` köprüleri eklenmiştir. Mevcut
arayüzdeki ek dosya düğmesi zaten yer tutucudur; bu kurulum bunu değiştirmez.
