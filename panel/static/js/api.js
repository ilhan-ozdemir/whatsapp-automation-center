const API = "/api";

async function request(url, options = {}) {

    const response = await fetch(API + url, options);

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "API Error");
    }

    return data;

}

export async function getStatus() {

    return await request("/status");

}

export async function getChats() {

    return await request("/chats");

}

export async function getMessages(chatId) {

    return await request("/messages/" + encodeURIComponent(chatId));

}

export async function sendMessage(chatId, message) {

    return await request("/send-message", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            chatId,
            message

        })

    });

}

export async function sendFile(chatId, path, caption = "") {

    return await request("/send-file", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            chatId,
            path,
            caption

        })

    });

}
