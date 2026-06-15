# Beaches Brain Clinic — public website

Static marketing site for a two-person Sydney neuropsychology practice (Dr Natalie
Phillips + her technical partner James, who owns the build). Hand-written HTML/CSS/JS —
**no framework, no build step.** Replaces a WordPress site. Currently on **GitHub Pages
staging**; a Cloudflare Pages + custom-domain cutover is planned for go-live.

The private backend lives in a sibling repo, `beaches-brain-clinic-backend` (Python on
Cloud Run, Sydney). **This site's forms POST to that backend** — see below.

---

## Layout

- **Pages:** `index.html`, `about.html`, `adult-assessment.html`,
  `child-assessment.html`, `referrals.html`, `privacy.html`, `404.html`.
- **`assets/css/styles.css`** — all styles. Design tokens in `:root`.
- **`assets/js/main.js`** — all behaviour (nav, scroll reveal, form submission, pre-warm).
- **`assets/img/`** — `logo.png` (1200px source), `logo-email.png` (240px, used by the
  backend's emails), photos, favicons.
- `_headers`, `robots.txt`, `sitemap.xml`, `site.webmanifest` — Pages/SEO config.
- `_research/`, `_shots/`, `review/` are gitignored working artifacts (not published).

## Brand tokens (single source of truth — `:root` in `styles.css`)

- `--action: #129E90` — primary CTA / button background (also used by the backend's
  email buttons and given to the Zanda portal). Hover `--action-2: #0E8377`.
- `--teal: #20B8AE`, `--green: #4FBE8C`, `--ink/navy: #0C2A4D`.

## Forms → backend

`main.js` POSTs form submissions as JSON to
`INQUIRY_ENDPOINT = https://inquiry-handler-2kmdoytnva-ts.a.run.app/inquiry`.

- **Contact form** fields mirror the old WPForms exactly (owner decision): separate
  first/last name, email, phone, a "reason for contact" dropdown (`enquiry_type`), an age
  range, a "how did you hear about us" dropdown (`referral_source`), and the free-text
  reason. Honeypot field `company`.
- **Referral form** (`referrals.html`, health professionals referring a client) has
  different fields; `referralPayload()` in main.js composes them into the `/inquiry`
  shape (folding client details into `reason`, deriving age_range from DOB, mapping
  profession → referral_source).
- **Pre-warm:** on first form `focusin`, main.js fires a no-cors `/health` ping so the
  scale-to-zero backend is warm by submit time.
- The visitor only ever gets back a generic acknowledgement — never a triage result.

> The site stores no personal data, but the form **collects** health-related info and
> sends it to the Sydney backend, which seals it. Keep it that way: no analytics that
> capture form content, no third-party form handlers.

---

## Conventions / gotchas

- **GitHub Pages caches assets ~600s.** Bump the `?v=YYYYMMDD…` cache-buster on `<link>`/
  `<script>` asset URLs across **all** pages when you change CSS/JS, or stale assets ship
  (this once made the form say "not connected" after the endpoint was wired).
- **Mobile-only CSS changes must not alter desktop.** Past mobile fixes are scoped under
  `@media (max-width: …)`. The owner reviews desktop and mobile separately.
- No DNS changes until the owner is ready to cut the domain over (the WordPress site is
  still live on the real domain during staging).
- One change = one branch + PR + merge; keep `main` == what's deployed to Pages.

For the overall system design and the privacy model, see
`../beaches-brain-clinic-backend/CLAUDE.md` and `docs/ARCHITECTURE.md` in that repo.
