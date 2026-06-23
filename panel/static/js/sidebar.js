import { getChats } from "./api.js";

let currentChat = null;

function avatar(chat){

    if(chat.isGroup)
        return "👥";

    if(chat.name && chat.name.length)
        return chat.name[0].toUpperCase();

    return "👤";

}

function preview(chat){

    if(chat.lastMessage)
        return chat.lastMessage;

    return chat.isGroup
        ? "Grup"
        : "Kişi";

}

export async function loadSidebar(onSelect){

    const container =
        document.getElementById("chatList");

    container.innerHTML =
        '<div class="loading">Yükleniyor...</div>';

    const chats =
        await getChats();

    container.innerHTML="";

    chats.forEach(chat=>{

        const item=document.createElement("div");

        item.className="chat-item";

        item.innerHTML=`

            <div class="chat-avatar">

                ${avatar(chat)}

            </div>

            <div class="chat-info">

                <div class="chat-top">

                    <div class="chat-name">

                        ${chat.name}

                    </div>

                    <div class="chat-time">

                        ${chat.lastTime ?? ""}

                    </div>

                </div>

                <div class="chat-bottom">

                    <div class="chat-preview">

                        ${preview(chat)}

                    </div>

                    <div class="chat-badge">

                        ${chat.unreadCount>0 ? chat.unreadCount : ""}

                    </div>

                </div>

            </div>

        `;

        item.onclick=()=>{

            document
                .querySelectorAll(".chat-item")
                .forEach(x=>x.classList.remove("active"));

            item.classList.add("active");

            currentChat=chat;

            onSelect(chat);

        };

        container.appendChild(item);

    });

}
