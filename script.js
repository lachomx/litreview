// Literature Review Assistant – Landingpage

// ===== Hier eintragen =====
const CONFIG = {
  listings: {
    claude: "https://promptbase.com/prompt/literature-review-assistant-with-zotero-2", // ein Listing, funktioniert auch in ChatGPT
  },
  metaPixelId: "249899463203808", // Meta-Pixel (Events Manager)
  tiktokPixelId: "", // TODO: TikTok-Pixel-ID
};

const CONSENT_KEY = "lra-consent"; // "yes" | "no"
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];

function storageGet(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}
function storageSet(key, value) {
  try { localStorage.setItem(key, value); } catch { /* privater Modus */ }
}

// ----- Kauf-Links mit UTM-Parametern -----
function withUtm(url) {
  const params = new URLSearchParams(location.search);
  const out = new URL(url);
  UTM_KEYS.forEach((k) => { if (params.has(k)) out.searchParams.set(k, params.get(k)); });
  return out.toString();
}

document.querySelectorAll("[data-listing]").forEach((a) => {
  const url = CONFIG.listings[a.dataset.listing];
  if (url) a.href = withUtm(url);
  a.addEventListener("click", () => track("click_buy", { version: a.dataset.listing }));
});

// ----- Suchstring hervorheben und kopieren -----
function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
document.querySelectorAll("[data-hl]").forEach((pre) => {
  const raw = pre.textContent;
  pre.dataset.raw = raw;
  pre.innerHTML = escapeHtml(raw).replace(
    /("[^"\n]*")|(\[[a-z:]+\])|\b(AND|OR|NOT)\b/g,
    (m, str, tag, op) =>
      str ? `<span class="str">${str}</span>` :
      tag ? `<span class="tag">${tag}</span>` :
      `<span class="op">${op}</span>`
  );
});
document.querySelectorAll("[data-copy]").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const pre = document.querySelector(btn.dataset.copy);
    try {
      await navigator.clipboard.writeText(pre.dataset.raw || pre.textContent);
      btn.textContent = "Copied";
    } catch {
      btn.textContent = "Select and copy";
    }
    setTimeout(() => { btn.textContent = "Copy"; }, 1800);
  });
});

// ----- Einblenden beim Scrollen -----
const reveals = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px" });
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add("in"));
}

document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });

// ----- Einwilligung und Pixel -----
const trackingConfigured = Boolean(CONFIG.metaPixelId || CONFIG.tiktokPixelId);
const banner = document.getElementById("cookie");
const settingsBtn = document.querySelector("[data-cookie-settings]");
let pixelsLoaded = false;

function hasConsent() { return storageGet(CONSENT_KEY) === "yes"; }

function loadPixels() {
  if (pixelsLoaded || !hasConsent()) return;
  pixelsLoaded = true;
  if (CONFIG.metaPixelId) {
    /* Meta Pixel (offizielles Snippet) */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq("init", CONFIG.metaPixelId);
    fbq("track", "PageView");
  }
  if (CONFIG.tiktokPixelId) {
    /* TikTok Pixel (offizielles Snippet) */
    !function (w, d, t) {
      w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
      ttq.load(CONFIG.tiktokPixelId);
      ttq.page();
    }(window, document, "ttq");
  }
}

// Ereignisse nur mit Einwilligung senden
function track(name, data = {}) {
  if (!pixelsLoaded) return;
  if (window.fbq) fbq("trackCustom", name, data);
  if (window.ttq) ttq.track(name === "click_buy" ? "ClickButton" : name, data);
}

function showBanner() { banner.hidden = false; }

if (trackingConfigured) {
  settingsBtn.hidden = false;
  settingsBtn.addEventListener("click", showBanner);
  const choice = storageGet(CONSENT_KEY);
  if (choice === "yes") loadPixels();
  else if (choice !== "no") showBanner();

  banner.querySelectorAll("[data-consent]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const yes = btn.dataset.consent === "yes";
      const wasLoaded = pixelsLoaded;
      storageSet(CONSENT_KEY, yes ? "yes" : "no");
      banner.hidden = true;
      if (yes) loadPixels();
      // Widerruf: Seite neu laden, damit bereits geladene Pixel weg sind
      else if (wasLoaded) location.reload();
    });
  });
}
