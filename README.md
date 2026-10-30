# Landingpage – Literature Review Assistant

Statische Seite für GitHub Pages, ohne Build-Schritt. Lokal ansehen: `python3 -m http.server 8765 --directory landingpage` und http://localhost:8765 öffnen.

## Noch auszufüllen
| Wo | Was |
|---|---|
| `script.js` → `CONFIG.listings` | Links zum ChatGPT- und zum Claude-Listing auf PromptBase (bis dahin führen die Buttons auf promptbase.com) |
| `script.js` → `metaPixelId`, `tiktokPixelId` | Pixel-IDs. Erst wenn eine eingetragen ist, erscheint das Cookie-Banner. |
| `index.html` → Domain | eingetragen: `https://lachomx.github.io/litreview` (bei eigener Domain ersetzen) |
| `index.html` → Formular `[FORM_ENDPOINT]` | Endpunkt von Brevo/MailerLite mit Double-Opt-in, dann `disabled` an Feld, Checkbox und Button entfernen und den Button-Text auf „Send me the cheat sheet“ ändern |
| `impressum.html` | Name, Anschrift, E-Mail |
| `datenschutz.html` | Name, Anschrift, Newsletter-Anbieter, Datum; nicht genutzte Abschnitte löschen; Text prüfen lassen |

Das Vorschaubild `og-image.png` (1200 × 630) entsteht aus `../landingpage-src/og-image.html`.

## Veröffentlichen
1. Neues öffentliches Repo auf GitHub anlegen (z. B. `litreview`) und den Inhalt dieses Ordners hineinlegen.
2. Im Repo: Settings → Pages → Branch `main`, Ordner `/ (root)` → Save.
3. Nach 1–2 Minuten läuft die Seite unter `https://<nutzername>.github.io/litreview/`. Diese Adresse als `[DOMAIN]` eintragen.

In Anzeigen und Bio die Seite mit UTM-Parametern verlinken, z. B. `?utm_source=tiktok&utm_campaign=video1`. Die Parameter werden an die PromptBase-Links weitergegeben.
