const globalAPI = "https://wa-status-api-sg.onrender.com/api/status";
const COOLDOWN_TIME = 10000; // 10 seconds cooldown
const servers = {
  "Core Chat (c3.whatsapp.net:5222)": "https://c3.whatsapp.net",
  "Core Chat (c4.whatsapp.net:5222)": "https://c4.whatsapp.net",
  "Core Chat (e1.whatsapp.net:5222)": "https://e1.whatsapp.net",
  "Core Chat (g.whatsapp.net:5222)": "https://g.whatsapp.net",
  "Media (mmg.whatsapp.net:443)": "https://mmg.whatsapp.net",
  "Media (media.whatsapp.net:443)": "https://media.whatsapp.net",
  "Media CDN (media-mxp1-1.cdn.whatsapp.net:443)":
    "https://media-mxp1-1.cdn.whatsapp.net",
  "Media CDN (mmx-ds.cdn.whatsapp.net:443)": "https://mmx-ds.cdn.whatsapp.net",
  "Media Content (scontent.whatsapp.net:443)": "https://scontent.whatsapp.net",
  "Static Assets (static.whatsapp.net:443)": "https://static.whatsapp.net",
  "WhatsApp Web (web.whatsapp.com:443)": "https://web.whatsapp.com",
  "Main Website (www.whatsapp.com:443)": "https://www.whatsapp.com",
  "FAQ & Help (faq.whatsapp.com:443)": "https://faq.whatsapp.com",
  "Group Invite Links (chat.whatsapp.com:443)": "https://chat.whatsapp.com",
  "Misc Server (dit.whatsapp.net:443)": "https://dit.whatsapp.net",
  "Maybe Blocked? (e6.whatsapp.net:5222)": "https://e6.whatsapp.net",
};

function getCooldownRemaining() {
  const lastRefreshTime = localStorage.getItem("lastRefreshTime");
  if (!lastRefreshTime) return 0;

  const elapsed = Date.now() - Number(lastRefreshTime);
  return Math.max(0, COOLDOWN_TIME - elapsed);
}

function setLastRefreshTime() {
  localStorage.setItem("lastRefreshTime", Date.now());
}

function showCooldownScreen(secondsLeft) {
  const container = document.getElementById("container");
  container.innerHTML = `
    <div id="cooldown-message" style="font-size: 1.5rem; color: orange; padding: 2rem;">
      🕒 Hold up! Please wait <b id="cooldown-timer">${secondsLeft}</b> seconds before trying again.
    </div>
  `;

  const interval = setInterval(() => {
    secondsLeft--;
    const timerEl = document.getElementById("cooldown-timer");
    if (secondsLeft <= 0) {
      clearInterval(interval);
      location.reload(); // auto reload
    } else if (timerEl) {
      timerEl.textContent = secondsLeft;
    }
  }, 1000);
}

function showLoading() {
  const container = document.getElementById("container");
  container.innerHTML = `
    <div style="font-size: 1.5rem; padding: 2rem;">
      🔄 Fetching WhatsApp Status...
    </div>
  `;
}

async function fetchGlobalStatus() {
  const res = await fetch(globalAPI);
  return await res.json();
}

function renderStatus(name, global) {
  const div = document.createElement("div");
  div.className = "server";

  const levelClass =
    global.level === "good" ? "up" : global.level === "warn" ? "warn" : "down";

  div.innerHTML = `
    <h3>${name}</h3>
    <div class="status">
      <div>🌍 Global: <span class="${levelClass}">${global.status}</span></div>
      <div class="latency">${global.latency !== "N/A" ? global.latency + " ms" : ""}</div>
    </div>
    <div class="status">
      <div>🧑 Regional: <span class="warn">NOT IMPLEMENTED YET</span></div>
      <div class="latency">N/A</div>
    </div>
  `;

  document.getElementById("container").appendChild(div);
}

async function main() {
  const remaining = Math.ceil(getCooldownRemaining() / 1000);

  if (remaining > 0) {
    showCooldownScreen(remaining);
    return;
  }

  setLastRefreshTime();
  showLoading();

  const globalData = await fetchGlobalStatus();
  const container = document.getElementById("container");
  container.innerHTML = ""; // clear loading

  for (const [name, url] of Object.entries(servers)) {
    const host = new URL(url).host;
    const globalInfo = Object.values(globalData).find((e) => e.host === host);
    if (!globalInfo) continue;
    renderStatus(name, globalInfo);
  }
}

main();
