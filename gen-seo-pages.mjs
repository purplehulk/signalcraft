#!/usr/bin/env node
// Signalcraft — programmatic SEO page generator (ROADMAP #5).
// Builds an "AI receptionist for [trade] in [city], VA" landing page for every vertical×city in
// the matrix below, plus a hub index, sitemap.xml and robots.txt. These are Signalcraft's OWN
// inbound funnel: compounding local-intent pages that double as live demos of the product (every
// page carries the AI chat widget). Pages share /assets/seo.css and live under /ai-receptionist/.
//
//   node gen-seo-pages.mjs            # build all pages (overwrites — safe to re-run)
//   node gen-seo-pages.mjs --dry-run  # list what it would write, no files
//
// URLs: https://signalcraft.fyi/ai-receptionist/<vertical>-<city>/  (clean, extensionless)

import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DRY = process.argv.includes("--dry-run");
const SITE = "https://signalcraft.fyi";
const DEMO_CALL = "+1 (804) 406-5307";
const DEMO_TEL = "+18044065307";
const TODAY = new Date().toISOString().slice(0, 10);

// ── matrix ────────────────────────────────────────────────────────────────────
const VERTICALS = [
  {
    slug: "hvac", name: "HVAC", trade: "HVAC", plural: "HVAC companies", lc: "HVAC business", icon: "🌡️",
    emergency: "a no-cooling call in a July heat wave, or a furnace that quits on the coldest night of the year",
    pain: "When a homeowner's AC dies in summer, they call the next company on the list the second you don't pick up.",
    services: ["emergency no-cool / no-heat calls", "maintenance & tune-up scheduling", "new-system and replacement quotes", "seasonal service reminders"],
    stat: { n: "45%+", p: "of HVAC service calls arrive after hours or during peak-season overload" },
    faq: { q: "Can it handle emergency no-cool and no-heat calls?", a: "Yes. The receptionist recognizes urgency, captures the address and system details, and either books the soonest emergency slot or flags it straight to your on-call tech." },
  },
  {
    slug: "plumbing", name: "Plumbing", trade: "plumbing", plural: "plumbing companies", lc: "plumbing business", icon: "🚿",
    emergency: "a burst pipe at 11pm or a water heater flooding a basement on a Sunday",
    pain: "A plumbing emergency can't wait for a callback — if voicemail picks up, the next plumber gets the job.",
    services: ["emergency leak & burst-pipe calls", "drain and water-heater jobs", "repair and quote requests", "scheduled service appointments"],
    stat: { n: "1 in 4", p: "plumbing calls is an emergency the caller will not leave on voicemail" },
    faq: { q: "Does it know the difference between an emergency leak and a routine job?", a: "It does. Burst pipes and active leaks are triaged as urgent and routed to your on-call line or booked immediately; routine work is scheduled into your normal calendar." },
  },
  {
    slug: "roofing", name: "Roofing", trade: "roofing", plural: "roofing companies", lc: "roofing business", icon: "🏠",
    emergency: "a storm-damage leak the morning after a Virginia thunderstorm, when every roofer in town is slammed",
    pain: "After a storm, the roofer who answers first wins the job — and the insurance work that comes with it.",
    services: ["storm-damage & leak calls", "free roof inspection bookings", "repair and replacement estimates", "insurance-claim intake"],
    stat: { n: "2x", p: "the leads after a storm — but only for the roofer who actually answers the phone" },
    faq: { q: "Can it capture storm-damage and insurance leads?", a: "Yes. It collects the property address, damage description, and insurance details, books the free inspection, and notifies you instantly so you reach high-intent storm leads before competitors do." },
  },
  {
    slug: "electrical", name: "Electrical", trade: "electrical", plural: "electrical contractors", lc: "electrical business", icon: "⚡",
    emergency: "a power outage, a sparking panel, or a safety hazard a homeowner won't sit on until morning",
    pain: "Electrical problems feel dangerous — callers want a human (or a smart receptionist) now, not a voicemail beep.",
    services: ["emergency & safety-hazard calls", "panel, wiring, and lighting jobs", "estimate and inspection requests", "scheduled installation bookings"],
    stat: { n: "60%+", p: "of homeowners won't leave a voicemail — they just call the next electrician" },
    faq: { q: "Will it treat a sparking panel or outage as urgent?", a: "Absolutely. Safety-related calls are flagged as priority, the caller gets clear next steps, and the job is booked or escalated to your on-call electrician right away." },
  },
  {
    slug: "appliance-repair", name: "Appliance Repair", trade: "appliance repair", plural: "appliance repair companies", lc: "appliance repair business", icon: "🔧",
    emergency: "a dead refrigerator full of groceries, or a washer that just flooded the laundry room",
    pain: "When the fridge dies, homeowners want it fixed today — they'll call down the list until someone actually answers.",
    services: ["emergency no-cool fridge & freezer calls", "washer, dryer & dishwasher repairs", "diagnostic and repair scheduling", "parts, brand, and warranty questions"],
    stat: { n: "70%+", p: "of appliance-repair calls are same-day-urgent jobs the caller won't leave on voicemail" },
    faq: { q: "Can it book same-day appliance repair jobs?", a: "Yes. It captures the appliance type, brand, and symptom, gauges urgency (a dead fridge vs. a noisy dryer), and books the soonest slot — or routes the truly urgent jobs straight to you." },
  },
  {
    slug: "garage-door", name: "Garage Door", trade: "garage door", plural: "garage door companies", lc: "garage door business", icon: "🚪",
    emergency: "a door stuck open overnight leaving the house exposed, or a snapped spring trapping a car inside",
    pain: "A garage door stuck open is a security problem — homeowners keep calling until a human answers.",
    services: ["emergency stuck & broken-door calls", "spring, opener & cable repairs", "new door installation quotes", "tune-up and maintenance scheduling"],
    stat: { n: "50%+", p: "of garage-door calls are urgent repairs the caller needs handled the same day" },
    faq: { q: "Will it treat a stuck or broken door as urgent?", a: "Yes. A door stuck open or a snapped spring is flagged as priority — the receptionist captures the details and books the soonest repair, or escalates straight to your on-call tech." },
  },
  {
    slug: "pest-control", name: "Pest Control", trade: "pest control", plural: "pest control companies", lc: "pest control business", icon: "🐜",
    emergency: "a wasp nest by the front door, or a sudden roach or rodent sighting a homeowner wants gone now",
    pain: "Pests are an emotional, urgent call — if you don't pick up, they call the next exterminator the same minute.",
    services: ["urgent infestation & stinging-insect calls", "recurring treatment scheduling", "inspection and quote requests", "termite and wildlife job intake"],
    stat: { n: "65%+", p: "of pest-control calls are urgent — the caller wants it handled today, not next week" },
    faq: { q: "Can it handle urgent infestation calls?", a: "Yes. It identifies the pest and the urgency, captures the address, and books the soonest treatment — flagging stinging-insect and emergency calls straight to you." },
  },
  {
    slug: "landscaping", name: "Landscaping", trade: "landscaping", plural: "landscaping companies", lc: "landscaping business", icon: "🌳",
    emergency: "a storm-downed limb, a busted irrigation line, or a last-minute request before a weekend event",
    pain: "Landscaping leads are seasonal and fiercely competitive — the company that answers first books the estimate.",
    services: ["new estimate & design consultations", "recurring maintenance scheduling", "irrigation, hardscape & cleanup jobs", "seasonal and storm-cleanup requests"],
    stat: { n: "3x", p: "the inbound leads in spring — but only for the crew that answers while they're out mowing" },
    faq: { q: "Can it book estimates while my crew is out in the field?", a: "That's the whole point. While you're on a mower or a job, it answers every call, captures the property details and scope, and books the estimate before the lead calls a competitor." },
  },
];

