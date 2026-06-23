import { Router } from "express";
import client from "../services/whatsapp.js";

const router = Router();

router.get("/messages/:chatId", async (req, res) => {

    try {

        const chatId = decodeURIComponent(req.params.chatId);

        const chat = await client.getChatById(chatId);

        const messages = await chat.fetchMessages({
            limit: 50
        });

        const result = [];

        for (const message of messages) {

            result.push({

                id: message.id.id,

                fromMe: message.fromMe,

                body: message.body || "",

                type: message.type,

                timestamp: message.timestamp,

                hasMedia: message.hasMedia,

                caption: message.caption || "",

                filename: message.filename || "",

                mimeType: message._data?.mimetype || "",

                filesize: message._data?.size || 0,

                duration: message.duration || 0,

                forwarded: message.forwardingScore > 0,

                isStatus: message.isStatus || false,

                author: message.author || null,

                mediaEndpoint: message.hasMedia
                    ? `/media/${message.id.id}`
                    : null

            });

        }

        res.json(result);

    } catch (err) {

        res.status(500).json({

            success: false,

            error: err.message

        });

    }

});

export default router;
