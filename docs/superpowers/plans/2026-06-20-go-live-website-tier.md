# Go Live Website Tier — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Surface AI-powered websites as a first-class product on signalcraft.fyi — a lead services card, a sharpened showcase, an affordable "Go Live" $149/mo pricing tier, nav discoverability, and matching on-page SEO — without cannibalizing the higher tiers.

**Architecture:** Hand-edited static site (`purplehulk/signalcraft`, GitHub Pages, no build step). All substantive changes live in `index.html` (inline `<style>` + markup); sibling pages get a one-line nav addition. Verification is visual via a local static server + preview screenshots (no test framework exists). Deploy is `git push` to `main` — performed only on explicit user go-ahead, never automatically.

**Tech Stack:** Static HTML/CSS, CSS Grid, `serve-site.mjs` / preview server (port 8000).

---

## File Structure

- `index.html` — **primary.** Head SEO (`:6–9`), nav (`:357–380`), services bento (`:469–494` + CSS `:168–182`), `#websites` section (`:498–528`), pricing tiers (`:593–657` + CSS `:273–296`, `:318`).
- `services.html`, `work.html`, `about.html`, `contact.html` — nav link addition only (link to `index.html#websites`).
- No new files. No generated `/ai-receptionist/` pages touched.

## Pre-flight: work on a branch (deploy safety)

The repo's default branch `main` **is** the deploy target. Do all work on a feature branch; merging/pushing to `main` is a deliberate, user-approved final step.

- [ ] **Step 0: Create the branch**

Run:
```bash
cd /c/Users/mrzeb/Downloads/signalcraft-site
git checkout -b feat/go-live-website-tier
```
Expected: `Switched to a new branch 'feat/go-live-website-tier'`

---

## Task 1: On-page SEO — put "websites" in the title & meta

**Files:**
- Modify: `index.html:6-9`

- [ ] **Step 1: Update the `<title>` and meta description**

Replace `index.html:6-7`:
```html
<title>Signalcraft — AI-built marketing for local businesses | Chesterfield & Richmond, VA</title>
<meta name="description" content="Signalcraft is a veteran-owned, AI-powered marketing agency in the Richmond, VA area. We make local home-services businesses impossible to miss — starting with a free digital presence audit." />
```
with:
```html
<title>Signalcraft — AI-built websites & marketing for local businesses | Richmond & Chesterfield, VA</title>
<meta name="description" content="Signalcraft builds affordable, AI-powered websites that book jobs — plus local SEO, reviews, and Ava, your 24/7 AI receptionist. Veteran-owned, Richmond, VA. Free presence audit." />
```

- [ ] **Step 2: Update the Open Graph tags**

Replace `index.html:8-9`:
```html
<meta property="og:title" content="Signalcraft — Get the message through." />
<meta property="og:description" content="AI-built marketing that makes local businesses impossible to miss. Free digital presence audit." />
```
with:
```html
<meta property="og:title" content="Signalcraft — AI websites that book jobs." />
<meta property="og:description" content="Affordable, AI-built websites that book jobs — plus SEO, reviews & a 24/7 AI receptionist. Free presence audit." />
```

- [ ] **Step 3: Verify**

Run: `grep -n "AI-built websites" index.html` → Expected: matches line 6.
Run: `grep -n "websites that book jobs" index.html` → Expected: matches the meta description + og:description.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "seo: surface AI websites in homepage title, meta & og tags"
```

---

## Task 2: Nav — add a "Websites" link

**Files:**
- Modify: `index.html:362-368` (desktop `.links`), `index.html:373-380` (mobile `.sheet`)
- Modify: `services.html`, `work.html`, `about.html`, `contact.html` (nav blocks)

- [ ] **Step 1: Add Websites to the desktop nav**

In `index.html`, replace the `.links` block (`:362-368`):
```html
  <div class="links">
    <a href="services.html">Services</a>
    <a href="#pricing">Pricing</a>
    <a href="work.html">Work</a>
    <a href="about.html">About</a>
    <a href="contact.html">Contact</a>
  </div>
```
with:
```html
  <div class="links">
    <a href="services.html">Services</a>
    <a href="#websites">Websites</a>
    <a href="#pricing">Pricing</a>
    <a href="work.html">Work</a>
    <a href="about.html">About</a>
    <a href="contact.html">Contact</a>
  </div>
```

- [ ] **Step 2: Add Websites to the mobile sheet**

In `index.html`, replace the `.sheet` block (`:373-380`):
```html
<div class="sheet" id="sheet">
  <a href="services.html">Services</a>
  <a href="#pricing">Pricing</a>
  <a href="work.html">Work</a>
  <a href="about.html">About</a>
  <a href="contact.html">Contact</a>
  <a href="#audit">Get your free audit</a>
</div>
```
with:
```html
<div class="sheet" id="sheet">
  <a href="services.html">Services</a>
  <a href="#websites">Websites</a>
  <a href="#pricing">Pricing</a>
  <a href="work.html">Work</a>
  <a href="about.html">About</a>
  <a href="contact.html">Contact</a>
  <a href="#audit">Get your free audit</a>
