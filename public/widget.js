// Auto-inject Floating Chat Widget (no HTML needed on host page)
(function () {
  const loader = document.currentScript;
  const API_BASE =
    loader?.getAttribute("data-api") ||
    "https://ai-chatbot-server-db6g.onrender.com";
  const BUSINESS_ID = loader?.getAttribute("data-business-id") || "demo";

  // ---- Styles (scoped) ----
  const css = `
  .aiw-wrap{position:fixed;right:20px;bottom:20px;z-index:999999;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
  .aiw-btn{width:56px;height:56px;border-radius:999px;border:none;box-shadow:0 8px 24px rgba(0,0,0,.25);cursor:pointer}
  .aiw-btn{background:#111;color:#fff;font-weight:700}
  .aiw-card{width:320px;max-width:90vw;background:#fff;border-radius:16px;box-shadow:0 16px 40px rgba(0,0,0,.25);overflow:hidden;display:none;flex-direction:column}
  .aiw-head{background:#111;color:#fff;padding:10px 14px;font-weight:600}
  .aiw-body{display:flex;flex-direction:column;height:380px}
  .aiw-msgs{flex:1;overflow:auto;padding:12px;background:#fafafa}
  .aiw-msg{max-width:85%;padding:8px 10px;margin:6px 0;border-radius:10px;line-height:1.3;white-space:pre-wrap}
  .aiw-user{background:#dfe9ff;margin-left:auto}
  .aiw-bot{background:#f3f3f3}
  .aiw-typing{opacity:.75;font-style:italic}
  .aiw-row{display:flex;gap:8px;border-top:1px solid #eee;padding:10px;background:#fff}
  .aiw-input{flex:1;border:1px solid #ddd;border-radius:10px;padding:10px 12px;outline:none}
  .aiw-send{border:none;border-radius:10px;padding:10px 12px;background:#111;color:#fff;cursor:pointer}
  `;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  // ---- DOM ----
  const wrap = document.createElement("div");
  wrap.className = "aiw-wrap";

  const button = document.createElement("button");
  button.className = "aiw-btn";
  button.title = "Chat";
  button.textContent = "💬";

  const card = document.createElement("div");
  card.className = "aiw-card";

  const head = document.createElement("div");
  head.className = "aiw-head";
  head.textContent = "AI Receptionist";

  const body = document.createElement("div");
  body.className = "aiw-body";

  const msgs = document.createElement("div");
  msgs.className = "aiw-msgs";

  const row = document.createElement("div");
  row.className = "aiw-row";

  const input = document.createElement("input");
  input.className = "aiw-input";
  input.type = "text";
  input.placeholder = "Type your message…";

  const send = document.createElement("button");
  send.className = "aiw-send";
  send.textContent = "Send";

  // assemble
  row.appendChild(input);
  row.appendChild(send);
  body.appendChild(msgs);
  body.appendChild(row);
  card.appendChild(head);
  card.appendChild(body);
  wrap.appendChild(card);
  wrap.appendChild(button);
  document.body.appendChild(wrap);

  // toggle open/close
  let open = false;
  button.onclick = () => {
    open = !open;
    card.style.display = open ? "flex" : "none";
  };

  // helpers
  function addMsg(text, who = "bot") {
    const d = document.createElement("div");
    d.className = `aiw-msg ${who === "user" ? "aiw-user" : "aiw-bot"}`;
    d.textContent = text;
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
    return d;
  }
  let typingEl = null;
  function showTyping() {
    typingEl = addMsg("AI is typing…", "bot");
    typingEl.classList.add("aiw-typing");
  }
  function hideTyping() {
    if (typingEl) typingEl.remove();
    typingEl = null;
  }

  // sending state
  let sending = false;
  function setDisabled(state) {
    input.disabled = state;
    send.disabled = state;
    send.textContent = state ? "Sending…" : "Send";
  }

  async function sendMessage() {
    if (sending) return;
    const text = input.value.trim();
    if (!text) return;

    addMsg(text, "user");
    input.value = "";
    input.focus();
    sending = true;
    setDisabled(true);
    showTyping();

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, businessId: BUSINESS_ID }),
      });
      if (!res.ok) {
        hideTyping();
        addMsg("Hmm, I’m having trouble. Please try again in a moment.", "bot");
        return;
      }
      const data = await res.json();
      hideTyping();
      addMsg(data.reply || "Sorry, I didn’t quite catch that.", "bot");
    } catch (e) {
      hideTyping();
      addMsg("😕 Network issue: I couldn’t reach the server.", "bot");
      console.error(e);
    } finally {
      sending = false;
      setDisabled(false);
    }
  }

  // events
  send.onclick = sendMessage;
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  });
})();
