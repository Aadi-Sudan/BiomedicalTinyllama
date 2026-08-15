// ─── State ───────────────────────────────────────────────────
let isLoading = false;
let conversationHistory = [];

// ─── Send message ────────────────────────────────────────────
async function sendMessage() {
  if (isLoading) return;

  const input = document.getElementById("user-input");
  const text = input.value.trim();
  if (!text) return;

  const welcome = document.getElementById("welcome-state");
  if (welcome) welcome.remove();

  addBubble("user", text);
  input.value = "";
  autoResize(input);

  const typingId = showTyping();
  setLoading(true);

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: text,
        history: conversationHistory
      }),
    });

    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    const data = await res.json();

    removeTyping(typingId);
    addBubble("bot", data.response);

    // Update history after successful response
    conversationHistory.push({ role: "user", content: text });
    conversationHistory.push({ role: "assistant", content: data.response });

    // Cap at 6 messages (3 exchanges) on frontend
    if (conversationHistory.length > 6) {
      conversationHistory = conversationHistory.slice(-6);
    }

  } catch (err) {
    removeTyping(typingId);
    addBubble("bot", "Something went wrong — the model may still be loading. Please try again in a moment.", true);
    console.error(err);
  } finally {
    setLoading(false);
  }
}

// ─── Add message bubble ──────────────────────────────────────
function addBubble(role, text, isError = false) {
  const box = document.getElementById("chat-box");

  const row = document.createElement("div");
  row.className = `message-row ${role}`;

  const avatar = document.createElement("div");
  avatar.className = `avatar ${role}-avatar`;
  avatar.textContent = role === "user" ? "You" : "AI";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  if (isError) bubble.style.color = "#EF4444";
  bubble.textContent = text;

  row.appendChild(avatar);
  row.appendChild(bubble);
  box.appendChild(row);
  box.scrollTop = box.scrollHeight;
}

// ─── Typing indicator ────────────────────────────────────────
function showTyping() {
  const box = document.getElementById("chat-box");
  const id = "typing-" + Date.now();

  const row = document.createElement("div");
  row.className = "message-row bot";
  row.id = id;

  const avatar = document.createElement("div");
  avatar.className = "avatar bot-avatar";
  avatar.textContent = "AI";

  const bubble = document.createElement("div");
  bubble.className = "bubble";

  const indicator = document.createElement("div");
  indicator.className = "typing-indicator";
  indicator.innerHTML = `
    <span class="typing-dot"></span>
    <span class="typing-dot"></span>
    <span class="typing-dot"></span>
    <span class="thinking-label">Thinking…</span>
  `;

  bubble.appendChild(indicator);
  row.appendChild(avatar);
  row.appendChild(bubble);
  box.appendChild(row);
  box.scrollTop = box.scrollHeight;

  return id;
}

function removeTyping(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

// ─── Loading state ───────────────────────────────────────────
function setLoading(state) {
  isLoading = state;
  const btn = document.getElementById("send-btn");
  const input = document.getElementById("user-input");
  btn.disabled = state;
  input.disabled = state;
}

// ─── Keyboard shortcut ───────────────────────────────────────
function handleKey(e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

// ─── Auto-resize textarea ────────────────────────────────────
function autoResize(el) {
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 120) + "px";
}

// ─── Suggestion chips ────────────────────────────────────────
function fillSuggestion(btn) {
  const input = document.getElementById("user-input");
  input.value = btn.textContent.trim();
  input.focus();
  autoResize(input);
}

// ─── Clear chat ──────────────────────────────────────────────
function clearChat() {
  conversationHistory = [];

  const box = document.getElementById("chat-box");
  box.innerHTML = "";

  const welcome = document.createElement("div");
  welcome.className = "welcome-state";
  welcome.id = "welcome-state";
  welcome.innerHTML = `
    <div class="welcome-icon">
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="19" stroke="#BFDBFE" stroke-width="1.5"/>
        <path d="M20 10v10l6 6" stroke="#2563EB" stroke-width="2" stroke-linecap="round"/>
        <circle cx="20" cy="20" r="3" fill="#2563EB"/>
      </svg>
    </div>
    <h2 class="welcome-title">Ask a biomedical question</h2>
    <p class="welcome-body">This assistant is fine-tuned on medical Q&A data and can help explain conditions, treatments, mechanisms, and clinical concepts. Use the suggestions on the left to get started.</p>
  `;
  box.appendChild(welcome);
}