</div>
```

- [ ] **Step 3: Add Websites to sibling pages' nav (cross-page link)**

For EACH of `services.html`, `work.html`, `about.html`, `contact.html`:
1. Run `grep -n 'href="services.html">Services</a>' <page>` to locate both the desktop `.links` and the mobile `.sheet` occurrences.
2. Immediately after the Services link in BOTH blocks, insert:
   ```html
   <a href="index.html#websites">Websites</a>
   ```
   (Use `index.html#websites`, not `#websites`, since the section lives on the home page.)

- [ ] **Step 4: Verify**

Run: `grep -rn "#websites\">Websites" *.html` → Expected: desktop + mobile match on `index.html` (`#websites`) and on all four sibling pages (`index.html#websites`) = 10 matches total.

- [ ] **Step 5: Commit**

```bash
git add index.html services.html work.html about.html contact.html
git commit -m "nav: add Websites link (desktop + mobile) across all pages"
```

---

## Task 3: Services bento — add a full-width "AI Websites" lead card

The bento is a 12-col grid (`.bento` `index.html:169`) paired 7+5 / 5+7. To add a 5th card without breaking the pairing, the new card spans the full row (`grid-column:1/-1`) and sits on top as the lead; the existing four keep their layout and are renumbered `/02–/05`.

**Files:**
- Modify: `index.html:170` (add `.b-lead` CSS)
- Modify: `index.html:469-493` (add lead card, renumber)

- [ ] **Step 1: Add the `.b-lead` CSS rule**

In `index.html`, after line 170 (`.b-a{grid-column:span 7}...`), add:
```css
.b-lead{grid-column:1/-1}
.b-lead .core{background:linear-gradient(150deg,#13182b,#0f1626);border-color:rgba(240,90,40,.22)}
```
(`grid-column:1/-1` spans the full row in both the 12-col desktop grid and the 1-col mobile grid `:319`, so no responsive override is needed.)

- [ ] **Step 2: Insert the lead card and renumber the four existing cards**

In `index.html`, replace the opening of `.bento` (the first existing card starts at `:470`). Insert the new card as the FIRST child of `<div class="bento">`, then change each existing `.num` label. The new card:
```html
        <div class="svc shell b-lead rv"><div class="core">
          <div class="num">/01 — AI WEBSITES</div>
          <h3>Your website, alive — and it answers.</h3>
          <p>Hand-built (never templated) with motion, animation, and a live AI chat assistant baked in — it answers questions and captures every lead, then routes it straight to you. Live in days, from $149/mo.</p>
          <div class="pill-row"><span class="tagp">AI-built</span><span class="tagp">Live chat</span><span class="tagp">Mobile-first</span><span class="tagp">From $149/mo</span></div>
        </div></div>
```
Then renumber the existing `.num` lines:
- `:471` `/01 — FINDABILITY` → `/02 — FINDABILITY`
- `:477` `/02 — PROOF` → `/03 — PROOF`
- `:483` `/03 — STORY` → `/04 — STORY`
- `:489` `/04 — ALWAYS ON` → `/05 — ALWAYS ON`

- [ ] **Step 3: Verify**

Run: `grep -n "/01 — AI WEBSITES\|/02 — FINDABILITY\|/03 — PROOF\|/04 — STORY\|/05 — ALWAYS ON" index.html`
Expected: five matches in order, one per card.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "services: add full-width AI Websites lead card, renumber bento /02-/05"
```

---

## Task 4: Sharpen the `#websites` showcase + align chat copy with gating

Tighten the section to the dynamic-yet-affordable wedge, and — importantly — soften "books the job/visits" to "captures the lead" so the website's chat does not read as a substitute for the Ava voice receptionist (Always-On). This is the cannibalization discipline in copy form.

**Files:**
- Modify: `index.html:503` (section sub), `index.html:510` (webfeat item)

- [ ] **Step 1: Rewrite the section sub-headline**

Replace `index.html:503`:
```html
      <p class="sub rv d2">Every site we build is hand-crafted to your brand, with a live AI assistant baked in that qualifies visitors and books the job 24/7. Add a custom AI-generated brand film and you've got something your competitors simply don't.</p>
```
with:
```html
      <p class="sub rv d2">Every site we build is hand-crafted to your brand — alive with motion, mobile-first, and a live AI assistant baked in that answers questions and captures the lead 24/7. From $149/mo: a done-for-you site that's alive, not a stale template you maintain yourself. Add a custom AI-generated brand film and you've got something competitors simply don't.</p>
```

- [ ] **Step 2: Align the AI-assistant feature bullet with the gating**

Replace `index.html:510`:
```html
            <li><span class="ck" aria-hidden="true">✓</span><span><b>Live AI assistant</b> — answers questions and books visits, day or night.</span></li>
```
with:
```html
            <li><span class="ck" aria-hidden="true">✓</span><span><b>Live AI assistant</b> — answers questions and captures every lead, day or night.</span></li>
```

- [ ] **Step 3: Verify**

