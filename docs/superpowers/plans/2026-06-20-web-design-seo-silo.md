# Web-Design SEO Silo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Extend `gen-seo-pages.mjs` to generate a 176-page "web design for [trade] in [city]" silo + hub that funnels into the Go Live $149/mo tier, sharing one `sitemap.xml` with the existing receptionist silo.

**Architecture:** Pure additions to one Node ESM script (`gen-seo-pages.mjs`). A `WEB` per-trade data map, a `buildWebPage(v,c)` and `buildWebHub()` that mirror the existing `buildPage`/`buildHub`, run-section wiring, one reciprocal cross-link in `buildPage`, and `Web Design` links in shared nav/footer + two hand-page footers. Reuses `/assets/seo.css` (existing classes only). No build step; verification is `node --check`, `--dry-run`, grep, and a local preview render.

**Tech Stack:** Node ESM (`gen-seo-pages.mjs`), static HTML, `/assets/seo.css`, preview server (port 8000).

**Content source of truth:** the committed spec `docs/superpowers/specs/2026-06-20-web-design-seo-silo-design.md` — its "Per-trade content model" and "Page template" sections hold the exact copy. Transcribe `WEB` content from there verbatim.

---

## File Structure

- `gen-seo-pages.mjs` — all generator changes (data map, two builders, run wiring, nav/footer, cross-link).
- `index.html`, `services.html` — add one `/web-design/` footer link each (crawl discovery).
- Generated output (by running the script): `web-design/<trade>-<city>/index.html` ×176, `web-design/index.html`, regenerated `sitemap.xml`. **Generated files are committed** (the receptionist pages already are).

## Pre-flight

- [ ] **Step 0: Confirm branch** — `git -C /c/Users/mrzeb/Downloads/signalcraft-site rev-parse --abbrev-ref HEAD` → expect `feat/web-design-seo-silo`. Do not branch again; do not push.

---

## Task 1: Add the `WEB` per-trade data map

**Files:** Modify `gen-seo-pages.mjs` (after the `CITIES` array, ~line 115).

- [ ] **Step 1: Insert the `WEB` map**

After the `CITIES` array closes, add a `WEB` object keyed by trade `slug`, with one entry per the 8 trades. Each entry: `{ webLead, needs: [3 strings], stat: {n,p}, webFaq: {q,a} }`. **Transcribe the exact copy from the spec's "Per-trade content model" section** (hvac, plumbing, roofing, electrical, appliance-repair, garage-door, pest-control, landscaping). Keep the literal `[City]` tokens in `webLead` and `webFaq.a` — they are replaced at render time (Task 2).

```js
// ── web-design silo content (keyed by trade slug; [City] is replaced per page) ──
const WEB = {
  "hvac": { webLead: "built to win the no-cool call in a July heat wave — instant click-to-call, financing and quote forms, and a maintenance-plan signup that turns one job into a recurring customer.",
    needs: ["Instant click-to-call + an emergency 'no-cool / no-heat' banner", "Online quote and financing-application forms", "Maintenance-plan signup that builds recurring revenue"],
    stat: { n: "75%", p: "of homeowners check your website before booking an HVAC visit — a dated site sends them to the next company" },
    webFaq: { q: "Will my HVAC site capture financing and quote requests?", a: "Yes. We build quote and financing-application forms into the site, plus a one-tap emergency call button, so a [City] homeowner in a heat wave books you instead of scrolling on." } },
  // ... plumbing, roofing, electrical, appliance-repair, garage-door, pest-control, landscaping
  //     transcribed verbatim from the spec.
};
```

- [ ] **Step 2: Attach `web` to each vertical**

Immediately after the `WEB` map, link it onto the verticals so `buildWebPage` can read `v.web`:
```js
for (const v of VERTICALS) v.web = WEB[v.slug];
```

- [ ] **Step 3: Verify syntax + completeness**

Run: `node --check gen-seo-pages.mjs` → Expected: no output (valid).
Run: `node -e "import('./gen-seo-pages.mjs')" 2>/dev/null || node -e "const m=0" ` — skip; instead grep:
Run: `grep -c 'webFaq' gen-seo-pages.mjs` → Expected: `8` (one per trade) — confirms all 8 entries present.

