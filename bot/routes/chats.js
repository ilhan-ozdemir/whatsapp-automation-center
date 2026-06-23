import { Router } from "express";
import client from "../services/whatsapp.js";

const router = Router();

router.get("/chats", async (req, res) => {

    try {

        const chats = await client.getChats();

        const result = chats.map(chat => {

            let lastMessage = "";

            if (chat.lastMessage) {

                if (chat.lastMessage.body) {

                    lastMessage = chat.lastMessage.body;

                } else if (chat.lastMessage.type) {

                    lastMessage = "📎 " + chat.lastMessage.type;

                }

            }

            return {

                id: chat.id._serialized,

                name: chat.name || chat.formattedTitle || "İsimsiz",

                isGroup: chat.isGroup,

                unreadCount: chat.unreadCount || 0,

                timestamp: chat.timestamp || 0,

                lastMessage,

                lastTime: chat.timestamp
                    ? new Date(chat.timestamp * 1000)
                        .toLocaleTimeString("tr-TR", {
                            hour: "2-digit",
                            minute: "2-digit"
                        })
                    : ""

            };

        });

        result.sort((a, b) => b.timestamp - a.timestamp);

        res.json(result);

    } catch (err) {

        res.status(500).json({

            success: false,

            error: err.message

        });

    }

});

export default router;
