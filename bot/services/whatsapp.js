import pkg from "whatsapp-web.js";

const { Client, LocalAuth } = pkg;

const client = new Client({

    authStrategy: new LocalAuth({

        clientId: "default",

        dataPath: "/storage/session"

    }),

    puppeteer: {

        executablePath: "/usr/bin/chromium",

        headless: true,

        args: [

            "--no-sandbox",

            "--disable-setuid-sandbox",

            "--disable-dev-shm-usage",

            "--disable-gpu",

            "--no-first-run",

            "--no-default-browser-check"

        ]

    }

});

export default client;