- [ ] **Step 4: Commit**
```bash
git add gen-seo-pages.mjs && git commit -m "seo-gen: add WEB per-trade content map for web-design silo"
```

---

## Task 2: Add `buildWebPage(v, c)`

**Files:** Modify `gen-seo-pages.mjs` (after `buildPage` closes, ~line 336).

`buildWebPage` mirrors `buildPage`'s structure and HTML scaffold (same `<head>` pattern, `navHtml()`,
`crumb`, `shero`, `band`/`stat`, `sec`/`feat`, `steps`, `faq`, `areas`/`linkcols`, `aeo-band`, `cta`,
`footerHtml()`, `SCRIPTS`). Reuse the SAME seo.css classes. Substitute the content below.

- [ ] **Step 1: Add the function**

```js
function buildWebPage(v, c) {
  const fill = (s) => String(s).replace(/\[City\]/g, c.name);
  const url = `${SITE}/web-design/${v.slug}-${c.slug}/`;
  const title = `Web Design for ${v.name} in ${c.name}, VA | Websites That Book Jobs — Signalcraft`;
  const desc = `Affordable ${v.name} web design in ${c.name}, VA. Signalcraft builds alive, AI-powered websites that book jobs — from $149/mo, done-for-you, live in days. Free audit.`;
  const h1 = `${v.name} Web Design in <span class="o">${c.name}, VA</span>`;

  const faqs = [
    { q: `How much does a ${v.name} website cost in ${c.name}?`, a: `Our Go Live plan starts at $149/mo with $0 founding setup — no big agency invoice up front. It includes the build, a live AI chat assistant, hosting, SSL, and monthly care. Every ${v.lc} is different, so custom quotes are always welcome.` },
    { q: `How long until my ${v.name.toLowerCase()} site is live?`, a: `Days, not months. We build with AI-grade speed and a done-for-you process, so most ${c.name} ${v.plural} are live within a week of the kickoff audit.` },
    { q: `Do I own it? Who handles hosting and updates?`, a: `The site is built for your brand and your business. Hosting, SSL, and monthly updates are included so it never goes stale — no plugins to babysit, no surprise renewal bills.` },
    { q: `Will it actually rank in ${c.name}?`, a: `Yes — local SEO is baked in, built on what Google rewards now, plus AEO: we structure the site so ChatGPT and Google AI can name your ${v.lc} when ${c.name} customers ask "who's the best near me?"` },
    { q: v.web.webFaq.q, a: fill(v.web.webFaq.a) },
  ];

  const serviceSchema = { "@context": "https://schema.org", "@type": "Service",
    serviceType: `Website Design & Development for ${v.name} Businesses`,
    provider: { "@type": "Organization", name: "Signalcraft", url: SITE, areaServed: "Virginia", description: "Veteran-owned, AI-powered marketing studio for local home-service businesses." },
    areaServed: { "@type": "City", name: `${c.name}, Virginia` },
    audience: { "@type": "BusinessAudience", name: `${v.name} businesses` },
    url, description: desc };
  const faqSchema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE + "/" },
    { "@type": "ListItem", position: 2, name: "Web Design", item: SITE + "/web-design/" },
    { "@type": "ListItem", position: 3, name: `${v.name} in ${c.name}, VA`, item: url } ] };

  const sameTradeOtherCities = CITIES.filter((x) => x.slug !== c.slug)
    .map((x) => `<li><a href="/web-design/${v.slug}-${x.slug}/">${v.name} — ${x.name}, VA</a></li>`).join("");
  const otherTradesThisCity = VERTICALS.filter((x) => x.slug !== v.slug)
    .map((x) => `<li><a href="/web-design/${x.slug}-${c.slug}/">${x.name} — ${c.name}, VA</a></li>`).join("");

  // 3 trade-specific need cards + 3 universal cards
  const needCards = v.web.needs.map((n) => ({ ico: v.icon, h: n, p: "" }));
  const featCards = [
    ...needCards,
    { ico: "💬", h: "A live AI assistant, built in", p: `Answers visitors and captures every lead 24/7 — so a ${c.name} homeowner who lands at 9pm becomes tomorrow's booked job.` },
    { ico: "📈", h: "Local SEO baked in", p: `Built to surface when ${c.name} neighbors search — on what Google rewards now, including AI search results.` },
    { ico: "⚡", h: "Fast, mobile-first & hosted", p: `Loads in under two seconds on a phone; hosting, SSL, and monthly care handled by us.` },
  ];

  const body = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}" />
