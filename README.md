# Beaches Brain Clinic — website

A fast, modern, **static** website (plain HTML/CSS/JS — no build step, no database, no
WordPress). It's designed to be cheap-to-free to host, effortless to maintain, and quick
to load. Brand colours and the logo are carried over from the existing site; the gradient
palette is sampled directly from the logo.

---

## 1. Quick start (view it locally)

You only need Python 3 (already on your Mac). From this folder:

```bash
python3 -m http.server 8137
```

Then open **http://localhost:8137** in your browser. Press `Ctrl+C` to stop.

> Any static file server works (`npx serve`, VS Code "Live Server", etc.) — there's nothing
> to compile.

---

## 2. Project structure

```
.
├── index.html              # Home (hero, services, about, philosophy, contact form)
├── about.html              # Dr Natalie Phillips — full profile
├── child-assessment.html   # Child & Adolescent assessment
├── adult-assessment.html   # Adult assessment
├── referrals.html          # Referral form for health professionals
├── 404.html
├── assets/
│   ├── css/styles.css      # All styling + the design system (brand colours at the top)
│   ├── js/main.js          # Nav, scroll animations, form submission
│   └── img/                # Logo, headshot, favicons, photos
├── robots.txt · sitemap.xml · site.webmanifest · _headers
└── _research/ · _shots/    # Source assets & preview screenshots — NOT needed for deploy
```

`_research/` and `_shots/` are working files. They're harmless to deploy but you can delete
them before going live if you want a clean folder.

---

## 3. Connect the contact & referral forms

Both forms (Contact on the home page, and the Referral form) POST JSON to the **Sydney
inquiry handler** (Cloud Run, `australia-southeast1` — see the private
`beaches-brain-clinic-backend` repo). No third-party form service: health-related
content stays on Australian infrastructure (APP 8).

1. Deploy the backend and copy its Cloud Run URL.
2. In `assets/js/main.js`, set the constant near the top:

   ```js
   var INQUIRY_ENDPOINT = "https://<cloud-run-url>/inquiry";
   ```

3. Add this site's origin to the backend's `ALLOWED_ORIGINS` env var so CORS passes.

Until the endpoint is set, both forms show a friendly "not connected yet" message and
point people at the clinic email instead of failing silently. The referral form's fields
are mapped into the same `/inquiry` payload in `main.js` (client details fold into the
free-text `reason`, which the backend seals and de-identifies).

---

## 4. Editing content

Everything is plain text inside the `.html` files — open one and edit between the tags.
Common edits:

| What | Where |
|------|-------|
| Phone number | search `0401 241 222` and `+61401241222` (the `tel:` links) |
| Email | search `contact@beachesbrainclinic.com.au` |
| Address | search `Narabang Way` |
| Dr Phillips' photo | replace `assets/img/dr-natalie-phillips.jpg` (square image looks best) |
| Logo | replace `assets/img/logo.png` |
| Brand colours | top of `assets/css/styles.css` (the `:root { --green … }` block) |
| Services / bios | edit the relevant section in each `.html` file |

---

## 5. Hosting

**Live since 2026-11-11** at **https://beachesbrainclinic.com.au**.

- **Hosting:** Cloudflare **Workers static assets** (free plan), Worker
  `beaches-brain-clinic-website`, configured by `wrangler.jsonc`.
- **Deploys:** Workers Builds is connected to this repo. Every merge to `main` runs
  `sh scripts/build.sh` (copies the allow-listed public files into `dist/`), then
  `npx wrangler deploy`. It's live within about a minute.
- **DNS:** on Cloudflare (nameservers `bradley` / `elly.ns.cloudflare.com`). The domain is still
  **registered at GoDaddy**; renew it there (Cloudflare can't register `.com.au`).
- **`www`:** a proxied record plus the "Redirect from WWW to root" rule (301 to the bare domain).
  **Always Use HTTPS** is on.
- **Old WordPress addresses** are 301-redirected by `_redirects`.

---

## 6. Notes & nice-to-haves

- **Fonts** load from Google Fonts (Fraunces + Inter). For a fully self-contained,
  privacy-friendly setup you can later self-host them — ask and I'll wire it up.
- **Accessibility:** semantic HTML, keyboard focus styles, `prefers-reduced-motion`
  support, and alt text are all built in.
- **Performance:** no JS frameworks, no render-blocking beyond fonts; the headshot/photo are
  the only large assets and can be further compressed if desired.
- The contact email used everywhere is **contact@beachesbrainclinic.com.au** (your choice).
  Your current site also references `info@…` on the referral page — worth consolidating to
  one address.
```
