// Grab chat elements
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");
const sendButton = document.getElementById("sendButton");

let isSending = false; // prevent double-submits
let typingEl = null;

// Helpers
function addMessage(sender, text) {
  const messageDiv = document.createElement("div");
  messageDiv.className = sender === "user" ? "user-message" : "bot-message";
  messageDiv.textContent = `${sender === "user" ? "You" : "AI"}: ${text}`;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTyping() {
  typingEl = document.createElement("div");
  typingEl.className = "bot-message typing";
  typingEl.textContent = "AI is typing…";
  chatMessages.appendChild(typingEl);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTyping() {
  if (typingEl) typingEl.remove();
  typingEl = null;
}

function setDisabled(state) {
  chatInput.disabled = state;
  sendButton.disabled = state;
  sendButton.textContent = state ? "Sending…" : "Send";
}

// Main send function
async function sendMessage() {
  if (isSending) return; // guard against spam clicks/Enter
  const userMessage = chatInput.value.trim();
  if (!userMessage) return;

  addMessage("user", userMessage);
  chatInput.value = "";
  isSending = true;
  setDisabled(true);
  showTyping();

  try {
    const response = await fetch("https://ai-chatbot-server-db6g.onrender.com/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage }),
    });

    // Handle non-OK responses nicely
    if (!response.ok) {
      hideTyping();
      addMessage("bot", "Hmm, I’m having trouble right now. Please try again in a moment.");
      return;
    }

    const data = await response.json();
    hideTyping();
    addMessage("bot", data.reply || "Sorry, I didn’t quite catch that.");
  } catch (error) {
    console.error("Error connecting to AI server:", error);
    hideTyping();
    addMessage("bot", "😕 Network issue: I couldn’t reach the server. Try again shortly.");
  } finally {
    isSending = false;
    setDisabled(false);
    chatInput.focus();
  }
}

// Send on Enter key
chatInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
});

// Send on button click
sendButton.addEventListener("click", sendMessage);
