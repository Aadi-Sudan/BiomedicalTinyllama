async function sendMessage() {
    const input = document.getElementById("user-input");
    const text = input.value.trim();
    if (!text) return;

    addMessage("You", text, "user");
    input.value = "";

    const payload = { input: text };

    console.log("Sending input:", text);
    console.log("Payload:", JSON.stringify(payload));
    console.log("About to call fetch...");

    try {
        const res = await fetch("/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        console.log("Fetch call completed");
        console.log("Response status:", res.status);

        const data = await res.json();
        console.log("Parsed response JSON:", data);

        addMessage("LLama", data.response, "bot");
    } catch (err) {
        console.error("Fetch failed:", err);
        addMessage("Error", "Something went wrong. See console.", "bot");
    }
}

function addMessage(sender, text, cls) {
    const box = document.getElementById("chat-box");
    const msg = document.createElement("div");
    msg.className = "message";
    msg.innerHTML = `<span class="${cls}">${sender}:</span> ${text}`;
    box.appendChild(msg);
    box.scrollTop = box.scrollHeight;
}