const CITIES = [
  { slug: "richmond", name: "Richmond", region: "Greater Richmond", county: "the City of Richmond", nearby: "the Fan, Church Hill, and the West End" },
  { slug: "chesterfield", name: "Chesterfield", region: "Greater Richmond", county: "Chesterfield County", nearby: "Midlothian, Bon Air, and Brandermill" },
  { slug: "henrico", name: "Henrico", region: "Greater Richmond", county: "Henrico County", nearby: "Short Pump, Glen Allen, and Highland Springs" },
  { slug: "midlothian", name: "Midlothian", region: "Greater Richmond", county: "Chesterfield County", nearby: "Bon Air, Brandermill, and Woodlake" },
  { slug: "glen-allen", name: "Glen Allen", region: "Greater Richmond", county: "Henrico County", nearby: "Short Pump, Innsbrook, and the West End" },
  { slug: "mechanicsville", name: "Mechanicsville", region: "Greater Richmond", county: "Hanover County", nearby: "Atlee, Hanover, and the Mechanicsville Turnpike corridor" },
  { slug: "petersburg", name: "Petersburg", region: "Greater Richmond", county: "the City of Petersburg", nearby: "Colonial Heights, Hopewell, and the Fort Gregg-Adams area" },
  { slug: "ashland", name: "Ashland", region: "Greater Richmond", county: "Hanover County", nearby: "Hanover, Glen Allen, and the Route 1 corridor" },
  { slug: "colonial-heights", name: "Colonial Heights", region: "Greater Richmond", county: "the City of Colonial Heights", nearby: "Petersburg, Chester, and the Southpark corridor" },
  { slug: "norfolk", name: "Norfolk", region: "Hampton Roads", county: "the City of Norfolk", nearby: "Ghent, Ocean View, and Downtown Norfolk" },
  { slug: "virginia-beach", name: "Virginia Beach", region: "Hampton Roads", county: "the City of Virginia Beach", nearby: "the Oceanfront, Town Center, and Kempsville" },
  { slug: "chesapeake", name: "Chesapeake", region: "Hampton Roads", county: "the City of Chesapeake", nearby: "Greenbrier, Western Branch, and Great Bridge" },
  { slug: "hampton", name: "Hampton", region: "Hampton Roads", county: "the City of Hampton", nearby: "Phoebus, Buckroe, and Coliseum Central" },
  { slug: "newport-news", name: "Newport News", region: "Hampton Roads", county: "the City of Newport News", nearby: "City Center, Hilton Village, and Denbigh" },
  { slug: "portsmouth", name: "Portsmouth", region: "Hampton Roads", county: "the City of Portsmouth", nearby: "Olde Towne, Churchland, and Port Norfolk" },
  { slug: "suffolk", name: "Suffolk", region: "Hampton Roads", county: "the City of Suffolk", nearby: "Harbour View, North Suffolk, and Driver" },
  { slug: "roanoke", name: "Roanoke", region: "the Roanoke Valley", county: "the City of Roanoke", nearby: "Salem, Vinton, and Cave Spring" },
  { slug: "lynchburg", name: "Lynchburg", region: "the Lynchburg area", county: "the City of Lynchburg", nearby: "Forest, Madison Heights, and Boonsboro" },
  { slug: "harrisonburg", name: "Harrisonburg", region: "the Shenandoah Valley", county: "the City of Harrisonburg", nearby: "Rockingham County, Bridgewater, and Dayton" },
  { slug: "charlottesville", name: "Charlottesville", region: "the Charlottesville area", county: "the City of Charlottesville", nearby: "Albemarle County, Pantops, and Crozet" },
  { slug: "fredericksburg", name: "Fredericksburg", region: "the Fredericksburg area", county: "the City of Fredericksburg", nearby: "Spotsylvania, Stafford, and Central Park" },
  { slug: "williamsburg", name: "Williamsburg", region: "the Historic Triangle", county: "the City of Williamsburg", nearby: "James City County, Yorktown, and Jamestown" },
];

