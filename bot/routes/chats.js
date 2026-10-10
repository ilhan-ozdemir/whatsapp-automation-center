import { Router } from "express";
import client from "../services/whatsapp.js";

const router = Router();

// Temporary diagnostics: never log chats, client state, or raw error objects.
function logChatsError(stage, err) {
    const name = /^(Error|TypeError|ReferenceError|RangeError|SyntaxError|TimeoutError)$/.test(err?.name)
        ? err.name : "Error";
    const rawMessage = typeof err?.message === "string" ? err.message : "";
    // Unknown messages can contain chat content or credentials; redact by default.
    const message = /^(?:Evaluation failed: )?r$/.test(rawMessage)
        ? rawMessage
        : /^Cannot read properties of (undefined|null) \(reading '[A-Za-z_$][\w$]*'\)$/.test(rawMessage)
            ? rawMessage : "[redacted error message]";
    // Keep source locations only; omit exception text, arguments, URLs and state.
    const stack = typeof err?.stack === "string"
        ? err.stack.split("\n").slice(1).map(line => {
            const location = line.match(/(?:\(|\s)((?:\/|file:\/\/\/)[\w./@-]+:\d+:\d+)\)?$/);
            return location ? "    at " + location[1]
                .replace(/\d{6,}/g, "[redacted]")
                .replace(/(?:session|auth|token)[^/\s:]*/gi, "[redacted]") : null;
        }).filter(Boolean).join("\n")
        : "";
    console.error(`[chats diagnostic] ${stage} failed`, { name, message, stack });
}

router.get("/chats", async (req, res) => {

    let stage = "getChats";

    try {

        console.info("[chats diagnostic] getChats started");
        const chats = await client.getChats();
        console.info("[chats diagnostic] getChats completed");

        stage = "map";
        console.info("[chats diagnostic] map started");
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
        console.info("[chats diagnostic] map completed");

        stage = "response";
        result.sort((a, b) => b.timestamp - a.timestamp);

        res.json(result);

    } catch (err) {

        logChatsError(stage, err);
        res.status(500).json({

            success: false,

            error: err.message

        });

    }

});

export default router;
