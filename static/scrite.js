async function sendMessage() {
    const input = document.getElementById("user-input");
    const message = input.value;
    if (!message) return;
  
    const chat = document.getElementById("chat-container");
    chat.innerHTML += `<div class="message user"><b>You:</b> ${message}</div>`;
    input.value = "";
  
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
  
    const data = await res.json();
    chat.innerHTML += `<div class="message bot"><b>Bot:</b> ${data.reply}</div>`;
    chat.scrollTop = chat.scrollHeight;
  }
  