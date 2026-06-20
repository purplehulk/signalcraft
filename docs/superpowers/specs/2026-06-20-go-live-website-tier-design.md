# Design — "Go Live" AI Website Tier + Surfacing Websites as a Product

**Date:** 2026-06-20
**Repo:** `purplehulk/signalcraft` (live at signalcraft.fyi)
**Scope:** Single-file change to `index.html` (plus shared nav on sibling pages). No new pages, no build step.

---

## Problem

Signalcraft builds AI-powered websites, but a visitor scanning the site never registers it as a
distinct, buyable product:

- A dedicated `#websites` section already exists (`index.html:498`, *"AI-powered websites — Sites
  that don't just look good, they answer"*) **but it is orphaned**: not in the nav, not a service
  card, not a pricing tier.
- Nav links only **Services** and **Pricing** (`index.html:364`).
- The services bento has four cards `/01–/04` (Findability, Proof, Story, Always On — `index.html:470–493`);
  websites are mentioned only *inside* `/01 Findability` as plumbing for Google visibility.
- Pricing's lowest tier is **Foundation** at $497 setup / $197 mo (`index.html:595–613`). There is no
  cheap, website-first entry point.

Net: the website offering is hidden mid-scroll. We are **promoting a buried asset**, not building new.

## Goal

Make "AI-powered websites" a first-class, highlighted product with its own service card and its own
affordable pricing tier — positioned to **win against local freelancers/agencies** (who sell a
$2k–$6k one-time site that goes stale) — **without cannibalizing the higher-priced tiers.**

## Positioning strategy

Tiers sell **outcomes**, not features. A website is the *floor* every business needs; it cannot
deliver the premium outcomes no matter how slick:

| Tier | Job it does | Why a $149 website can't replace it |
|------|-------------|-------------------------------------|
| **Go Live** $149/mo | Look legit, have a live presence | — (that *is* the job) |
| **Foundation** $197/mo | Get **found** on Google | A beautiful site on page 3 is invisible |
| **Growth** $497/mo | Get **booked** (SEO, video, follow-up) | Ongoing marketing labor |
| **Always-On** $897/mo | Never miss a **call** | A website doesn't answer the phone |

"Dynamic" maps onto the ladder: **motion + AI-chat ship in every site** (Go Live); self-updating
content arrives at Foundation/Growth; personalization at Always-On. Alive on day one, smarter as
they climb.

## Cannibalization discipline (the core constraint)

The only real leak is messaging. Three rules close it:

1. **Gate the chat honestly.** Go Live's AI chat = *answers FAQs + captures the lead + routes it to
   the owner*. **Full booking and the Ava voice line that answers the phone stay at Always-On.** This
   is true (web chat ≠ 24/7 voice receptionist) and protects the premium.
2. **Point every card upward.** Card CTAs/sub-copy escalate: get found → get booked → never miss the
   call. Good/better/best anchoring makes the cheap tier make the expensive ones look *worth it*.
3. **Land-and-expand.** Go Live is the cheap lobby that gets the logo; clients upgrade once the site
   is live and they realize they still aren't *found* or are still missing 9pm *calls*.

**Decision — no à la carte Ava.** Selling Ava as a +$299 add-on to any tier would make
Go Live ($149) + Ava ($299) = $448 undercut Growth ($497) and gut Always-On ($897) — manufacturing
the exact cannibalization we're avoiding. Ava's value is in the bundle; she stays there. The rare
"just a receptionist" buyer is handled by the existing *"custom quotes always welcome"* note
(`index.html:658`), one-to-one, with no published price that knee-caps the bundle.

---

## The changes (all in `index.html` unless noted)

### 1. New pricing tier — "Go Live" (Tier 0, before Foundation)

Insert a fourth `.tier` card as the **first** card in `.ptiers` (`index.html:593`). Reuse existing
`.tier` markup/classes; style it as the lean entry option.

- **tlabel:** `TIER 0 · LAUNCH`
- **h3:** `Go Live`
- **tdesc:** "A stunning, AI-powered website that's alive from day one — built, not templated."
- **price:** `$0 setup` (founding) with `$299` struck/noted as normal, `+ $149/mo`,
  terms: "Founding rate · $0 setup"
- **list (✓):**
  - Hand-crafted, mobile-first website (motion + animation built in)
  - Live AI chat assistant — answers FAQs & captures every lead
  - Hosting, SSL & monthly site care included
  - Click-to-call + online request form
  - Live in days, not months
- **compare-to / bestfor:** "vs. a $3,000 agency site that's stale the day it ships."
- **pcta:** `#audit` (matches the other cards)

**Layout note:** `.ptiers` is `grid-template-columns:repeat(3,1fr)` (`index.html:273`); going to 4
cards will be tight on desktop. Verify on build — acceptable fixes: switch to `repeat(4,1fr)` with
reduced padding, or `auto-fit`/`minmax`. Mobile already collapses to 1 column (`index.html:318`).
Keep the **Growth "★ Most Popular"** badge so the anchor still reads as the recommended choice.

### 2. Services bento — add a lead "AI Websites" card

In the bento (`index.html:469`), add a new **first** card and renumber:

- New `/01 — AI WEBSITES` — h3: "Your website, alive — and it answers." Body: hand-crafted +
  motion + live AI chat that qualifies visitors and routes the lead. Pills: `AI-built` ·
  `Live chat` · `Mobile-first`.
- Renumber existing cards: Findability → `/02`, Proof → `/03`, Story → `/04`, Always On → `/05`.

**Layout note:** the bento is a deliberate grid; adding a 5th card may need a grid tweak. Verify on
build; keep the "hot" emphasis on the Always-On card.

### 3. Sharpen the existing `#websites` section

In `#websites` (`index.html:499–`), tighten copy to the dynamic-yet-affordable wedge: emphasize
motion/animation + the baked-in live AI chat + the agency compare-to ("alive, not stale; done-for-you,
not DIY"). Keep the existing live-demo showcase. No structural overhaul.

### 4. Nav — add "Websites"

Add a `Websites` link → `#websites` in:
- Desktop nav (`index.html:357–`, alongside Services/Pricing at `:364`)
- Mobile nav sheet (`:374–375`)
- The shared nav on every page that carries it: `services.html`, `work.html`, `about.html`,
  `contact.html` (link to `index.html#websites` from non-home pages).

### 6. On-page SEO — reflect the website product (same-file, in-scope)

The homepage's strongest SEO signals currently omit "website" entirely
(`<title>` `index.html:6`, `<meta name="description">` `:7`, `og:` tags `:8–9`). Adding a website
product without putting it in the title/meta means the new offering ranks for — and shows a snippet
for — nothing new. Edits:

- **`<title>`** → include website language, e.g.
  `Signalcraft — AI-built websites & marketing for local businesses | Richmond & Chesterfield, VA`
- **`<meta name="description">`** → work in the wedge, e.g.
  `Affordable, AI-powered websites that book jobs — plus local SEO, reviews, and Ava, your 24/7 AI
  receptionist. Veteran-owned, Richmond VA. Free presence audit.`
- **`og:title` / `og:description`** → mirror the "websites" language.
- **`#websites` section copy** → ensure it naturally carries real search terms (web design,
  affordable, mobile-first) — handled alongside Change #3.

**Out of scope SEO (deliberate, future opt-in):**
- `/ai-receptionist/` programmatic pages — untouched (separate generated funnel; never hand-edit).
- A programmatic "website design for [trade] in [city]" silo (mirroring `gen-seo-pages.mjs`). High
  potential for capturing local web-design search demand, but it is a **new-pages project** that
  conflicts with the no-over-build guardrail. Its own spec if/when wanted — not now.

---

## Out of scope (guardrails)

- No new pages (honors roadmap's "don't over-build; sell, don't add pages").
- No fabricated proof, testimonials, or stats.
- No change to Ava's packaging or to the Foundation/Growth/Always-On prices or contents.
- No à la carte add-on matrix.

## Files affected

- `index.html` — nav, services bento, `#websites` copy, pricing tiers (primary).
- `services.html`, `work.html`, `about.html`, `contact.html` — nav link only.
- (Verify) any mobile-nav partial duplicated across pages.

## Success criteria

- A visitor scanning **Services** sees "AI Websites" as the first card.
- A visitor scanning **Pricing** sees a clear, affordable website entry tier ($149/mo).
- **Websites** is reachable from the nav on every page.
- The four pricing tiers read as an ascending good/better/best ladder; Go Live's chat is clearly
  lead-capture (not the Ava voice receptionist), preserving Always-On's distinct value.
- Renders correctly on desktop (4 tiers / 5 bento cards) and collapses cleanly on mobile.
- Homepage `<title>` / `<meta description>` / `og:` tags include website language so the new product
  is discoverable and the search snippet reflects it.
- Deploys via `git push` to `main` (GitHub Pages); verified locally first.
