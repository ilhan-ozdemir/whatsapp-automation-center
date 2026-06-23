import express from "express";
import pkg from "whatsapp-web.js";
import qrcode from "qrcode-terminal";

import config from "./config.js";
import logger from "./logger.js";

const { Client, LocalAuth } = pkg;

const app = express();
const API_PORT = 3001;

let status = {
    connected: false,
    message: "Bot starting"
};

logger.info("======================================");
logger.info(config.APP_NAME);
logger.info(`Version : ${config.VERSION}`);
logger.info("Bot Engine Başlatılıyor...");
logger.info("======================================");

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

    status = {
        connected: false,
        message: "Waiting for QR scan"
    };

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

    status = {
        connected: true,
        name: info.pushname,
        number: info.wid.user,
        platform: info.platform
    };

});

client.on("auth_failure", msg => {

    logger.error(`Auth Failure: ${msg}`);

    status = {
        connected: false,
        message: msg
    };

});

client.on("disconnected", reason => {

    logger.warn(`Disconnected: ${reason}`);

    status = {
        connected: false,
        message: reason
    };

});
app.get("/status", (req, res) => {
    res.json(status);
});

app.listen(API_PORT, "0.0.0.0", () => {
    logger.info(`REST API listening on port ${API_PORT}`);
});

client.initialize();