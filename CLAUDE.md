# Signalcraft — marketing site (signalcraft.fyi)

Static site, **public** repo `purplehulk/signalcraft`, served by **GitHub Pages** on the apex
domain `signalcraft.fyi` (DNS on Cloudflare, grey-cloud/DNS-only for the GH Pages records). `CNAME`
holds the domain. No build step for the hand-written pages — edit the HTML directly.

## Pages
- Hand-written top-level: `index.html`, `services.html`, `work.html`, `about.html`, `contact.html`,
  `privacy.html`, `terms.html`. Each is self-contained (inline `<style>`, shared nav/footer markup).
- `assets/chat.js` — the site chat widget (posts to the Worker at `api.signalcraft.fyi`; leads → Web3Forms).

## Programmatic SEO (ROADMAP #5 — `/ai-receptionist/`)
- **Generated, do NOT hand-edit.** `gen-seo-pages.mjs` builds an "AI receptionist for [trade] in
  [city], VA" page for every vertical×city in its matrix → `ai-receptionist/<vertical>-<city>/index.html`,
  plus the hub `ai-receptionist/index.html`, `sitemap.xml`, and `robots.txt`.
- Rebuild after changing the matrix or template: `node gen-seo-pages.mjs` (`--dry-run` to preview).
  It's idempotent (overwrites). To add cities/verticals, edit the `CITIES` / `VERTICALS` arrays.
- Generated pages share `assets/seo.css` (matches the main design system) and carry the chat widget,
  full schema (Service + FAQPage + BreadcrumbList), and an internal-link silo (same trade × other
  cities, same city × other trades). The homepage + services footers link to the hub for crawl discovery.
- These are Signalcraft's OWN inbound funnel (compounding local-intent SEO) and double as live product
  demos. They are real estate for the AI receptionist offering, not client work.

## Deploy
- `git push` to `main` → GitHub Pages publishes. Verify locally first (any static server) before pushing.
- Related: lead-gen hub `../signalcraft-leadscrub/`, backend Worker `../signalcraft-chat-worker/`.
