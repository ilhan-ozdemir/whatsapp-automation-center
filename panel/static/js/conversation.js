import { getMessages } from "./api.js";
import { escapeHtml, formatDate } from "./utils.js";

function renderBody(message){

    switch(message.type){

        case "chat":
            return `
                <div class="message-body">
                    ${escapeHtml(message.body)}
                </div>
            `;

        case "image":
            return `
                <div class="message-media">
                    🖼️ Fotoğraf
                </div>
            `;

        case "video":
            return `
                <div class="message-media">
                    🎥 Video
                </div>
            `;

        case "audio":

            return `
                <div class="message-media">
                    🎤 Ses Kaydı
                </div>
            `;

        case "ptt":

            return `
                <div class="message-media">
                    🎤 Sesli Mesaj
                </div>
            `;

        case "document":

            return `
                <div class="message-media">
                    📄 Belge
                </div>
            `;

        case "sticker":

            return `
                <div class="message-media">
                    😀 Sticker
                </div>
            `;

        default:

            return `
                <div class="message-media">
                    📎 ${message.type}
                </div>
            `;
    }

}

export async function loadConversation(chat){

    document.getElementById("conversationHeader").textContent =
        chat.name;

    const container =
        document.getElementById("messageContainer");

    container.innerHTML="Yükleniyor...";

    const messages=await getMessages(chat.id);

    container.innerHTML="";

    messages.forEach(message=>{

        const div=document.createElement("div");

        div.className =
            message.fromMe
                ? "message out"
                : "message in";

        div.innerHTML=`

            ${renderBody(message)}

            <div class="message-time">

                ${formatDate(message.timestamp)}

            </div>

        `;

        container.appendChild(div);

    });

    container.scrollTop=container.scrollHeight;

}