<link rel="canonical" href="${url}" />
<meta name="robots" content="index,follow" />
<meta property="og:title" content="${esc(`${v.name} Web Design in ${c.name}, VA — Signalcraft`)}" />
<meta property="og:description" content="${esc(desc)}" />
<meta property="og:type" content="website" />
<meta property="og:url" content="${url}" />
<link rel="icon" type="image/svg+xml" href="${ICON}" />
${FONTS}
<link rel="stylesheet" href="/assets/seo.css" />
<script type="application/ld+json">${JSON.stringify(serviceSchema)}</script>
<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>
<script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>
</head>
<body>
<a href="#main" class="skip">Skip to content</a>
<div class="field" aria-hidden="true"></div>
${navHtml()}
<div class="crumb"><div class="wrap"><a href="/">Home</a> › <a href="/web-design/">Web Design</a> › ${v.name} in ${c.name}, VA</div></div>
<main id="main">
  <header class="shero">
    <div class="wrap">
      <div class="k">Web Design · ${c.name}, VA</div>
      <h1>${h1}</h1>
      <p class="lead">Most ${v.lc} websites are stale brochures. Yours will be <b>alive</b> — ${fill(v.web.webLead)} Done-for-you by <b>Signalcraft</b>, live in days, from <b>$149/mo</b>.</p>
      <div class="hero-cta">
        <a class="cta-pill" href="/contact.html" style="font-size:15px;padding:13px 13px 13px 24px">Get your free audit <span class="arr" style="width:30px;height:30px">↗</span></a>
        <a class="callbtn" href="/#pricing">See Go Live · $149/mo →</a>
      </div>
    </div>
  </header>
  <section class="band" aria-label="Why it matters">
    <div class="wrap"><div class="grid">
      <div class="stat"><div class="n">${v.web.stat.n}</div><p>${v.web.stat.p}.</p></div>
      <div class="stat"><div class="n">$149/mo</div><p>to go live — $0 founding setup, no big agency invoice.</p></div>
      <div class="stat"><div class="n">Days</div><p>from kickoff to live, not the months an agency takes.</p></div>
    </div></div>
  </section>
  <section class="sec" aria-labelledby="needs-h">
    <div class="wrap">
      <div class="k">What a ${v.name} website needs in ${c.name}</div>
      <h2 id="needs-h">A site that books jobs — not a brochure that sits there.</h2>
      <div class="feat">
        ${featCards.map((f) => `<div class="c"><div class="ico" aria-hidden="true">${f.ico}</div><h3>${f.h}</h3>${f.p ? `<p>${f.p}</p>` : ""}</div>`).join("\n        ")}
      </div>
    </div>
  </section>
  <section class="sec" aria-labelledby="steps-h" style="padding-top:0">
    <div class="wrap">
      <div class="k">How it works</div>
      <h2 id="steps-h">From dated site to booked jobs — in days.</h2>
      <div class="steps">
        <div class="st"><b>/01</b><h3>Free audit</h3><p>We show exactly where ${c.name} jobs are leaking from your current site and search presence.</p></div>
        <div class="st"><b>/02</b><h3>We build it</h3><p>A hand-built, alive site with your brand, motion, and a live AI assistant — in days. <a href="/demos/riverside/" style="color:#fff;border-bottom:1px solid var(--signal)">See a site we built →</a></p></div>
        <div class="st"><b>/03</b><h3>Live &amp; handled</h3><p>We host it, maintain it, and keep it ranking — from $149/mo, nothing for you to babysit.</p></div>
      </div>
    </div>
  </section>
  <section class="sec faq" aria-labelledby="faq-h" style="padding-top:0">
    <div class="wrap">
      <div class="k">Questions</div>
      <h2 id="faq-h">${v.name} web design FAQ — ${c.name}, VA</h2>
      ${faqs.map((f) => `<details><summary>${esc(f.q)}</summary><p>${f.a}</p></details>`).join("\n      ")}
    </div>
  </section>
  <section class="areas" aria-labelledby="areas-h">
    <div class="wrap">
      <h2 id="areas-h">${v.name} web design across ${c.region}</h2>
      <p class="sub">Serving ${c.name} (${c.county}) and nearby ${c.nearby}. Also losing after-hours calls? <a href="/ai-receptionist/${v.slug}-${c.slug}/" style="color:#fff;border-bottom:1px solid var(--signal)">See AI Receptionist for ${v.name} in ${c.name} →</a></p>
      <div class="linkcols">
        <div><h3>${v.name} web design — other areas</h3><ul>${sameTradeOtherCities}</ul></div>
        <div><h3>Other trades in ${c.name}</h3><ul>${otherTradesThisCity}</ul></div>
      </div>
    </div>
  </section>
  <section class="aeo-sec" aria-labelledby="aeo-h">
    <div class="wrap">
      <div class="aeo-band">
        <div class="tag">New</div>
        <h2 id="aeo-h">Get your ${v.lc} recommended by <span class="o">ChatGPT &amp; Google AI.</span></h2>
        <p>More ${c.name} customers ask AI "who's the best ${v.lc} near me?" instead of scrolling Google. We build your site so ChatGPT, Gemini, and Google's AI can name you — structured data, machine-readable service facts, and the trust signals they look for.</p>
        <div class="nums">
          <div><b>45%</b><span>of local searches now use AI</span></div>
          <div><b>1.2%</b><span>of businesses ever get cited</span></div>
          <div><b>1st</b><span>-mover while rivals sleep</span></div>
        </div>
        <a class="cta-pill" href="/contact.html" style="font-size:15px;padding:13px 13px 13px 24px">See if AI recommends you <span class="arr" style="width:30px;height:30px">↗</span></a>
      </div>
    </div>
  </section>
  <section class="cta" aria-labelledby="cta-h">
    <div class="wrap">
      <h2 id="cta-h">Get a ${v.name.toLowerCase()} website that books jobs in ${c.name}.</h2>
      <p>Start with a free digital-presence audit — we'll show you exactly where ${c.name} jobs are leaking, then build your alive, AI-powered site from $149/mo if it's a fit.</p>
      <a class="cta-pill" href="/contact.html" style="font-size:15px;padding:13px 13px 13px 24px">Get your free audit <span class="arr" style="width:30px;height:30px">↗</span></a>
      <p style="margin-top:18px;font-size:14px"><a href="/demos/riverside/" style="color:#fff;border-bottom:1px solid var(--signal)">Or see a live site we built →</a></p>
    </div>
  </section>