// ── shared chrome ───────────────────────────────────────────────────────────
const LOGO = (s) => `<svg width="${s}" height="${s}" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="14" fill="#121A2E" stroke="rgba(255,255,255,.12)"/><g transform="translate(19,46)" fill="none" stroke="#F05A28" stroke-linecap="round"><circle r="4" fill="#F05A28" stroke="none"/><path d="M0,-11 A11,11 0 0 1 11,0" stroke-width="4"/><path d="M0,-20 A20,20 0 0 1 20,0" stroke-width="4" opacity=".75"/><path d="M0,-29 A29,29 0 0 1 29,0" stroke-width="4" opacity=".45"/></g></svg>`;
const ICON = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%230C1222'/%3E%3Cg transform='translate(19,46)' fill='none' stroke='%23F05A28' stroke-linecap='round'%3E%3Ccircle r='4' fill='%23F05A28' stroke='none'/%3E%3Cpath d='M0,-11 A11,11 0 0 1 11,0' stroke-width='4'/%3E%3Cpath d='M0,-20 A20,20 0 0 1 20,0' stroke-width='4' opacity='.75'/%3E%3Cpath d='M0,-29 A29,29 0 0 1 29,0' stroke-width='4' opacity='.45'/%3E%3C/g%3E%3C/svg%3E`;
const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin /><link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />`;

function navHtml() {
  return `<nav aria-label="Primary">
  <a class="brand" href="/">${LOGO(30)}<b>Signalcraft</b></a>
  <div class="links">
    <a href="/services.html">Services</a>
    <a href="/work.html">Work</a>
    <a href="/ai-receptionist/">AI Receptionist</a>
    <a href="/contact.html">Contact</a>
  </div>
  <a class="cta-pill" href="/contact.html">Free audit <span class="arr">↗</span></a>
  <button class="burger" id="burger" aria-label="Menu"><span></span><span></span></button>
