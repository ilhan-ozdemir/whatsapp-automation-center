import fs from "fs";
import pkg from "whatsapp-web.js";
import qrcode from "qrcode-terminal";

import config from "./config.js";
import logger from "./logger.js";

const { Client, LocalAuth } = pkg;

const STATUS_FILE = "/storage/status.json";

function writeStatus(data) {
    fs.writeFileSync(
        STATUS_FILE,
        JSON.stringify(data, null, 4),
        "utf8"
    );
}

logger.info("======================================");
logger.info(config.APP_NAME);
logger.info(`Version : ${config.VERSION}`);
logger.info("Bot Engine Başlatılıyor...");
logger.info("======================================");

writeStatus({
    connected: false,
    message: "Bot starting"
});

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: "/storage/session"
    }),
    puppeteer: {
        executablePath: "/usr/bin/chromium",
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage"
        ]
    }
});

client.on("qr", qr => {

    logger.info("QR Code oluşturuldu.");

    writeStatus({
        connected: false,
        message: "Waiting for QR scan"
    });

    qrcode.generate(qr, {
        small: true
    });

});

client.on("authenticated", () => {

    logger.info("Kimlik doğrulandı.");

});

client.on("ready", () => {

    logger.info("WhatsApp bağlandı.");

    const info = client.info;

    writeStatus({
        connected: true,
        name: info.pushname,
        number: info.wid.user,
        platform: info.platform
    });

});

client.on("auth_failure", msg => {

    logger.error(`Auth Failure: ${msg}`);

    writeStatus({
        connected: false,
        message: msg
    });

});

client.on("disconnected", reason => {

    logger.warn(`Disconnected: ${reason}`);

    writeStatus({
        connected: false,
        message: reason
    });

});

client.initialize();