Run: `grep -n "captures the lead 24/7\|captures every lead, day or night" index.html`
Expected: two matches (sub + bullet). Also: `grep -n "books the job 24/7\|books visits" index.html` → Expected: no matches.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "websites: sharpen showcase copy + gate chat claim (capture, not book)"
```

---

## Task 5: Pricing — add the "Go Live" $149 entry tier (4-up grid)

**Files:**
- Modify: `index.html:273` (tier grid → 4 columns), `index.html:274` (tier padding)
- Modify: `index.html:593-594` (insert Go Live card as first tier)

- [ ] **Step 1: Make the tier grid hold 4 cards**

Replace `index.html:273`:
```css
.ptiers{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:64px;align-items:stretch}
```
with:
```css
.ptiers{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:64px;align-items:stretch}
```
Then replace the padding in `index.html:274`:
```css
.tier .core{padding:34px 30px;height:100%;display:flex;flex-direction:column;position:relative;
```
with:
```css
.tier .core{padding:30px 22px;height:100%;display:flex;flex-direction:column;position:relative;
```
(Mobile already collapses `.ptiers` to one column at `:318` — no change needed there.)

- [ ] **Step 2: Insert the Go Live tier as the first card**

In `index.html`, insert immediately after `<div class="ptiers">` (`:593`) and before the Foundation card (`:595`):
```html

        <div class="tier shell rv"><div class="core">
          <div class="tlabel">TIER 0 · LAUNCH</div>
          <h3>Go Live</h3>
          <p class="tdesc">A stunning, AI-powered website that's alive from day one — built, not templated.</p>
          <div class="price">
            <div class="setup">$0 <span>setup</span></div>
            <div class="mo">+ <b>$149</b>/mo</div>
            <div class="terms">Founding rate · $0 setup (reg. $299)</div>
          </div>
          <ul>
            <li>Hand-crafted, mobile-first website (motion + animation)</li>
            <li>Live AI chat — answers FAQs &amp; captures every lead</li>
            <li>Hosting, SSL &amp; monthly site care included</li>
            <li>Click-to-call + online request form</li>
            <li>Live in days, not months</li>
          </ul>
          <div class="pcta"><a class="cta-pill" href="#audit">Start free audit <span class="arr">↗</span></a></div>
          <div class="bestfor"><b>Best for:</b> beating a $3,000 agency site that's stale the day it ships.</div>
        </div></div>
```

- [ ] **Step 3: Verify markup**

Run: `grep -n "TIER 0 · LAUNCH\|Go Live" index.html` → Expected: tlabel + h3 match.
Run: `grep -c 'class="tier ' index.html` → Expected: `4` (matches `tier shell` ×3 + `tier hot shell` ×1, i.e. the 3 original tiers + Go Live).

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "pricing: add Go Live \$149 website tier (4-up grid)"
```

---

## Task 6: Visual verification & deploy hand-off

No automated tests exist; verify by eye on a local server before any deploy.

- [ ] **Step 1: Start the local preview**

Use the preview server for the `signalcraft-site` project (`preview_start "signalcraft-site"`, per repo `CLAUDE.md`), or run `node serve-site.mjs` (port 8000).

- [ ] **Step 2: Desktop checks (screenshot the homepage)**
  - Services: "AI Websites" is a full-width card on top, numbered `/01`; the four below read `/02–/05`.
  - Pricing: four tiers fit on one row, Go Live first, Growth still badged "★ Most Popular," cards not visually broken by the reduced padding.
  - Nav shows **Websites** between Services and Pricing; clicking it scrolls to `#websites`.

- [ ] **Step 3: Mobile checks (preview_resize to ~390px, screenshot)**
  - Bento stacks one card per row; Go Live tier and all four tiers stack cleanly.
  - Mobile nav `.links` row now holds 6 items — confirm it doesn't overflow/clip (`:323-324` uses `flex:1;white-space:nowrap`). If it clips, note it for a follow-up (e.g. drop a low-priority link from the inline row); do not block the deploy on it.

- [ ] **Step 4: Link check**

Run: `grep -rn "index.html#websites" services.html work.html about.html contact.html` → Expected: 8 matches (desktop + mobile per page). Spot-click one sibling page's Websites link in preview → lands on the homepage `#websites` section.

- [ ] **Step 5: Deploy hand-off (DO NOT push without explicit go-ahead)**

Summarize the diff and the screenshots for the user. Deploy only when the user explicitly approves:
```bash
git checkout main
git merge --no-ff feat/go-live-website-tier
git push origin main   # ← GitHub Pages publishes to signalcraft.fyi
```

---

## Notes / known follow-ups (not blockers)

- **Founding callout vs Go Live founding deal:** the `.founding` band (`:300-312`, "50% off setup" for 5 clients) and Go Live's "$0 setup (reg. $299)" are two different founding incentives on the same page. Not contradictory, but if it reads confusingly in Step 2, flag for the user — out of scope to reconcile here.
- **Hero copy** ("websites that book jobs," `:392`) is intentionally left as-is — scope guardrail.
- **Programmatic "website design for [trade] in [city]" silo** is explicitly deferred to its own spec.
