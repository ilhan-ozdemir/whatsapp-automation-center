let status = {
    connected: false,
    message: "Bot starting"
};

export function getStatus() {
    return status;
}

export function setStatus(data) {
    status = data;
}