</main>
${footerHtml()}
${SCRIPTS}
</body>
</html>`;
  return { url, title, dir: join(__dirname, "web-design", `${v.slug}-${c.slug}`), html: body };
}
```

- [ ] **Step 2: Verify** — `node --check gen-seo-pages.mjs` → no output. (Not wired into run yet.)
- [ ] **Step 3: Commit** — `git add gen-seo-pages.mjs && git commit -m "seo-gen: add buildWebPage() web-design page builder"`

---

## Task 3: Add `buildWebHub()`

**Files:** Modify `gen-seo-pages.mjs` (after `buildHub`, ~line 388).

- [ ] **Step 1: Add the function** (mirror `buildHub`; reuse its HTML scaffold, substitute content):

```js
function buildWebHub() {
  const url = `${SITE}/web-design/`;
  const title = `Web Design for Home-Service Businesses in Virginia | Signalcraft`;
  const desc = `Affordable, AI-powered web design for home-service businesses across Virginia — HVAC, plumbing, roofing, electrical, and more. Sites that book jobs, from $149/mo. Find your trade and city.`;
  const groups = VERTICALS.map((v) => `
      <div style="margin-bottom:30px">
        <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.1em;color:var(--signal);margin-bottom:12px;font-family:'Space Mono'">${v.icon} ${v.name}</h3>
        <ul style="list-style:none;display:flex;flex-wrap:wrap;gap:8px">${CITIES.map((c) => `<li><a href="/web-design/${v.slug}-${c.slug}/">${v.name} — ${c.name}, VA</a></li>`).join("")}</ul>
      </div>`).join("");
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}" />
<link rel="canonical" href="${url}" />
<meta property="og:title" content="Web Design for Home-Service Businesses — Virginia" />
<meta property="og:description" content="${esc(desc)}" />
<meta property="og:type" content="website" />
<meta property="og:url" content="${url}" />
<link rel="icon" type="image/svg+xml" href="${ICON}" />
${FONTS}
<link rel="stylesheet" href="/assets/seo.css" />
</head>
<body>
<a href="#main" class="skip">Skip to content</a>
<div class="field" aria-hidden="true"></div>
${navHtml()}
<div class="crumb"><div class="wrap"><a href="/">Home</a> › Web Design</div></div>
<main id="main">
  <header class="shero">
    <div class="wrap">
      <div class="k">Web Design · Virginia</div>
      <h1>Websites that <span class="o">book jobs.</span></h1>
      <p class="lead">Signalcraft builds alive, AI-powered websites for home-service businesses across Virginia — from <b>$149/mo</b>, done-for-you, live in days. <b>Pick your trade and city</b> to see how it works for you.</p>
      <div class="hero-cta"><a class="cta-pill" href="/contact.html" style="font-size:15px;padding:13px 13px 13px 24px">Get your free audit <span class="arr" style="width:30px;height:30px">↗</span></a><a class="callbtn" href="/#pricing">See Go Live · $149/mo →</a></div>
    </div>
  </header>
  <section class="sec" aria-label="Service pages">
    <div class="wrap">${groups}</div>
  </section>
</main>
${footerHtml()}
${SCRIPTS}
</body>
</html>`;
  return { url, dir: join(__dirname, "web-design"), html };
}
```

- [ ] **Step 2: Verify** — `node --check gen-seo-pages.mjs` → no output.
- [ ] **Step 3: Commit** — `git add gen-seo-pages.mjs && git commit -m "seo-gen: add buildWebHub() web-design hub"`

---

## Task 4: Wire the web silo into the run section + sitemap

**Files:** Modify `gen-seo-pages.mjs` run section (~lines 391–423).

- [ ] **Step 1: Build web pages + hub and include in URLs/sitemap/write**

Replace the run block from `const pages = [] …` through the `for (const p of pages) write(...)` line so it also handles the web silo. Exact changes:
```js
const pages = [];
for (const v of VERTICALS) for (const c of CITIES) pages.push(buildPage(v, c));
const hub = buildHub();
const webPages = [];
for (const v of VERTICALS) for (const c of CITIES) webPages.push(buildWebPage(v, c));
const webHub = buildWebHub();
const allUrls = [hub.url, ...pages.map((p) => p.url), webHub.url, ...webPages.map((p) => p.url)];
```
And in the `--dry-run` block, also list web pages:
```js
if (DRY) {
  console.log(`[dry-run] would write ${pages.length} receptionist + ${webPages.length} web-design pages + 2 hubs + sitemap.xml + robots.txt:`);
  console.log("  " + hub.url);
  for (const p of pages) console.log("  " + p.url);
  console.log("  " + webHub.url);
  for (const p of webPages) console.log("  " + p.url);
  process.exit(0);
}
```
And in the write section, after writing receptionist pages, add:
```js
write(webHub.dir, webHub.html);
for (const p of webPages) write(p.dir, p.html);
```
Update the final `console.log` summary line(s) to mention both silos (e.g. `Generated ${pages.length} receptionist + ${webPages.length} web-design pages + 2 hubs`).

- [ ] **Step 2: Verify dry-run counts**

Run: `node gen-seo-pages.mjs --dry-run | grep -c '/web-design/'` → Expected: `177` (176 pages + hub).
Run: `node gen-seo-pages.mjs --dry-run | grep -c '/ai-receptionist/'` → Expected: `177` (unchanged).

- [ ] **Step 3: Commit** — `git add gen-seo-pages.mjs && git commit -m "seo-gen: wire web-design silo into run + sitemap"`

---

## Task 5: Cross-silo reciprocal link + nav/footer Web Design links

**Files:** Modify `gen-seo-pages.mjs` (`buildPage` `areas` section ~line 297; `navHtml` ~line 122; `footerHtml` ~line 142).

- [ ] **Step 1: Reciprocal link in receptionist `buildPage`**

In `buildPage`, find the `areas` section `<p class="sub">Serving ${c.name} (${c.county}) and nearby ${c.nearby}.</p>` and replace it with:
```js
      <p class="sub">Serving ${c.name} (${c.county}) and nearby ${c.nearby}. Need a website that books jobs too? <a href="/web-design/${v.slug}-${c.slug}/" style="color:#fff;border-bottom:1px solid var(--signal)">See ${v.name} web design in ${c.name} →</a></p>
