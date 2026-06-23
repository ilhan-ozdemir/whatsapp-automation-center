export function escapeHtml(text = "") {

    return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");

}

export function formatTime(timestamp) {

    if (!timestamp) return "";

    const date = new Date(timestamp * 1000);

    return date.toLocaleTimeString("tr-TR", {

        hour: "2-digit",
        minute: "2-digit"

    });

}

export function formatDate(timestamp) {

    if (!timestamp) return "";

    const date = new Date(timestamp * 1000);

    return date.toLocaleDateString("tr-TR") + " " +
        date.toLocaleTimeString("tr-TR", {

            hour: "2-digit",
            minute: "2-digit"

        });

}
