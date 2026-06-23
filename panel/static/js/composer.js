import { sendMessage } from "./api.js";

let currentChat = null;

export function setCurrentChat(chat) {

    currentChat = chat;

}

export function initComposer() {

    const input = document.getElementById("messageInput");

    const button = document.getElementById("sendButton");

    button.onclick = async () => {

        if (!currentChat) {

            alert("Önce sohbet seçiniz.");

            return;

        }

        const message = input.value.trim();

        if (message === "") {
            return;
        }

        button.disabled = true;

        try {

            await sendMessage(currentChat.id, message);

            input.value = "";

        } catch (err) {

            alert(err.message);

        }

        button.disabled = false;

    };

}
