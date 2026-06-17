/* ===================== SIGNALCRAFT AI CHAT WIDGET =====================
   Self-injecting: drops its own styles, launcher, panel and logic onto any
   page with a single <script src="assets/chat.js" defer></script>.
   One source of truth across every page on the site.
   ===================================================================== */
(function () {
  // After deploying the Cloudflare Worker (signalcraft-chat-worker), this is its URL:
  const WORKER_URL = "https://signalcraft-chat.mrzebedeemiddleton.workers.dev";
  const WEB3FORMS_KEY = "37fd3bb7-6acd-494d-956e-de52e1b39fd0"; // same inbox as the audit form
  const GREETING = "Hey — I'm Signalcraft's AI assistant. \u{1F44B} Curious whether your business is easy to find online, or want your free presence audit? Ask me anything.";

  /* ---- styles (uses the site's CSS vars, with safe fallbacks) ---- */
  const css = `
  #sc-launch{position:fixed;right:22px;bottom:22px;z-index:70;width:60px;height:60px;border-radius:999px;
    border:0;cursor:pointer;background:var(--signal,#F05A28);color:#fff;display:grid;place-items:center;
    box-shadow:0 16px 40px -12px var(--signal-glow,rgba(240,90,40,.32)),0 4px 14px -4px rgba(0,0,0,.5);
    transition:transform .5s var(--ease,cubic-bezier(.32,.72,0,1)),box-shadow .5s var(--ease,cubic-bezier(.32,.72,0,1))}
  #sc-launch:hover{transform:translateY(-2px) scale(1.04)}
  #sc-launch:active{transform:scale(.96)}
  #sc-launch svg{width:26px;height:26px}
  #sc-launch .dot{position:absolute;top:13px;right:13px;width:9px;height:9px;border-radius:999px;background:#5BC48E;border:2px solid var(--signal,#F05A28)}
  #sc-panel{position:fixed;right:22px;bottom:94px;z-index:71;width:380px;max-width:calc(100vw - 32px);
    height:560px;max-height:calc(100dvh - 130px);display:none;flex-direction:column;overflow:hidden;
    background:linear-gradient(170deg,var(--card,#121A2E),var(--card-2,#161F37));border:1px solid var(--hairline-2,rgba(255,255,255,.14));
    border-radius:22px;box-shadow:0 40px 90px -30px rgba(0,0,0,.8);
    opacity:0;transform:translateY(14px) scale(.98);transition:opacity .4s var(--ease,cubic-bezier(.32,.72,0,1)),transform .4s var(--ease,cubic-bezier(.32,.72,0,1))}
  #sc-panel.open{display:flex;opacity:1;transform:none}
  #sc-head{display:flex;align-items:center;gap:12px;padding:16px 18px;border-bottom:1px solid var(--hairline,rgba(255,255,255,.08));position:relative}
  #sc-head::after{content:"";position:absolute;left:0;right:0;top:0;height:2px;background:linear-gradient(90deg,transparent,var(--signal,#F05A28),transparent)}
  #sc-head .av{width:36px;height:36px;border-radius:11px;background:rgba(240,90,40,.16);border:1px solid rgba(240,90,40,.3);display:grid;place-items:center;color:var(--signal,#F05A28);flex:none}
  #sc-head b{font-family:'Space Grotesk',sans-serif;font-size:15px;color:#fff;letter-spacing:-.01em}
  #sc-head .st{font-family:'Space Mono',monospace;font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;color:#5BC48E;margin-top:1px}
  #sc-x{margin-left:auto;background:rgba(255,255,255,.05);border:1px solid var(--hairline,rgba(255,255,255,.08));color:var(--steel,#8A97AF);
    width:30px;height:30px;border-radius:9px;cursor:pointer;font-size:16px;line-height:1;transition:color .4s,background .4s}
  #sc-x:hover{color:#fff;background:rgba(255,255,255,.1)}
  #sc-msgs{flex:1;overflow-y:auto;padding:18px;display:flex;flex-direction:column;gap:12px;scrollbar-width:thin}
  .sc-b{max-width:84%;padding:11px 14px;font-size:14px;line-height:1.5;border-radius:15px;white-space:pre-wrap;word-wrap:break-word}
  .sc-b.bot{align-self:flex-start;background:rgba(255,255,255,.05);border:1px solid var(--hairline,rgba(255,255,255,.08));color:#E8EDF5;border-bottom-left-radius:5px}
  .sc-b.me{align-self:flex-end;background:var(--signal,#F05A28);color:#fff;border-bottom-right-radius:5px}
  .sc-note{align-self:center;font-family:'Space Mono',monospace;font-size:10.5px;letter-spacing:.04em;color:#5BC48E;
    background:rgba(62,156,107,.12);border:1px solid rgba(62,156,107,.25);padding:6px 12px;border-radius:99px}
  .sc-typing{align-self:flex-start;display:flex;gap:4px;padding:13px 15px;background:rgba(255,255,255,.05);border:1px solid var(--hairline,rgba(255,255,255,.08));border-radius:15px;border-bottom-left-radius:5px}
  .sc-typing i{width:6px;height:6px;border-radius:99px;background:var(--steel,#8A97AF);animation:scb 1.2s var(--ease,cubic-bezier(.32,.72,0,1)) infinite}
  .sc-typing i:nth-child(2){animation-delay:.15s}.sc-typing i:nth-child(3){animation-delay:.3s}
  @keyframes scb{0%,60%,100%{opacity:.3;transform:translateY(0)}30%{opacity:1;transform:translateY(-3px)}}
  #sc-form{display:flex;gap:9px;padding:14px;border-top:1px solid var(--hairline,rgba(255,255,255,.08))}
  #sc-in{flex:1;background:rgba(255,255,255,.04);border:1px solid var(--hairline-2,rgba(255,255,255,.14));border-radius:13px;
    padding:11px 14px;color:#fff;font-family:inherit;font-size:14px;resize:none;max-height:90px;transition:border-color .4s,box-shadow .4s}
  #sc-in:focus{outline:none;border-color:var(--signal,#F05A28);box-shadow:0 0 0 3px rgba(240,90,40,.14)}
  #sc-send{flex:none;width:44px;border:0;border-radius:13px;background:var(--signal,#F05A28);color:#fff;cursor:pointer;display:grid;place-items:center;transition:transform .4s,opacity .4s}
  #sc-send:hover{transform:translateY(-1px)}#sc-send:disabled{opacity:.45;cursor:default;transform:none}
  #sc-send svg{width:18px;height:18px}
  @media(max-width:480px){#sc-panel{right:12px;left:12px;width:auto;bottom:88px}}
  @media(prefers-reduced-motion:reduce){#sc-panel,#sc-launch{transition:none}}`;

  const markup = `
  <button id="sc-launch" aria-label="Chat with Signalcraft AI">
    <span class="dot"></span>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
  </button>
  <div id="sc-panel" role="dialog" aria-label="Signalcraft AI chat">
    <div id="sc-head">
      <div class="av"><svg width="20" height="20" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-linecap="round"><circle cx="32" cy="46" r="4" fill="currentColor" stroke="none"/><path d="M32 35 A11 11 0 0 1 43 46" stroke-width="4"/><path d="M32 26 A20 20 0 0 1 52 46" stroke-width="4" opacity=".7"/></svg></div>
      <div><b>Signalcraft AI</b><div class="st">● Online · replies instantly</div></div>
      <button id="sc-x" aria-label="Close chat">✕</button>
    </div>
    <div id="sc-msgs"></div>
    <form id="sc-form">
      <textarea id="sc-in" rows="1" placeholder="Ask us anything…" autocomplete="off"></textarea>
      <button id="sc-send" type="submit" aria-label="Send"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg></button>
    </form>
  </div>`;

  function init() {
    if (document.getElementById('sc-launch')) return; // guard against double-injection
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    const host = document.createElement('div');
    host.innerHTML = markup;
    while (host.firstChild) document.body.appendChild(host.firstChild);

    const launch = document.getElementById('sc-launch'),
      panel = document.getElementById('sc-panel'),
      msgs = document.getElementById('sc-msgs'),
      form = document.getElementById('sc-form'),
      input = document.getElementById('sc-in'),
      send = document.getElementById('sc-send');
    const api = []; let greeted = false, busy = false, leadSent = false;

    function bubble(text, who) { const d = document.createElement('div'); d.className = 'sc-b ' + who; d.textContent = text; msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight; return d; }
    function note(text) { const d = document.createElement('div'); d.className = 'sc-note'; d.textContent = text; msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight; }
    function typing(on) { let t = document.getElementById('sc-typing'); if (on) { if (!t) { t = document.createElement('div'); t.id = 'sc-typing'; t.className = 'sc-typing'; t.innerHTML = '<i></i><i></i><i></i>'; msgs.appendChild(t); msgs.scrollTop = msgs.scrollHeight; } } else if (t) { t.remove(); } }

    function open() { panel.classList.add('open'); if (!greeted) { greeted = true; bubble(GREETING, 'bot'); } input.focus(); }
    function close() { panel.classList.remove('open'); }
    launch.addEventListener('click', () => panel.classList.contains('open') ? close() : open());
    document.getElementById('sc-x').addEventListener('click', close);

    input.addEventListener('input', () => { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 90) + 'px'; });
    input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); } });

    async function captureLead(lead) {
      if (leadSent) return; leadSent = true;
      try {
        await fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ access_key: WEB3FORMS_KEY, subject: 'New Signalcraft chat lead', from_name: 'Signalcraft Chat Widget',
            name: lead.name || '', email: lead.email || '', phone: lead.phone || '', industry: lead.business || '', source: 'Website chat widget' }) });
        note('✓ Sent to the Signalcraft team');
      } catch (e) { /* non-blocking */ }
    }

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const text = input.value.trim(); if (!text || busy) return;
      if (WORKER_URL.startsWith('REPLACE')) {
        bubble(text, 'me'); input.value = ''; input.style.height = 'auto';
        bubble("The chat isn't connected yet — please email audit@signalcraft.fyi and we'll jump right on it.", 'bot'); return;
      }
      bubble(text, 'me'); api.push({ role: 'user', content: text }); input.value = ''; input.style.height = 'auto';
      busy = true; send.disabled = true; typing(true);
      try {
        const r = await fetch(WORKER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: api }) });
        const data = await r.json(); typing(false);
        let reply = (data && data.text) || "Sorry — I hit a snag. Email audit@signalcraft.fyi and we'll help directly.";
        let lead = null;
        const m = reply.match(/\[\[LEAD\]\]\s*(\{[\s\S]*\})/);
        if (m) { try { lead = JSON.parse(m[1]); } catch (_) { } reply = reply.slice(0, m.index).trim(); }
        bubble(reply, 'bot'); api.push({ role: 'assistant', content: reply });
        if (lead && lead.email) captureLead(lead);
      } catch (err) { typing(false); bubble("Connection trouble on my end — please email audit@signalcraft.fyi and we'll take care of you.", 'bot'); }
      finally { busy = false; send.disabled = false; input.focus(); }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
