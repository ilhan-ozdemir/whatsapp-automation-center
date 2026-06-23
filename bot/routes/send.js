import { Router } from "express";
import client from "../services/whatsapp.js";

const router = Router();

router.post("/send-message", async (req, res) => {

    try {

        const {

            chatId,

            message

        } = req.body;

        if (!chatId || !message) {

            return res.status(400).json({

                success: false,

                error: "chatId and message are required"

            });

        }

        await client.sendMessage(chatId, message);

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
