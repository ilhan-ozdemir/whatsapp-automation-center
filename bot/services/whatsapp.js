import config from "../config.js";
import pkg from "whatsapp-web.js";

const { Client, LocalAuth } = pkg;

const client = new Client({

    authStrategy: new LocalAuth({

        clientId: "default",

        dataPath: config.SESSION_PATH

    }),

    webVersionCache: { type: "local", path: config.CACHE_PATH },

    puppeteer: {

        executablePath: config.CHROMIUM_PATH,

        headless: true,

        args: [

            ...(config.CHROMIUM_NO_SANDBOX ? ["--no-sandbox", "--disable-setuid-sandbox"] : []),

            "--disable-dev-shm-usage",

            "--disable-gpu",

            "--no-first-run",

            "--no-default-browser-check"

        ]

    }

});

export default client;