```

- [ ] **Step 2: Add `Web Design` to shared nav + footer**

In `navHtml()`, in BOTH `.links` and `.sheet`, add after the AI Receptionist link:
```html
    <a href="/web-design/">Web Design</a>
```
In `footerHtml()`'s `.lk` block, add after the AI Receptionist link:
```html
        <a href="/web-design/">Web Design</a>
```

- [ ] **Step 3: Verify** — `node --check gen-seo-pages.mjs` → no output. `grep -c '/web-design/' gen-seo-pages.mjs` → Expected: ≥ 7 (builders + nav×2 + footer + cross-link + dry-run/write refs).

- [ ] **Step 4: Commit** — `git add gen-seo-pages.mjs && git commit -m "seo-gen: cross-link silos + Web Design in shared nav/footer"`

---

## Task 6: Hand-page footer links (crawl discovery)

**Files:** Modify `index.html`, `services.html` footers.

- [ ] **Step 1: Add the hub link**

In `index.html` and `services.html`, grep for the existing `/ai-receptionist/` link in the footer block (`grep -n 'ai-receptionist' index.html services.html`). Immediately after it, add:
```html
<a href="/web-design/">Web Design</a>
```
(Match the surrounding footer link markup/classes on each page — they may differ slightly from the generated footer.)

- [ ] **Step 2: Verify** — `grep -c '/web-design/' index.html services.html` → Expected: `1` each.
- [ ] **Step 3: Commit** — `git add index.html services.html && git commit -m "nav: link web-design hub from homepage + services footers"`

---

## Task 7: Generate, verify, commit output

**Files:** creates `web-design/**`, updates `sitemap.xml`.

- [ ] **Step 1: Run the generator**

Run: `node gen-seo-pages.mjs`
Expected: console reports `176 receptionist + 176 web-design pages + 2 hubs`, sitemap url count ~362.

- [ ] **Step 2: Structural checks**
- Run: `ls web-design | wc -l` → Expected: `177` (176 trade-city dirs + the hub `index.html`… note hub is `web-design/index.html`, so `ls web-design` shows 176 dirs + `index.html` = 177 entries).
- Run: `grep -c '/web-design/' sitemap.xml` → Expected: `177` (176 pages + hub).
- Run: `node --check` not needed; confirm a sample file exists: `test -f web-design/roofing-richmond/index.html && echo OK`.

- [ ] **Step 3: Visual + schema spot-check (preview)**

Start preview (`preview_start "signalcraft-site"`). Load `http://localhost:8000/web-design/roofing-richmond/` and `http://localhost:8000/web-design/` via eval/navigation. Confirm:
- Page renders styled (seo.css applied — not unstyled HTML), H1 = "Roofing Web Design in Richmond, VA".
- Three `<script type="application/ld+json">` blocks present and parse (`JSON.parse` each via eval).
- Internal silo links + the cross-link to `/ai-receptionist/roofing-richmond/` resolve (200).
- Trade-specific copy present (e.g. "storm-damage", "before/after roof").
- `/web-design/` hub lists all 8 trades × cities; nav/footer show the Web Design link.

- [ ] **Step 4: Commit generated output**

```bash
git add web-design sitemap.xml
git commit -m "seo: generate 176 web-design pages + hub, update sitemap"
```

---

## Task 8: Deploy hand-off (DO NOT push without explicit go-ahead)

- [ ] Summarize diff + spot-check results for the user. Deploy only on explicit approval:
```bash
git checkout main && git merge --no-ff feat/web-design-seo-silo && git push origin main
```

---

## Notes
- Generated pages are committed to the repo (consistent with the existing `/ai-receptionist/` pages).
- If any planned seo.css class proves missing at Task 7 Step 3 (unstyled element), report it — do not invent a new stylesheet; pick the closest existing class.
- `robots.txt` is regenerated unchanged (already `Allow: /` + sitemap pointer).
