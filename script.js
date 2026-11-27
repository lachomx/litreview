// Literature Review Assistant – Landingpage

// ===== Hier eintragen =====
const CONFIG = {
  listings: {
    claude: "https://buy.stripe.com/3cIeVf79a9Mi5iaf4o0Jq00", // Stripe-Zahlungslink (Managed Payments, live), funktioniert auch in ChatGPT
  },
  metaPixelId: "2086922485279992", // Meta-Pixel (Events Manager)
  tiktokPixelId: "", // TODO: TikTok-Pixel-ID
  goatcounterCode: "litreviewcoach", // GoatCounter (https://litreviewcoach.goatcounter.com), cookiefrei, ohne Einwilligung
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
  // Stripe-Zahlungslinks übernehmen utm_source, utm_medium, utm_campaign, utm_content und utm_term direkt in die Zahlung
  UTM_KEYS.forEach((k) => { if (params.has(k)) out.searchParams.set(k, params.get(k)); });
  return out.toString();
}

document.querySelectorAll("[data-listing]").forEach((a) => {
  const url = CONFIG.listings[a.dataset.listing];
  if (url) a.href = withUtm(url);
  a.addEventListener("click", () => track("click_buy", { version: a.dataset.listing }));
});

// Klick auf „Try Phase 0 free“ (getrennt von Kauf-Klicks gezählt)
document.querySelectorAll("[data-free]").forEach((a) => {
  a.addEventListener("click", () => track("click_free_phase0", { version: a.dataset.free }));
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
      if (pre.id === "phase0") track("copy_phase0");
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

// ----- Kaufbalken mobil: sichtbar zwischen Hero und Abschluss-CTA -----
const buybar = document.getElementById("buybar");
const heroEl = document.getElementById("top");
const finalEl = document.getElementById("final");
if (buybar && heroEl && finalEl && "IntersectionObserver" in window) {
  let heroVisible = true, finalVisible = false;
  const update = () => {
    const show = !heroVisible && !finalVisible;
    buybar.classList.toggle("show", show);
    buybar.setAttribute("aria-hidden", show ? "false" : "true");
    buybar.querySelector("a").tabIndex = show ? 0 : -1;
  };
  new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; update(); }).observe(heroEl);
  new IntersectionObserver(([e]) => { finalVisible = e.isIntersecting; update(); }).observe(finalEl);
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

// ----- Besucherzählung ohne Cookies (GoatCounter) -----
// Speichert nichts im Browser und keine IP-Adressen, deshalb ohne Einwilligung (Datenschutz Abschnitt 6).
// Eigene Besuche ausschließen (Betreiber): einmal pro Browser/Gerät litreviewcoach.com/?nicht-zaehlen aufrufen;
// ?wieder-zaehlen hebt es auf. Nur dann wird lokal "skipgc" gesetzt (GoatCounter-Standard), sonst nichts.
const NICHT_ZAEHLEN = (() => {
  try {
    const p = new URLSearchParams(location.search);
    if (p.has("nicht-zaehlen")) localStorage.setItem("skipgc", "t");
    if (p.has("wieder-zaehlen")) localStorage.removeItem("skipgc");
    return localStorage.getItem("skipgc") === "t";
  } catch { return false; } // privater Modus
})();
if (CONFIG.goatcounterCode && !NICHT_ZAEHLEN) {
  const gc = document.createElement("script");
  gc.async = true;
  gc.src = "https://gc.zgo.at/count.js";
  gc.dataset.goatcounter = `https://${CONFIG.goatcounterCode}.goatcounter.com/count`;
  document.head.appendChild(gc);
}

// Ereignisse an GoatCounter; frühe Ereignisse warten, bis count.js geladen ist
const gcWarteschlange = [];
function gcEvent(path, title) {
  if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path, title, event: true });
  else gcWarteschlange.push([path, title]);
}
if (CONFIG.goatcounterCode) {
  const flush = setInterval(() => {
    if (!(window.goatcounter && window.goatcounter.count)) return;
    clearInterval(flush);
    gcWarteschlange.splice(0).forEach(([p, t]) => gcEvent(p, t));
  }, 500);
  setTimeout(() => clearInterval(flush), 20000); // Blocker aktiv: aufgeben
}

// Herkunft des Besuchs (utm_source), beim ersten Aufruf gemerkt; ohne Quelle "direkt"
const QUELLE = (() => {
  const roh = new URLSearchParams(location.search).get("utm_source");
  let q = roh;
  try {
    if (roh) sessionStorage.setItem("lra-quelle", roh);
    else q = sessionStorage.getItem("lra-quelle");
  } catch { /* privater Modus */ }
  q = (q || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
  return q || "direkt";
})();
const KLICK_EREIGNISSE = ["click_buy", "click_free_phase0", "copy_phase0"];

// Kauf-Klick: GoatCounter immer (Klicks mit Herkunft), Pixel nur mit Einwilligung
function track(name, data = {}) {
  const quelle = KLICK_EREIGNISSE.includes(name) ? QUELLE : null;
  gcEvent([name, data.version, quelle].filter(Boolean).join("-").replace(/_/g, "-"), name);
  if (!pixelsLoaded) return;
  if (window.fbq) fbq("trackCustom", name, data);
  if (window.ttq) ttq.track(name === "click_buy" ? "ClickButton" : name, data);
}

// ----- Verweildauer und gelesene Abschnitte (nur GoatCounter, cookiefrei, nicht an Pixel) -----
// Zeit zählt nur, solange der Tab sichtbar ist. Jede Stufe und jeder Abschnitt zählt pro Aufruf höchstens einmal.
const ZEIT_STUFEN = [[30, "30s"], [60, "1min"], [180, "3min"]];
let sichtbarSek = 0;
const zeitTimer = setInterval(() => {
  if (document.visibilityState !== "visible") return;
  sichtbarSek += 1;
  ZEIT_STUFEN.forEach(([s, name]) => { if (sichtbarSek === s) gcEvent(`zeit-${name}`, "Verweildauer"); });
  if (sichtbarSek >= ZEIT_STUFEN[ZEIT_STUFEN.length - 1][0]) clearInterval(zeitTimer);
}, 1000);

if ("IntersectionObserver" in window) {
  // Abschnitt gilt als gesehen, sobald er die Bildschirmmitte erreicht
  const so = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      so.unobserve(en.target);
      gcEvent(`abschnitt-${en.target.id}`, "Abschnitt gesehen");
    });
  }, { rootMargin: "-45% 0px -45% 0px" });
  ["review", "how", "free", "example", "offer", "faq", "final"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) so.observe(el);
  });
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
