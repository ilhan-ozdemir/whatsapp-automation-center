import express from "express";
import pkg from "whatsapp-web.js";
import qrcode from "qrcode-terminal";

import config from "./config.js";
import logger from "./logger.js";

const { Client, LocalAuth, MessageMedia } = pkg;

const app = express();
const API_PORT = 3001;

app.use(express.json());

let status = {
    connected: false,
    message: "Bot starting"
};

logger.info("======================================");
logger.info(config.APP_NAME);
logger.info(`Version : ${config.VERSION}`);
logger.info("Bot Engine Başlatılıyor...");
logger.info("======================================");

function getChatId(number) {
    return number.replace(/\D/g, "") + "@c.us";
}

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

app.post("/send-message", async (req, res) => {

    try {

        const { number, message } = req.body;

        if (!number || !message) {
            return res.status(400).json({
                success: false,
                error: "number and message are required"
            });
        }

        await client.sendMessage(
            getChatId(number),
            message
        );

        return res.json({
            success: true
        });

    } catch (err) {

        logger.error(err);

        return res.status(500).json({
            success: false,
            error: err.message
        });

    }

});

app.post("/send-file", async (req, res) => {

    try {

        const {
            number,
            path,
            caption = ""
        } = req.body;

        if (!number || !path) {
            return res.status(400).json({
                success: false,
                error: "number and path are required"
            });
        }

        const media = MessageMedia.fromFilePath(path);

        await client.sendMessage(
            getChatId(number),
            media,
            {
                caption
            }
        );

        return res.json({
            success: true
        });

    } catch (err) {

        logger.error(err);

        return res.status(500).json({
            success: false,
            error: err.message
        });

    }

});

app.listen(API_PORT, "0.0.0.0", () => {
    logger.info(`REST API listening on port ${API_PORT}`);
});

client.initialize();