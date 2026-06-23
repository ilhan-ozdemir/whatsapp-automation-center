import { loadStatus } from "./status.js";
import { loadSidebar } from "./sidebar.js";
import { loadConversation } from "./conversation.js";
import { initComposer, setCurrentChat } from "./composer.js";
import { initUpload } from "./upload.js";

async function start() {

    await loadStatus();

    await loadSidebar(async chat => {

        setCurrentChat(chat);

        await loadConversation(chat);

    });

    initComposer();

    initUpload();

    setInterval(loadStatus, 5000);

}

start();
