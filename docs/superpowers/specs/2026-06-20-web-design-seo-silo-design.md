# Design — Programmatic "Web Design for [Trade] in [City]" SEO Silo

**Date:** 2026-06-20
**Repo:** `purplehulk/signalcraft` (live at signalcraft.fyi, GitHub Pages, no build step for hand pages)
**Scope:** Extend `gen-seo-pages.mjs` to generate a second programmatic silo (web design) alongside the
existing AI-receptionist silo, sharing one `sitemap.xml`. Plus small footer links on two hand pages.

---

## Problem & goal

The new "Go Live" $149/mo AI-website tier needs demand. Home-service owners search
*"web designer for plumbers in Richmond"*, *"roofing website design"*, etc. — high commercial intent
that should funnel into Go Live. We already own a proven programmatic engine (`gen-seo-pages.mjs`,
176 receptionist pages). Mirror it for web design: **8 trades × 22 cities = 176 web-design landing
pages** + a hub, each funnelling to the free audit and the Go Live tier.

## Architecture

**Extend `gen-seo-pages.mjs` — do NOT create a second script** (it owns `sitemap.xml`; two scripts
would fight over it). Additions:
- A `WEB` data map (per-trade web-design content, below), keyed by trade `slug`.
- `buildWebPage(v, c)` → writes `/web-design/<v.slug>-<c.slug>/index.html`.
- `buildWebHub()` → writes `/web-design/index.html`.
- The run section loops both silos; `allUrls` includes receptionist pages, web pages, and both hubs;
  the single `sitemap.xml` covers everything (~360 URLs).
- Reuse all shared chrome: `LOGO`, `ICON`, `FONTS`, `navHtml()`, `footerHtml()`, `SCRIPTS`, `esc()`,
  and `/assets/seo.css`. **Reuse only existing seo.css classes** (`shero`, `band`, `grid`, `stat`,
  `sec`, `feat`, `c`, `ico`, `steps`, `st`, `faq`, `details/summary`, `areas`, `linkcols`, `aeo-band`,
  `cta`, `crumb`, `k`, `o`) so no CSS changes are needed. Verify at build.
- **URL:** `/web-design/<trade>-<city>/` (clean, extensionless), mirroring `/ai-receptionist/`.

## Per-trade content model (`WEB`, keyed by trade slug)

Each entry supplies trade-specific copy; city specifics (`c.name`, `c.region`, `c.county`,
`c.nearby`) interpolate from the existing `CITIES` array. `[City]` below = `c.name`.

Each trade has: `webLead` (hero angle), `needs` (3 trade-specific site must-haves → feature cards),
`stat` ({n, p}), `webFaq` ({q, a}).

