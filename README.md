# NFC Review Tool — go-live guide

A multi-tenant tap-to-review system for local businesses. Customer taps an NFC
card → answers 4–6 quick questions → gets an AI-drafted Google review → copies it
and posts from their own Google account. You sell the setup to businesses for
₹2,000–3,000 + optional ₹300–500/month.

## Files in this folder

| File | What it is | Where it goes |
|---|---|---|
| `index.html` | Customer-facing review experience | GitHub Pages |
| `admin.html` | Your private client-onboarding panel | GitHub Pages |
| `sales-map.html` | **V1** Sales Map — 3D pitch route command center | GitHub Pages |
| `template-generator.js` | Offline fallback review writer | GitHub Pages |
| `manifest.json`, `sw.js`, `icon.svg` | PWA shell (Add to Home Screen, caching) | GitHub Pages |
| `worker.js` | Backend: config storage, AI generation, admin API | Cloudflare Workers |
| `wrangler.toml` | Optional — only if deploying via Wrangler CLI | — |

## Step-by-step: go live

### A. Deploy the backend (Cloudflare, free)

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → sign up / log in (free).
2. **Workers & Pages → Create → Create Worker** → name it e.g. `nfc-review` → **Deploy**.
3. Click **Edit code** → delete everything → paste the full contents of `worker.js` → **Save and deploy**.
4. **Create the KV namespace:** in the left sidebar go to **Storage & Databases → KV** → **Create a namespace** → name it `BUSINESS_CONFIGS` → note its ID.
5. **Bind KV to the Worker:** open your Worker → **Settings → Bindings → Add** → **KV namespace** → variable name `BUSINESS_CONFIGS` → select the namespace you just made → **Deploy** the worker again.
6. **Set the secrets:** in the Worker → **Settings → Variables and Secrets** → add two secrets:
   - `GROQ_API_KEY` → your Groq API key
   - `ADMIN_PASSWORD` → pick a strong password (this protects your admin panel)
7. Copy your Worker's public URL — it looks like `https://nfc-review.yourname.workers.dev`.

### B. Point the frontend at the backend

8. Open `index.html` and `admin.html` in a text editor. Find this line near the top of the script:
   `const WORKER_URL = "PASTE_YOUR_WORKER_URL_HERE";`
   Replace the placeholder with your Worker URL from step 7 (in **both** files).

### C. Host the frontend (GitHub Pages, free)

9. Create a new **public** GitHub repository, e.g. `nfc-review-tool`.
10. Upload **all files** from this folder to the repo root (`index.html`, `admin.html`,
    `template-generator.js`, `manifest.json`, `sw.js`, `icon.svg`).
11. Repo **Settings → Pages** → Source: **Deploy from a branch** → branch `main`, folder `/ (root)` → Save.
12. Wait ~1 minute. Your site is live at `https://YOUR-USERNAME.github.io/nfc-review-tool/`.

### D. Add your first client and test

13. Open `https://YOUR-USERNAME.github.io/nfc-review-tool/admin.html`.
14. Enter the Worker URL + your admin password → add a test business (name, color,
    Google review link, questions) → Save.
15. Copy the generated NFC link (e.g. `…?biz=cafe-mocha`) and open it **on your phone**.
    Walk the full flow: questions → AI draft → Copy & open Google reviews.
16. Tip: opening `index.html` with **no** `?biz=` shows a built-in demo business, so you
    can preview the design anytime without touching the backend.

### E. Program the NFC cards

17. Use the free **NFC Tools** app (Android/iOS) → Write → Add a record → **URL** →
    paste the client's link → Write the tag. Stick it at the client's counter.

## Selling notes (India)

- **Cost per client:** ~₹500–800 (physical NFC cards + printing). Everything digital is free tier.
- **Price:** ₹2,000–3,000 one-time setup + optional ₹300–500/month for the "AI review dashboard".
- **Pitch line:** "Customers tap a card, answer 4 questions in 30 seconds, and post a Google review — most businesses 3–5x their review count in the first month."
- Google does not allow auto-posting reviews, which is why the customer always taps "Post"
  themselves — this keeps the client's listing safe and the system compliant.

## Sales Map — daily pitch command center (`sales-map.html`)

Your own tool for selling the cards, living at the same GitHub Pages link
(`…/sales-map.html`, linked from the top of `admin.html`).

**V1 — shipped now:**
- Real 3D map (MapLibre GL + OpenFreeMap, extruded buildings, 3D/2D toggle) — free, no API key
- Import 60–70 businesses/day: paste `name, address` (auto-located) or `name, lat, lng`
- ⚡ **Optimize route** — nearest-neighbor + 2-opt ordering, real road route drawn via OSRM,
  per-stop distance/time, total km + minutes for the day
- Tap any pin → status: 🕐 To visit / ✅ Bought / ❌ Not bought / ✔ Done + 1-line note
- Ordered day-plan list, per-stop Google Maps "Navigate ↗" deep link, live stats
  (businesses · bought · done · conversion %), 🎯 my-location start point
- Everything saved in the browser (localStorage) + JSON backup export/import. One link, no login.

**V2 — next:** live GPS follow mode while walking, turn-by-turn list from OSRM steps,
WhatsApp follow-up message templates per business, multi-day history & streaks.

**V3 — later:** auto-discover new businesses nearby (Overpass API: cafes/salons within
radius), revenue dashboard (cards sold × price), team mode with shared lists.

## Maintenance

- Adding a client = 2 minutes in `admin.html`. No code changes, ever.
- If Groq ever fails (rate limit/outage), the system silently falls back to the offline
  template generator — the customer never sees an error.
- After changing frontend files, bump the `CACHE` name in `sw.js` so phones pick up the update.
