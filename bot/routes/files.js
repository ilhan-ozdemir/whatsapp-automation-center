import { Router } from "express";
import pkg from "whatsapp-web.js";
import client from "../services/whatsapp.js";

const { MessageMedia } = pkg;

const router = Router();

router.post("/send-file", async (req, res) => {

    try {

        const {

            chatId,

            path,

            caption = ""

        } = req.body;

        if (!chatId || !path) {

            return res.status(400).json({

                success: false,

                error: "chatId and path are required"

            });

        }

        const media = MessageMedia.fromFilePath(path);

        await client.sendMessage(chatId, media, {

            caption

        });

        res.json({

            success: true

        });

    } catch (err) {

        res.status(500).json({

            success: false,

            error: err.message

        });

    }

});

export default router;