- **hvac** — `webLead`: "built to win the no-cool call in a July heat wave — instant click-to-call,
  financing and quote forms, and a maintenance-plan signup that turns one job into a recurring
  customer." `needs`: ["Instant click-to-call + an emergency 'no-cool / no-heat' banner", "Online
  quote and financing-application forms", "Maintenance-plan signup that builds recurring revenue"].
  `stat`: {n:"75%", p:"of homeowners check your website before booking an HVAC visit — a dated site
  sends them to the next company"}. `webFaq`: {q:"Will my HVAC site capture financing and quote
  requests?", a:"Yes. We build quote and financing-application forms into the site, plus a one-tap
  emergency call button, so a [City] homeowner in a heat wave books you instead of scrolling on."}
- **plumbing** — `webLead`: "built so a burst-pipe emergency becomes a booked job — one-tap calling,
  urgent-vs-routine intake, and a site fast enough to load when someone's standing in two inches of
  water." `needs`: ["A one-tap emergency call button, above the fold", "Urgent-vs-routine request
  intake", "Service & pricing pages for drains, water heaters, and repairs"]. `stat`: {n:"1 in 4",
  p:"plumbing searches are emergencies — they hire whoever's site loads fast and shows a phone number
  first"}. `webFaq`: {q:"Can the site handle emergency plumbing leads?", a:"That's the point. The
  emergency call button sits above the fold, the form triages urgent vs. routine, and the site loads
  in under two seconds — so [City] homeowners reach you first."}
- **roofing** — `webLead`: "built to capture storm-damage leads the morning after a Virginia
  thunderstorm — photo galleries, insurance-claim intake, and click-to-call front and center."
  `needs`: ["A storm-damage lead form with insurance-claim intake", "Before/after roof photo
  galleries", "One-tap free-inspection booking"]. `stat`: {n:"2x", p:"the leads after a storm — but
  only for the roofer whose site is found and answers first"}. `webFaq`: {q:"Can the site capture
  storm and insurance leads?", a:"Yes. The storm-damage form collects the address, damage, and
  insurance details, books the free inspection, and notifies you instantly — so you reach high-intent
  [City] storm leads before competitors."}
- **electrical** — `webLead`: "built to earn a safety-conscious homeowner's trust fast — clear
  service pages (panels, rewiring, EV chargers), license and credential proof, and one-tap calling for
  hazards." `needs`: ["Safety-forward service pages (panels, rewiring, EV chargers)", "License &
  credential trust signals up front", "One-tap emergency call for sparking panels and hazards"].
  `stat`: {n:"60%+", p:"of homeowners judge an electrician's trustworthiness by their website before
  they ever call"}. `webFaq`: {q:"Will the site show I'm licensed and trustworthy?", a:"Yes. We
  surface your license, insurance, and reviews prominently, with clear service pages and a one-tap call
  button — the trust signals [City] homeowners look for before letting an electrician in."}
- **appliance-repair** — `webLead`: "built to book the same-day fridge or washer repair —
  brand/symptom intake, transparent service-call info, and a site that ranks when someone searches at
  8am with a dead refrigerator." `needs`: ["A brand & symptom intake form", "Same-day booking with
  clear service-call info", "Brand/warranty service pages for search"]. `stat`: {n:"70%+", p:"of
  appliance-repair jobs are same-day — the caller books whoever's site is found and answers first"}.
  `webFaq`: {q:"Can customers book a repair right from the site?", a:"Yes. The intake form captures
  the appliance, brand, and symptom, gauges urgency, and books the soonest slot — so [City] homeowners
  with a dead fridge book you today, not next week."}
- **garage-door** — `webLead`: "built to turn a stuck-door emergency into a booked repair — a visual
  door style-picker for new installs, instant calling, and galleries that sell the upgrade." `needs`:
  ["A visual garage-door style & quote picker", "A stuck/broken-door emergency call button", "Install
  galleries that sell upgrades"]. `stat`: {n:"50%+", p:"of garage-door buyers shop the look online
  first — a visual site wins the install job"}. `webFaq`: {q:"Can the site help sell new installs?",
  a:"Yes. The visual style-picker and install galleries let [City] homeowners see the upgrade and
  request a quote, plus an emergency button for stuck-door repairs."}
- **pest-control** — `webLead`: "built to convert an urgent 'get-it-gone-now' search — pest-specific
  landing pages, recurring-plan signup, and instant calling for wasp nests and infestations." `needs`:
  ["Pest-specific landing pages (termites, rodents, stinging insects)", "A recurring treatment-plan
  signup", "Instant call + urgent infestation intake"]. `stat`: {n:"65%+", p:"of pest-control
  searches are urgent — they hire the first credible site that loads"}. `webFaq`: {q:"Can the site
  sell recurring treatment plans?", a:"Yes. We build a plan-signup flow plus pest-specific pages that
  rank, so [City] homeowners book a one-time treatment and convert to recurring revenue."}
- **landscaping** — `webLead`: "built to sell the transformation — before/after portfolios, seasonal
  service pages, and estimate booking that fills your calendar in spring." `needs`: ["Before/after
  project portfolio galleries", "Seasonal service & maintenance-plan pages", "Estimate-request
  booking"]. `stat`: {n:"3x", p:"the leads in spring — captured by the landscaper whose portfolio
  site is found first"}. `webFaq`: {q:"Will the site show off my past work?", a:"Yes. We build
  before/after portfolio galleries and estimate booking, so [City] homeowners see the transformation
  and request a quote before calling a competitor."}

## Page template (`buildWebPage`)

- **Title:** `Web Design for ${v.name} in ${c.name}, VA | Websites That Book Jobs — Signalcraft`
- **Meta description:** `Affordable ${v.name} web design in ${c.name}, VA. Signalcraft builds alive,
  AI-powered websites that book jobs — from $149/mo, done-for-you, live in days. Free audit.`
- **Canonical / robots / og:** same pattern as `buildPage` (self-canonical, `index,follow`, og tags).
- **H1:** `${v.name} Web Design in <span class="o">${c.name}, VA</span>`
- **Lead:** `Most ${v.lc} websites are stale brochures. Yours will be <b>alive</b> — ${v.web.webLead}
  Done-for-you by <b>Signalcraft</b>, live in days, from <b>$149/mo</b>.`
- **Stat band (3):** `{n:v.web.stat.n, p:v.web.stat.p}`, `{n:"$149/mo", p:"to go live — $0 founding
  setup, no big agency invoice"}`, `{n:"Days", p:"from kickoff to live, not the months an agency
  takes"}`.
- **Feature section "What a ${v.name} website needs in ${c.name}":** the 3 `needs` cards + 3 universal
  cards — `{ico:"💬", h:"A live AI assistant", p:"Answers visitors and captures every lead 24/7 — built
  in, not bolted on."}`, `{ico:"📈", h:"Local SEO baked in", p:"Built to surface when ${c.name}
  neighbors search — including AI search results."}`, `{ico:"⚡", h:"Fast, mobile-first & hosted",
  p:"Loads in under two seconds on a phone; hosting, SSL, and monthly care handled by us."}`.
- **Live-demo proof:** no standalone band (the `.webshow`/`.browser` styles live in `index.html`'s
  inline CSS, NOT in `seo.css`, so they're unavailable here). Instead, surface the demo via the
  `cta-pill` proof link in the final CTA section (below) and a one-line mention in step `/02` of How
  It Works — both use only existing classes.
- **How it works (3 steps, Go Live process):** `/01 Free audit` (we show where [City] jobs leak) →
  `/02 We build it` (alive, in days) → `/03 Live + handled` (we host, maintain, and keep it ranking).
- **FAQ (5):**
  1. `How much does a ${v.name} website cost in ${c.name}?` → Go Live from $149/mo, $0 founding setup,
     no big upfront; custom quotes welcome.
  2. `How long until my site is live?` → days, not months — done-for-you.
  3. `Do I own it? Who handles hosting and updates?` → built for your brand; hosting, SSL & monthly
     care included so it never goes stale.
  4. `Will it actually rank in ${c.name}?` → local SEO baked in + AEO (we make you a business ChatGPT
     & Google AI name).
  5. `v.web.webFaq` (trade-specific).
- **AEO band:** reuse the receptionist AEO band copy, retargeted to "${v.lc} website".
- **Internal-link silo (`areas` + `linkcols`):** same trade other cities (`/web-design/${v.slug}-${x.slug}/`)
  + other trades this city (`/web-design/${x.slug}-${c.slug}/`), serving `${c.region}` / `${c.nearby}`.
- **Cross-silo link (one):** a single line linking to `/ai-receptionist/${v.slug}-${c.slug}/` —
  *"Also losing after-hours calls? See AI Receptionist for ${v.name} in ${c.name} →"*.
- **Primary CTA:** `Get your free audit` → `/contact.html`. **Secondary CTA:** `See Go Live · $149/mo →`
  → `/#pricing`. **Proof link:** `See a site we built →` → `/demos/riverside/`.
- **Schema (3 JSON-LD blocks):** `Service` (serviceType `Website Design & Development for ${v.name}
  Businesses`, provider Signalcraft, areaServed `${c.name}, Virginia`, audience `${v.name} businesses`,
  url, description), `FAQPage` (the 5 FAQs), `BreadcrumbList` (Home › Web Design › ${v.name} in
  ${c.name}, VA — breadcrumb level 2 label "Web Design", item `${SITE}/web-design/`).

## Hub (`buildWebHub`) → `/web-design/`

Mirror `buildHub()`: hero leading the Go Live offer ("Websites that book jobs — from $149/mo"),
primary CTA → `/contact.html`, secondary → `/#pricing`; then trade-grouped lists of all city links
(`/web-design/${v.slug}-${c.slug}/`). Title `Web Design for Home-Service Businesses in Virginia |
Signalcraft`; self-canonical; og tags.

## Cross-silo reciprocity (edit existing `buildPage`)

In the receptionist `buildPage`, add **one** reciprocal link in its `areas` section:
*"Need a website that books jobs too? See ${v.name} web design in ${c.name} →"* →
`/web-design/${v.slug}-${c.slug}/`. Keeps the two silos supporting each other without bloating.

## Nav, footer & crawl discovery

- `navHtml()` and `footerHtml()` (used by ALL generated pages): add a `Web Design` link →
  `/web-design/`. (Receptionist link stays.)
- **Hand pages:** add a `/web-design/` link to the footers of `index.html` and `services.html` (next
  to the existing `/ai-receptionist/` hub link) so crawlers discover the new hub. The homepage
  `Websites` nav link stays pointing to `#websites` (the showcase); the hub is the SEO entry point.

## Sitemap

`allUrls` = receptionist hub + 176 receptionist pages + web hub + 176 web pages. `STATIC` unchanged.
One `sitemap.xml` (~362 URLs) + `robots.txt` (unchanged) regenerate on `node gen-seo-pages.mjs`.

## Out of scope

- No new CSS / no `seo.css` changes (reuse existing classes; if a needed element has no class, report
  it rather than inventing a silo-specific stylesheet).
- No new hand-written pages; no changes to pricing, Ava packaging, or the receptionist content beyond
  the single reciprocal cross-link.
- No real per-trade galleries/forms built as features *on these marketing pages* — the `needs` describe
  what the **product** (a Go Live site) includes; these landing pages sell it, they don't implement it.

## Success criteria

- `node gen-seo-pages.mjs --dry-run` lists 176 web pages + web hub (and still the 176 receptionist
  pages + hub).
- A built sample (e.g. `/web-design/roofing-richmond/`) renders correctly on `seo.css` with no missing
  styles, valid HTML, all three schema blocks present, internal + cross-silo links resolving.
- Each trade's pages carry genuinely trade-specific copy (lead, needs, stat, FAQ) — not boilerplate.
- `/web-design/` hub lists every trade×city; reachable from homepage + services footers and generated-
  page nav/footer.
- `sitemap.xml` includes all web-design URLs; the whole thing rebuilds idempotently.
- Verified locally, then deploys via `git push` to `main` on explicit go-ahead.