</nav>
<div class="sheet" id="sheet">
  <a href="/services.html">Services</a>
  <a href="/work.html">Work</a>
  <a href="/ai-receptionist/">AI Receptionist</a>
  <a href="/contact.html">Contact</a>
  <a href="/contact.html">Get your free audit</a>
</div>`;
}
function footerHtml() {
  return `<footer>
  <div class="wrap">
    <div class="foot">
      <a class="brand" href="/">${LOGO(26)} Signalcraft</a>
      <div class="lk">
        <a href="/services.html">Services</a>
        <a href="/work.html">Work</a>
        <a href="/ai-receptionist/">AI Receptionist</a>
        <a href="/contact.html">Free audit</a>
        <a href="/privacy.html">Privacy</a>
        <a href="/terms.html">Terms</a>
      </div>
    </div>
    <div class="foot-base">
      <span>© 2026 Signalcraft · Richmond &amp; Chesterfield, VA · Veteran owned</span>
      <span class="by"><b>Get the message through.</b></span>
    </div>
  </div>
</footer>`;
}
const SCRIPTS = `<script>(function(){var b=document.getElementById('burger'),s=document.getElementById('sheet');if(b)b.addEventListener('click',function(){b.classList.toggle('open');s.classList.toggle('open');});})();</script>
<script src="/assets/chat.js" defer></script>`;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// ── per-page builder ────────────────────────────────────────────────────────
function buildPage(v, c) {
  const url = `${SITE}/ai-receptionist/${v.slug}-${c.slug}/`;
  const title = `AI Receptionist for ${v.name} in ${c.name}, VA | 24/7 Call Answering — Signalcraft`;
  const desc = `Stop missing ${v.name.toLowerCase()} calls in ${c.name}, VA. Signalcraft's AI receptionist answers, qualifies, and books jobs 24/7 so ${c.name} ${v.plural} capture every lead — even after hours. Free presence audit.`;
  const h1 = `AI Receptionist for ${v.name} Businesses in <span class="o">${c.name}, VA</span>`;

  const faqs = [
    { q: `How does an AI receptionist help my ${v.name} business in ${c.name}?`, a: `It answers every call to your ${c.name} ${v.lc} 24/7 in a natural voice, asks the right qualifying questions, books the job on your calendar, and texts or emails you the details instantly. ${v.pain} With Signalcraft, that never happens — even when you're on a job site or asleep.` },
    v.faq,
    { q: `Will callers in ${c.name} know they're talking to an AI?`, a: `Most don't — the receptionist sounds natural and conversational. What ${c.name} homeowners notice is that someone answered on the first ring, knew the right questions to ask, and got them booked. You can hear it yourself: call our live demo line at ${DEMO_CALL}.` },
    { q: `Do you only cover ${c.name}, or the rest of ${c.region}?`, a: `We serve ${c.name} and ${v.plural} across ${c.region} — including ${c.nearby}. Every service area gets the same 24/7 AI receptionist, online booking, and missed-call rescue.` },
    { q: `What does it cost, and how do we start?`, a: `It starts with a free digital-presence audit — no strings. We show you exactly how many calls and leads your ${v.lc} is currently missing, then set up the AI receptionist if it's a fit. Book your free audit and we'll handle the rest.` },
  ];

  const faqSchema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  const serviceSchema = {
    "@context": "https://schema.org", "@type": "Service",
    serviceType: `AI Receptionist & 24/7 Call Answering for ${v.name} Businesses`,
    provider: { "@type": "Organization", name: "Signalcraft", url: SITE, areaServed: "Virginia", description: "Veteran-owned, AI-powered marketing studio for local home-service businesses." },
    areaServed: { "@type": "City", name: `${c.name}, Virginia` },
    audience: { "@type": "BusinessAudience", name: `${v.name} businesses` },
    url, description: desc,
  };
  const breadcrumb = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE + "/" },
      { "@type": "ListItem", position: 2, name: "AI Receptionist", item: SITE + "/ai-receptionist/" },
      { "@type": "ListItem", position: 3, name: `${v.name} in ${c.name}, VA`, item: url },
    ],
  };

  // internal-link silo: same trade in other cities, + other trades in this city
  const sameTradeOtherCities = CITIES.filter((x) => x.slug !== c.slug)
    .map((x) => `<li><a href="/ai-receptionist/${v.slug}-${x.slug}/">${v.name} — ${x.name}, VA</a></li>`).join("");
  const otherTradesThisCity = VERTICALS.filter((x) => x.slug !== v.slug)
    .map((x) => `<li><a href="/ai-receptionist/${x.slug}-${c.slug}/">${x.name} — ${c.name}, VA</a></li>`).join("");

  const featCards = [
    { ico: "📞", h: "Answers every call, 24/7", p: `No more voicemail, no more missed calls. Every ${c.name} caller reaches a friendly receptionist on the first ring — nights, weekends, and holidays included.` },
    { ico: v.icon, h: `Built for ${v.name.toLowerCase()} work`, p: `It handles ${v.services.slice(0, 3).join(", ")}, and more — asking the questions a ${v.lc} actually needs answered before a job is booked.` },
    { ico: "📅", h: "Books straight to your calendar", p: `Qualified jobs land on your schedule automatically, with the caller's details texted and emailed to you the moment the call ends.` },
    { ico: "⚡", h: "Turns after-hours into revenue", p: `${v.stat.n} of calls happen when you can't answer. ${v.pain} The AI catches them so the next morning starts with booked work, not lost leads.` },
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
<meta property="og:title" content="${esc(`AI Receptionist for ${v.name} in ${c.name}, VA — Signalcraft`)}" />
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

<div class="crumb"><div class="wrap"><a href="/">Home</a> › <a href="/ai-receptionist/">AI Receptionist</a> › ${v.name} in ${c.name}, VA</div></div>

<main id="main">
  <header class="shero">
    <div class="wrap">
      <div class="k">AI Receptionist · ${c.name}, VA</div>
      <h1>${h1}</h1>
      <p class="lead">${v.pain} Signalcraft's AI receptionist answers, qualifies, and <b>books every ${v.name.toLowerCase()} call 24/7</b> — so ${c.name} ${v.plural} stop losing jobs to voicemail and the competitor who picked up first.</p>
      <div class="hero-cta">
        <a class="cta-pill" href="/contact.html" style="font-size:15px;padding:13px 13px 13px 24px">Get your free audit <span class="arr" style="width:30px;height:30px">↗</span></a>
        <a class="callbtn" href="tel:${DEMO_TEL}">▶ Hear it live — ${DEMO_CALL}</a>
      </div>
    </div>
  </header>

  <section class="band" aria-label="Why it matters">
    <div class="wrap"><div class="grid">
      <div class="stat"><div class="n">${v.stat.n}</div><p>${v.stat.p}.</p></div>
      <div class="stat"><div class="n">24/7</div><p>Every call to your ${c.name} ${v.lc} answered — nights, weekends, holidays.</p></div>
      <div class="stat"><div class="n">&lt;1 ring</div><p>Callers reach a real-sounding receptionist instantly instead of voicemail.</p></div>
    </div></div>
  </section>

  <section class="sec" aria-labelledby="how-h">
    <div class="wrap">
      <div class="k">Why ${c.name} ${v.plural} choose Signalcraft</div>
      <h2 id="how-h">The lead you miss is the job your competitor books.</h2>
      <p class="intro">Most ${v.lc} owners in ${c.name} are on a job, on a ladder, or asleep when the phone rings — and ${esc(v.emergency)} doesn't wait. Here's what changes when an AI receptionist has your back.</p>
      <div class="feat">
        ${featCards.map((f) => `<div class="c"><div class="ico" aria-hidden="true">${f.ico}</div><h3>${f.h}</h3><p>${f.p}</p></div>`).join("\n        ")}
      </div>
    </div>
  </section>

  <section class="sec" aria-labelledby="steps-h" style="padding-top:0">
    <div class="wrap">
      <div class="k">How it works</div>
      <h2 id="steps-h">From missed call to booked job — automatically.</h2>
      <div class="steps">
        <div class="st"><b>/01</b><h3>It answers</h3><p>Every call picked up instantly, day or night, in a natural voice for your ${c.name} ${v.lc}.</p></div>
        <div class="st"><b>/02</b><h3>It qualifies</h3><p>Asks the right ${v.name.toLowerCase()} questions — the problem, the address, the urgency.</p></div>
        <div class="st"><b>/03</b><h3>It books</h3><p>Drops the qualified job straight onto your calendar and confirms with the caller.</p></div>
        <div class="st"><b>/04</b><h3>It notifies you</h3><p>You get the caller's details by text and email the second the call ends.</p></div>
      </div>
    </div>
  </section>

  <section class="sec faq" aria-labelledby="faq-h" style="padding-top:0">
    <div class="wrap">
      <div class="k">Questions</div>
      <h2 id="faq-h">${v.name} AI receptionist FAQ — ${c.name}, VA</h2>
      ${faqs.map((f) => `<details><summary>${esc(f.q)}</summary><p>${f.a}</p></details>`).join("\n      ")}
    </div>
  </section>

  <section class="areas" aria-labelledby="areas-h">
    <div class="wrap">
      <h2 id="areas-h">AI receptionist service across ${c.region}</h2>
      <p class="sub">Serving ${c.name} (${c.county}) and nearby ${c.nearby}.</p>
      <div class="linkcols">
        <div><h3>${v.name} — other areas</h3><ul>${sameTradeOtherCities}</ul></div>
        <div><h3>Other trades in ${c.name}</h3><ul>${otherTradesThisCity}</ul></div>
      </div>
    </div>
  </section>

  <section class="aeo-sec" aria-labelledby="aeo-h">
    <div class="wrap">
      <div class="aeo-band">
        <div class="tag">New</div>
        <h2 id="aeo-h">Get your ${v.lc} recommended by <span class="o">ChatGPT &amp; Google AI.</span></h2>
        <p>More ${c.name} customers now ask AI "who's the best ${v.lc} near me?" instead of scrolling Google. We make your business one the AI actually names — structured data, machine-readable service facts, and the trust signals ChatGPT, Gemini, and Google's AI answers look for.</p>
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
      <h2 id="cta-h">See how many calls your ${v.lc} is missing.</h2>
      <p>Start with a free digital-presence audit — we'll show you exactly where ${c.name} jobs are leaking, then set up your 24/7 AI receptionist if it's a fit.</p>
      <a class="cta-pill" href="/contact.html" style="font-size:15px;padding:13px 13px 13px 24px">Get your free audit <span class="arr" style="width:30px;height:30px">↗</span></a>
      <p style="margin-top:18px;font-size:14px"><a href="tel:${DEMO_TEL}" style="color:#fff;border-bottom:1px solid var(--signal)">Or call the live demo line: ${DEMO_CALL}</a></p>
    </div>
  </section>
</main>

${footerHtml()}
${SCRIPTS}
</body>
</html>`;
  return { url, title, dir: join(__dirname, "ai-receptionist", `${v.slug}-${c.slug}`), html: body };
}

// ── hub index ───────────────────────────────────────────────────────────────
function buildHub() {
  const url = `${SITE}/ai-receptionist/`;
  const title = `AI Receptionist for Home-Service Businesses in Virginia | Signalcraft`;
  const desc = `Signalcraft builds 24/7 AI receptionists for home-service businesses across Virginia — HVAC, plumbing, roofing, electrical, and more — answering, qualifying, and booking every call. Find your trade and city.`;
  const groups = VERTICALS.map((v) => `
      <div style="margin-bottom:30px">
        <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.1em;color:var(--signal);margin-bottom:12px;font-family:'Space Mono'">${v.icon} ${v.name}</h3>
        <ul style="list-style:none;display:flex;flex-wrap:wrap;gap:8px">${CITIES.map((c) => `<li><a href="/ai-receptionist/${v.slug}-${c.slug}/">${v.name} — ${c.name}, VA</a></li>`).join("")}</ul>
      </div>`).join("");
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}" />
<link rel="canonical" href="${url}" />
<meta property="og:title" content="AI Receptionist for Home-Service Businesses — Virginia" />
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
<div class="crumb"><div class="wrap"><a href="/">Home</a> › AI Receptionist</div></div>
<main id="main">
  <header class="shero">
    <div class="wrap">
      <div class="k">24/7 AI Receptionist · Virginia</div>
      <h1>Never miss another <span class="o">customer call.</span></h1>
      <p class="lead">Signalcraft builds AI receptionists that answer, qualify, and book jobs around the clock for home-service businesses across Virginia. <b>Pick your trade and city</b> to see how it works for you — or hear it live at <a href="tel:${DEMO_TEL}" style="color:#fff;border-bottom:1px solid var(--signal)">${DEMO_CALL}</a>.</p>
      <div class="hero-cta"><a class="cta-pill" href="/contact.html" style="font-size:15px;padding:13px 13px 13px 24px">Get your free audit <span class="arr" style="width:30px;height:30px">↗</span></a></div>
      <p style="margin-top:16px;font-size:14px"><a href="/tools/missed-call-calculator/" style="color:#fff;border-bottom:1px solid var(--signal)">Free tool: see what missed calls cost your business →</a></p>
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
  return { url, dir: join(__dirname, "ai-receptionist"), html };
}

// ── run ───────────────────────────────────────────────────────────────────────
const pages = [];
for (const v of VERTICALS) for (const c of CITIES) pages.push(buildPage(v, c));
const hub = buildHub();
const allUrls = [hub.url, ...pages.map((p) => p.url)];

// sitemap.xml (only the programmatic pages + the static top-level pages, all under one map)
const STATIC = ["/", "/services.html", "/work.html", "/about.html", "/contact.html", "/tools/missed-call-calculator/", "/tools/instant-audit/", "/privacy.html", "/terms.html"].map((p) => SITE + p);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...STATIC, ...allUrls].map((u) => `  <url><loc>${u}</loc><lastmod>${TODAY}</lastmod></url>`).join("\n")}
</urlset>
`;
const robots = `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`;

if (DRY) {
  console.log(`[dry-run] would write ${pages.length} pages + hub + sitemap.xml + robots.txt:`);
  console.log("  " + hub.url);
  for (const p of pages) console.log("  " + p.url);
  process.exit(0);
}

function write(dir, html) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), html);
}
write(hub.dir, hub.html);
for (const p of pages) write(p.dir, p.html);
writeFileSync(join(__dirname, "sitemap.xml"), sitemap);
writeFileSync(join(__dirname, "robots.txt"), robots);

console.log(`✓ Generated ${pages.length} SEO pages + hub index`);
console.log(`✓ sitemap.xml (${STATIC.length + allUrls.length} urls) + robots.txt`);
console.log(`  Hub: ${hub.url}`);
console.log(`  Pages live under /ai-receptionist/<vertical>-<city>/`);
console.log(`\nReview locally, then push signalcraft-site to publish (purplehulk/signalcraft → GitHub Pages).`);
