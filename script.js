let fabrics = [];

// Load fabrics.json when the page starts
fetch("fabrics.json")
  .then((res) => res.json())
  .then((data) => {
    fabrics = data;
    console.log("Loaded fabrics:", fabrics);
    botSay(
      "Hi! I’m your fabric assistant 🐱\nAsk me about a pattern name, manufacturer, or colorway.\n\nExample: “What is the Tweed Multi fabric?”"
    );
  })
  .catch((err) => {
    console.error("Error loading fabrics.json", err);
    botSay(
      "I couldn’t load the fabrics.json file. Make sure it’s in the same folder as index.html."
    );
  });

// DOM references
const chatWindow = document.getElementById("chatWindow");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");
const typingIndicator = document.getElementById("typingIndicator");
const themeToggle = document.getElementById("themeToggle");
const quickButtons = document.querySelectorAll(".quick-btn");

// ---------- Typing indicator helpers ----------
function showTyping() {
  typingIndicator.classList.remove("hidden");
}

function hideTyping() {
  typingIndicator.classList.add("hidden");
}

// ---------- Chat UI helpers ----------
function addMessage(text, sender = "bot", html = false) {
  const row = document.createElement("div");
  row.className = `message-row ${sender}`;

  if (sender === "bot") {
    const avatarWrapper = document.createElement("div");
    avatarWrapper.className = "bot-avatar-wrapper";

    const avatar = document.createElement("img");
    avatar.src = "image/catalogbot.png";
    avatar.alt = "Fabric Chat Cat";
    avatar.className = "bot-avatar";

    avatarWrapper.appendChild(avatar);
    row.appendChild(avatarWrapper);
  }

  const bubble = document.createElement("div");
  bubble.className = "message-bubble";

  if (html) {
    bubble.innerHTML = text;
  } else {
    bubble.innerHTML = text.replace(/\n/g, "<br>");
  }

  row.appendChild(bubble);
  chatWindow.appendChild(row);

  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function userSay(text) {
  if (!text.trim()) return;
  addMessage(text, "user", false);
}

function botSay(text, html = false) {
  addMessage(text, "bot", html);
}

// ---------- Fabric search logic ----------
function findFabric(question) {
  if (!question) return null;
  const q = question.toLowerCase().trim();

  const patternKey = "Pattern Name";
  const manufacturerKey = "Manufacturer";
  const colorwayKey = "Colorway";

  // 1) exact match on pattern name
  let match =
    fabrics.find((f) => {
      const pattern = (f[patternKey] || "").toLowerCase();
      return pattern === q;
    }) || null;

  if (match) return match;

  // 2) look for pattern/manufacturer/colorway inside question
  match =
    fabrics.find((f) => {
      const pattern = (f[patternKey] || "").toLowerCase();
      const manu = (f[manufacturerKey] || "").toLowerCase();
      const color = (f[colorwayKey] || "").toLowerCase();
      return (
        (pattern && q.includes(pattern)) ||
        (manu && q.includes(manu)) ||
        (color && q.includes(color))
      );
    }) || null;

  if (match) return match;

  // 3) basic word fuzzy on pattern name
  const words = q.split(/\s+/).filter(Boolean);
  match =
    fabrics.find((f) => {
      const pattern = (f[patternKey] || "").toLowerCase();
      return words.some((w) => pattern.includes(w));
    }) || null;

  return match;
}

function fabricToBotMessage(fabric, contextQuestion = "") {
  const manufacturer = fabric["Manufacturer"] || "—";
  const patternName = fabric["Pattern Name"] || "Unknown Pattern";
  const colorway = fabric["Colorway"] || "—";
  const fabricType = fabric["Fabric Type"] || "—";

  let intro = `Here’s what I found for <strong>${patternName}</strong> 🧶`;
  if (contextQuestion && contextQuestion.toLowerCase().includes("orange")) {
    intro = `An orange option I like is <strong>${patternName}</strong> 🧶`;
  }

  const html = `
    <div>${intro}</div>
    <div class="fabric-card">
      <div class="fabric-card-title">${patternName}</div>
      <div class="fabric-card-field">
        <span class="fabric-card-label">Manufacturer:</span>
        ${manufacturer}
      </div>
      <div class="fabric-card-field">
        <span class="fabric-card-label">Colorway:</span>
        ${colorway}
      </div>
      <div class="fabric-card-field">
        <span class="fabric-card-label">Fabric Type:</span>
        ${fabricType}
      </div>
    </div>
  `;

  return html;
}

// ---------- Message send handling ----------
function respondToQuestion(text) {
  showTyping();

  setTimeout(() => {
    const fabric = findFabric(text);
    hideTyping();

    if (!fabric) {
      botSay(
        "I couldn’t find a fabric that matches that.\nTry using a pattern name like “Tweed Multi” or include the manufacturer name."
      );
      return;
    }

    const replyHtml = fabricToBotMessage(fabric, text);
    botSay(replyHtml, true);
  }, 500);
}

function handleSend() {
  const text = chatInput.value;
  if (!text.trim()) return;

  userSay(text);
  chatInput.value = "";
  respondToQuestion(text);
}

// Button click
sendBtn.addEventListener("click", handleSend);

// Enter key
chatInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    handleSend();
  }
});

// ---------- Quick suggestion buttons ----------
quickButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const q = btn.getAttribute("data-query") || "";
    if (!q) return;
    userSay(q);
    respondToQuestion(q);
  });
});

// ---------- Dark-mode toggle ----------
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  themeToggle.textContent = isDark ? "☀️ Light" : "🌙 Dark";
});




