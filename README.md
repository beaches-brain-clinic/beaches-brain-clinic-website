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

**Current state:** the site auto-deploys to **GitHub Pages** from `main` (test/staging URL —
see the repo's Settings → Pages). This is the "stand it up and test end-to-end" step of the
cutover; the custom domain goes to Cloudflare Pages (below) at go-live, and only then does
the old droplet get decommissioned.

### The cheapest options

This is a static site, so it can run on free hosting that's faster and far more reliable
than the current Digital Ocean + WordPress setup (and removes the security/update burden).

| Option | Cost | Notes |
|--------|------|-------|
| **Cloudflare Pages** ⭐ recommended | **Free** | Unlimited bandwidth, global CDN, free SSL, custom domain, drag-and-drop or Git deploy. The `_headers` file here works out of the box. |
| **Netlify** | Free tier | Just as easy; 100 GB/mo bandwidth. Also reads `_headers`. |
| **GitHub Pages** | Free | Great if you already use Git; no `_headers` support. |
| Keep Digital Ocean droplet | ~US$4–6/mo | Works, but you pay monthly and maintain the server + WordPress updates. Not recommended for a static site. |

**Bottom line:** with **Cloudflare Pages** your only ongoing cost is the **domain renewal**
(~A$20/year). Everything else is $0.

### Deploy to Cloudflare Pages (no command line needed)

1. Create a free account at **https://dash.cloudflare.com** → **Workers & Pages** →
   **Create** → **Pages** → **Upload assets**.
2. Drag this whole folder in (or zip it first). Name the project `beaches-brain-clinic`.
3. Click **Deploy**. You'll instantly get a live URL like
   `beaches-brain-clinic.pages.dev` to check.
4. **Custom domain:** in the project → **Custom domains** → add
   `beachesbrainclinic.com.au` and `www.beachesbrainclinic.com.au`, then follow the DNS
   instructions (easiest if you move the domain's nameservers to Cloudflare — they walk you
   through it). SSL is automatic and free.

> Prefer auto-deploys on every edit? Put this folder in a free GitHub repo and connect it in
> the Pages "Import from Git" flow instead of uploading — then every saved change goes live
> automatically.

### Moving the domain off Digital Ocean

Your domain `beachesbrainclinic.com.au` is registered somewhere (likely via DO or a
registrar). You don't need to transfer the registration — just point the **DNS** at the new
host (Cloudflare's setup wizard handles this). Once the new site is verified and live, you
can safely shut down the Digital Ocean droplet to stop paying for it.

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
