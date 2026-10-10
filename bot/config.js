import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(process.env.WAC_ROOT || fileURLToPath(new URL("../", import.meta.url)));
const resolve = (value, fallback) => path.resolve(root, value || fallback);
const port = Number(process.env.BOT_PORT || 3001);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid BOT_PORT");

export default {
    APP_NAME: "WhatsApp Automation Center",
    VERSION: "0.1.0",
    LOG_LEVEL: process.env.LOG_LEVEL || "info",
    ROOT: root,
    DATABASE_PATH: resolve(process.env.DATABASE_PATH, "database/app.db"),
    SESSION_PATH: resolve(process.env.SESSION_PATH, "storage/session"),
    UPLOADS_PATH: resolve(process.env.UPLOADS_PATH, "storage/uploads"),
    CACHE_PATH: resolve(process.env.CACHE_PATH, "storage/web-cache"),
    CHROMIUM_PATH: process.env.CHROMIUM_PATH || "/snap/bin/chromium",
    CHROMIUM_NO_SANDBOX: process.env.CHROMIUM_NO_SANDBOX === "true",
    BOT_HOST: process.env.BOT_HOST || "127.0.0.1",
    BOT_PORT: port
};
