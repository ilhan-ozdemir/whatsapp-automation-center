import express from "express";
import qrcode from "qrcode-terminal";

import config from "./config.js";
import logger from "./logger.js";

import client from "./services/whatsapp.js";
import { setStatus } from "./services/status.js";
import MessageService from "./services/MessageService.js";

import statusRoutes from "./routes/status.js";
import chatsRoutes from "./routes/chats.js";
import sendRoutes from "./routes/send.js";
import filesRoutes from "./routes/files.js";
import messagesRoutes from "./routes/messages.js";
import mediaRoutes from "./routes/media.js";

const app = express();
const API_PORT = 3001;

app.use(express.json());

logger.info("======================================");
logger.info(config.APP_NAME);
logger.info(`Version : ${config.VERSION}`);
logger.info("Bot Engine Başlatılıyor...");
logger.info("======================================");

setStatus({
    connected: false,
    message: "Bot starting"
});

client.on("qr", qr => {

    logger.info("QR Code oluşturuldu.");

    setStatus({
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

    setStatus({
        connected: true,
        name: info.pushname,
        number: info.wid.user,
        platform: info.platform
    });

});

client.on("message_create", async message => {

    await MessageService.save(message);

});

client.on("auth_failure", msg => {

    logger.error(`Auth Failure: ${msg}`);

    setStatus({
        connected: false,
        message: msg
    });

});

client.on("disconnected", reason => {

    logger.warn(`Disconnected: ${reason}`);

    setStatus({
        connected: false,
        message: reason
    });

});

app.use(statusRoutes);
app.use(chatsRoutes);
app.use(sendRoutes);
app.use(filesRoutes);
app.use(messagesRoutes);
app.use(mediaRoutes);

app.listen(API_PORT, "0.0.0.0", () => {

    logger.info(`REST API listening on port ${API_PORT}`);

});

client.initialize();
