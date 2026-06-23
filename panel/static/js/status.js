import { getStatus } from "./api.js";

export async function loadStatus() {

    try {

        const status = await getStatus();

        document.getElementById("profileName").textContent =
            status.name || "WhatsApp Automation";

        document.getElementById("profileStatus").textContent =
            status.connected
                ? "🟢 Bağlı"
                : "🔴 Bağlı Değil";

    } catch {

        document.getElementById("profileStatus").textContent =
            "🔴 Bağlantı Hatası";

    }

}
