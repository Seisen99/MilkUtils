/**
 * WebSocket hook for intercepting game data
 */

/**
 * Handle incoming WebSocket message
 * @param {string} message - JSON message string
 * @returns {string} Original message
 */
function handleMessage(message) {
    let obj = JSON.parse(message);

    // Character data (skills, items, houses, drinks)
    if (obj && obj.type === "init_character_data") {
        console.log("Received init_character_data:", obj);
        updateCharacterData(obj);
    }
    // Static game data (actions, items definitions)
    else if (obj && obj.type === "init_client_data") {
        console.log("Received init_client_data:", obj);
        updateClientData(obj);
    }

    return message;
}

/**
 * Hook WebSocket to intercept messages
 */
function hookWS() {
    const dataProperty = Object.getOwnPropertyDescriptor(MessageEvent.prototype, "data");
    const oriGet = dataProperty.get;

    dataProperty.get = hookedGet;
    Object.defineProperty(MessageEvent.prototype, "data", dataProperty);

    function hookedGet() {
        const socket = this.currentTarget;
        if (!(socket instanceof WebSocket)) {
            return oriGet.call(this);
        }
        if (socket.url.indexOf("api.milkywayidle.com/ws") <= -1 && socket.url.indexOf("api-test.milkywayidle.com/ws") <= -1) {
            return oriGet.call(this);
        }

        const message = oriGet.call(this);
        Object.defineProperty(this, "data", { value: message }); // Anti-loop

        return handleMessage(message);
    }
}

// Export to global scope for Tampermonkey
unsafeWindow.hookWS = hookWS;
unsafeWindow.handleMessage = handleMessage;
