import express from "express";
import qrcode from "qrcode-terminal";

import config from "./config.js";
import logger from "./logger.js";

import client from "./services/whatsapp.js";
import Forwarder from "./services/forwarder.js";
import { setStatus } from "./services/status.js";

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
    connected:false,
    message:"Bot starting"
});

client.on("qr", qr => {

    logger.info("QR Code oluşturuldu.");

    qrcode.generate(qr,{small:true});

});

client.on("authenticated",()=>{

    logger.info("Kimlik doğrulandı.");

});

client.on("ready",()=>{

    logger.info("WhatsApp bağlandı.");

});

client.on("message_create",async message=>{

    logger.info(
        `[EVENT] from=${message.from} to=${message.to} author=${message.author} fromMe=${message.fromMe} type=${message.type}`
    );

    await Forwarder.handle(client,message);

});

client.on("auth_failure",msg=>{

    logger.error(msg);

});

client.on("disconnected",reason=>{

    logger.warn(reason);

});

app.use(statusRoutes);
app.use(chatsRoutes);
app.use(sendRoutes);
app.use(filesRoutes);
app.use(messagesRoutes);
app.use(mediaRoutes);

app.listen(API_PORT,"0.0.0.0",()=>{

    logger.info(`REST API listening on port ${API_PORT}`);

});

client.initialize();
